from datetime import date
from datetime import datetime
import json
from io import BytesIO
from typing import Annotated, Any
from uuid import UUID
import re

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.assessment import Assessment
from app.models.course import Course
from app.models.user import User
from app.schemas.course import CourseCreate, CourseResponse, CourseUpdate
from app.utils.waterloo_parser import parse_waterloo_outline

router = APIRouter(prefix="/courses", tags=["courses"])


def _extract_json_array(raw_text: str) -> list[dict[str, Any]]:
    text = raw_text.strip()
    if "```" in text:
        parts = text.split("```")
        for part in parts:
            candidate = part.strip()
            if candidate.startswith("json"):
                candidate = candidate[4:].strip()
            if candidate.startswith("[") and candidate.endswith("]"):
                text = candidate
                break
    data = json.loads(text)
    if not isinstance(data, list):
        raise ValueError("LLM output is not a JSON list")
    return [item for item in data if isinstance(item, dict)]


def _parse_due_date(value: Any) -> date:
    if value is None:
        raise ValueError("Missing due_date")
    text = str(value).strip()
    lowered = text.lower()
    if any(token in lowered for token in ("tba", "tbd", "registrar")):
        return date(2026, 4, 24)
    try:
        if "T" in text:
            parsed_dt = datetime.fromisoformat(text.replace("Z", "+00:00"))
            return parsed_dt.date()
        parsed = date.fromisoformat(text)
        return parsed
    except ValueError:
        # Last fallback for slash-formatted local dates.
        parsed = datetime.strptime(text.replace("-", "/"), "%Y/%m/%d")
        return parsed.date()


def _extract_table_rows(table: Any) -> list[list[str]]:
    rows: list[list[str]] = []
    for tr in table.find_all("tr"):
        cells = tr.find_all(["th", "td"])
        values = [cell.get_text(" ", strip=True) for cell in cells]
        if any(values):
            rows.append(values)
    return rows


def _split_exact(total_weight: float, count: int) -> list[float]:
    if count <= 0:
        return []
    basis_points_total = int(round(total_weight * 100))
    base = basis_points_total // count
    remainder = basis_points_total % count
    values = [base / 100.0 for _ in range(count)]
    for i in range(remainder):
        values[i] = round(values[i] + 0.01, 2)
    return values


def _normalize_component_token(text: str) -> str:
    raw = (text or "").strip().lower()
    if not raw:
        return ""
    token = re.sub(r"[^a-z]", "", raw.split(" ")[0])
    irregular = {
        "quizzes": "quiz",
    }
    if token in irregular:
        return irregular[token]
    if token.endswith("ies") and len(token) > 4:
        return token[:-3] + "y"
    if token.endswith(("ches", "shes", "sses", "xes", "zes")) and len(token) > 4:
        return token[:-2]
    if token.endswith("s") and len(token) > 3:
        return token[:-1]
    return token


def _infer_outline_year_from_text(text: str) -> int:
    match = re.search(r"\b(?:winter|spring|summer|fall)\s+(\d{4})\b", text or "", flags=re.IGNORECASE)
    if match:
        try:
            return int(match.group(1))
        except ValueError:
            return 2026
    return 2026


def _infer_component_count_from_text(source_text: str, component: str) -> int:
    token = component.lower()
    if not token:
        return 0
    searchable_text = source_text or ""
    if "<" in searchable_text and ">" in searchable_text:
        try:
            from bs4 import BeautifulSoup

            searchable_text = BeautifulSoup(searchable_text, "html.parser").get_text(" ", strip=True)
        except Exception:
            pass
    irregular_plural = {
        "quiz": "quizzes",
    }
    plural = irregular_plural.get(token) or (
        f"{token}es" if token.endswith(("s", "x", "z", "ch", "sh")) else f"{token}s"
    )
    number_words = {
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five": 5,
        "six": 6,
        "seven": 7,
        "eight": 8,
        "nine": 9,
        "ten": 10,
        "eleven": 11,
        "twelve": 12,
    }
    patterns = [
        rf"\b(\d{{1,2}})\s+{re.escape(plural)}\b",
        rf"\b(\d{{1,2}})\s+{re.escape(token)}s?\b",
        rf"\b{re.escape(plural)}\s*\(?\s*(\d{{1,2}})\s*\)?\b",
        rf"\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+{re.escape(plural)}\b",
        rf"\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+{re.escape(token)}s?\b",
    ]
    best = 0
    lowered = searchable_text.lower()
    for pattern in patterns:
        for match in re.finditer(pattern, lowered, flags=re.IGNORECASE):
            raw = (match.group(1) or "").strip().lower()
            if raw.isdigit():
                best = max(best, int(raw))
                continue
            as_word = number_words.get(raw)
            if as_word is not None:
                best = max(best, as_word)

    # Fallback: count explicitly numbered occurrences, e.g. "Quiz 1 ... Quiz 5".
    numbered_matches = re.findall(rf"\b{re.escape(token)}\s*(\d{{1,2}})\b", lowered, flags=re.IGNORECASE)
    if numbered_matches:
        unique_numbers = {int(value) for value in numbered_matches}
        best = max(best, len(unique_numbers))

    return best


def _looks_like_aggregate_item(title: str, component: str) -> bool:
    lowered = (title or "").strip().lower()
    if not lowered:
        return False
    if re.search(r"\d", lowered):
        return False
    base = component.lower()
    return lowered in {base, f"{base}s", f"{base}es", "quizzes" if base == "quiz" else ""}


def _expand_category_clumps(parsed_items: list[dict[str, Any]], source_text: str) -> list[dict[str, Any]]:
    component_words = {"quiz", "assignment", "lab", "project", "test", "exam"}
    expanded: list[dict[str, Any]] = []

    for item in parsed_items:
        title = str(item.get("title", "")).strip()
        assessment_type = str(item.get("assessment_type", "")).strip() or "Assignment"
        component = _normalize_component_token(title) or _normalize_component_token(assessment_type)
        if component not in component_words or not _looks_like_aggregate_item(title, component):
            expanded.append(item)
            continue

        count = _infer_component_count_from_text(source_text, component)
        if count <= 1:
            expanded.append(item)
            continue

        total_weight = float(item.get("weight_percentage", 0))
        split_weights = _split_exact(total_weight, count)
        base_due = item.get("due_date")
        component_label = "Quiz" if component == "quiz" else component.capitalize()
        for idx in range(1, count + 1):
            expanded.append(
                {
                    **item,
                    "title": f"{component_label} {idx}",
                    "assessment_type": component if component != "assignment" else assessment_type,
                    "weight_percentage": float(split_weights[idx - 1]),
                    "due_date": base_due,
                }
            )
        print(
            f"[courses.upload] expanded_clump component={component} "
            f"count={count} total={total_weight} split_weights={split_weights}"
        )

    return expanded


def _normalize_repeated_component_weights(parsed_items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    component_words = {"quiz", "assignment", "lab", "project", "test", "exam"}
    grouped_indexes: dict[str, list[int]] = {}

    for idx, item in enumerate(parsed_items):
        title = str(item.get("title", "")).strip()
        assessment_type = _normalize_component_token(str(item.get("assessment_type", "")))
        title_key = _normalize_component_token(title)
        group_key = title_key if title_key in component_words else assessment_type
        if group_key not in component_words:
            continue
        grouped_indexes.setdefault(group_key, []).append(idx)

    for group_key, indexes in grouped_indexes.items():
        if len(indexes) <= 1:
            continue

        weights: list[float] = []
        for idx in indexes:
            try:
                weights.append(float(parsed_items[idx].get("weight_percentage", 0)))
            except Exception:
                weights.append(0.0)

        if not weights:
            continue

        all_same = all(abs(w - weights[0]) < 1e-9 for w in weights)
        total = sum(weights)
        if not all_same:
            continue
        if total <= 100.0:
            continue

        split_weights = _split_exact(weights[0], len(indexes))
        print(
            f"[courses.upload] normalizing repeated component group={group_key} "
            f"raw_each={weights[0]} count={len(indexes)} split_weights={split_weights}"
        )
        for i, idx in enumerate(indexes):
            parsed_items[idx]["weight_percentage"] = float(split_weights[i])

    return parsed_items


@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_data: CourseCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new course for the authenticated user."""
    db_course = Course(
        user_id=current_user.id,
        **course_data.model_dump(),
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


@router.get("/", response_model=list[CourseResponse])
async def get_courses(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Return only courses that belong to the authenticated user."""
    return db.query(Course).filter(Course.user_id == current_user.id).all()


@router.patch("/{id}", response_model=CourseResponse)
async def update_course(
    id: str,
    course_data: CourseUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Partially update one course that belongs to the authenticated user."""
    db_course = (
        db.query(Course)
        .filter(Course.id == id, Course.user_id == current_user.id)
        .first()
    )

    if not db_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    update_data = course_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_course, field, value)

    db.commit()
    db.refresh(db_course)
    return db_course


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Delete one course that belongs to the authenticated user."""
    db_course = (
        db.query(Course)
        .filter(Course.id == id, Course.user_id == current_user.id)
        .first()
    )

    if not db_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    db.delete(db_course)
    db.commit()


@router.delete("/{course_id}/assessments")
@router.delete("/{course_id}/assessments/")
async def clear_course_assessments(
    course_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_course = (
        db.query(Course)
        .filter(Course.id == course_id, Course.user_id == current_user.id)
        .first()
    )
    if not db_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    db.query(Assessment).filter(
        Assessment.course_id == db_course.id,
        Assessment.user_id == current_user.id,
    ).delete(synchronize_session=False)
    db.commit()
    return {"message": "All assessments cleared"}


@router.post("/{id}/upload-syllabus", status_code=status.HTTP_201_CREATED)
async def upload_syllabus(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    file: UploadFile = File(...),
):
    db_course = (
        db.query(Course)
        .filter(Course.id == id, Course.user_id == current_user.id)
        .first()
    )
    if not db_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    content_type = (file.content_type or "").lower()
    filename = (file.filename or "").lower()
    is_html = content_type in {"text/html"} or filename.endswith((".html", ".htm"))
    is_pdf = content_type in {"application/pdf", "application/x-pdf"} or filename.endswith(".pdf")

    if not is_html and not is_pdf:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and HTML syllabus files are supported",
        )

    file_bytes = await file.read()
    parsed_items: list[dict[str, Any]] = []
    extracted_text = ""
    fallback_text = ""
    source_text_for_postprocess = ""

    if is_html:
        try:
            html_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to read HTML: {exc}") from exc
        source_text_for_postprocess = html_text
        parsed_items = parse_waterloo_outline(html_text) or []

        # AI fallback only if Waterloo structure parsing fails.
        if not parsed_items:
            try:
                from bs4 import BeautifulSoup
            except ImportError as exc:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Missing dependency: beautifulsoup4. Install backend requirements.",
                ) from exc
            soup = BeautifulSoup(html_text, "html.parser")
            table_chunks = []
            for table in soup.find_all("table"):
                rows = _extract_table_rows(table)
                if rows:
                    table_chunks.append("\n".join(" | ".join(row) for row in rows))
            fallback_text = "\n\n".join(table_chunks).strip()
            extracted_text = fallback_text
            source_text_for_postprocess = fallback_text or html_text
    else:
        try:
            from pypdf import PdfReader
        except ImportError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Missing dependency: pypdf. Install backend requirements.",
            ) from exc
        try:
            reader = PdfReader(BytesIO(file_bytes))
            extracted_text = "\n".join((page.extract_text() or "") for page in reader.pages).strip()
            source_text_for_postprocess = extracted_text
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to read PDF: {exc}") from exc

    if not parsed_items and not extracted_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No readable assessment data found")

    if not parsed_items:
        if not settings.google_api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="GOOGLE_API_KEY (or GEMINI_API_KEY) is not configured",
            )
        try:
            from google import genai
        except ImportError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Missing dependency: google-genai. Install backend requirements.",
            ) from exc

        prompt = (
            "Extract a JSON array of assessments from this syllabus text. "
            "Return JSON only with this schema exactly: "
            '[{"title": string, "weight_percentage": float, "due_date": "YYYY-MM-DD", "assessment_type": string}]. '
            "If uncertain, infer best effort but keep valid JSON and realistic values. "
            "If an assessment date is 'TBA' or similar, default the due_date to '2026-04-24'. "
            "Ensure all assessments, even those without firm dates, are returned in the JSON array."
        )

        client = genai.Client(api_key=settings.google_api_key)
        try:
            response = client.models.generate_content(
                model=settings.google_model,
                contents=(
                    "You extract structured assessment data from syllabi.\n\n"
                    f"{prompt}\n\nSyllabus text:\n{extracted_text[:30000]}"
                ),
            )
            raw_output = (response.text or "").strip() or "[]"
            parsed_items = _extract_json_array(raw_output)
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"LLM extraction failed: {exc}") from exc

    parsed_items = _expand_category_clumps(parsed_items, source_text_for_postprocess or extracted_text or fallback_text)
    parsed_items = _normalize_repeated_component_weights(parsed_items)
    inferred_outline_year = _infer_outline_year_from_text(source_text_for_postprocess or extracted_text or fallback_text)

    created: list[Assessment] = []
    for assessment in parsed_items:
        try:
            title = str(assessment.get("title", "")).strip()
            assessment_type = str(assessment.get("assessment_type", "")).strip() or "Assignment"
            weight_percentage = float(assessment.get("weight_percentage", 0))
            due_raw = assessment.get("due_date")
            if isinstance(due_raw, date):
                due = due_raw
            else:
                due = _parse_due_date(due_raw)
            due = due.replace(year=inferred_outline_year)
            if not title:
                continue
            if weight_percentage < 0 or weight_percentage > 100:
                continue
            print("Saving assessment:", assessment)
            db_assessment = Assessment(
                user_id=current_user.id,
                course_id=db_course.id,
                title=title,
                assessment_type=assessment_type,
                due_date=due,
                weight_percentage=weight_percentage,
                is_completed=False,
            )
            db.add(db_assessment)
            created.append(db_assessment)
        except Exception:
            continue

    db.commit()
    for assessment in created:
        db.refresh(assessment)

    return {
        "message": "Syllabus processed successfully.",
        "assessments_created": len(created),
        "assessments": [
            {
                "id": str(a.id),
                "course_id": str(a.course_id),
                "title": a.title,
                "assessment_type": a.assessment_type,
                "weight_percentage": a.weight_percentage,
                "due_date": a.due_date.isoformat(),
                "is_completed": a.is_completed,
            }
            for a in created
        ],
    }
