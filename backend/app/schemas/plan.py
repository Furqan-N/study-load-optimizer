from datetime import date, time, datetime, timedelta
from pydantic import BaseModel, Field
from uuid import UUID


class StudyBlockBase(BaseModel):
    date: date
    start_time: time
    end_time: time
    duration_hours: int
    description: str | None = None
    course_id: UUID | None = None
    assessment_id: UUID | None = None


class StudyBlockCreate(StudyBlockBase):
    pass


class StudyBlockUpdate(BaseModel):
    date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
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
    start_date: date | None = Field(
        default=None,
        description="Start date for the study plan (defaults to today if not provided)"
    )
    end_date: date | None = Field(
        default=None,
        description="End date for the study plan (defaults to 7 days from today if not provided)"
    )


class PlanGenerateResponse(BaseModel):
    """Response schema for study plan generation."""
    message: str
    blocks_created: int
    blocks: list[StudyBlockResponse]
