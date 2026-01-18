from datetime import date, time, datetime
from pydantic import BaseModel
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
