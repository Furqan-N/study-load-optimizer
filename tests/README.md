# Tests

This directory contains tests for the UW Load Optimizer backend.

## Setup

Install test dependencies:

```bash
pip install pytest pytest-asyncio httpx
```

Or add to your `requirements.txt`:
```
pytest>=7.4.0
pytest-asyncio>=0.21.0
httpx>=0.24.0
```

## Running Tests

From the project root:

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run a specific test file
pytest tests/test_example.py

# Run with coverage
pytest --cov=app --cov-report=html
```

## Fixtures

The `conftest.py` file provides the following fixtures:

- `db_session`: Database session with tables created/dropped for each test
- `client`: FastAPI TestClient with database dependency override
- `test_user`: A test user created in the database
- `auth_headers`: JWT authorization headers for the test user

## Example Test

```python
def test_create_course(client, auth_headers):
    response = client.post(
        "/api/v1/courses",
        json={"code": "CS135", "name": "Designing Functional Programs"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    assert response.json()["code"] == "CS135"
```
