from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.course import Course
from app.models.term import Term
from app.models.user import User
from app.schemas.term import TermCreate, TermUpdate, TermReorder, TermResponse

router = APIRouter(prefix="/terms", tags=["terms"])


def _to_response(term: Term, course_count: int) -> TermResponse:
    return TermResponse(
        id=term.id,
        user_id=term.user_id,
        season=term.season,
        year=term.year,
        is_current=term.is_current,
        is_archived=term.is_archived,
        course_count=course_count,
        status="Archived" if term.is_archived else "Active",
        sort_order=term.sort_order,
    )


@router.get("/", response_model=list[TermResponse])
async def list_terms(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[TermResponse]:
    terms = (
        db.query(Term)
        .filter(Term.user_id == current_user.id)
        .order_by(Term.sort_order)
        .all()
    )

    # Build course counts in a single query
    counts_query = (
        db.query(Course.term_id, func.count(Course.id))
        .filter(Course.user_id == current_user.id)
        .group_by(Course.term_id)
        .all()
    )
    count_by_term = {str(tid): cnt for tid, cnt in counts_query}

    return [_to_response(t, count_by_term.get(str(t.id), 0)) for t in terms]


@router.post("/", response_model=TermResponse, status_code=status.HTTP_201_CREATED)
async def create_term(
    payload: TermCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> TermResponse:
    existing = (
        db.query(Term)
        .filter(
            Term.user_id == current_user.id,
            Term.season == payload.season,
            Term.year == payload.year,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{payload.season} {payload.year} already exists.",
        )

    # Mark all other terms as not current
    db.query(Term).filter(
        Term.user_id == current_user.id,
        Term.is_current == True,
    ).update({"is_current": False})

    max_order = (
        db.query(func.coalesce(func.max(Term.sort_order), -1))
        .filter(Term.user_id == current_user.id)
        .scalar()
    )

    term = Term(
        user_id=current_user.id,
        season=payload.season,
        year=payload.year,
        is_current=True,
        sort_order=max_order + 1,
    )
    db.add(term)
    db.commit()
    db.refresh(term)
    return _to_response(term, 0)


@router.patch("/{term_id}", response_model=TermResponse)
async def update_term(
    term_id: str,
    payload: TermUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> TermResponse:
    term = (
        db.query(Term)
        .filter(Term.id == term_id, Term.user_id == current_user.id)
        .first()
    )
    if not term:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Check for duplicate season+year if either is being changed
    new_season = update_data.get("season", term.season)
    new_year = update_data.get("year", term.year)
    if new_season != term.season or new_year != term.year:
        duplicate = (
            db.query(Term)
            .filter(
                Term.user_id == current_user.id,
                Term.season == new_season,
                Term.year == new_year,
                Term.id != term.id,
            )
            .first()
        )
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"{new_season} {new_year} already exists.",
            )

    for field, value in update_data.items():
        setattr(term, field, value)

    db.commit()
    db.refresh(term)

    course_count = db.query(func.count(Course.id)).filter(Course.term_id == term.id).scalar() or 0
    return _to_response(term, course_count)


@router.put("/reorder", response_model=list[TermResponse])
async def reorder_terms(
    payload: TermReorder,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[TermResponse]:
    terms = (
        db.query(Term)
        .filter(Term.user_id == current_user.id)
        .all()
    )
    term_map = {str(t.id): t for t in terms}

    for idx, term_id in enumerate(payload.term_ids):
        term = term_map.get(str(term_id))
        if term:
            term.sort_order = idx

    db.commit()

    counts_query = (
        db.query(Course.term_id, func.count(Course.id))
        .filter(Course.user_id == current_user.id)
        .group_by(Course.term_id)
        .all()
    )
    count_by_term = {str(tid): cnt for tid, cnt in counts_query}

    ordered = sorted(terms, key=lambda t: t.sort_order)
    return [_to_response(t, count_by_term.get(str(t.id), 0)) for t in ordered]


@router.delete("/{term_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_term(
    term_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    term = (
        db.query(Term)
        .filter(Term.id == term_id, Term.user_id == current_user.id)
        .first()
    )
    if not term:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term not found")
    db.delete(term)
    db.commit()
