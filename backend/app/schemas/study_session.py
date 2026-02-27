from datetime import datetime
from pydantic import BaseModel, Field, model_validator
from uuid import UUID


class StudySessionCreate(BaseModel):
    course_id: UUID
    title: str = Field(..., min_length=1)
    start_time: datetime
    end_time: datetime
    duration_minutes: int = Field(..., gt=0)

    @model_validator(mode="after")
    def validate_time_range(self) -> "StudySessionCreate":
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class StudySessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    course_id: UUID
    title: str
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    is_completed: bool

    class Config:
        from_attributes = True
