from typing import Annotated, List
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import delete, and_
from uuid import UUID
from app.db.session import get_db
from app.models.user import User
from app.models.study_block import StudyBlock
from app.schemas.plan import (
    StudyBlockCreate,
    StudyBlockUpdate,
    StudyBlockResponse,
    PlanGenerateRequest,
    PlanGenerateResponse,
)
from app.core.deps import get_current_user
from app.services.planner import generate_study_plan
from app.services.study_block import check_for_overlaps

router = APIRouter(prefix="/plan", tags=["plan"])


@router.get("", response_model=List[StudyBlockResponse])
async def get_study_blocks(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get all study blocks for the current user."""
    study_blocks = db.query(StudyBlock).filter(
        StudyBlock.user_id == current_user.id
    ).all()
    return study_blocks


@router.post("", response_model=StudyBlockResponse, status_code=status.HTTP_201_CREATED)
async def create_study_block(
    study_block_data: StudyBlockCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new study block."""
    # Check for overlapping blocks
    overlapping_block = check_for_overlaps(
        db=db,
        user_id=current_user.id,
        date=study_block_data.date,
        start_time=study_block_data.start_time,
        end_time=study_block_data.end_time,
    )
    
    if overlapping_block:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Study block overlaps with an existing block on {overlapping_block.date} "
                f"from {overlapping_block.start_time} to {overlapping_block.end_time}"
            ),
        )
    
    db_study_block = StudyBlock(
        **study_block_data.model_dump(),
        user_id=current_user.id,
    )
    db.add(db_study_block)
    db.commit()
    db.refresh(db_study_block)
    return db_study_block


@router.get("/{study_block_id}", response_model=StudyBlockResponse)
async def get_study_block(
    study_block_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get a specific study block."""
    study_block = db.query(StudyBlock).filter(
        StudyBlock.id == study_block_id,
        StudyBlock.user_id == current_user.id,
    ).first()
    if not study_block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study block not found",
        )
    return study_block


@router.patch("/{study_block_id}", response_model=StudyBlockResponse)
async def update_study_block(
    study_block_id: UUID,
    study_block_data: StudyBlockUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Update a study block."""
    study_block = db.query(StudyBlock).filter(
        StudyBlock.id == study_block_id,
        StudyBlock.user_id == current_user.id,
    ).first()
    if not study_block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study block not found",
        )
    
    # Get the updated values (use existing values if not provided in update)
    update_data = study_block_data.model_dump(exclude_unset=True)
    new_date = update_data.get("date", study_block.date)
    new_start_time = update_data.get("start_time", study_block.start_time)
    new_end_time = update_data.get("end_time", study_block.end_time)
    
    # Check for overlapping blocks with the new values
    overlapping_block = check_for_overlaps(
        db=db,
        user_id=current_user.id,
        date=new_date,
        start_time=new_start_time,
        end_time=new_end_time,
        exclude_block_id=study_block_id,  # Exclude the current block being updated
    )
    
    if overlapping_block:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Study block overlaps with an existing block on {overlapping_block.date} "
                f"from {overlapping_block.start_time} to {overlapping_block.end_time}"
            ),
        )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(study_block, field, value)
    db.commit()
    db.refresh(study_block)
    return study_block


@router.delete("/{study_block_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_study_block(
    study_block_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Delete a study block."""
    study_block = db.query(StudyBlock).filter(
        StudyBlock.id == study_block_id,
        StudyBlock.user_id == current_user.id,
    ).first()
    if not study_block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study block not found",
        )
    db.delete(study_block)
    db.commit()
    return None


@router.post("/generate", response_model=PlanGenerateResponse, status_code=status.HTTP_201_CREATED)
async def generate_plan(
    request: PlanGenerateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Generate a study plan based on user's assessments and availability.
    
    Creates StudyBlock objects automatically and saves them to the database.
    """
    # Use provided dates or defaults
    start_date = request.start_date if request.start_date is not None else date.today()
    end_date = request.end_date if request.end_date is not None else date.today() + timedelta(days=7)
    
    # Validate date range
    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date must be before or equal to end_date",
        )
    
    # Delete existing auto-generated blocks for this date range
    # Only delete blocks with assessment_id (auto-generated), preserve manual blocks
    delete_stmt = delete(StudyBlock).where(
        and_(
            StudyBlock.user_id == current_user.id,
            StudyBlock.date >= start_date,
            StudyBlock.date <= end_date,
            StudyBlock.assessment_id.isnot(None),  # Only delete auto-generated blocks
        )
    )
    db.execute(delete_stmt)
    db.flush()  # Clear deleted blocks from transaction before adding new ones
    
    # Generate study plan
    new_blocks = generate_study_plan(
        db=db,
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
    )
    
    # Save blocks to database
    if new_blocks:
        db.add_all(new_blocks)
        db.commit()
        
        # Refresh all blocks to get their IDs and timestamps
        for block in new_blocks:
            db.refresh(block)
    
    return PlanGenerateResponse(
        message=f"Successfully generated {len(new_blocks)} study blocks",
        blocks_created=len(new_blocks),
        blocks=[StudyBlockResponse.model_validate(block) for block in new_blocks],
    )
