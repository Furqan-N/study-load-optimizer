from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.models.user import User
from app.models.availability import Availability
from app.schemas.availability import AvailabilityCreate, AvailabilityUpdate, AvailabilityResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/availability", tags=["availability"])


@router.get("", response_model=List[AvailabilityResponse])
async def get_availabilities(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get all availability blocks for the current user."""
    availabilities = db.query(Availability).filter(
        Availability.user_id == current_user.id
    ).all()
    return availabilities


@router.post("", response_model=AvailabilityResponse, status_code=status.HTTP_201_CREATED)
async def create_availability(
    availability_data: AvailabilityCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new availability block."""
    db_availability = Availability(
        **availability_data.model_dump(),
        user_id=current_user.id,
    )
    db.add(db_availability)
    db.commit()
    db.refresh(db_availability)
    return db_availability


@router.get("/{availability_id}", response_model=AvailabilityResponse)
async def get_availability(
    availability_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get a specific availability block."""
    availability = db.query(Availability).filter(
        Availability.id == availability_id,
        Availability.user_id == current_user.id,
    ).first()
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found",
        )
    return availability


@router.patch("/{availability_id}", response_model=AvailabilityResponse)
async def update_availability(
    availability_id: UUID,
    availability_data: AvailabilityUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Update an availability block."""
    availability = db.query(Availability).filter(
        Availability.id == availability_id,
        Availability.user_id == current_user.id,
    ).first()
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found",
        )
    update_data = availability_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(availability, field, value)
    db.commit()
    db.refresh(availability)
    return availability


@router.delete("/{availability_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_availability(
    availability_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Delete an availability block."""
    availability = db.query(Availability).filter(
        Availability.id == availability_id,
        Availability.user_id == current_user.id,
    ).first()
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found",
        )
    db.delete(availability)
    db.commit()
    return None
