from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.models.user import User
from app.models.assessment import Assessment
from app.models.course import Course
from app.models.study_session import StudySession
from app.schemas.assessment import AssessmentCreate, AssessmentResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/assessments", tags=["assessments"])


class GradePayload(BaseModel):
    earned_score: float | None = None


@router.post("/", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new assessment for a course owned by the current user."""
    owned_course = (
        db.query(Course)
        .filter(
            Course.id == assessment_data.course_id,
            Course.user_id == current_user.id,
        )
        .first()
    )
    if not owned_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    db_assessment = Assessment(
        user_id=current_user.id,
        **assessment_data.model_dump(),
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment


@router.get("/", response_model=list[AssessmentResponse])
async def get_assessments(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    course_id: UUID | None = None,
):
    """Get all assessments for the current user, optionally filtered by course."""
    query = db.query(Assessment).filter(Assessment.user_id == current_user.id)
    if course_id:
        query = query.filter(Assessment.course_id == course_id)
    return query.all()


@router.patch("/{assessment_id}/toggle-complete", response_model=AssessmentResponse)
async def toggle_assessment_complete(
    assessment_id: UUID,
    payload: GradePayload | None = None,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_assessment = (
        db.query(Assessment)
        .filter(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
        )
        .first()
    )
    if not db_assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found",
        )

    db_assessment.is_completed = not db_assessment.is_completed

    if payload is not None and payload.earned_score is not None:
        db_assessment.earned_score = payload.earned_score

    if db_assessment.is_completed:
        # Clean up unneeded auto-generated study sessions
        db.query(StudySession).filter(
            StudySession.user_id == current_user.id,
            StudySession.is_completed.is_(False),
            StudySession.title == f"Study: {db_assessment.title}",
        ).delete(synchronize_session=False)

    db.commit()
    db.refresh(db_assessment)
    return db_assessment


@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_assessment = (
        db.query(Assessment)
        .filter(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
        )
        .first()
    )
    if not db_assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found",
        )

    db.delete(db_assessment)
    db.commit()
