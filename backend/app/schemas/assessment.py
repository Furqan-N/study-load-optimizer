from datetime import date
from pydantic import BaseModel, Field, field_validator
from uuid import UUID


class AssessmentCreate(BaseModel):
    course_id: UUID
    assessment_type: str
    title: str
    due_date: date
    weight_percentage: float = Field(..., ge=0, le=100)

    @field_validator("title", "assessment_type")
    @classmethod
    def validate_not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Field cannot be empty")
        return value.strip()


class AssessmentResponse(BaseModel):
    id: UUID
    user_id: UUID
    course_id: UUID
    title: str
    assessment_type: str
    due_date: date
    weight_percentage: float
    is_completed: bool
    earned_score: float | None = None

    class Config:
        from_attributes = True
