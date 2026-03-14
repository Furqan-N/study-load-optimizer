import uuid
from sqlalchemy import Column, String, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_code = Column(String, nullable=False)  # e.g., "MATH 402"
    course_name = Column(String, nullable=False)  # e.g., "Advanced Calculus"
    credits = Column(Float, nullable=False, default=0.5)
    target_grade = Column(String, nullable=False)  # e.g., "A", "85%"
    daily_target_hours = Column(Float, nullable=False, default=4.0)

    # Relationships
    user = relationship("User", back_populates="courses")
    assessments = relationship("Assessment", back_populates="course", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="course", cascade="all, delete-orphan")
