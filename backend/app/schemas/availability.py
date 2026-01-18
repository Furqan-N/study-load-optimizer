from datetime import datetime, time
from pydantic import BaseModel
from uuid import UUID


class AvailabilityBase(BaseModel):
    day_of_week: str
    start_time: time
    end_time: time


class AvailabilityCreate(AvailabilityBase):
    pass


class AvailabilityUpdate(BaseModel):
    day_of_week: str | None = None
    start_time: time | None = None
    end_time: time | None = None


class AvailabilityResponse(AvailabilityBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
