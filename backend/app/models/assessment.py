import uuid
from sqlalchemy import Column, String, Float, ForeignKey, Date, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    assessment_type = Column(String, nullable=False)  # Exam, Essay, Project, etc.
    due_date = Column(Date, nullable=False)
    weight_percentage = Column(Float, nullable=False)
    is_completed = Column(Boolean, nullable=False, default=False)

    # Relationships
    user = relationship("User", back_populates="assessments")
    course = relationship("Course", back_populates="assessments")
