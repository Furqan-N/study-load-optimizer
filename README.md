# Study Load Optimizer (Syllabi)

A full-stack web application that helps University of Waterloo students manage their academic workload. Upload course syllabi, track assessments, log study sessions, and generate optimized study plans based on your availability.

## Tech Stack

| Layer    | Technology                                                   |
| -------- | ------------------------------------------------------------ |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend  | Python 3.11+, FastAPI, SQLAlchemy 2.0, Alembic              |
| Database | PostgreSQL 15                                                |
| Auth     | JWT (python-jose + passlib/bcrypt)                           |
| AI       | Google Gemini (syllabus parsing)                             |
| Deploy   | Vercel (frontend), Docker (backend + DB)                     |

## Features

- **Course Management** — Create courses and organize them by academic term
- **Syllabus Upload** — Upload PDF syllabi; Gemini AI extracts assessments automatically
- **Assessment Tracking** — Track assignments, quizzes, midterms, and finals with due dates and weights
- **Study Sessions** — Log study time per course and mark sessions complete
- **Availability** — Set your weekly free-time blocks
- **Study Plan Generator** — Auto-generate study blocks based on upcoming assessments and availability
- **Analytics** — View study time breakdowns and grade forecasts per course
- **Calendar View** — See assessments and study sessions on a calendar
- **Term Management** — Organize courses across multiple terms with archiving support

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

### Backend

```bash
cd backend

# Install dependencies
pip install -e .
# or
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, SECRET_KEY, GOOGLE_API_KEY

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000` with docs at `/docs`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs at `http://localhost:3000`.

### Docker (backend + database)

```bash
cd backend
docker-compose up
```

This starts PostgreSQL and the FastAPI server together.

## Project Structure

```
study-load-optimizer/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entry point
│   │   ├── api/routes/            # 8 route modules
│   │   ├── models/                # 6 SQLAlchemy models
│   │   ├── schemas/               # 8 Pydantic schemas
│   │   ├── services/              # Planner + study block logic
│   │   ├── core/                  # Config, security, deps
│   │   ├── db/                    # Session + base classes
│   │   └── utils/                 # Waterloo syllabus parser
│   ├── alembic/                   # Database migrations
│   ├── scripts/                   # Utility scripts
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js App Router pages
│   │   ├── components/            # Auth, layout, and UI components
│   │   └── lib/                   # API client + utilities
│   ├── package.json
│   └── tsconfig.json
├── tests/                         # Pytest test suite
└── pytest.ini
```

## Environment Variables

| Variable         | Description                         | Required |
| ---------------- | ----------------------------------- | -------- |
| `DATABASE_URL`   | PostgreSQL connection string        | Yes      |
| `SECRET_KEY`     | JWT signing secret                  | Yes      |
| `DEBUG`          | Enable debug mode                   | No       |
| `GOOGLE_API_KEY` | Gemini API key (syllabus parsing)   | No       |
| `GOOGLE_MODEL`   | Gemini model name (default: gemini-2.0-flash) | No |
