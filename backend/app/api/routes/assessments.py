from datetime import date
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
from app.schemas.assessment import AssessmentBulkCreate, AssessmentCreate, AssessmentResponse, AssessmentUpdate
from app.core.deps import get_current_user

router = APIRouter(prefix="/assessments", tags=["assessments"])


class AssessmentCompletionUpdate(BaseModel):
    is_completed: bool | None = None
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


@router.post("/bulk", response_model=list[AssessmentResponse], status_code=status.HTTP_201_CREATED)
async def create_assessments_bulk(
    payload: AssessmentBulkCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No assessments provided",
        )

    course_ids = {item.course_id for item in payload.items}
    if len(course_ids) != 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Bulk items must target a single course",
        )
    course_id = next(iter(course_ids))
    owned_course = (
        db.query(Course)
        .filter(
            Course.id == course_id,
            Course.user_id == current_user.id,
        )
        .first()
    )
    if not owned_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    created: list[Assessment] = []
    for item in payload.items:
        db_assessment = Assessment(
            user_id=current_user.id,
            **item.model_dump(),
        )
        db.add(db_assessment)
        created.append(db_assessment)

    db.commit()
    for assessment in created:
        db.refresh(assessment)
    return created


@router.get("/upcoming", response_model=list[AssessmentResponse])
async def get_upcoming_deadlines(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: int = 5,
):
    today = date.today()
    return (
        db.query(Assessment)
        .filter(
            Assessment.user_id == current_user.id,
            Assessment.due_date >= today,
            Assessment.earned_score.is_(None),
        )
        .order_by(Assessment.due_date.asc())
        .limit(limit)
        .all()
    )


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


@router.patch("/{assessment_id}", response_model=AssessmentResponse)
async def update_assessment(
    assessment_id: UUID,
    payload: AssessmentUpdate,
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

    if payload.title is not None:
        cleaned_title = payload.title.strip()
        if not cleaned_title:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Title cannot be empty",
            )
        db_assessment.title = cleaned_title

    if payload.assessment_type is not None:
        cleaned_type = payload.assessment_type.strip().lower()
        if not cleaned_type:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Assessment type cannot be empty",
            )
        db_assessment.assessment_type = cleaned_type

    if payload.due_date is not None:
        db_assessment.due_date = payload.due_date

    if payload.weight_percentage is not None:
        if payload.weight_percentage < 0 or payload.weight_percentage > 100:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Weight percentage must be between 0 and 100",
            )
        db_assessment.weight_percentage = payload.weight_percentage

    if payload.earned_score is not None:
        if payload.earned_score < 0 or payload.earned_score > 100:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Grade must be between 0 and 100",
            )
        db_assessment.earned_score = payload.earned_score

    db.commit()
    db.refresh(db_assessment)
    return db_assessment


@router.patch("/{assessment_id}/toggle-complete", response_model=AssessmentResponse)
async def toggle_assessment_complete(
    assessment_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    payload: AssessmentCompletionUpdate | None = None,
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
