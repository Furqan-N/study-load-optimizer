# UW Load Optimizer Backend

Backend API for the UW Load Optimizer application.

## Tech Stack

- Python 3.11+
- FastAPI
- SQLAlchemy 2.0
- Alembic
- PostgreSQL
- JWT Authentication
- Pydantic v2

## Setup

1. Install dependencies:
```bash
pip install -e .
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Create a PostgreSQL database:
```sql
CREATE DATABASE uw_load_optimizer;
```

4. Run migrations:
```bash
alembic upgrade head
```

5. Start the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── core/                # Core functionality
│   │   ├── config.py        # Configuration management
│   │   ├── security.py      # JWT and password hashing
│   │   └── deps.py          # Dependency injection
│   ├── db/                  # Database setup
│   │   ├── session.py       # SQLAlchemy session
│   │   └── base.py          # Base model imports
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── api/                 # API routes
│   │   ├── router.py        # Main router
│   │   └── routes/          # Route handlers
│   └── services/            # Business logic
├── alembic/                 # Database migrations
└── alembic.ini              # Alembic configuration
```

## Development

Run tests:
```bash
pytest
```

Create a new migration:
```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `DEBUG`: Enable debug mode (default: False)

## API Examples

### Authentication

First, register a user and login to get an access token:

```bash
# Register a new user
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "full_name": "John Doe"
  }'

# Login to get access token
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'

# Response: {"access_token": "eyJ...", "token_type": "bearer"}
```

Save the `access_token` from the login response. Use it in subsequent requests as `Bearer <token>`.

### Course CRUD Operations

Replace `<TOKEN>` with your actual access token and `<COURSE_ID>` with a course UUID.

```bash
# Get all courses (only current user's courses)
curl -X GET "http://localhost:8000/api/v1/courses" \
  -H "Authorization: Bearer <TOKEN>"

# Create a new course
curl -X POST "http://localhost:8000/api/v1/courses" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CS135",
    "name": "Designing Functional Programs",
    "color": "#3b82f6"
  }'

# Get a specific course
curl -X GET "http://localhost:8000/api/v1/courses/<COURSE_ID>" \
  -H "Authorization: Bearer <TOKEN>"

# Update a course (PUT - full update)
curl -X PUT "http://localhost:8000/api/v1/courses/<COURSE_ID>" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CS136",
    "name": "Elementary Algorithm Design and Data Abstraction",
    "color": "#ef4444"
  }'

# Delete a course
curl -X DELETE "http://localhost:8000/api/v1/courses/<COURSE_ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

**Notes:**
- All course operations require authentication
- Users can only access their own courses (ownership is enforced)
- `code` and `name` fields are required and cannot be empty
- `color` is optional
