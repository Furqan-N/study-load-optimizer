from datetime import datetime, date
from pydantic import BaseModel
from uuid import UUID


class AssessmentBase(BaseModel):
    name: str
    assessment_type: str
    weight: int  # Percentage
    due_date: date
    estimated_hours: int | None = None


class AssessmentCreate(AssessmentBase):
    course_id: UUID


class AssessmentUpdate(BaseModel):
    name: str | None = None
    assessment_type: str | None = None
    weight: int | None = None
    due_date: date | None = None
    estimated_hours: int | None = None
    hours_completed: float | None = None
    status: str | None = None  # not_started, in_progress, done


class AssessmentResponse(AssessmentBase):
    id: UUID
    user_id: UUID
    course_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
