from datetime import date
from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.course import Course
from app.models.study_session import StudySession
from app.schemas.study_session import StudySessionCreate, StudySessionResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/study-sessions", tags=["study-sessions"])


@router.post("/", response_model=StudySessionResponse, status_code=status.HTTP_201_CREATED)
async def create_study_session(
    session_data: StudySessionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new study session for the authenticated user."""
    owned_course = (
        db.query(Course)
        .filter(
            Course.id == session_data.course_id,
            Course.user_id == current_user.id,
        )
        .first()
    )
    if not owned_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    db_session = StudySession(
        user_id=current_user.id,
        **session_data.model_dump(),
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


@router.get("/", response_model=list[StudySessionResponse])
async def get_study_sessions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
):
    """Get study sessions for current user with optional date range filters."""
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date must be before or equal to end_date",
        )

    query = db.query(StudySession).filter(StudySession.user_id == current_user.id)

    if start_date:
        query = query.filter(func.date(StudySession.start_time) >= start_date)
    if end_date:
        query = query.filter(func.date(StudySession.start_time) <= end_date)

    return query.order_by(StudySession.start_time.asc()).all()


@router.patch("/{session_id}/toggle-complete", response_model=StudySessionResponse)
async def toggle_study_session_complete(
    session_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_session = (
        db.query(StudySession)
        .filter(
            StudySession.id == session_id,
            StudySession.user_id == current_user.id,
        )
        .first()
    )
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study session not found",
        )

    db_session.is_completed = not db_session.is_completed
    db.commit()
    db.refresh(db_session)
    return db_session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_study_session(
    session_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_session = (
        db.query(StudySession)
        .filter(
            StudySession.id == session_id,
            StudySession.user_id == current_user.id,
        )
        .first()
    )
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study session not found",
        )

    db.delete(db_session)
    db.commit()
