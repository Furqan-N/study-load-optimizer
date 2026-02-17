"""
Database base module for Alembic.

This module imports Base from base_class and all models so Alembic can detect them.
Models should import Base from app.db.base_class, not from here.
"""

# Import Base from base_class (no circular dependency)
from app.db.base_class import Base  # noqa

# Import all models here so Alembic can detect them
from app.models.user import User  # noqa
from app.models.course import Course  # noqa
from app.models.assessment import Assessment  # noqa
from app.models.availability import Availability  # noqa
from app.models.study_block import StudyBlock  # noqa
