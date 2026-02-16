"""
Study block validation service.

This module contains validation logic for study blocks, including overlap detection.
"""

from datetime import date, time
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.study_block import StudyBlock


def check_for_overlaps(
    db: Session,
    user_id: UUID,
    date: date,
    start_time: time,
    end_time: time,
    exclude_block_id: UUID | None = None,
) -> StudyBlock | None:
    """
    Check if a study block overlaps with any existing blocks for the user on the same date.
    
    Args:
        db: Database session
        user_id: UUID of the user
        date: Date of the study block
        start_time: Start time of the study block
        end_time: End time of the study block
        exclude_block_id: Optional UUID of a block to exclude from the check (for updates)
        
    Returns:
        The overlapping StudyBlock if found, None otherwise
        
    Overlap condition: Two blocks overlap if (new_start < existing_end) AND (new_end > existing_start)
    """
    # Query for existing blocks on the same date for this user
    query = db.query(StudyBlock).filter(
        and_(
            StudyBlock.user_id == user_id,
            StudyBlock.date == date,
        )
    )
    
    # Exclude the current block if updating
    if exclude_block_id is not None:
        query = query.filter(StudyBlock.id != exclude_block_id)
    
    existing_blocks = query.all()
    
    # Check for overlaps
    # Overlap exists if: (new_start < existing_end) AND (new_end > existing_start)
    for block in existing_blocks:
        if start_time < block.end_time and end_time > block.start_time:
            return block
    
    return None
