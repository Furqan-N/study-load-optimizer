from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.study_block import StudyBlock
from app.models.user import User
from app.schemas.plan import PlanGenerateRequest, PlanGenerateResponse, StudyBlockResponse
from app.services.planner import generate_study_plan

router = APIRouter(prefix="/plan", tags=["plan"])


@router.post("/generate", response_model=PlanGenerateResponse, status_code=status.HTTP_201_CREATED)
async def generate_plan(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    body: PlanGenerateRequest | None = None,
):
    """
    Generate an optimised study plan.

    Accepts an optional date range (defaults to today → +14 days).
    Idempotent: existing auto-generated blocks in the range are deleted
    before new ones are created.
    """
    start = (body.start_date if body and body.start_date else None) or date.today()
    end = (body.end_date if body and body.end_date else None) or (start + timedelta(days=14))

    # Idempotency: remove previously generated blocks in the range.
    db.query(StudyBlock).filter(
        and_(
            StudyBlock.user_id == current_user.id,
            StudyBlock.date >= start,
            StudyBlock.date <= end,
        )
    ).delete(synchronize_session=False)

    new_blocks = generate_study_plan(db, current_user.id, start, end)

    if new_blocks:
        db.bulk_save_objects(new_blocks)
    db.commit()

    # Re-query to get blocks with generated ids.
    saved_blocks = (
        db.query(StudyBlock)
        .filter(
            and_(
                StudyBlock.user_id == current_user.id,
                StudyBlock.date >= start,
                StudyBlock.date <= end,
            )
        )
        .order_by(StudyBlock.date, StudyBlock.start_time)
        .all()
    )

    return PlanGenerateResponse(
        message="Study plan generated!" if saved_blocks else "No upcoming assessments or availability to plan for.",
        blocks_created=len(saved_blocks),
        blocks=[StudyBlockResponse.model_validate(b) for b in saved_blocks],
    )
