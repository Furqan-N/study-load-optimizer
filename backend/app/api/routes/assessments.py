from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.models.user import User
from app.models.assessment import Assessment
from app.models.course import Course
from app.schemas.assessment import AssessmentCreate, AssessmentUpdate, AssessmentResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/assessments", tags=["assessments"])


@router.get("", response_model=List[AssessmentResponse])
async def get_assessments(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    course_id: UUID | None = None,
):
    """Get all assessments for the current user, optionally filtered by course."""
    query = db.query(Assessment).filter(Assessment.user_id == current_user.id)
    if course_id:
        query = query.filter(Assessment.course_id == course_id)
    assessments = query.all()
    return assessments


@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new assessment."""
    # Verify course belongs to user
    course = db.query(Course).filter(
        Course.id == assessment_data.course_id,
        Course.user_id == current_user.id,
    ).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )
    
    db_assessment = Assessment(
        **assessment_data.model_dump(),
        user_id=current_user.id,
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment


@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get a specific assessment."""
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id,
    ).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found",
        )
    return assessment


@router.patch("/{assessment_id}", response_model=AssessmentResponse)
async def update_assessment(
    assessment_id: UUID,
    assessment_data: AssessmentUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Update an assessment with automatic status/hours synchronization."""
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id,
    ).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found",
        )
    
    update_data = assessment_data.model_dump(exclude_unset=True)
    
    # Store original values
    original_status = assessment.status
    original_hours_completed = assessment.hours_completed
    
    # Track what's being explicitly updated
    hours_updated = "hours_completed" in update_data
    status_updated = "status" in update_data
    
    new_hours_completed = update_data.get("hours_completed", original_hours_completed)
    new_status = update_data.get("status", original_status)
    
    # Hours -> Status trigger: If hours_completed is updated and >= expected_hours, set status to 'done'
    if hours_updated and new_hours_completed >= assessment.expected_hours:
        # Only auto-set to 'done' if status is not being explicitly changed to something else
        # This allows reopening (status can be explicitly set to 'in_progress' even if hours >= expected)
        if not status_updated:
            update_data["status"] = "done"
        # If status is being explicitly set, respect that (allows reopening)
    
    # Status -> Hours trigger: If status is explicitly set to 'done', set hours_completed = expected_hours
    if status_updated and new_status == "done":
        # Determine the current hours value (new if being updated, otherwise original)
        current_hours = update_data.get("hours_completed", original_hours_completed)
        # Only update hours if current hours_completed < expected_hours
        if current_hours < assessment.expected_hours:
            update_data["hours_completed"] = assessment.expected_hours
    
    # Reopening trigger: If status changes from 'done' to 'in_progress', allow it
    # The logic above already handles this - if status is explicitly set, we respect it
    
    # Apply all updates
    for field, value in update_data.items():
        setattr(assessment, field, value)
    
    db.commit()
    db.refresh(assessment)
    return assessment


@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Delete an assessment."""
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id,
    ).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found",
        )
    db.delete(assessment)
    db.commit()
    return None
