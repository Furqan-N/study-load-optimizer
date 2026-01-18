from datetime import datetime
from pydantic import BaseModel
from uuid import UUID


class CourseBase(BaseModel):
    code: str
    name: str
    credits: int = 3
    description: str | None = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    code: str | None = None
    name: str | None = None
    credits: int | None = None
    description: str | None = None


class CourseResponse(CourseBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
