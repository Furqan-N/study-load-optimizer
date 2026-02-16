import uuid
from sqlalchemy import (
    Column,
    String,
    Float,
    ForeignKey,
    DateTime,
    Date,
    CheckConstraint,
    Index,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
from sqlalchemy.sql import func


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    course_id = Column(
        UUID(as_uuid=True),
        ForeignKey("courses.id"),
        nullable=False,
    )
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)  # assignment, quiz, midterm, final, other
    due_date = Column(Date, nullable=True)
    weight_percent = Column(
        Float,
        nullable=False,
    )
    expected_hours = Column(
        Float,
        nullable=False,
    )
    hours_completed = Column(
        Float,
        nullable=False,
        default=0.0,
    )
    status = Column(
        String,
        nullable=False,
        default="not_started",  # not_started, in_progress, done
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=text("now()"),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="assessments")
    course = relationship("Course", back_populates="assessments")
