from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.models.user import User
from app.models.study_block import StudyBlock
from app.schemas.plan import StudyBlockCreate, StudyBlockUpdate, StudyBlockResponse
from app.core.deps import get_current_user

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
    update_data = study_block_data.model_dump(exclude_unset=True)
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
