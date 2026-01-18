from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import all models here so Alembic can detect them
from app.models.user import User  # noqa
from app.models.course import Course  # noqa
from app.models.assessment import Assessment  # noqa
from app.models.availability import Availability  # noqa
from app.models.study_block import StudyBlock  # noqa
