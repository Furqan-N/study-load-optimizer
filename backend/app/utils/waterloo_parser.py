import re
from datetime import date, datetime
from typing import Any
from zoneinfo import ZoneInfo

from bs4 import BeautifulSoup

DEFAULT_TERM_END_MONTH = 4
DEFAULT_TERM_END_DAY = 24
DEFAULT_OUTLINE_YEAR = 2026
QUIZ_TITLE_RE = re.compile(r"\bquiz\s*(\d+)\b", re.IGNORECASE)
TERM_YEAR_RE = re.compile(r"\b(?:winter|spring|summer|fall)\s+(\d{4})\b", re.IGNORECASE)
TIME_RE = re.compile(r"\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\b", re.IGNORECASE)
TORONTO_TZ = ZoneInfo("America/Toronto")
ASSIGNMENT_TOKEN_RE = re.compile(r"\bA(\d{1,2})\b", re.IGNORECASE)
QUIZ_TOKEN_RE = re.compile(r"\bQ(\d{1,2})\b", re.IGNORECASE)
PAREN_COUNT_RE = re.compile(r"\((\d{1,3})\)")

MONTH_MAP = {
    "jan": 1,
    "january": 1,
    "feb": 2,
    "february": 2,
    "mar": 3,
    "march": 3,
    "apr": 4,
    "april": 4,
    "may": 5,
    "jun": 6,
    "june": 6,
    "jul": 7,
    "july": 7,
    "aug": 8,
    "august": 8,
    "sep": 9,
    "sept": 9,
    "september": 9,
    "oct": 10,
    "october": 10,
    "nov": 11,
    "november": 11,
    "dec": 12,
    "december": 12,
}


def _extract_table_rows(table: Any) -> list[list[str]]:
    rows: list[list[str]] = []
    for tr in table.find_all("tr"):
        cells = tr.find_all(["th", "td"])
        values = [cell.get_text(" ", strip=True) for cell in cells]
        if any(values):
            rows.append(values)
    return rows


def _parse_weight_percentage(text: str) -> float | None:
    match = re.findall(r"(\d+(?:\.\d+)?)", text or "")
    if not match:
        return None
    try:
        return float(match[0])
    except ValueError:
        return None


def _extract_outline_year(soup: BeautifulSoup) -> int:
    page_text = soup.get_text(" ", strip=True)
    match = TERM_YEAR_RE.search(page_text)
    if match:
        try:
            return int(match.group(1))
        except ValueError:
            return DEFAULT_OUTLINE_YEAR
    return DEFAULT_OUTLINE_YEAR


def _placeholder_term_end_for_year(year: int) -> datetime:
    return datetime(year, DEFAULT_TERM_END_MONTH, DEFAULT_TERM_END_DAY, 0, 0, 0, tzinfo=TORONTO_TZ)


def _extract_time_from_text(text: str) -> tuple[int, int]:
    match = TIME_RE.search(text or "")
    if not match:
        return (0, 0)
    hour = int(match.group(1))
    minute = int(match.group(2) or "0")
    marker = match.group(3).lower().replace(".", "")
    if marker.startswith("p") and hour != 12:
        hour += 12
    if marker.startswith("a") and hour == 12:
        hour = 0
    return (hour, minute)


def _to_toronto_datetime(year: int, month: int, day: int, hour: int = 0, minute: int = 0) -> datetime:
    return datetime(year, month, day, hour, minute, 0, tzinfo=TORONTO_TZ)


def _coerce_date_from_text(text: str, outline_year: int, term_end_placeholder: datetime) -> datetime | None:
    raw = (text or "").strip()
    if not raw:
        return None

    lowered = raw.lower()
    if any(token in lowered for token in ("tba", "tbd", "registrar")):
        return term_end_placeholder

    # ISO path first
    try:
        iso_raw = raw.replace("Z", "+00:00")
        if "T" in iso_raw or "+" in iso_raw[10:] or "-" in iso_raw[10:]:
            iso_dt = datetime.fromisoformat(iso_raw)
            if iso_dt.tzinfo is None:
                iso_dt = iso_dt.replace(tzinfo=TORONTO_TZ)
            iso_dt = iso_dt.astimezone(TORONTO_TZ).replace(year=outline_year, second=0, microsecond=0)
            return iso_dt
        iso_date = date.fromisoformat(iso_raw)
        return _to_toronto_datetime(outline_year, iso_date.month, iso_date.day, 0, 0)
    except Exception:
        pass

    # Month-day extraction from noisy cells (e.g., "Thu Jan 15", "Week 2 Jan 15")
    match = re.search(
        r"\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|"
        r"aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})\b",
        lowered,
        flags=re.IGNORECASE,
    )
    if match:
        month_token = match.group(1).lower().rstrip(".")
        day_num = int(match.group(2))
        month_num = MONTH_MAP.get(month_token)
        if month_num:
            try:
                hour, minute = _extract_time_from_text(raw)
                return _to_toronto_datetime(outline_year, month_num, day_num, hour, minute)
            except ValueError:
                return None

    formats = ["%b %d", "%B %d", "%b %d, %Y", "%B %d, %Y", "%d %b", "%d %B"]
    for fmt in formats:
        try:
            parsed = datetime.strptime(raw, fmt)
            hour, minute = _extract_time_from_text(raw)
            return _to_toronto_datetime(outline_year, parsed.month, parsed.day, hour, minute)
        except ValueError:
            continue
    return None


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


def _extract_month_day_dates(text: str, outline_year: int) -> list[datetime]:
    if not text:
        return []
    matches = re.findall(
        r"\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|"
        r"aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})\b",
        text,
        flags=re.IGNORECASE,
    )
    out: list[datetime] = []
    hour, minute = _extract_time_from_text(text)
    for month_token, day_token in matches:
        month_num = MONTH_MAP.get(month_token.lower().rstrip("."))
        if not month_num:
            continue
        try:
            out.append(_to_toronto_datetime(outline_year, month_num, int(day_token), hour, minute))
        except ValueError:
            continue
    return out


def _extract_weekday_dates(text: str, outline_year: int) -> list[datetime]:
    matches = re.findall(
        r"\b(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\s+"
        r"(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|"
        r"aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})\b",
        text,
        flags=re.IGNORECASE,
    )
    out: list[datetime] = []
    hour, minute = _extract_time_from_text(text)
    for _, month_token, day_token in matches:
        month_num = MONTH_MAP.get(month_token.lower().rstrip("."))
        if not month_num:
            continue
        try:
            out.append(_to_toronto_datetime(outline_year, month_num, int(day_token), hour, minute))
        except ValueError:
            continue
    return out


def _extract_tuesday_dates(text: str, outline_year: int) -> list[datetime]:
    matches = re.findall(
        r"\b(tue(?:s|sday)?)\s+"
        r"(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|"
        r"aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})\b",
        text,
        flags=re.IGNORECASE,
    )
    out: list[datetime] = []
    hour, minute = _extract_time_from_text(text)
    for _, month_token, day_token in matches:
        month_num = MONTH_MAP.get(month_token.lower().rstrip("."))
        if not month_num:
            continue
        try:
            out.append(_to_toronto_datetime(outline_year, month_num, int(day_token), hour, minute))
        except ValueError:
            continue
    return out


def _pick_quiz_due_date_from_plan_row(row: list[str], quiz_cell_text: str, outline_year: int) -> datetime | None:
    # 1) Best source: date embedded in the same quiz cell ("Quiz 1 Thu Jan 15").
    quiz_weekday_dates = _extract_weekday_dates(quiz_cell_text, outline_year)
    if quiz_weekday_dates:
        return quiz_weekday_dates[0]
    quiz_cell_dates = _extract_month_day_dates(quiz_cell_text, outline_year)
    if quiz_cell_dates:
        return quiz_cell_dates[0]

    # 2) Next best: a non-range cell with a date.
    for cell in row:
        cell_weekday_dates = _extract_weekday_dates(cell, outline_year)
        if cell_weekday_dates:
            return cell_weekday_dates[0]
        cell_dates = _extract_month_day_dates(cell, outline_year)
        if not cell_dates:
            continue
        lowered = cell.lower()
        if " - " in cell or " to " in lowered:
            # Date ranges in class plan rows are usually "Thu-Fri"; quizzes are on the first day.
            return cell_dates[0]
        return cell_dates[0]

    # 3) Last resort: any date in row text, choose the first one.
    row_dates = _extract_month_day_dates(" ".join(row), outline_year)
    if row_dates:
        return row_dates[0]
    return None


def _normalize_group_name(text: str) -> str:
    lowered = re.sub(r"[^a-z\s]", " ", (text or "").lower())
    cleaned = re.sub(r"\s+", " ", lowered).strip()
    if not cleaned:
        return ""
    tokens = [tok for tok in cleaned.split(" ") if tok not in {"the", "total", "overall", "weight"}]
    if not tokens:
        return ""
    irregular = {
        "quizzes": "quiz",
    }
    first = tokens[0]
    if first in irregular:
        tokens[0] = irregular[first]
    elif first.endswith("ies") and len(first) > 4:
        tokens[0] = first[:-3] + "y"
    elif first.endswith(("ches", "shes", "sses", "xes", "zes")) and len(first) > 4:
        tokens[0] = first[:-2]
    elif first.endswith("s") and len(first) > 3:
        tokens[0] = first[:-1]
    return " ".join(tokens)


def _extract_parent_count(text: str) -> int | None:
    match = PAREN_COUNT_RE.search(text or "")
    if not match:
        return None
    try:
        return int(match.group(1))
    except ValueError:
        return None


def _is_parent_category_row(title: str, date_text: str) -> bool:
    lowered_date = (date_text or "").strip().lower()
    if not lowered_date:
        return True
    return any(token in lowered_date for token in ("see schedule", "see learn", "see course schedule", "learn"))


def _looks_like_aggregate_component(title: str) -> bool:
    lowered = (title or "").strip().lower()
    if not lowered:
        return False
    if re.search(r"\d", lowered):
        return False
    normalized = _normalize_group_name(lowered)
    if not normalized:
        return False
    first_word = normalized.split(" ")[0]
    return first_word in {"quiz", "assignment", "lab", "project", "test", "exam"}


def _extract_schedule_due_date(row_text_cells: list[str], outline_year: int, term_end_placeholder: datetime) -> datetime:
    # 1) Structured extraction across the full row.
    due = _pick_quiz_due_date_from_plan_row(row_text_cells, " ".join(row_text_cells), outline_year)
    if due:
        return due

    # 2) Cell-by-cell parse using all supported date formats.
    for cell in row_text_cells:
        parsed = _coerce_date_from_text(cell, outline_year, term_end_placeholder)
        if parsed and parsed != term_end_placeholder:
            return parsed

    # 3) Last attempt: strip weekday/range noise and parse again.
    for cell in row_text_cells:
        cleaned = re.sub(r"\b(mon|tue|wed|thu|fri|sat|sun)(?:day)?\b", " ", cell, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s+", " ", cleaned).strip(" ,.-")
        parsed = _coerce_date_from_text(cleaned, outline_year, term_end_placeholder)
        if parsed and parsed != term_end_placeholder:
            return parsed

    return term_end_placeholder


def _child_title_for_group(group_label: str, row_text: str, counter: int) -> str:
    words = [w for w in group_label.split(" ") if w]
    if not words:
        return f"Item {counter}"
    display_base = " ".join(word.capitalize() for word in words)
    joined = " ".join(words)
    match = re.search(rf"\b{re.escape(joined)}\s*(\d+)\b", row_text, flags=re.IGNORECASE)
    if match:
        return f"{display_base} {match.group(1)}"
    return f"{display_base} {counter}"


def _infer_quiz_count_from_text(plan_section: Any, soup: BeautifulSoup) -> int:
    sources: list[str] = []
    if plan_section is not None:
        sources.append(plan_section.get_text(" ", strip=True))
    sources.append(soup.get_text(" ", strip=True))

    count = 0
    patterns = [
        r"\b(\d{1,2})\s+quizzes\b",
        r"\bquizzes?\s*\(?\s*(\d{1,2})\s*\)?\b",
    ]
    for source in sources:
        lowered = source.lower()
        for pattern in patterns:
            for match in re.finditer(pattern, lowered, flags=re.IGNORECASE):
                try:
                    count = max(count, int(match.group(1)))
                except ValueError:
                    continue
    return count


def _extract_quiz_dates_from_course_schedule(
    soup: BeautifulSoup, outline_year: int, term_end_placeholder: datetime
) -> list[datetime]:
    schedule_candidates: list[Any] = []
    for section in soup.find_all(["div", "section"]):
        section_id = (section.get("id") or "").lower()
        section_text = section.get_text(" ", strip=True).lower()
        if "course_schedule" in section_id or "course schedule" in section_text:
            schedule_candidates.append(section)

    quiz_dates: list[datetime] = []
    for section in schedule_candidates:
        for table in section.find_all("table"):
            for row in table.find_all("tr"):
                cells = row.find_all(["th", "td"])
                if not cells:
                    continue
                row_text_cells = [cell.get_text(" ", strip=True) for cell in cells]
                row_joined = " ".join(row_text_cells).lower()
                if "quiz" not in row_joined:
                    continue
                due = _extract_schedule_due_date(row_text_cells, outline_year, term_end_placeholder)
                quiz_dates.append(due)
    return quiz_dates


def parse_waterloo_outline(html_content: str) -> list[dict[str, Any]] | None:
    soup = BeautifulSoup(html_content, "html.parser")
    outline_year = _extract_outline_year(soup)
    term_end_placeholder = _placeholder_term_end_for_year(outline_year)
    assessment_section = soup.find("div", id="assessments_amp_activities")
    if not assessment_section:
        return None

    assessments: list[dict[str, Any]] = []
    parent_categories: dict[str, dict[str, Any]] = {}

    # Pass 1: parse assessment table and identify parent categories.
    for table in assessment_section.find_all("table"):
        rows = _extract_table_rows(table)
        if not rows:
            continue

        headers = [h.lower() for h in rows[0]]
        component_idx = next((i for i, h in enumerate(headers) if "component" in h), 0)
        date_idx = next((i for i, h in enumerate(headers) if "date" in h), 1 if len(rows[0]) > 1 else 0)
        weight_idx = next((i for i, h in enumerate(headers) if "weight" in h), 3 if len(rows[0]) > 3 else 2)
        data_rows = rows[1:] if any("component" in h for h in headers) else rows

        for row in data_rows:
            if component_idx >= len(row) or weight_idx >= len(row):
                continue

            title = row[component_idx].strip()
            date_text = row[date_idx].strip() if date_idx < len(row) else ""
            weight = _parse_weight_percentage(row[weight_idx])
            if not title or weight is None:
                continue

            normalized_group = _normalize_group_name(title)
            if (_is_parent_category_row(title, date_text) or _looks_like_aggregate_component(title)) and normalized_group:
                parent_categories[normalized_group] = {
                    "title": title,
                    "weight_percentage": float(weight),
                    "count": _extract_parent_count(title),
                }
                continue

            lower_title = title.lower()
            due = _coerce_date_from_text(date_text, outline_year, term_end_placeholder)
            assessments.append(
                {
                    "title": title,
                    "weight_percentage": float(weight),
                    "due_date": due or term_end_placeholder,
                    "assessment_type": "exam" if "exam" in lower_title else "assignment",
                }
            )

    # Pass 2: parse tentative class plan and group child items by parent category.
    group_children: dict[str, list[dict[str, Any]]] = {key: [] for key in parent_categories}
    group_counters: dict[str, int] = {key: 0 for key in parent_categories}
    plan_section = soup.find("div", id="tentative_class_plan")
    if plan_section and parent_categories:
        distributed_seen: dict[str, set[int]] = {
            "assignment": set(),
            "quiz": set(),
        }
        for table in plan_section.find_all("table"):
            table_rows = table.find_all("tr")
            if len(table_rows) <= 1:
                continue

            header_cells = table_rows[0].find_all(["th", "td"])
            header_text = [cell.get_text(" ", strip=True).lower() for cell in header_cells]
            assessments_idx = next(
                (i for i, text in enumerate(header_text) if "assessment" in text),
                None,
            )

            for row in table_rows[1:]:
                cols = row.find_all(["th", "td"])
                if not cols:
                    continue
                row_text_cells = [col.get_text(" ", strip=True) for col in cols]
                row_joined = " ".join(row_text_cells)
                lowered_row = row_joined.lower()
                if "no tutorial" in lowered_row or "reading week" in lowered_row:
                    continue

                assessments_cell_text = (
                    row_text_cells[assessments_idx]
                    if assessments_idx is not None and assessments_idx < len(row_text_cells)
                    else row_joined
                )

                # Prefer Tuesday dates in schedule rows for distributed items (CS 136 outlines).
                tuesday_dates = _extract_tuesday_dates(row_joined, outline_year)
                due = tuesday_dates[0] if tuesday_dates else _extract_schedule_due_date(
                    row_text_cells, outline_year, term_end_placeholder
                )

                # Distributed assessments (A1, A2, ... / Q1, Q2, ...)
                assignment_numbers = [
                    int(match.group(1)) for match in ASSIGNMENT_TOKEN_RE.finditer(assessments_cell_text)
                ]
                quiz_numbers = [
                    int(match.group(1)) for match in QUIZ_TOKEN_RE.finditer(assessments_cell_text)
                ]

                if "assignment" in parent_categories:
                    for num in assignment_numbers:
                        if num in distributed_seen["assignment"]:
                            continue
                        distributed_seen["assignment"].add(num)
                        group_children["assignment"].append(
                            {
                                "title": f"A{num}",
                                "due_date": due,
                                "assessment_type": "assignment",
                            }
                        )

                if "quiz" in parent_categories:
                    for num in quiz_numbers:
                        if num in distributed_seen["quiz"]:
                            continue
                        distributed_seen["quiz"].add(num)
                        group_children["quiz"].append(
                            {
                                "title": f"Q{num}",
                                "due_date": due,
                                "assessment_type": "quiz",
                            }
                        )

                for group_key in parent_categories:
                    trigger_word = group_key.split(" ")[0]
                    if not trigger_word:
                        continue
                    if re.search(rf"\b{re.escape(trigger_word)}s?\b", lowered_row, flags=re.IGNORECASE):
                        group_counters[group_key] += 1
                        title = _child_title_for_group(group_key, row_joined, group_counters[group_key])
                        assessment_type = "assignment"
                        if trigger_word == "quiz":
                            assessment_type = "quiz"
                        elif "exam" in group_key:
                            assessment_type = "exam"
                        group_children[group_key].append(
                            {
                                "title": title,
                                "due_date": due,
                                "assessment_type": assessment_type,
                            }
                        )

    # Prevent category clumping for quizzes: if we have a quiz parent total but sparse/no quiz rows,
    # infer quiz count from text and build individual quiz placeholders.
    quiz_parent_key = next((key for key in parent_categories if key.split(" ")[0] == "quiz"), None)
    if quiz_parent_key:
        inferred_quiz_count = _infer_quiz_count_from_text(plan_section, soup)
        if inferred_quiz_count > 0:
            existing_quiz_children = group_children.get(quiz_parent_key, [])
            existing_count = len(existing_quiz_children)
            if existing_count < inferred_quiz_count:
                schedule_quiz_dates = _extract_quiz_dates_from_course_schedule(
                    soup, outline_year, term_end_placeholder
                )
                for idx in range(existing_count + 1, inferred_quiz_count + 1):
                    due = (
                        schedule_quiz_dates[idx - 1]
                        if (idx - 1) < len(schedule_quiz_dates)
                        else term_end_placeholder
                    )
                    existing_quiz_children.append(
                        {
                            "title": f"Quiz {idx}",
                            "due_date": due,
                            "assessment_type": "quiz",
                        }
                    )
                group_children[quiz_parent_key] = existing_quiz_children

    # Dynamic weight normalization: split each parent category weight across found children.
    for group_key, children in group_children.items():
        if not children:
            continue
        parent_weight = float(parent_categories[group_key]["weight_percentage"])
        split_weights = _split_exact(parent_weight, len(children))
        print(f"[waterloo_parser] parent_category={group_key} weight={parent_weight} child_count={len(children)}")
        print(f"[waterloo_parser] split_weights={split_weights}")
        for idx, child in enumerate(children):
            assessments.append(
                {
                    "title": child["title"],
                    "weight_percentage": float(split_weights[idx]),
                    "due_date": child["due_date"],
                    "assessment_type": child["assessment_type"],
                }
            )

    # Enforce term year across all due dates.
    normalized: list[dict[str, Any]] = []
    for item in assessments:
        due = item.get("due_date")
        if isinstance(due, datetime):
            due = due.astimezone(TORONTO_TZ).replace(year=outline_year, second=0, microsecond=0)
        elif isinstance(due, date):
            due = _to_toronto_datetime(outline_year, due.month, due.day, 0, 0)
        elif due:
            parsed_due = _coerce_date_from_text(str(due), outline_year, term_end_placeholder)
            due = (parsed_due or term_end_placeholder).astimezone(TORONTO_TZ).replace(
                year=outline_year, second=0, microsecond=0
            )
        else:
            due = term_end_placeholder

        normalized.append(
            {
                "title": item.get("title", "").strip(),
                "weight_percentage": float(item.get("weight_percentage", 0)),
                "due_date": due.isoformat(),
                "assessment_type": str(item.get("assessment_type", "assignment")),
            }
        )

    final_assessments = [item for item in normalized if item["title"]]

    # Fallback normalizer: if multiple items share a component type and a parent total exists,
    # split that parent total evenly across the child items.
    component_totals: dict[str, float] = {}
    for key, value in parent_categories.items():
        trigger = key.split(" ")[0] if key else ""
        if not trigger:
            continue
        component_totals[trigger] = float(value["weight_percentage"])

    grouped_indexes: dict[str, list[int]] = {}
    for idx, item in enumerate(final_assessments):
        component_key = _normalize_group_name(str(item.get("title", "")))
        trigger = component_key.split(" ")[0] if component_key else ""
        if not trigger:
            continue
        grouped_indexes.setdefault(trigger, []).append(idx)

    for trigger, indexes in grouped_indexes.items():
        parent_total = component_totals.get(trigger)
        if parent_total is None or len(indexes) <= 1:
            continue
        split_weights = _split_exact(parent_total, len(indexes))
        print(
            f"[waterloo_parser] fallback_split component={trigger} "
            f"parent_total={parent_total} child_count={len(indexes)} split_weights={split_weights}"
        )
        for i, item_idx in enumerate(indexes):
            final_assessments[item_idx]["weight_percentage"] = float(split_weights[i])

    final_quiz_objects = [
        item for item in final_assessments if str(item.get("assessment_type", "")).lower() == "quiz"
    ]
    total_weight = round(sum(float(item.get("weight_percentage", 0)) for item in final_assessments), 2)
    print(f"[waterloo_parser] total_weight={total_weight}")
    print(f"[waterloo_parser] final_quiz_objects={final_quiz_objects}")
    print(f"[waterloo_parser] final_parsed_assessments={final_assessments}")

    return final_assessments
