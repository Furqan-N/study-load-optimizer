from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from uuid import UUID


class CourseBase(BaseModel):
    code: str = Field(..., min_length=1, description="Course code (e.g., CS135)")
    name: str = Field(..., min_length=1, description="Course name")
    color: str | None = Field(None, description="Optional color for UI")


class CourseCreate(CourseBase):
    @field_validator("code", "name")
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()


class CourseUpdate(BaseModel):
    code: str | None = Field(None, min_length=1)
    name: str | None = Field(None, min_length=1)
    color: str | None = None

    @field_validator("code", "name")
    @classmethod
    def validate_not_empty_if_provided(cls, v: str | None) -> str | None:
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Field cannot be empty")
            return v.strip()
        return v


class CourseResponse(CourseBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
