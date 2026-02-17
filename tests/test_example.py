"""
Example test file to verify pytest setup is working.
"""


def test_example():
    """Simple test to verify pytest is working."""
    assert 1 + 1 == 2


def test_client_fixture(client):
    """Test that the client fixture works."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_db_session_fixture(db_session):
    """Test that the db_session fixture works."""
    # Just verify we can query
    from app.models.user import User
    users = db_session.query(User).all()
    assert isinstance(users, list)


def test_test_user_fixture(test_user):
    """Test that the test_user fixture works."""
    assert test_user.email == "test@example.com"
    assert test_user.full_name == "Test User"
    assert test_user.id is not None


def test_auth_headers_fixture(auth_headers, test_user):
    """Test that the auth_headers fixture works."""
    assert "Authorization" in auth_headers
    assert auth_headers["Authorization"].startswith("Bearer ")
