from pydantic import BaseModel, Field, field_validator
from uuid import UUID


class CourseCreate(BaseModel):
    term_id: UUID = Field(..., description="Term this course belongs to")
    course_code: str = Field(..., min_length=1, description="Course code (e.g., MATH 402)")
    course_name: str = Field(..., min_length=1, description="Course name")
    credits: float = Field(0.5, gt=0, description="Course weight in credits")
    target_grade: str = Field("85", min_length=1, description='Target grade (e.g., "A", "85%")')
    daily_target_hours: float = Field(
        4.0,
        ge=0,
        le=12,
        description="Daily study target in hours",
    )

    @field_validator("course_code", "course_name", "target_grade")
    @classmethod
    def validate_not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Field cannot be empty")
        return value.strip()


class CourseUpdate(BaseModel):
    term_id: UUID | None = Field(None, description="Term this course belongs to")
    course_code: str | None = Field(None, min_length=1, description="Course code (e.g., MATH 402)")
    course_name: str | None = Field(None, min_length=1, description="Course name")
    credits: float | None = Field(None, gt=0, description="Course weight in credits")
    target_grade: str | None = Field(None, min_length=1, description='Target grade (e.g., "A", "85%")')
    daily_target_hours: float | None = Field(
        None,
        ge=0,
        le=12,
        description="Optional daily study target in hours",
    )

    @field_validator("course_code", "course_name", "target_grade")
    @classmethod
    def validate_optional_not_empty(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not value.strip():
            raise ValueError("Field cannot be empty")
        return value.strip()


class CourseResponse(BaseModel):
    id: UUID
    user_id: UUID
    term_id: UUID
    course_code: str
    course_name: str
    credits: float
    target_grade: str
    daily_target_hours: float = 4.0

    class Config:
        from_attributes = True
