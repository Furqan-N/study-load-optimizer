"""
SQLAlchemy Base class definition.

This module contains only the Base declarative base to avoid circular imports.
Models should import Base from here, not from app.db.base.
"""

from sqlalchemy.orm import declarative_base

Base = declarative_base()
