# Study Load Optimizer — Backend

FastAPI backend for the Study Load Optimizer application.

## Tech Stack

- Python 3.11+
- FastAPI
- SQLAlchemy 2.0
- Alembic (migrations)
- PostgreSQL 15
- JWT Authentication (python-jose + passlib/bcrypt)
- Pydantic v2
- Google Gemini API (syllabus parsing)

## Setup

1. Install dependencies:
```bash
pip install -e .
# or
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Run migrations:
```bash
alembic upgrade head
```

4. Start the development server:
```bash
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`.
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Docker

```bash
docker-compose up
```

This starts both PostgreSQL and the API server.

## Environment Variables

| Variable         | Description                                    | Required |
| ---------------- | ---------------------------------------------- | -------- |
| `DATABASE_URL`   | PostgreSQL connection string                   | Yes      |
| `SECRET_KEY`     | JWT signing secret (also accepts `JWT_SECRET`) | Yes      |
| `DEBUG`          | Enable debug mode (default: `false`)           | No       |
| `GOOGLE_API_KEY` | Gemini API key for syllabus parsing            | No       |
| `GOOGLE_MODEL`   | Gemini model (default: `gemini-2.0-flash`)     | No       |

## API Routes

All routes are prefixed with `/api/v1`.

### Auth (`/auth`)
| Method | Endpoint    | Description              |
| ------ | ----------- | ------------------------ |
| POST   | `/register` | Register a new user      |
| POST   | `/login`    | Login and get JWT token  |
| GET    | `/me`       | Get current user profile |

### Terms (`/terms`)
| Method | Endpoint      | Description              |
| ------ | ------------- | ------------------------ |
| GET    | `/`           | List user's terms        |
| POST   | `/`           | Create a term            |
| PATCH  | `/{term_id}`  | Update a term            |
| PUT    | `/reorder`    | Reorder terms            |
| DELETE | `/{term_id}`  | Delete a term            |

### Courses (`/courses`)
| Method | Endpoint                    | Description                          |
| ------ | --------------------------- | ------------------------------------ |
| GET    | `/`                         | List courses (filterable by term)    |
| POST   | `/`                         | Create a course                      |
| PATCH  | `/{id}`                     | Update a course                      |
| DELETE | `/{id}`                     | Delete a course                      |
| DELETE | `/{course_id}/assessments`  | Delete all assessments for a course  |
| POST   | `/{id}/upload-syllabus`     | Upload PDF syllabus (Gemini parsing) |

### Assessments (`/assessments`)
| Method | Endpoint                          | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| GET    | `/`                               | List assessments               |
| GET    | `/upcoming`                       | List upcoming assessments      |
| POST   | `/`                               | Create an assessment           |
| POST   | `/bulk`                           | Bulk create assessments        |
| PATCH  | `/{assessment_id}`                | Update an assessment           |
| PATCH  | `/{assessment_id}/toggle-complete`| Toggle completion status       |
| DELETE | `/{assessment_id}`                | Delete an assessment           |

### Study Sessions (`/study-sessions`)
| Method | Endpoint                          | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| GET    | `/`                               | List study sessions            |
| POST   | `/`                               | Create a study session         |
| PATCH  | `/{session_id}/toggle-complete`   | Toggle completion status       |
| DELETE | `/{session_id}`                   | Delete a study session         |

### Availability (`/availability`)
| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| GET    | `/`                   | List availability blocks       |
| POST   | `/`                   | Create an availability block   |
| GET    | `/{availability_id}`  | Get a specific block           |
| PATCH  | `/{availability_id}`  | Update a block                 |
| DELETE | `/{availability_id}`  | Delete a block                 |

### Plan (`/plan`)
| Method | Endpoint    | Description                          |
| ------ | ----------- | ------------------------------------ |
| POST   | `/generate` | Generate optimized study plan        |

### Analytics (`/analytics`)
| Method | Endpoint           | Description                              |
| ------ | ------------------ | ---------------------------------------- |
| GET    | `/study-time`      | Get study time breakdown by course       |
| GET    | `/grade-forecast`  | Get per-course grade forecast/projection |

## Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI entry point + CORS
│   ├── api/
│   │   ├── router.py            # Main API router
│   │   └── routes/              # Route handlers
│   │       ├── auth.py
│   │       ├── terms.py
│   │       ├── courses.py
│   │       ├── assessments.py
│   │       ├── study_sessions.py
│   │       ├── availability.py
│   │       ├── plan.py
│   │       └── analytics.py
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── term.py
│   │   ├── course.py
│   │   ├── assessment.py
│   │   ├── study_session.py
│   │   ├── study_block.py
│   │   └── availability.py
│   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── term.py
│   │   ├── course.py
│   │   ├── assessment.py
│   │   ├── study_session.py
│   │   ├── availability.py
│   │   └── plan.py
│   ├── services/                # Business logic
│   │   ├── planner.py           # Study plan optimization
│   │   └── study_block.py       # Study block management
│   ├── core/                    # App configuration
│   │   ├── config.py            # Settings (env vars)
│   │   ├── security.py          # JWT + password hashing
│   │   └── deps.py              # Dependency injection
│   ├── db/                      # Database setup
│   │   ├── session.py           # SQLAlchemy session
│   │   ├── base.py              # Model imports
│   │   └── base_class.py        # Declarative base
│   └── utils/
│       └── waterloo_parser.py   # UW syllabus HTML/PDF parser
├── alembic/                     # Database migrations
├── scripts/
│   └── fix_quiz_weights.py      # Quiz weight utility
├── pyproject.toml
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── alembic.ini
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
