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
