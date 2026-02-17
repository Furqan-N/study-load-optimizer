from __future__ import annotations

from datetime import date as datetime_date, time as datetime_time, datetime, timedelta
from pydantic import BaseModel, Field
from uuid import UUID


class StudyBlockBase(BaseModel):
    date: datetime_date
    start_time: datetime_time
    end_time: datetime_time
    duration_hours: int
    description: str | None = None
    course_id: UUID | None = None
    assessment_id: UUID | None = None


class StudyBlockCreate(StudyBlockBase):
    pass


class StudyBlockUpdate(BaseModel):
    date: datetime_date | None = None
    start_time: datetime_time | None = None
    end_time: datetime_time | None = None
    duration_hours: int | None = None
    description: str | None = None
    course_id: UUID | None = None
    assessment_id: UUID | None = None


class StudyBlockResponse(StudyBlockBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class PlanGenerateRequest(BaseModel):
    """Request schema for generating a study plan."""
    start_date: datetime_date | None = Field(
        default=None,
        description="Start date for the study plan (defaults to today if not provided)"
    )
    end_date: datetime_date | None = Field(
        default=None,
        description="End date for the study plan (defaults to 7 days from today if not provided)"
    )


class PlanGenerateResponse(BaseModel):
    """Response schema for study plan generation."""
    message: str
    blocks_created: int
    blocks: list[StudyBlockResponse]
