import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    name = Column(String, nullable=False)  # e.g., "Midterm 1", "Assignment 3"
    assessment_type = Column(String, nullable=False)  # e.g., "exam", "assignment", "project"
    weight = Column(Integer, nullable=False)  # Percentage (e.g., 25 for 25%)
    due_date = Column(Date, nullable=False)
    estimated_hours = Column(Integer, nullable=True)  # Estimated hours needed
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="assessments")
    course = relationship("Course", back_populates="assessments")
