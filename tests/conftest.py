"""
Pytest configuration and fixtures for FastAPI application tests.
"""

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Set test environment variables before importing app modules
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET"] = "test-secret-key-for-testing-only"
os.environ["DEBUG"] = "False"

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.models.user import User
from app.core.security import get_password_hash, create_access_token


# Test database URL - using SQLite in-memory database
# Note: SQLite doesn't natively support PostgreSQL UUID types, but SQLAlchemy
# will handle UUIDs by storing them as strings in SQLite
TEST_DATABASE_URL = "sqlite:///:memory:"

# Create test engine with StaticPool for in-memory SQLite
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Needed for SQLite
    poolclass=StaticPool,
    echo=False,
)

# Create test sessionmaker
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """
    Create a test database session.
    
    Creates all tables, yields a session, then drops all tables after the test.
    """
    # Create all tables
    Base.metadata.create_all(bind=test_engine)
    
    # Create a session
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop all tables
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session: Session):
    """
    Create a FastAPI TestClient with database dependency override.
    
    Overrides the get_db dependency to use the test database session.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass  # Don't close the session here, let the fixture handle it
    
    # Override the dependency
    app.dependency_overrides[get_db] = override_get_db
    
    # Create test client
    test_client = TestClient(app)
    
    yield test_client
    
    # Clean up: remove dependency override
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db_session: Session):
    """
    Create a test user in the database.
    
    Returns the User object.
    """
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("testpassword123"),
        full_name="Test User",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def auth_headers(test_user: User):
    """
    Generate JWT token for test_user and return authorization headers.
    
    Returns a dict with Authorization header: {"Authorization": f"Bearer {token}"}
    """
    # Create access token for the test user
    access_token = create_access_token(data={"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {access_token}"}
