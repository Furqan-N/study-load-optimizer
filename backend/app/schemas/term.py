from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from typing import Literal, List


class TermCreate(BaseModel):
    season: Literal["Winter", "Spring", "Fall"]
    year: int = Field(..., ge=2000, le=2100)

    @field_validator("season")
    @classmethod
    def validate_season(cls, value: str) -> str:
        if value not in ("Winter", "Spring", "Fall"):
            raise ValueError("Season must be Winter, Spring, or Fall")
        return value


class TermUpdate(BaseModel):
    season: Literal["Winter", "Spring", "Fall"] | None = None
    year: int | None = Field(None, ge=2000, le=2100)
    is_archived: bool | None = None

    @field_validator("season")
    @classmethod
    def validate_season(cls, value: str | None) -> str | None:
        if value is not None and value not in ("Winter", "Spring", "Fall"):
            raise ValueError("Season must be Winter, Spring, or Fall")
        return value


class TermResponse(BaseModel):
    id: UUID
    user_id: UUID
    season: str
    year: int
    is_current: bool
    is_archived: bool = False
    course_count: int = 0
    status: str = "Active"

    sort_order: int = 0

    class Config:
        from_attributes = True


class TermReorder(BaseModel):
    term_ids: List[UUID]
