from pydantic import BaseModel, Field, field_validator
from uuid import UUID


class CourseCreate(BaseModel):
    course_code: str = Field(..., min_length=1, description="Course code (e.g., MATH 402)")
    course_name: str = Field(..., min_length=1, description="Course name")
    credits: float = Field(..., gt=0, description="Course weight in credits")
    target_grade: str = Field(..., min_length=1, description='Target grade (e.g., "A", "85%")')

    @field_validator("course_code", "course_name", "target_grade")
    @classmethod
    def validate_not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Field cannot be empty")
        return value.strip()


class CourseUpdate(BaseModel):
    course_code: str | None = Field(None, min_length=1, description="Course code (e.g., MATH 402)")
    course_name: str | None = Field(None, min_length=1, description="Course name")
    credits: float | None = Field(None, gt=0, description="Course weight in credits")
    target_grade: str | None = Field(None, min_length=1, description='Target grade (e.g., "A", "85%")')

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
    course_code: str
    course_name: str
    credits: float
    target_grade: str

    class Config:
        from_attributes = True
