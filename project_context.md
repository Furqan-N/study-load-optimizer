# Project Context — Study Load Optimizer

> Auto-generated project snapshot.

---

## Directory Tree

```
./
  .claude/
  .git/
  .gitignore
  .pytest_cache/
  backend/
    .env
    alembic/
    alembic.ini
      __pycache__/
      env.py
      script.py.mako
      versions/
        .gitkeep
        __pycache__/
        0169dfe1f923_add_updated_assessments_table.py
        0489e0942a66_create_initial_postgres_tables.py
        7e5713fe52ee_add_study_sessions_table.py
        d3eb8e184fd0_add_courses_table.py
    app/
      __init__.py
      __pycache__/
      api/
        __init__.py
        __pycache__/
        router.py
        routes/
          __init__.py
          __pycache__/
          analytics.py
          assessments.py
          auth.py
          availability.py
          courses.py
          plan.py
          study_sessions.py
      core/
        __init__.py
        __pycache__/
        config.py
        deps.py
        security.py
      db/
        __init__.py
        __pycache__/
        base.py
        base_class.py
        session.py
      main.py
      models/
        __init__.py
        __pycache__/
        assessment.py
        availability.py
        course.py
        study_block.py
        study_session.py
        user.py
      schemas/
        __init__.py
        __pycache__/
        assessment.py
        auth.py
        availability.py
        course.py
        plan.py
        study_session.py
        user.py
      services/
        __init__.py
        __pycache__/
        planner.py
        study_block.py
      utils/
        __pycache__/
        waterloo_parser.py
    docker-compose.yml
    Dockerfile
    pyproject.toml
    README.md
    requirements.txt
    scripts/
      __pycache__/
      fix_quiz_weights.py
  frontend/
    .gitignore
    .next/
    eslint.config.mjs
    next.config.ts
    next-env.d.ts
    node_modules/
    package.json
    postcss.config.mjs
    public/
      file.svg
      globe.svg
      next.svg
      syllabi-logo.png
      syllabi-logo.svg
      vercel.svg
      window.svg
    README.md
    src/
      app/
        dashboard/
          assessments/
            page.tsx
          calendar/
            page.tsx
          courses/
            [id]/
              page.tsx
            page.tsx
          insights/
            page.tsx
          layout.tsx
          page.tsx
          schedule/
            page.tsx
          settings/
            page.tsx
        favicon.ico
        globals.css
        layout.tsx
        login/
          page.tsx
        page.tsx
        register/
          page.tsx
        utils/
          dateHelpers.ts
      components/
        auth/
          ProtectedRoute.tsx
        layout/
          Header.tsx
          Sidebar.tsx
      lib/
        api.ts
    tsconfig.json
  pytest.ini
  tests/
    __init__.py
    __pycache__/
    conftest.py
    README.md
    test_example.py
    test_planner.py
```

---

## Source Files

### `./backend/alembic.ini`

```ini
# A generic, single database configuration.

[alembic]
# path to migration scripts
script_location = alembic

# template used to generate migration file names; The default value is %%(rev)s_%%(slug)s
# Uncomment the line below if you want the files to be prepended with date and time
# file_template = %%(year)d_%%(month).2d_%%(day).2d_%%(hour).2d%%(minute).2d-%%(rev)s_%%(slug)s

# sys.path path, will be prepended to sys.path if present.
# defaults to the current working directory.
prepend_sys_path = .

# timezone to use when rendering the date within the migration file
# as well as the filename.
# If specified, requires the python-dateutil library that can be
# installed by adding `alembic[tz]` to the pip requirements
# string value is passed to dateutil.tz.gettz()
# leave blank for localtime
# timezone =

# max length of characters to apply to the
# "slug" field
# truncate_slug_length = 40

# set to 'true' to run the environment during
# the 'revision' command, regardless of autogenerate
# revision_environment = false

# set to 'true' to allow .pyc and .pyo files without
# a source .py file to be detected as revisions in the
# versions/ directory
# sourceless = false

# version location specification; This defaults
# to alembic/versions.  When using multiple version
# directories, initial revisions must be specified with --version-path.
# The path separator used here should be the separator specified by "version_path_separator" below.
# version_locations = %(here)s/bar:%(here)s/bat:alembic/versions

# version path separator; As mentioned above, this is the character used to split
# version_locations. The default within new alembic.ini files is "os", which uses os.pathsep.
# If this key is omitted entirely, it falls back to the legacy behavior of splitting on spaces and/or commas.
# Valid values for version_path_separator are:
#
# version_path_separator = :
# version_path_separator = ;
# version_path_separator = space
version_path_separator = os  # Use os.pathsep. Default configuration used for new projects.

# set to 'true' to search source files recursively
# in each "version_locations" directory
# new in Alembic version 1.10
# recursive_version_locations = false

# the output encoding used when revision files
# are written from script.py.mako
# output_encoding = utf-8

sqlalchemy.url = driver://user:pass@localhost/dbname


[post_write_hooks]
# post_write_hooks defines scripts or Python functions that are run
# on newly generated revision scripts.  See the documentation for further
# detail and examples

# format using "black" - use the console_scripts runner, against the "black" entrypoint
# hooks = black
# black.type = console_scripts
# black.entrypoint = black
# black.options = -l 79 REVISION_SCRIPT_FILENAME

# lint with attempts to fix using "ruff" - use the exec runner, execute a binary
# hooks = ruff
# ruff.type = exec
# ruff.executable = %(here)s/.venv/bin/ruff
# ruff.options = --fix REVISION_SCRIPT_FILENAME

# Logging configuration
[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S

```

### `./backend/alembic/env.py`

```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# Add the parent directory to the path so we can import app
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.base import Base
from app.core.config import settings

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set sqlalchemy.url from settings
config.set_main_option("sqlalchemy.url", str(settings.database_url).replace("%", "%%"))

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

```

### `./backend/alembic/script.py.mako`

```python
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}

```

### `./backend/alembic/versions/0169dfe1f923_add_updated_assessments_table.py`

```python
"""add updated assessments table

Revision ID: 0169dfe1f923
Revises: d3eb8e184fd0
Create Date: 2026-02-19 16:23:57.087544

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0169dfe1f923'
down_revision = 'd3eb8e184fd0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('assessments', sa.Column('assessment_type', sa.String(), nullable=False))
    op.add_column('assessments', sa.Column('weight_percentage', sa.Float(), nullable=False))
    op.add_column('assessments', sa.Column('is_completed', sa.Boolean(), nullable=False))
    op.alter_column('assessments', 'due_date',
               existing_type=sa.DATE(),
               nullable=False)
    op.drop_column('assessments', 'expected_hours')
    op.drop_column('assessments', 'type')
    op.drop_column('assessments', 'status')
    op.drop_column('assessments', 'hours_completed')
    op.drop_column('assessments', 'weight_percent')
    op.drop_column('assessments', 'created_at')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('assessments', sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False))
    op.add_column('assessments', sa.Column('weight_percent', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False))
    op.add_column('assessments', sa.Column('hours_completed', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False))
    op.add_column('assessments', sa.Column('status', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.add_column('assessments', sa.Column('type', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.add_column('assessments', sa.Column('expected_hours', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False))
    op.alter_column('assessments', 'due_date',
               existing_type=sa.DATE(),
               nullable=True)
    op.drop_column('assessments', 'is_completed')
    op.drop_column('assessments', 'weight_percentage')
    op.drop_column('assessments', 'assessment_type')
    # ### end Alembic commands ###

```

### `./backend/alembic/versions/0489e0942a66_create_initial_postgres_tables.py`

```python
"""create_initial_postgres_tables

Revision ID: 0489e0942a66
Revises: 
Create Date: 2026-02-17 11:37:19.070250

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0489e0942a66'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('hashed_password', sa.String(), nullable=False),
    sa.Column('full_name', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_table('availabilities',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('day_of_week', sa.String(), nullable=False),
    sa.Column('start_time', sa.Time(), nullable=False),
    sa.Column('end_time', sa.Time(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('courses',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('code', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('color', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('assessments',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('course_id', sa.UUID(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('type', sa.String(), nullable=False),
    sa.Column('due_date', sa.Date(), nullable=True),
    sa.Column('weight_percent', sa.Float(), nullable=False),
    sa.Column('expected_hours', sa.Float(), nullable=False),
    sa.Column('hours_completed', sa.Float(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('study_blocks',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('course_id', sa.UUID(), nullable=True),
    sa.Column('assessment_id', sa.UUID(), nullable=True),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('start_time', sa.Time(), nullable=False),
    sa.Column('end_time', sa.Time(), nullable=False),
    sa.Column('duration_hours', sa.Integer(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ),
    sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('study_blocks')
    op.drop_table('assessments')
    op.drop_table('courses')
    op.drop_table('availabilities')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    # ### end Alembic commands ###

```

### `./backend/alembic/versions/7e5713fe52ee_add_study_sessions_table.py`

```python
"""add study sessions table

Revision ID: 7e5713fe52ee
Revises: 0169dfe1f923
Create Date: 2026-02-19 19:14:45.046389

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7e5713fe52ee'
down_revision = '0169dfe1f923'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('study_sessions',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('course_id', sa.UUID(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
    sa.Column('end_time', sa.DateTime(timezone=True), nullable=False),
    sa.Column('duration_minutes', sa.Integer(), nullable=False),
    sa.Column('is_completed', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('study_sessions')
    # ### end Alembic commands ###

```

### `./backend/alembic/versions/d3eb8e184fd0_add_courses_table.py`

```python
"""add courses table

Revision ID: d3eb8e184fd0
Revises: 0489e0942a66
Create Date: 2026-02-19 13:40:25.984041

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'd3eb8e184fd0'
down_revision = '0489e0942a66'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('courses', sa.Column('course_code', sa.String(), nullable=False))
    op.add_column('courses', sa.Column('course_name', sa.String(), nullable=False))
    op.add_column('courses', sa.Column('credits', sa.Float(), nullable=False))
    op.add_column('courses', sa.Column('target_grade', sa.String(), nullable=False))
    op.drop_column('courses', 'created_at')
    op.drop_column('courses', 'name')
    op.drop_column('courses', 'code')
    op.drop_column('courses', 'color')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('courses', sa.Column('color', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('courses', sa.Column('code', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.add_column('courses', sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.add_column('courses', sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False))
    op.drop_column('courses', 'target_grade')
    op.drop_column('courses', 'credits')
    op.drop_column('courses', 'course_name')
    op.drop_column('courses', 'course_code')
    # ### end Alembic commands ###

```

### `./backend/app/__init__.py`

```python

```

### `./backend/app/api/__init__.py`

```python

```

### `./backend/app/api/router.py`

```python
from fastapi import APIRouter
from app.api.routes import auth, courses, assessments, availability, plan, study_sessions, analytics

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(courses.router)
api_router.include_router(assessments.router)
api_router.include_router(study_sessions.router)
api_router.include_router(availability.router)
api_router.include_router(plan.router)
api_router.include_router(analytics.router)

```

### `./backend/app/api/routes/__init__.py`

```python

```

### `./backend/app/api/routes/analytics.py`

```python
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.study_session import StudySession
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/study-time")
async def get_study_time_by_course(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    start_date: date | None = Query(default=None, description="Inclusive start date (YYYY-MM-DD)."),
    end_date: date | None = Query(default=None, description="Inclusive end date (YYYY-MM-DD)."),
):
    """
    Returns per-course study hours for the requested date window.

    Default window: last 7 days (rolling) if no dates are provided.

    Response shape:
      [{ "course_id": "<uuid>", "hours": 3.5 }, ...]
    """

    if start_date and end_date and start_date > end_date:
        return []

    if start_date is None or end_date is None:
        # Rolling 7-day window ending today (inclusive).
        today = date.today()
        end_date = today
        start_date = today - timedelta(days=6)

    # Convert date window to datetimes for filtering StudySession.start_time.
    start_dt = datetime.combine(start_date, datetime.min.time())
    end_dt = datetime.combine(end_date, datetime.max.time())

    rows = (
        db.query(
            StudySession.course_id.label("course_id"),
            func.coalesce(func.sum(StudySession.duration_minutes), 0).label("total_minutes"),
        )
        .filter(
            StudySession.user_id == current_user.id,
            StudySession.start_time >= start_dt,
            StudySession.start_time <= end_dt,
        )
        .group_by(StudySession.course_id)
        .all()
    )

    results: list[dict[str, object]] = []
    for course_id, total_minutes in rows:
        minutes = float(total_minutes or 0)
        results.append(
            {
                "course_id": str(course_id),
                "hours": round(minutes / 60.0, 1),
            }
        )

    return results


```

### `./backend/app/api/routes/assessments.py`

```python
from datetime import date
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.models.user import User
from app.models.assessment import Assessment
from app.models.course import Course
from app.models.study_session import StudySession
from app.schemas.assessment import AssessmentBulkCreate, AssessmentCreate, AssessmentResponse, AssessmentUpdate
from app.core.deps import get_current_user

router = APIRouter(prefix="/assessments", tags=["assessments"])


class AssessmentCompletionUpdate(BaseModel):
    is_completed: bool | None = None
    earned_score: float | None = None


@router.post("/", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new assessment for a course owned by the current user."""
    owned_course = (
        db.query(Course)
        .filter(
            Course.id == assessment_data.course_id,
            Course.user_id == current_user.id,
        )
        .first()
    )
    if not owned_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    db_assessment = Assessment(
        user_id=current_user.id,
        **assessment_data.model_dump(),
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment


@router.post("/bulk", response_model=list[AssessmentResponse], status_code=status.HTTP_201_CREATED)
async def create_assessments_bulk(
    payload: AssessmentBulkCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No assessments provided",
        )

    course_ids = {item.course_id for item in payload.items}
    if len(course_ids) != 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Bulk items must target a single course",
        )
    course_id = next(iter(course_ids))
    owned_course = (
        db.query(Course)
        .filter(
            Course.id == course_id,
            Course.user_id == current_user.id,
        )
        .first()
    )
    if not owned_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    created: list[Assessment] = []
    for item in payload.items:
        db_assessment = Assessment(
            user_id=current_user.id,
            **item.model_dump(),
        )
        db.add(db_assessment)
        created.append(db_assessment)

    db.commit()
    for assessment in created:
        db.refresh(assessment)
    return created


@router.get("/upcoming", response_model=list[AssessmentResponse])
async def get_upcoming_deadlines(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: int = 5,
):
    today = date.today()
    return (
        db.query(Assessment)
        .filter(
            Assessment.user_id == current_user.id,
            Assessment.due_date >= today,
            Assessment.earned_score.is_(None),
        )
        .order_by(Assessment.due_date.asc())
        .limit(limit)
        .all()
    )


@router.get("/", response_model=list[AssessmentResponse])
async def get_assessments(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    course_id: UUID | None = None,
):
    """Get all assessments for the current user, optionally filtered by course."""
    query = db.query(Assessment).filter(Assessment.user_id == current_user.id)
    if course_id:
        query = query.filter(Assessment.course_id == course_id)
    return query.all()


@router.patch("/{assessment_id}", response_model=AssessmentResponse)
async def update_assessment(
    assessment_id: UUID,
    payload: AssessmentUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_assessment = (
        db.query(Assessment)
        .filter(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
        )
        .first()
    )
    if not db_assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found",
        )

    if payload.title is not None:
        cleaned_title = payload.title.strip()
        if not cleaned_title:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Title cannot be empty",
            )
        db_assessment.title = cleaned_title

    if payload.assessment_type is not None:
        cleaned_type = payload.assessment_type.strip().lower()
        if not cleaned_type:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Assessment type cannot be empty",
            )
        db_assessment.assessment_type = cleaned_type

    if payload.due_date is not None:
        db_assessment.due_date = payload.due_date

    if payload.weight_percentage is not None:
        if payload.weight_percentage < 0 or payload.weight_percentage > 100:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Weight percentage must be between 0 and 100",
            )
        db_assessment.weight_percentage = payload.weight_percentage

    if payload.earned_score is not None:
        if payload.earned_score < 0 or payload.earned_score > 100:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Grade must be between 0 and 100",
            )
        db_assessment.earned_score = payload.earned_score

    db.commit()
    db.refresh(db_assessment)
    return db_assessment


@router.patch("/{assessment_id}/toggle-complete", response_model=AssessmentResponse)
async def toggle_assessment_complete(
    assessment_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    payload: AssessmentCompletionUpdate | None = None,
):
    db_assessment = (
        db.query(Assessment)
        .filter(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
        )
        .first()
    )
    if not db_assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found",
        )

    db_assessment.is_completed = not db_assessment.is_completed

    if payload is not None and payload.earned_score is not None:
        db_assessment.earned_score = payload.earned_score

    if db_assessment.is_completed:
        # Clean up unneeded auto-generated study sessions
        db.query(StudySession).filter(
            StudySession.user_id == current_user.id,
            StudySession.is_completed.is_(False),
            StudySession.title == f"Study: {db_assessment.title}",
        ).delete(synchronize_session=False)

    db.commit()
    db.refresh(db_assessment)
    return db_assessment


@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_assessment = (
        db.query(Assessment)
        .filter(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
        )
        .first()
    )
    if not db_assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found",
        )

    db.delete(db_assessment)
    db.commit()

```

### `./backend/app/api/routes/auth.py`

```python
from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, Token
from app.schemas.user import UserResponse, UserMeResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Annotated[Session, Depends(get_db)]):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Annotated[Session, Depends(get_db)]):
    """Login and receive access token."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(hours=24)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": str(user.id)},
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserMeResponse)
async def get_current_user_info(current_user: Annotated[User, Depends(get_current_user)]):
    """Get current user information."""
    return current_user

```

### `./backend/app/api/routes/availability.py`

```python
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.models.user import User
from app.models.availability import Availability
from app.schemas.availability import AvailabilityCreate, AvailabilityUpdate, AvailabilityResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/availability", tags=["availability"])


@router.get("", response_model=List[AvailabilityResponse])
async def get_availabilities(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get all availability blocks for the current user."""
    availabilities = db.query(Availability).filter(
        Availability.user_id == current_user.id
    ).all()
    return availabilities


@router.post("", response_model=AvailabilityResponse, status_code=status.HTTP_201_CREATED)
async def create_availability(
    availability_data: AvailabilityCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new availability block."""
    db_availability = Availability(
        **availability_data.model_dump(),
        user_id=current_user.id,
    )
    db.add(db_availability)
    db.commit()
    db.refresh(db_availability)
    return db_availability


@router.get("/{availability_id}", response_model=AvailabilityResponse)
async def get_availability(
    availability_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get a specific availability block."""
    availability = db.query(Availability).filter(
        Availability.id == availability_id,
        Availability.user_id == current_user.id,
    ).first()
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found",
        )
    return availability


@router.patch("/{availability_id}", response_model=AvailabilityResponse)
async def update_availability(
    availability_id: UUID,
    availability_data: AvailabilityUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Update an availability block."""
    availability = db.query(Availability).filter(
        Availability.id == availability_id,
        Availability.user_id == current_user.id,
    ).first()
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found",
        )
    update_data = availability_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(availability, field, value)
    db.commit()
    db.refresh(availability)
    return availability


@router.delete("/{availability_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_availability(
    availability_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Delete an availability block."""
    availability = db.query(Availability).filter(
        Availability.id == availability_id,
        Availability.user_id == current_user.id,
    ).first()
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found",
        )
    db.delete(availability)
    db.commit()
    return None

```

### `./backend/app/api/routes/courses.py`

```python
from datetime import date
from datetime import datetime
import json
from io import BytesIO
from typing import Annotated, Any
from uuid import UUID
import re

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.assessment import Assessment
from app.models.course import Course
from app.models.user import User
from app.schemas.course import CourseCreate, CourseResponse, CourseUpdate
from app.utils.waterloo_parser import parse_waterloo_outline

router = APIRouter(prefix="/courses", tags=["courses"])


def _extract_json_array(raw_text: str) -> list[dict[str, Any]]:
    text = raw_text.strip()
    if "```" in text:
        parts = text.split("```")
        for part in parts:
            candidate = part.strip()
            if candidate.startswith("json"):
                candidate = candidate[4:].strip()
            if candidate.startswith("[") and candidate.endswith("]"):
                text = candidate
                break
    data = json.loads(text)
    if not isinstance(data, list):
        raise ValueError("LLM output is not a JSON list")
    return [item for item in data if isinstance(item, dict)]


def _parse_due_date(value: Any) -> date:
    if value is None:
        raise ValueError("Missing due_date")
    text = str(value).strip()
    lowered = text.lower()
    if any(token in lowered for token in ("tba", "tbd", "registrar")):
        return date(2026, 4, 24)
    try:
        if "T" in text:
            parsed_dt = datetime.fromisoformat(text.replace("Z", "+00:00"))
            return parsed_dt.date()
        parsed = date.fromisoformat(text)
        return parsed
    except ValueError:
        # Last fallback for slash-formatted local dates.
        parsed = datetime.strptime(text.replace("-", "/"), "%Y/%m/%d")
        return parsed.date()


def _extract_table_rows(table: Any) -> list[list[str]]:
    rows: list[list[str]] = []
    for tr in table.find_all("tr"):
        cells = tr.find_all(["th", "td"])
        values = [cell.get_text(" ", strip=True) for cell in cells]
        if any(values):
            rows.append(values)
    return rows


def _split_exact(total_weight: float, count: int) -> list[float]:
    if count <= 0:
        return []
    basis_points_total = int(round(total_weight * 100))
    base = basis_points_total // count
    remainder = basis_points_total % count
    values = [base / 100.0 for _ in range(count)]
    for i in range(remainder):
        values[i] = round(values[i] + 0.01, 2)
    return values


def _normalize_component_token(text: str) -> str:
    raw = (text or "").strip().lower()
    if not raw:
        return ""
    token = re.sub(r"[^a-z]", "", raw.split(" ")[0])
    irregular = {
        "quizzes": "quiz",
    }
    if token in irregular:
        return irregular[token]
    if token.endswith("ies") and len(token) > 4:
        return token[:-3] + "y"
    if token.endswith(("ches", "shes", "sses", "xes", "zes")) and len(token) > 4:
        return token[:-2]
    if token.endswith("s") and len(token) > 3:
        return token[:-1]
    return token


def _infer_outline_year_from_text(text: str) -> int:
    match = re.search(r"\b(?:winter|spring|summer|fall)\s+(\d{4})\b", text or "", flags=re.IGNORECASE)
    if match:
        try:
            return int(match.group(1))
        except ValueError:
            return 2026
    return 2026


def _infer_component_count_from_text(source_text: str, component: str) -> int:
    token = component.lower()
    if not token:
        return 0
    searchable_text = source_text or ""
    if "<" in searchable_text and ">" in searchable_text:
        try:
            from bs4 import BeautifulSoup

            searchable_text = BeautifulSoup(searchable_text, "html.parser").get_text(" ", strip=True)
        except Exception:
            pass
    irregular_plural = {
        "quiz": "quizzes",
    }
    plural = irregular_plural.get(token) or (
        f"{token}es" if token.endswith(("s", "x", "z", "ch", "sh")) else f"{token}s"
    )
    number_words = {
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five": 5,
        "six": 6,
        "seven": 7,
        "eight": 8,
        "nine": 9,
        "ten": 10,
        "eleven": 11,
        "twelve": 12,
    }
    patterns = [
        rf"\b(\d{{1,2}})\s+{re.escape(plural)}\b",
        rf"\b(\d{{1,2}})\s+{re.escape(token)}s?\b",
        rf"\b{re.escape(plural)}\s*\(?\s*(\d{{1,2}})\s*\)?\b",
        rf"\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+{re.escape(plural)}\b",
        rf"\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+{re.escape(token)}s?\b",
    ]
    best = 0
    lowered = searchable_text.lower()
    for pattern in patterns:
        for match in re.finditer(pattern, lowered, flags=re.IGNORECASE):
            raw = (match.group(1) or "").strip().lower()
            if raw.isdigit():
                best = max(best, int(raw))
                continue
            as_word = number_words.get(raw)
            if as_word is not None:
                best = max(best, as_word)

    # Fallback: count explicitly numbered occurrences, e.g. "Quiz 1 ... Quiz 5".
    numbered_matches = re.findall(rf"\b{re.escape(token)}\s*(\d{{1,2}})\b", lowered, flags=re.IGNORECASE)
    if numbered_matches:
        unique_numbers = {int(value) for value in numbered_matches}
        best = max(best, len(unique_numbers))

    return best


def _looks_like_aggregate_item(title: str, component: str) -> bool:
    lowered = (title or "").strip().lower()
    if not lowered:
        return False
    if re.search(r"\d", lowered):
        return False
    base = component.lower()
    return lowered in {base, f"{base}s", f"{base}es", "quizzes" if base == "quiz" else ""}


def _expand_category_clumps(parsed_items: list[dict[str, Any]], source_text: str) -> list[dict[str, Any]]:
    component_words = {"quiz", "assignment", "lab", "project", "test", "exam"}
    expanded: list[dict[str, Any]] = []

    for item in parsed_items:
        title = str(item.get("title", "")).strip()
        assessment_type = str(item.get("assessment_type", "")).strip() or "Assignment"
        component = _normalize_component_token(title) or _normalize_component_token(assessment_type)
        if component not in component_words or not _looks_like_aggregate_item(title, component):
            expanded.append(item)
            continue

        count = _infer_component_count_from_text(source_text, component)
        if count <= 1:
            expanded.append(item)
            continue

        total_weight = float(item.get("weight_percentage", 0))
        split_weights = _split_exact(total_weight, count)
        base_due = item.get("due_date")
        component_label = "Quiz" if component == "quiz" else component.capitalize()
        for idx in range(1, count + 1):
            expanded.append(
                {
                    **item,
                    "title": f"{component_label} {idx}",
                    "assessment_type": component if component != "assignment" else assessment_type,
                    "weight_percentage": float(split_weights[idx - 1]),
                    "due_date": base_due,
                }
            )
        print(
            f"[courses.upload] expanded_clump component={component} "
            f"count={count} total={total_weight} split_weights={split_weights}"
        )

    return expanded


def _normalize_repeated_component_weights(parsed_items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    component_words = {"quiz", "assignment", "lab", "project", "test", "exam"}
    grouped_indexes: dict[str, list[int]] = {}

    for idx, item in enumerate(parsed_items):
        title = str(item.get("title", "")).strip()
        assessment_type = _normalize_component_token(str(item.get("assessment_type", "")))
        title_key = _normalize_component_token(title)
        group_key = title_key if title_key in component_words else assessment_type
        if group_key not in component_words:
            continue
        grouped_indexes.setdefault(group_key, []).append(idx)

    for group_key, indexes in grouped_indexes.items():
        if len(indexes) <= 1:
            continue

        weights: list[float] = []
        for idx in indexes:
            try:
                weights.append(float(parsed_items[idx].get("weight_percentage", 0)))
            except Exception:
                weights.append(0.0)

        if not weights:
            continue

        all_same = all(abs(w - weights[0]) < 1e-9 for w in weights)
        total = sum(weights)
        if not all_same:
            continue
        if total <= 100.0:
            continue

        split_weights = _split_exact(weights[0], len(indexes))
        print(
            f"[courses.upload] normalizing repeated component group={group_key} "
            f"raw_each={weights[0]} count={len(indexes)} split_weights={split_weights}"
        )
        for i, idx in enumerate(indexes):
            parsed_items[idx]["weight_percentage"] = float(split_weights[i])

    return parsed_items


@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_data: CourseCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new course for the authenticated user."""
    db_course = Course(
        user_id=current_user.id,
        **course_data.model_dump(),
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


@router.get("/", response_model=list[CourseResponse])
async def get_courses(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Return only courses that belong to the authenticated user."""
    return db.query(Course).filter(Course.user_id == current_user.id).all()


@router.patch("/{id}", response_model=CourseResponse)
async def update_course(
    id: str,
    course_data: CourseUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Partially update one course that belongs to the authenticated user."""
    db_course = (
        db.query(Course)
        .filter(Course.id == id, Course.user_id == current_user.id)
        .first()
    )

    if not db_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    update_data = course_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_course, field, value)

    db.commit()
    db.refresh(db_course)
    return db_course


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Delete one course that belongs to the authenticated user."""
    db_course = (
        db.query(Course)
        .filter(Course.id == id, Course.user_id == current_user.id)
        .first()
    )

    if not db_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    db.delete(db_course)
    db.commit()


@router.delete("/{course_id}/assessments")
@router.delete("/{course_id}/assessments/")
async def clear_course_assessments(
    course_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_course = (
        db.query(Course)
        .filter(Course.id == course_id, Course.user_id == current_user.id)
        .first()
    )
    if not db_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    db.query(Assessment).filter(
        Assessment.course_id == db_course.id,
        Assessment.user_id == current_user.id,
    ).delete(synchronize_session=False)
    db.commit()
    return {"message": "All assessments cleared"}


@router.post("/{id}/upload-syllabus", status_code=status.HTTP_201_CREATED)
async def upload_syllabus(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    file: UploadFile = File(...),
):
    db_course = (
        db.query(Course)
        .filter(Course.id == id, Course.user_id == current_user.id)
        .first()
    )
    if not db_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    content_type = (file.content_type or "").lower()
    filename = (file.filename or "").lower()
    is_html = content_type in {"text/html"} or filename.endswith((".html", ".htm"))
    is_pdf = content_type in {"application/pdf", "application/x-pdf"} or filename.endswith(".pdf")

    if not is_html and not is_pdf:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and HTML syllabus files are supported",
        )

    file_bytes = await file.read()
    parsed_items: list[dict[str, Any]] = []
    extracted_text = ""
    fallback_text = ""
    source_text_for_postprocess = ""

    if is_html:
        try:
            html_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to read HTML: {exc}") from exc
        source_text_for_postprocess = html_text
        parsed_items = parse_waterloo_outline(html_text) or []

        # AI fallback only if Waterloo structure parsing fails.
        if not parsed_items:
            try:
                from bs4 import BeautifulSoup
            except ImportError as exc:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Missing dependency: beautifulsoup4. Install backend requirements.",
                ) from exc
            soup = BeautifulSoup(html_text, "html.parser")
            table_chunks = []
            for table in soup.find_all("table"):
                rows = _extract_table_rows(table)
                if rows:
                    table_chunks.append("\n".join(" | ".join(row) for row in rows))
            fallback_text = "\n\n".join(table_chunks).strip()
            extracted_text = fallback_text
            source_text_for_postprocess = fallback_text or html_text
    else:
        try:
            from pypdf import PdfReader
        except ImportError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Missing dependency: pypdf. Install backend requirements.",
            ) from exc
        try:
            reader = PdfReader(BytesIO(file_bytes))
            extracted_text = "\n".join((page.extract_text() or "") for page in reader.pages).strip()
            source_text_for_postprocess = extracted_text
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to read PDF: {exc}") from exc

    if not parsed_items and not extracted_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No readable assessment data found")

    if not parsed_items:
        if not settings.google_api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="GOOGLE_API_KEY (or GEMINI_API_KEY) is not configured",
            )
        try:
            from google import genai
        except ImportError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Missing dependency: google-genai. Install backend requirements.",
            ) from exc

        prompt = (
            "Extract a JSON array of assessments from this syllabus text. "
            "Return JSON only with this schema exactly: "
            '[{"title": string, "weight_percentage": float, "due_date": "YYYY-MM-DD", "assessment_type": string}]. '
            "If uncertain, infer best effort but keep valid JSON and realistic values. "
            "If an assessment date is 'TBA' or similar, default the due_date to '2026-04-24'. "
            "Ensure all assessments, even those without firm dates, are returned in the JSON array."
        )

        client = genai.Client(api_key=settings.google_api_key)
        try:
            response = client.models.generate_content(
                model=settings.google_model,
                contents=(
                    "You extract structured assessment data from syllabi.\n\n"
                    f"{prompt}\n\nSyllabus text:\n{extracted_text[:30000]}"
                ),
            )
            raw_output = (response.text or "").strip() or "[]"
            parsed_items = _extract_json_array(raw_output)
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"LLM extraction failed: {exc}") from exc

    parsed_items = _expand_category_clumps(parsed_items, source_text_for_postprocess or extracted_text or fallback_text)
    parsed_items = _normalize_repeated_component_weights(parsed_items)
    inferred_outline_year = _infer_outline_year_from_text(source_text_for_postprocess or extracted_text or fallback_text)

    created: list[Assessment] = []
    for assessment in parsed_items:
        try:
            title = str(assessment.get("title", "")).strip()
            assessment_type = str(assessment.get("assessment_type", "")).strip() or "Assignment"
            weight_percentage = float(assessment.get("weight_percentage", 0))
            due_raw = assessment.get("due_date")
            if isinstance(due_raw, date):
                due = due_raw
            else:
                due = _parse_due_date(due_raw)
            due = due.replace(year=inferred_outline_year)
            if not title:
                continue
            if weight_percentage < 0 or weight_percentage > 100:
                continue
            print("Saving assessment:", assessment)
            db_assessment = Assessment(
                user_id=current_user.id,
                course_id=db_course.id,
                title=title,
                assessment_type=assessment_type,
                due_date=due,
                weight_percentage=weight_percentage,
                is_completed=False,
            )
            db.add(db_assessment)
            created.append(db_assessment)
        except Exception:
            continue

    db.commit()
    for assessment in created:
        db.refresh(assessment)

    return {
        "message": "Syllabus processed successfully.",
        "assessments_created": len(created),
        "assessments": [
            {
                "id": str(a.id),
                "course_id": str(a.course_id),
                "title": a.title,
                "assessment_type": a.assessment_type,
                "weight_percentage": a.weight_percentage,
                "due_date": a.due_date.isoformat(),
                "is_completed": a.is_completed,
            }
            for a in created
        ],
    }

```

### `./backend/app/api/routes/plan.py`

```python
from datetime import date, datetime, timedelta, timezone
from typing import Annotated, Dict, List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.assessment import Assessment
from app.models.study_session import StudySession
from app.models.user import User

router = APIRouter(prefix="/plan", tags=["plan"])


def generate_smart_schedule(
    assessments: List[dict],
    start_date: datetime,
    max_daily_hours: float = 4.0,
    max_chunk_hours: float = 1.5,
) -> List[Dict]:
    # 1. Break assessments into manageable chunks
    task_queues: Dict = {}
    for ass in assessments:
        # Estimate hours needed (e.g., 0.5 hours per weight percentage point)
        total_hours = float(ass.get("weight_percentage", 10)) * 0.5
        chunks = []

        while total_hours > 0:
            chunk = min(total_hours, max_chunk_hours)
            chunks.append(
                {
                    "assessment_id": ass["id"],
                    "title": f"Study: {ass['title']}",
                    "duration_hours": chunk,
                    "course_id": ass["course_id"],
                }
            )
            total_hours -= chunk
        task_queues[ass["id"]] = chunks

    # 2. Interleave chunks (Round-Robin)
    interleaved_chunks = []
    while any(task_queues.values()):
        for ass_id in list(task_queues.keys()):
            if task_queues[ass_id]:
                interleaved_chunks.append(task_queues[ass_id].pop(0))

    # 3. Assign to days with a daily cap
    schedule = []
    current_day = start_date
    hours_today = 0.0
    for chunk in interleaved_chunks:
        if hours_today + chunk["duration_hours"] > max_daily_hours:
            # Move to the next day
            current_day += timedelta(days=1)
            hours_today = 0.0

        # Calculate start and end times (starting at 5 PM default for example)
        session_start = current_day.replace(
            hour=17,
            minute=0,
            second=0,
            microsecond=0,
        ) + timedelta(hours=hours_today)
        session_end = session_start + timedelta(hours=chunk["duration_hours"])

        schedule.append(
            {
                "assessment_id": chunk["assessment_id"],
                "course_id": chunk["course_id"],
                "title": chunk["title"],
                "start_time": session_start,
                "end_time": session_end,
                "duration_minutes": int(chunk["duration_hours"] * 60),
            }
        )

        hours_today += chunk["duration_hours"]
    return schedule


@router.post("/generate")
async def generate_plan(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    today = date.today()

    upcoming_assessments = (
        db.query(Assessment)
        .filter(
            Assessment.user_id == current_user.id,
            Assessment.is_completed.is_(False),
            Assessment.due_date >= today,
        )
        .order_by(Assessment.due_date.asc())
        .all()
    )

    if not upcoming_assessments:
        return {
            "message": "No upcoming assessments to plan for.",
            "sessions_created": 0,
        }

    assessment_dicts = [
        {
            "id": assessment.id,
            "course_id": assessment.course_id,
            "title": assessment.title,
            "weight_percentage": assessment.weight_percentage,
        }
        for assessment in upcoming_assessments
    ]

    # Remove previous auto-generated, incomplete sessions before inserting fresh optimized ones.
    db.query(StudySession).filter(
        StudySession.user_id == current_user.id,
        StudySession.is_completed.is_(False),
        StudySession.title.like("Study: %"),
    ).delete(synchronize_session=False)

    smart_schedule = generate_smart_schedule(
        assessments=assessment_dicts,
        start_date=datetime.now(timezone.utc),
        max_daily_hours=4.0,
        max_chunk_hours=1.5,
    )

    created_sessions = [
        StudySession(
            user_id=current_user.id,
            course_id=item["course_id"],
            title=item["title"],
            start_time=item["start_time"],
            end_time=item["end_time"],
            duration_minutes=item["duration_minutes"],
            is_completed=False,
        )
        for item in smart_schedule
    ]

    if created_sessions:
        db.bulk_save_objects(created_sessions)
    db.commit()

    return {
        "message": "Schedule optimized!",
        "sessions_created": len(created_sessions),
    }

```

### `./backend/app/api/routes/study_sessions.py`

```python
from datetime import date
from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.course import Course
from app.models.study_session import StudySession
from app.schemas.study_session import StudySessionCreate, StudySessionResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/study-sessions", tags=["study-sessions"])


@router.post("/", response_model=StudySessionResponse, status_code=status.HTTP_201_CREATED)
async def create_study_session(
    session_data: StudySessionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new study session for the authenticated user."""
    owned_course = (
        db.query(Course)
        .filter(
            Course.id == session_data.course_id,
            Course.user_id == current_user.id,
        )
        .first()
    )
    if not owned_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    db_session = StudySession(
        user_id=current_user.id,
        **session_data.model_dump(),
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


@router.get("/", response_model=list[StudySessionResponse])
async def get_study_sessions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
):
    """Get study sessions for current user with optional date range filters."""
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date must be before or equal to end_date",
        )

    query = db.query(StudySession).filter(StudySession.user_id == current_user.id)

    if start_date:
        query = query.filter(func.date(StudySession.start_time) >= start_date)
    if end_date:
        query = query.filter(func.date(StudySession.start_time) <= end_date)

    return query.order_by(StudySession.start_time.asc()).all()


@router.patch("/{session_id}/toggle-complete", response_model=StudySessionResponse)
async def toggle_study_session_complete(
    session_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_session = (
        db.query(StudySession)
        .filter(
            StudySession.id == session_id,
            StudySession.user_id == current_user.id,
        )
        .first()
    )
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study session not found",
        )

    db_session.is_completed = not db_session.is_completed
    db.commit()
    db.refresh(db_session)
    return db_session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_study_session(
    session_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_session = (
        db.query(StudySession)
        .filter(
            StudySession.id == session_id,
            StudySession.user_id == current_user.id,
        )
        .first()
    )
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study session not found",
        )

    db.delete(db_session)
    db.commit()

```

### `./backend/app/core/__init__.py`

```python

```

### `./backend/app/core/config.py`

```python
from pydantic_settings import BaseSettings
from pydantic import AliasChoices, Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    database_url: str = Field(..., alias="DATABASE_URL")
    secret_key: str = Field(
        ...,
        validation_alias=AliasChoices("SECRET_KEY", "JWT_SECRET"),
    )
    algorithm: str = Field(
        default="HS256",
        validation_alias=AliasChoices("ALGORITHM", "JWT_ALGORITHM"),
    )
    debug: bool = Field(default=False, alias="DEBUG")
    google_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("GOOGLE_API_KEY", "GEMINI_API_KEY"),
    )
    google_model: str = Field(
        default="gemini-2.0-flash",
        validation_alias=AliasChoices("GOOGLE_MODEL", "GEMINI_MODEL"),
    )

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

```

### `./backend/app/core/deps.py`

```python
from typing import Annotated
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.db.session import get_db
from app.models.user import User
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Extract, decode, and validate JWT, then return the authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        subject = payload.get("sub")
        token_user_id = payload.get("user_id")

        if not subject and not token_user_id:
            raise credentials_exception

        user: User | None = None
        if token_user_id:
            try:
                user_uuid = UUID(token_user_id)
            except ValueError:
                raise credentials_exception
            user = db.query(User).filter(User.id == user_uuid).first()
        elif isinstance(subject, str):
            if "@" in subject:
                user = db.query(User).filter(User.email == subject).first()
            else:
                try:
                    user_uuid = UUID(subject)
                except ValueError:
                    raise credentials_exception
                user = db.query(User).filter(User.id == user_uuid).first()
        else:
            raise credentials_exception
    except (JWTError, ValueError):
        raise credentials_exception

    if user is None:
        raise credentials_exception

    return user

```

### `./backend/app/core/security.py`

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None

```

### `./backend/app/db/__init__.py`

```python

```

### `./backend/app/db/base.py`

```python
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
from app.models.study_session import StudySession  # noqa
```

### `./backend/app/db/base_class.py`

```python
"""
SQLAlchemy Base class definition.

This module contains only the Base declarative base to avoid circular imports.
Models should import Base from here, not from app.db.base.
"""

from sqlalchemy.orm import declarative_base

Base = declarative_base()

```

### `./backend/app/db/session.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=settings.debug,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

```

### `./backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings

app = FastAPI(
    title="UW Load Optimizer API",
    description="Backend API for UW Load Optimizer",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "UW Load Optimizer API",
        "version": "0.1.0",
        "docs": "/docs",
    }

```

### `./backend/app/models/__init__.py`

```python
from app.models.assessment import Assessment
from app.models.availability import Availability
from app.models.course import Course
from app.models.study_session import StudySession
from app.models.user import User

__all__ = [
    "User",
    "Course",
    "Assessment",
    "StudySession",
    "Availability",
]

```

### `./backend/app/models/assessment.py`

```python
import uuid
from sqlalchemy import Column, String, Float, ForeignKey, Date, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    assessment_type = Column(String, nullable=False)  # Exam, Essay, Project, etc.
    due_date = Column(Date, nullable=False)
    weight_percentage = Column(Float, nullable=False)
    is_completed = Column(Boolean, nullable=False, default=False)
    earned_score = Column(Float, nullable=True)

    # Relationships
    user = relationship("User", back_populates="assessments")
    course = relationship("Course", back_populates="assessments")

```

### `./backend/app/models/availability.py`

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Time, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Availability(Base):
    __tablename__ = "availabilities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    day_of_week = Column(String, nullable=False)  # e.g., "Monday", "Tuesday"
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="availabilities")

```

### `./backend/app/models/course.py`

```python
import uuid
from sqlalchemy import Column, String, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_code = Column(String, nullable=False)  # e.g., "MATH 402"
    course_name = Column(String, nullable=False)  # e.g., "Advanced Calculus"
    credits = Column(Float, nullable=False, default=0.5)
    target_grade = Column(String, nullable=False)  # e.g., "A", "85%"
    daily_target_hours = Column(Float, nullable=False, default=4.0)

    # Relationships
    user = relationship("User", back_populates="courses")
    assessments = relationship("Assessment", back_populates="course", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="course", cascade="all, delete-orphan")

```

### `./backend/app/models/study_block.py`

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Date, Time, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class StudyBlock(Base):
    __tablename__ = "study_blocks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=True)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"), nullable=True)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    duration_hours = Column(Integer, nullable=False)  # Duration in hours
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="study_blocks")

```

### `./backend/app/models/study_session.py`

```python
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)  # e.g., "Linear Algebra Review"
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    is_completed = Column(Boolean, nullable=False, default=False)

    # Relationships
    user = relationship("User", back_populates="study_sessions")
    course = relationship("Course", back_populates="study_sessions")

```

### `./backend/app/models/user.py`

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    courses = relationship("Course", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="user", cascade="all, delete-orphan")
    availabilities = relationship("Availability", back_populates="user", cascade="all, delete-orphan")


```

### `./backend/app/schemas/__init__.py`

```python

```

### `./backend/app/schemas/assessment.py`

```python
from datetime import date
from pydantic import BaseModel, Field, field_validator
from uuid import UUID


class AssessmentCreate(BaseModel):
    course_id: UUID
    assessment_type: str
    title: str
    due_date: date
    weight_percentage: float = Field(..., ge=0, le=100)

    @field_validator("title", "assessment_type")
    @classmethod
    def validate_not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Field cannot be empty")
        return value.strip()


class AssessmentResponse(BaseModel):
    id: UUID
    user_id: UUID
    course_id: UUID
    title: str
    assessment_type: str
    due_date: date
    weight_percentage: float
    is_completed: bool
    earned_score: float | None = None

    class Config:
        from_attributes = True


class AssessmentUpdate(BaseModel):
    title: str | None = None
    assessment_type: str | None = None
    due_date: date | None = None
    weight_percentage: float | None = Field(default=None, ge=0, le=100)
    earned_score: float | None = Field(default=None, ge=0, le=100)


class AssessmentBulkCreate(BaseModel):
    items: list[AssessmentCreate]

```

### `./backend/app/schemas/auth.py`

```python
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

```

### `./backend/app/schemas/availability.py`

```python
from datetime import datetime, time
from pydantic import BaseModel
from uuid import UUID


class AvailabilityBase(BaseModel):
    day_of_week: str
    start_time: time
    end_time: time


class AvailabilityCreate(AvailabilityBase):
    pass


class AvailabilityUpdate(BaseModel):
    day_of_week: str | None = None
    start_time: time | None = None
    end_time: time | None = None


class AvailabilityResponse(AvailabilityBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

```

### `./backend/app/schemas/course.py`

```python
from pydantic import BaseModel, Field, field_validator
from uuid import UUID


class CourseCreate(BaseModel):
    course_code: str = Field(..., min_length=1, description="Course code (e.g., MATH 402)")
    course_name: str = Field(..., min_length=1, description="Course name")
    credits: float = Field(0.5, gt=0, description="Course weight in credits")
    target_grade: str = Field(..., min_length=1, description='Target grade (e.g., "A", "85%")')
    daily_target_hours: float = Field(
        4.0,
        ge=0,
        le=12,
        description="Daily study target in hours",
    )

    @field_validator("course_code", "course_name", "target_grade")
    @classmethod
    def validate_not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Field cannot be empty")
        return value.strip()


class CourseUpdate(BaseModel):
    course_code: str | None = Field(None, min_length=1, description="Course code (e.g., MATH 402)")
    course_name: str | None = Field(None, min_length=1, description="Course name")
    credits: float | None = Field(None, gt=0, description="Course weight in credits")
    target_grade: str | None = Field(None, min_length=1, description='Target grade (e.g., "A", "85%")')
    daily_target_hours: float | None = Field(
        None,
        ge=0,
        le=12,
        description="Optional daily study target in hours",
    )

    @field_validator("course_code", "course_name", "target_grade")
    @classmethod
    def validate_optional_not_empty(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not value.strip():
            raise ValueError("Field cannot be empty")
        return value.strip()


class CourseResponse(BaseModel):
    id: UUID
    user_id: UUID
    course_code: str
    course_name: str
    credits: float
    target_grade: str
    daily_target_hours: float = 4.0

    class Config:
        from_attributes = True

```

### `./backend/app/schemas/plan.py`

```python
from __future__ import annotations

from datetime import date as datetime_date, time as datetime_time, datetime, timedelta
from pydantic import BaseModel, Field
from uuid import UUID


class StudyBlockBase(BaseModel):
    date: datetime_date
    start_time: datetime_time
    end_time: datetime_time
    duration_hours: int
    description: str | None = None
    course_id: UUID | None = None
    assessment_id: UUID | None = None


class StudyBlockCreate(StudyBlockBase):
    pass


class StudyBlockUpdate(BaseModel):
    date: datetime_date | None = None
    start_time: datetime_time | None = None
    end_time: datetime_time | None = None
    duration_hours: int | None = None
    description: str | None = None
    course_id: UUID | None = None
    assessment_id: UUID | None = None


class StudyBlockResponse(StudyBlockBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class PlanGenerateRequest(BaseModel):
    """Request schema for generating a study plan."""
    start_date: datetime_date | None = Field(
        default=None,
        description="Start date for the study plan (defaults to today if not provided)"
    )
    end_date: datetime_date | None = Field(
        default=None,
        description="End date for the study plan (defaults to 7 days from today if not provided)"
    )


class PlanGenerateResponse(BaseModel):
    """Response schema for study plan generation."""
    message: str
    blocks_created: int
    blocks: list[StudyBlockResponse]

```

### `./backend/app/schemas/study_session.py`

```python
from datetime import datetime
from pydantic import BaseModel, Field, model_validator
from uuid import UUID


class StudySessionCreate(BaseModel):
    course_id: UUID
    title: str = Field(..., min_length=1)
    start_time: datetime
    end_time: datetime
    duration_minutes: int = Field(..., gt=0)

    @model_validator(mode="after")
    def validate_time_range(self) -> "StudySessionCreate":
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class StudySessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    course_id: UUID
    title: str
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    is_completed: bool

    class Config:
        from_attributes = True

```

### `./backend/app/schemas/user.py`

```python
from datetime import datetime
from pydantic import BaseModel, EmailStr
from uuid import UUID


class UserBase(BaseModel):
    email: str
    full_name: str | None = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class UserMeResponse(BaseModel):
    email: EmailStr
    full_name: str | None = None

    class Config:
        from_attributes = True

```

### `./backend/app/services/__init__.py`

```python

```

### `./backend/app/services/planner.py`

```python
"""
Study plan optimization service.

This module contains the logic for generating optimized study plans
based on courses, assessments, and availability.
"""

from datetime import date, datetime, time, timedelta
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.assessment import Assessment
from app.models.availability import Availability
from app.models.study_block import StudyBlock


# Day name mapping
DAY_NAMES = {
    "Monday": 0,
    "Tuesday": 1,
    "Wednesday": 2,
    "Thursday": 3,
    "Friday": 4,
    "Saturday": 5,
    "Sunday": 6,
}


def get_day_name(d: date) -> str:
    """Get the day name for a given date."""
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return days[d.weekday()]


def time_to_minutes(t: time) -> int:
    """Convert time to minutes since midnight."""
    return t.hour * 60 + t.minute


def minutes_to_time(minutes: int) -> time:
    """Convert minutes since midnight to time."""
    hours = minutes // 60
    mins = minutes % 60
    return time(hour=hours, minute=mins)


def calculate_time_difference_hours(start: time, end: time) -> float:
    """Calculate hours between two times."""
    start_minutes = time_to_minutes(start)
    end_minutes = time_to_minutes(end)
    if end_minutes < start_minutes:
        # Handle overnight (shouldn't happen for availability, but be safe)
        end_minutes += 24 * 60
    return (end_minutes - start_minutes) / 60.0


def generate_study_plan(
    db: Session,
    user_id: UUID,
    start_date: date,
    end_date: date,
) -> List[StudyBlock]:
    """
    Generate an optimized study plan based on assessments and availability.
    
    Args:
        db: Database session
        user_id: UUID of the user
        start_date: Start date for the study plan
        end_date: End date for the study plan
        
    Returns:
        List of newly generated StudyBlock objects (not committed to database)
    """
    # Data Fetching
    # Fetch active assessments (status != 'done' and hours_completed < expected_hours)
    assessments = (
        db.query(Assessment)
        .filter(
            and_(
                Assessment.user_id == user_id,
                Assessment.status != "done",
                Assessment.hours_completed < Assessment.expected_hours,
            )
        )
        .all()
    )
    
    # Fetch all availability records for the user
    availabilities = (
        db.query(Availability)
        .filter(Availability.user_id == user_id)
        .all()
    )
    
    # Fetch existing study blocks in the date range
    existing_blocks = (
        db.query(StudyBlock)
        .filter(
            and_(
                StudyBlock.user_id == user_id,
                StudyBlock.date >= start_date,
                StudyBlock.date <= end_date,
            )
        )
        .all()
    )
    
    # Prioritization: Sort by due_date (ascending), then by weight_percent (descending)
    # Handle None due_dates by putting them at the end
    assessments_sorted = sorted(
        assessments,
        key=lambda a: (
            a.due_date if a.due_date is not None else date.max,
            -a.weight_percent,  # Negative for descending
        ),
    )
    
    # Group existing blocks by date for quick lookup
    blocks_by_date: dict[date, List[StudyBlock]] = {}
    for block in existing_blocks:
        if block.date not in blocks_by_date:
            blocks_by_date[block.date] = []
        blocks_by_date[block.date].append(block)
    
    # Group availabilities by day of week
    availability_by_day: dict[str, List[Availability]] = {}
    for avail in availabilities:
        day = avail.day_of_week
        if day not in availability_by_day:
            availability_by_day[day] = []
        availability_by_day[day].append(avail)
    
    # Track hours allocated in this run for each assessment
    hours_allocated: dict[UUID, float] = {a.id: 0.0 for a in assessments_sorted}
    
    # List to store newly generated study blocks
    new_blocks: List[StudyBlock] = []
    
    # Iterate through each day from start_date to end_date
    current_date = start_date
    while current_date <= end_date:
        day_name = get_day_name(current_date)
        
        # Get availability windows for this day of week
        day_availabilities = availability_by_day.get(day_name, [])
        
        # Calculate free windows for this day
        free_windows = []
        for avail in day_availabilities:
            # Start with the full availability window
            window_start = avail.start_time
            window_end = avail.end_time
            
            # Subtract existing study blocks that overlap with this availability
            existing_for_date = blocks_by_date.get(current_date, [])
            # Sort existing blocks by start_time to handle overlaps correctly
            existing_for_date_sorted = sorted(existing_for_date, key=lambda b: b.start_time)
            
            for block in existing_for_date_sorted:
                block_start = block.start_time
                block_end = block.end_time
                
                # Check if block overlaps with availability window
                if block_start < window_end and block_end > window_start:
                    # Block overlaps, split the window
                    if block_start > window_start:
                        # There's a free window before the block
                        free_windows.append((window_start, block_start))
                    # Update window_start to after the block
                    window_start = max(window_start, block_end)
            
            # Add remaining window if any
            if window_start < window_end:
                free_windows.append((window_start, window_end))
        
        # Sort free windows by start time
        free_windows.sort(key=lambda w: w[0])
        
        # Allocate study blocks for prioritized assessments
        # Use a list that we can modify as we allocate blocks
        available_windows = free_windows.copy()
        
        for assessment in assessments_sorted:
            # Calculate remaining hours needed
            remaining_hours = (
                assessment.expected_hours
                - assessment.hours_completed
                - hours_allocated[assessment.id]
            )
            
            if remaining_hours <= 0:
                continue  # This assessment is fully allocated
            
            # Try to fill available windows for this assessment
            # Iterate through windows (we'll modify the list as we go)
            window_idx = 0
            while window_idx < len(available_windows) and remaining_hours > 0:
                window_start, window_end = available_windows[window_idx]
                window_duration = calculate_time_difference_hours(window_start, window_end)
                
                if window_duration <= 0:
                    # Remove exhausted window
                    available_windows.pop(window_idx)
                    continue
                
                # Maximum block length is 2 hours
                block_duration = min(window_duration, remaining_hours, 2.0)
                
                # Create study block
                # Calculate end time based on duration (round to nearest minute)
                block_end_minutes = time_to_minutes(window_start) + round(block_duration * 60)
                block_end = minutes_to_time(block_end_minutes)
                
                # Recalculate actual duration from times (in case of rounding)
                actual_duration_hours = calculate_time_difference_hours(window_start, block_end)
                
                new_block = StudyBlock(
                    user_id=user_id,
                    course_id=assessment.course_id,
                    assessment_id=assessment.id,
                    date=current_date,
                    start_time=window_start,
                    end_time=block_end,
                    duration_hours=int(round(actual_duration_hours)),  # Convert to int as per model
                    description=f"Study for {assessment.title}",
                )
                new_blocks.append(new_block)
                
                # Update tracking (use actual duration)
                hours_allocated[assessment.id] += actual_duration_hours
                remaining_hours -= actual_duration_hours
                
                # Update the available window
                if block_duration < window_duration:
                    # There's remaining time in this window, update it
                    available_windows[window_idx] = (block_end, window_end)
                    # Move to next window for this assessment
                    window_idx += 1
                else:
                    # Window is fully used, remove it
                    available_windows.pop(window_idx)
                    # window_idx stays the same (next window moves into this position)
        
        # Move to next day
        current_date += timedelta(days=1)
    
    return new_blocks

```

### `./backend/app/services/study_block.py`

```python
"""
Study block validation service.

This module contains validation logic for study blocks, including overlap detection.
"""

from datetime import date, time
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.study_block import StudyBlock


def check_for_overlaps(
    db: Session,
    user_id: UUID,
    date: date,
    start_time: time,
    end_time: time,
    exclude_block_id: UUID | None = None,
) -> StudyBlock | None:
    """
    Check if a study block overlaps with any existing blocks for the user on the same date.
    
    Args:
        db: Database session
        user_id: UUID of the user
        date: Date of the study block
        start_time: Start time of the study block
        end_time: End time of the study block
        exclude_block_id: Optional UUID of a block to exclude from the check (for updates)
        
    Returns:
        The overlapping StudyBlock if found, None otherwise
        
    Overlap condition: Two blocks overlap if (new_start < existing_end) AND (new_end > existing_start)
    """
    # Query for existing blocks on the same date for this user
    query = db.query(StudyBlock).filter(
        and_(
            StudyBlock.user_id == user_id,
            StudyBlock.date == date,
        )
    )
    
    # Exclude the current block if updating
    if exclude_block_id is not None:
        query = query.filter(StudyBlock.id != exclude_block_id)
    
    existing_blocks = query.all()
    
    # Check for overlaps
    # Overlap exists if: (new_start < existing_end) AND (new_end > existing_start)
    for block in existing_blocks:
        if start_time < block.end_time and end_time > block.start_time:
            return block
    
    return None

```

### `./backend/app/utils/waterloo_parser.py`

```python
import re
from datetime import date, datetime
from typing import Any
from zoneinfo import ZoneInfo

from bs4 import BeautifulSoup

DEFAULT_TERM_END_MONTH = 4
DEFAULT_TERM_END_DAY = 24
DEFAULT_OUTLINE_YEAR = 2026
QUIZ_TITLE_RE = re.compile(r"\bquiz\s*(\d+)\b", re.IGNORECASE)
TERM_YEAR_RE = re.compile(r"\b(?:winter|spring|summer|fall)\s+(\d{4})\b", re.IGNORECASE)
TIME_RE = re.compile(r"\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\b", re.IGNORECASE)
TORONTO_TZ = ZoneInfo("America/Toronto")
ASSIGNMENT_TOKEN_RE = re.compile(r"\bA(\d{1,2})\b", re.IGNORECASE)
QUIZ_TOKEN_RE = re.compile(r"\bQ(\d{1,2})\b", re.IGNORECASE)
PAREN_COUNT_RE = re.compile(r"\((\d{1,3})\)")

MONTH_MAP = {
    "jan": 1,
    "january": 1,
    "feb": 2,
    "february": 2,
    "mar": 3,
    "march": 3,
    "apr": 4,
    "april": 4,
    "may": 5,
    "jun": 6,
    "june": 6,
    "jul": 7,
    "july": 7,
    "aug": 8,
    "august": 8,
    "sep": 9,
    "sept": 9,
    "september": 9,
    "oct": 10,
    "october": 10,
    "nov": 11,
    "november": 11,
    "dec": 12,
    "december": 12,
}


def _extract_table_rows(table: Any) -> list[list[str]]:
    rows: list[list[str]] = []
    for tr in table.find_all("tr"):
        cells = tr.find_all(["th", "td"])
        values = [cell.get_text(" ", strip=True) for cell in cells]
        if any(values):
            rows.append(values)
    return rows


def _parse_weight_percentage(text: str) -> float | None:
    match = re.findall(r"(\d+(?:\.\d+)?)", text or "")
    if not match:
        return None
    try:
        return float(match[0])
    except ValueError:
        return None


def _extract_outline_year(soup: BeautifulSoup) -> int:
    page_text = soup.get_text(" ", strip=True)
    match = TERM_YEAR_RE.search(page_text)
    if match:
        try:
            return int(match.group(1))
        except ValueError:
            return DEFAULT_OUTLINE_YEAR
    return DEFAULT_OUTLINE_YEAR


def _placeholder_term_end_for_year(year: int) -> datetime:
    return datetime(year, DEFAULT_TERM_END_MONTH, DEFAULT_TERM_END_DAY, 0, 0, 0, tzinfo=TORONTO_TZ)


def _extract_time_from_text(text: str) -> tuple[int, int]:
    match = TIME_RE.search(text or "")
    if not match:
        return (0, 0)
    hour = int(match.group(1))
    minute = int(match.group(2) or "0")
    marker = match.group(3).lower().replace(".", "")
    if marker.startswith("p") and hour != 12:
        hour += 12
    if marker.startswith("a") and hour == 12:
        hour = 0
    return (hour, minute)


def _to_toronto_datetime(year: int, month: int, day: int, hour: int = 0, minute: int = 0) -> datetime:
    return datetime(year, month, day, hour, minute, 0, tzinfo=TORONTO_TZ)


def _coerce_date_from_text(text: str, outline_year: int, term_end_placeholder: datetime) -> datetime | None:
    raw = (text or "").strip()
    if not raw:
        return None

    lowered = raw.lower()
    if any(token in lowered for token in ("tba", "tbd", "registrar")):
        return term_end_placeholder

    # ISO path first
    try:
        iso_raw = raw.replace("Z", "+00:00")
        if "T" in iso_raw or "+" in iso_raw[10:] or "-" in iso_raw[10:]:
            iso_dt = datetime.fromisoformat(iso_raw)
            if iso_dt.tzinfo is None:
                iso_dt = iso_dt.replace(tzinfo=TORONTO_TZ)
            iso_dt = iso_dt.astimezone(TORONTO_TZ).replace(year=outline_year, second=0, microsecond=0)
            return iso_dt
        iso_date = date.fromisoformat(iso_raw)
        return _to_toronto_datetime(outline_year, iso_date.month, iso_date.day, 0, 0)
    except Exception:
        pass

    # Month-day extraction from noisy cells (e.g., "Thu Jan 15", "Week 2 Jan 15")
    match = re.search(
        r"\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|"
        r"aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})\b",
        lowered,
        flags=re.IGNORECASE,
    )
    if match:
        month_token = match.group(1).lower().rstrip(".")
        day_num = int(match.group(2))
        month_num = MONTH_MAP.get(month_token)
        if month_num:
            try:
                hour, minute = _extract_time_from_text(raw)
                return _to_toronto_datetime(outline_year, month_num, day_num, hour, minute)
            except ValueError:
                return None

    formats = ["%b %d", "%B %d", "%b %d, %Y", "%B %d, %Y", "%d %b", "%d %B"]
    for fmt in formats:
        try:
            parsed = datetime.strptime(raw, fmt)
            hour, minute = _extract_time_from_text(raw)
            return _to_toronto_datetime(outline_year, parsed.month, parsed.day, hour, minute)
        except ValueError:
            continue
    return None


def _split_exact(total_weight: float, count: int) -> list[float]:
    if count <= 0:
        return []
    basis_points_total = int(round(total_weight * 100))
    base = basis_points_total // count
    remainder = basis_points_total % count
    values = [base / 100.0 for _ in range(count)]
    for i in range(remainder):
        values[i] = round(values[i] + 0.01, 2)
    return values


def _extract_month_day_dates(text: str, outline_year: int) -> list[datetime]:
    if not text:
        return []
    matches = re.findall(
        r"\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|"
        r"aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})\b",
        text,
        flags=re.IGNORECASE,
    )
    out: list[datetime] = []
    hour, minute = _extract_time_from_text(text)
    for month_token, day_token in matches:
        month_num = MONTH_MAP.get(month_token.lower().rstrip("."))
        if not month_num:
            continue
        try:
            out.append(_to_toronto_datetime(outline_year, month_num, int(day_token), hour, minute))
        except ValueError:
            continue
    return out


def _extract_weekday_dates(text: str, outline_year: int) -> list[datetime]:
    matches = re.findall(
        r"\b(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\s+"
        r"(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|"
        r"aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})\b",
        text,
        flags=re.IGNORECASE,
    )
    out: list[datetime] = []
    hour, minute = _extract_time_from_text(text)
    for _, month_token, day_token in matches:
        month_num = MONTH_MAP.get(month_token.lower().rstrip("."))
        if not month_num:
            continue
        try:
            out.append(_to_toronto_datetime(outline_year, month_num, int(day_token), hour, minute))
        except ValueError:
            continue
    return out


def _extract_tuesday_dates(text: str, outline_year: int) -> list[datetime]:
    matches = re.findall(
        r"\b(tue(?:s|sday)?)\s+"
        r"(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|"
        r"aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})\b",
        text,
        flags=re.IGNORECASE,
    )
    out: list[datetime] = []
    hour, minute = _extract_time_from_text(text)
    for _, month_token, day_token in matches:
        month_num = MONTH_MAP.get(month_token.lower().rstrip("."))
        if not month_num:
            continue
        try:
            out.append(_to_toronto_datetime(outline_year, month_num, int(day_token), hour, minute))
        except ValueError:
            continue
    return out


def _pick_quiz_due_date_from_plan_row(row: list[str], quiz_cell_text: str, outline_year: int) -> datetime | None:
    # 1) Best source: date embedded in the same quiz cell ("Quiz 1 Thu Jan 15").
    quiz_weekday_dates = _extract_weekday_dates(quiz_cell_text, outline_year)
    if quiz_weekday_dates:
        return quiz_weekday_dates[0]
    quiz_cell_dates = _extract_month_day_dates(quiz_cell_text, outline_year)
    if quiz_cell_dates:
        return quiz_cell_dates[0]

    # 2) Next best: a non-range cell with a date.
    for cell in row:
        cell_weekday_dates = _extract_weekday_dates(cell, outline_year)
        if cell_weekday_dates:
            return cell_weekday_dates[0]
        cell_dates = _extract_month_day_dates(cell, outline_year)
        if not cell_dates:
            continue
        lowered = cell.lower()
        if " - " in cell or " to " in lowered:
            # Date ranges in class plan rows are usually "Thu-Fri"; quizzes are on the first day.
            return cell_dates[0]
        return cell_dates[0]

    # 3) Last resort: any date in row text, choose the first one.
    row_dates = _extract_month_day_dates(" ".join(row), outline_year)
    if row_dates:
        return row_dates[0]
    return None


def _normalize_group_name(text: str) -> str:
    lowered = re.sub(r"[^a-z\s]", " ", (text or "").lower())
    cleaned = re.sub(r"\s+", " ", lowered).strip()
    if not cleaned:
        return ""
    tokens = [tok for tok in cleaned.split(" ") if tok not in {"the", "total", "overall", "weight"}]
    if not tokens:
        return ""
    irregular = {
        "quizzes": "quiz",
    }
    first = tokens[0]
    if first in irregular:
        tokens[0] = irregular[first]
    elif first.endswith("ies") and len(first) > 4:
        tokens[0] = first[:-3] + "y"
    elif first.endswith(("ches", "shes", "sses", "xes", "zes")) and len(first) > 4:
        tokens[0] = first[:-2]
    elif first.endswith("s") and len(first) > 3:
        tokens[0] = first[:-1]
    return " ".join(tokens)


def _extract_parent_count(text: str) -> int | None:
    match = PAREN_COUNT_RE.search(text or "")
    if not match:
        return None
    try:
        return int(match.group(1))
    except ValueError:
        return None


def _is_parent_category_row(title: str, date_text: str) -> bool:
    lowered_date = (date_text or "").strip().lower()
    if not lowered_date:
        return True
    return any(token in lowered_date for token in ("see schedule", "see learn", "see course schedule", "learn"))


def _looks_like_aggregate_component(title: str) -> bool:
    lowered = (title or "").strip().lower()
    if not lowered:
        return False
    if re.search(r"\d", lowered):
        return False
    normalized = _normalize_group_name(lowered)
    if not normalized:
        return False
    first_word = normalized.split(" ")[0]
    return first_word in {"quiz", "assignment", "lab", "project", "test", "exam"}


def _extract_schedule_due_date(row_text_cells: list[str], outline_year: int, term_end_placeholder: datetime) -> datetime:
    # 1) Structured extraction across the full row.
    due = _pick_quiz_due_date_from_plan_row(row_text_cells, " ".join(row_text_cells), outline_year)
    if due:
        return due

    # 2) Cell-by-cell parse using all supported date formats.
    for cell in row_text_cells:
        parsed = _coerce_date_from_text(cell, outline_year, term_end_placeholder)
        if parsed and parsed != term_end_placeholder:
            return parsed

    # 3) Last attempt: strip weekday/range noise and parse again.
    for cell in row_text_cells:
        cleaned = re.sub(r"\b(mon|tue|wed|thu|fri|sat|sun)(?:day)?\b", " ", cell, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s+", " ", cleaned).strip(" ,.-")
        parsed = _coerce_date_from_text(cleaned, outline_year, term_end_placeholder)
        if parsed and parsed != term_end_placeholder:
            return parsed

    return term_end_placeholder


def _child_title_for_group(group_label: str, row_text: str, counter: int) -> str:
    words = [w for w in group_label.split(" ") if w]
    if not words:
        return f"Item {counter}"
    display_base = " ".join(word.capitalize() for word in words)
    joined = " ".join(words)
    match = re.search(rf"\b{re.escape(joined)}\s*(\d+)\b", row_text, flags=re.IGNORECASE)
    if match:
        return f"{display_base} {match.group(1)}"
    return f"{display_base} {counter}"


def _infer_quiz_count_from_text(plan_section: Any, soup: BeautifulSoup) -> int:
    sources: list[str] = []
    if plan_section is not None:
        sources.append(plan_section.get_text(" ", strip=True))
    sources.append(soup.get_text(" ", strip=True))

    count = 0
    patterns = [
        r"\b(\d{1,2})\s+quizzes\b",
        r"\bquizzes?\s*\(?\s*(\d{1,2})\s*\)?\b",
    ]
    for source in sources:
        lowered = source.lower()
        for pattern in patterns:
            for match in re.finditer(pattern, lowered, flags=re.IGNORECASE):
                try:
                    count = max(count, int(match.group(1)))
                except ValueError:
                    continue
    return count


def _extract_quiz_dates_from_course_schedule(
    soup: BeautifulSoup, outline_year: int, term_end_placeholder: datetime
) -> list[datetime]:
    schedule_candidates: list[Any] = []
    for section in soup.find_all(["div", "section"]):
        section_id = (section.get("id") or "").lower()
        section_text = section.get_text(" ", strip=True).lower()
        if "course_schedule" in section_id or "course schedule" in section_text:
            schedule_candidates.append(section)

    quiz_dates: list[datetime] = []
    for section in schedule_candidates:
        for table in section.find_all("table"):
            for row in table.find_all("tr"):
                cells = row.find_all(["th", "td"])
                if not cells:
                    continue
                row_text_cells = [cell.get_text(" ", strip=True) for cell in cells]
                row_joined = " ".join(row_text_cells).lower()
                if "quiz" not in row_joined:
                    continue
                due = _extract_schedule_due_date(row_text_cells, outline_year, term_end_placeholder)
                quiz_dates.append(due)
    return quiz_dates


def parse_waterloo_outline(html_content: str) -> list[dict[str, Any]] | None:
    soup = BeautifulSoup(html_content, "html.parser")
    outline_year = _extract_outline_year(soup)
    term_end_placeholder = _placeholder_term_end_for_year(outline_year)
    assessment_section = soup.find("div", id="assessments_amp_activities")
    if not assessment_section:
        return None

    assessments: list[dict[str, Any]] = []
    parent_categories: dict[str, dict[str, Any]] = {}

    # Pass 1: parse assessment table and identify parent categories.
    for table in assessment_section.find_all("table"):
        rows = _extract_table_rows(table)
        if not rows:
            continue

        headers = [h.lower() for h in rows[0]]
        component_idx = next((i for i, h in enumerate(headers) if "component" in h), 0)
        date_idx = next((i for i, h in enumerate(headers) if "date" in h), 1 if len(rows[0]) > 1 else 0)
        weight_idx = next((i for i, h in enumerate(headers) if "weight" in h), 3 if len(rows[0]) > 3 else 2)
        data_rows = rows[1:] if any("component" in h for h in headers) else rows

        for row in data_rows:
            if component_idx >= len(row) or weight_idx >= len(row):
                continue

            title = row[component_idx].strip()
            date_text = row[date_idx].strip() if date_idx < len(row) else ""
            weight = _parse_weight_percentage(row[weight_idx])
            if not title or weight is None:
                continue

            normalized_group = _normalize_group_name(title)
            if (_is_parent_category_row(title, date_text) or _looks_like_aggregate_component(title)) and normalized_group:
                parent_categories[normalized_group] = {
                    "title": title,
                    "weight_percentage": float(weight),
                    "count": _extract_parent_count(title),
                }
                continue

            lower_title = title.lower()
            due = _coerce_date_from_text(date_text, outline_year, term_end_placeholder)
            assessments.append(
                {
                    "title": title,
                    "weight_percentage": float(weight),
                    "due_date": due or term_end_placeholder,
                    "assessment_type": "exam" if "exam" in lower_title else "assignment",
                }
            )

    # Pass 2: parse tentative class plan and group child items by parent category.
    group_children: dict[str, list[dict[str, Any]]] = {key: [] for key in parent_categories}
    group_counters: dict[str, int] = {key: 0 for key in parent_categories}
    plan_section = soup.find("div", id="tentative_class_plan")
    if plan_section and parent_categories:
        distributed_seen: dict[str, set[int]] = {
            "assignment": set(),
            "quiz": set(),
        }
        for table in plan_section.find_all("table"):
            table_rows = table.find_all("tr")
            if len(table_rows) <= 1:
                continue

            header_cells = table_rows[0].find_all(["th", "td"])
            header_text = [cell.get_text(" ", strip=True).lower() for cell in header_cells]
            assessments_idx = next(
                (i for i, text in enumerate(header_text) if "assessment" in text),
                None,
            )

            for row in table_rows[1:]:
                cols = row.find_all(["th", "td"])
                if not cols:
                    continue
                row_text_cells = [col.get_text(" ", strip=True) for col in cols]
                row_joined = " ".join(row_text_cells)
                lowered_row = row_joined.lower()
                if "no tutorial" in lowered_row or "reading week" in lowered_row:
                    continue

                assessments_cell_text = (
                    row_text_cells[assessments_idx]
                    if assessments_idx is not None and assessments_idx < len(row_text_cells)
                    else row_joined
                )

                # Prefer Tuesday dates in schedule rows for distributed items (CS 136 outlines).
                tuesday_dates = _extract_tuesday_dates(row_joined, outline_year)
                due = tuesday_dates[0] if tuesday_dates else _extract_schedule_due_date(
                    row_text_cells, outline_year, term_end_placeholder
                )

                # Distributed assessments (A1, A2, ... / Q1, Q2, ...)
                assignment_numbers = [
                    int(match.group(1)) for match in ASSIGNMENT_TOKEN_RE.finditer(assessments_cell_text)
                ]
                quiz_numbers = [
                    int(match.group(1)) for match in QUIZ_TOKEN_RE.finditer(assessments_cell_text)
                ]

                if "assignment" in parent_categories:
                    for num in assignment_numbers:
                        if num in distributed_seen["assignment"]:
                            continue
                        distributed_seen["assignment"].add(num)
                        group_children["assignment"].append(
                            {
                                "title": f"A{num}",
                                "due_date": due,
                                "assessment_type": "assignment",
                            }
                        )

                if "quiz" in parent_categories:
                    for num in quiz_numbers:
                        if num in distributed_seen["quiz"]:
                            continue
                        distributed_seen["quiz"].add(num)
                        group_children["quiz"].append(
                            {
                                "title": f"Q{num}",
                                "due_date": due,
                                "assessment_type": "quiz",
                            }
                        )

                for group_key in parent_categories:
                    trigger_word = group_key.split(" ")[0]
                    if not trigger_word:
                        continue
                    if re.search(rf"\b{re.escape(trigger_word)}s?\b", lowered_row, flags=re.IGNORECASE):
                        group_counters[group_key] += 1
                        title = _child_title_for_group(group_key, row_joined, group_counters[group_key])
                        assessment_type = "assignment"
                        if trigger_word == "quiz":
                            assessment_type = "quiz"
                        elif "exam" in group_key:
                            assessment_type = "exam"
                        group_children[group_key].append(
                            {
                                "title": title,
                                "due_date": due,
                                "assessment_type": assessment_type,
                            }
                        )

    # Prevent category clumping for quizzes: if we have a quiz parent total but sparse/no quiz rows,
    # infer quiz count from text and build individual quiz placeholders.
    quiz_parent_key = next((key for key in parent_categories if key.split(" ")[0] == "quiz"), None)
    if quiz_parent_key:
        inferred_quiz_count = _infer_quiz_count_from_text(plan_section, soup)
        if inferred_quiz_count > 0:
            existing_quiz_children = group_children.get(quiz_parent_key, [])
            existing_count = len(existing_quiz_children)
            if existing_count < inferred_quiz_count:
                schedule_quiz_dates = _extract_quiz_dates_from_course_schedule(
                    soup, outline_year, term_end_placeholder
                )
                for idx in range(existing_count + 1, inferred_quiz_count + 1):
                    due = (
                        schedule_quiz_dates[idx - 1]
                        if (idx - 1) < len(schedule_quiz_dates)
                        else term_end_placeholder
                    )
                    existing_quiz_children.append(
                        {
                            "title": f"Quiz {idx}",
                            "due_date": due,
                            "assessment_type": "quiz",
                        }
                    )
                group_children[quiz_parent_key] = existing_quiz_children

    # Dynamic weight normalization: split each parent category weight across found children.
    for group_key, children in group_children.items():
        if not children:
            continue
        parent_weight = float(parent_categories[group_key]["weight_percentage"])
        split_weights = _split_exact(parent_weight, len(children))
        print(f"[waterloo_parser] parent_category={group_key} weight={parent_weight} child_count={len(children)}")
        print(f"[waterloo_parser] split_weights={split_weights}")
        for idx, child in enumerate(children):
            assessments.append(
                {
                    "title": child["title"],
                    "weight_percentage": float(split_weights[idx]),
                    "due_date": child["due_date"],
                    "assessment_type": child["assessment_type"],
                }
            )

    # Enforce term year across all due dates.
    normalized: list[dict[str, Any]] = []
    for item in assessments:
        due = item.get("due_date")
        if isinstance(due, datetime):
            due = due.astimezone(TORONTO_TZ).replace(year=outline_year, second=0, microsecond=0)
        elif isinstance(due, date):
            due = _to_toronto_datetime(outline_year, due.month, due.day, 0, 0)
        elif due:
            parsed_due = _coerce_date_from_text(str(due), outline_year, term_end_placeholder)
            due = (parsed_due or term_end_placeholder).astimezone(TORONTO_TZ).replace(
                year=outline_year, second=0, microsecond=0
            )
        else:
            due = term_end_placeholder

        normalized.append(
            {
                "title": item.get("title", "").strip(),
                "weight_percentage": float(item.get("weight_percentage", 0)),
                "due_date": due.isoformat(),
                "assessment_type": str(item.get("assessment_type", "assignment")),
            }
        )

    final_assessments = [item for item in normalized if item["title"]]

    # Fallback normalizer: if multiple items share a component type and a parent total exists,
    # split that parent total evenly across the child items.
    component_totals: dict[str, float] = {}
    for key, value in parent_categories.items():
        trigger = key.split(" ")[0] if key else ""
        if not trigger:
            continue
        component_totals[trigger] = float(value["weight_percentage"])

    grouped_indexes: dict[str, list[int]] = {}
    for idx, item in enumerate(final_assessments):
        component_key = _normalize_group_name(str(item.get("title", "")))
        trigger = component_key.split(" ")[0] if component_key else ""
        if not trigger:
            continue
        grouped_indexes.setdefault(trigger, []).append(idx)

    for trigger, indexes in grouped_indexes.items():
        parent_total = component_totals.get(trigger)
        if parent_total is None or len(indexes) <= 1:
            continue
        split_weights = _split_exact(parent_total, len(indexes))
        print(
            f"[waterloo_parser] fallback_split component={trigger} "
            f"parent_total={parent_total} child_count={len(indexes)} split_weights={split_weights}"
        )
        for i, item_idx in enumerate(indexes):
            final_assessments[item_idx]["weight_percentage"] = float(split_weights[i])

    final_quiz_objects = [
        item for item in final_assessments if str(item.get("assessment_type", "")).lower() == "quiz"
    ]
    total_weight = round(sum(float(item.get("weight_percentage", 0)) for item in final_assessments), 2)
    print(f"[waterloo_parser] total_weight={total_weight}")
    print(f"[waterloo_parser] final_quiz_objects={final_quiz_objects}")
    print(f"[waterloo_parser] final_parsed_assessments={final_assessments}")

    return final_assessments

```

### `./backend/docker-compose.yml`

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: studydb
    ports:
      - "5432:5432"

  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/studydb
    depends_on:
      - db

```

### `./backend/pyproject.toml`

```toml
[project]
name = "uw-load-optimizer"
version = "0.1.0"
description = "UW Load Optimizer Backend"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "sqlalchemy>=2.0.0",
    "alembic>=1.12.0",
    "psycopg2-binary>=2.9.9",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "python-multipart>=0.0.6",
]

[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

```

### `./backend/README.md`

```markdown
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

```

### `./backend/scripts/fix_quiz_weights.py`

```python
"""
Backfill script for incorrectly saved quiz weights.

Fixes courses where every quiz was saved as 20% (category total),
and redistributes that total across all quizzes in the same course.

Usage:
  cd backend
  python -m scripts.fix_quiz_weights --dry-run
  python -m scripts.fix_quiz_weights
"""

from __future__ import annotations

import argparse
from collections import defaultdict
from typing import Iterable
from uuid import UUID

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
import app.models  # noqa: F401  # Registers all ORM models for standalone script execution.
from app.models.assessment import Assessment


CATEGORY_TOTAL = 20.0


def split_exact(total: float, count: int) -> list[float]:
    if count <= 0:
        return []
    cents_total = int(round(total * 100))
    base = cents_total // count
    remainder = cents_total % count
    weights = [base / 100.0 for _ in range(count)]
    for i in range(remainder):
        weights[i] = round(weights[i] + 0.01, 2)
    return weights


def is_bad_quiz_group(quizzes: Iterable[Assessment]) -> bool:
    quiz_list = list(quizzes)
    if not quiz_list:
        return False
    # Detect the known bad pattern: all quizzes are exactly category total.
    return all(round(float(q.weight_percentage), 4) == CATEGORY_TOTAL for q in quiz_list)


def fix_quiz_weights(db: Session, dry_run: bool) -> tuple[int, int]:
    quizzes = (
        db.query(Assessment)
        .filter(
            or_(
                Assessment.assessment_type.ilike("quiz"),
                Assessment.title.ilike("quiz%"),
            )
        )
        .order_by(Assessment.course_id, Assessment.due_date, Assessment.title)
        .all()
    )

    by_course: dict[UUID, list[Assessment]] = defaultdict(list)
    for quiz in quizzes:
        by_course[quiz.course_id].append(quiz)

    updated_courses = 0
    updated_quizzes = 0

    for course_id, course_quizzes in by_course.items():
        if not is_bad_quiz_group(course_quizzes):
            continue

        split = split_exact(CATEGORY_TOTAL, len(course_quizzes))
        updated_courses += 1

        print(
            f"[fix_quiz_weights] course_id={course_id} "
            f"quiz_count={len(course_quizzes)} split={split}"
        )

        for i, quiz in enumerate(course_quizzes):
            old_weight = float(quiz.weight_percentage)
            new_weight = float(split[i])
            if round(old_weight, 4) != round(new_weight, 4):
                quiz.weight_percentage = new_weight
                updated_quizzes += 1
                print(
                    f"  - {quiz.title} ({quiz.id}): {old_weight:.2f}% -> {new_weight:.2f}%"
                )

    if dry_run:
        db.rollback()
    else:
        db.commit()

    return updated_courses, updated_quizzes


def main() -> None:
    parser = argparse.ArgumentParser(description="Fix incorrect quiz weights (20% each).")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without committing.",
    )
    args = parser.parse_args()

    db = SessionLocal()
    try:
        courses, quizzes = fix_quiz_weights(db, dry_run=args.dry_run)
        mode = "DRY RUN" if args.dry_run else "COMMITTED"
        print(
            f"[fix_quiz_weights] {mode}: updated_courses={courses}, updated_quizzes={quizzes}"
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()

```

### `./frontend/eslint.config.mjs`

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

```

### `./frontend/next.config.ts`

```tsx
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

```

### `./frontend/next-env.d.ts`

```tsx
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```

### `./frontend/package.json`

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "axios": "^1.13.5",
    "lucide-react": "^0.511.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "recharts": "^3.7.0",
    "sonner": "^1.7.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}

```

### `./frontend/postcss.config.mjs`

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

```

### `./frontend/public/file.svg`

```xml
<svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#666" fill-rule="evenodd"/></svg>
```

### `./frontend/public/globe.svg`

```xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
```

### `./frontend/public/next.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 394 80"><path fill="#000" d="M262 0h68.5v12.7h-27.2v66.6h-13.6V12.7H262V0ZM149 0v12.7H94v20.4h44.3v12.6H94v21h55v12.6H80.5V0h68.7zm34.3 0h-17.8l63.8 79.4h17.9l-32-39.7 32-39.6h-17.9l-23 28.6-23-28.6zm18.3 56.7-9-11-27.1 33.7h17.8l18.3-22.7z"/><path fill="#000" d="M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Zm252.6-.4c-1 0-1.8-.4-2.5-1s-1.1-1.6-1.1-2.6.3-1.8 1-2.5 1.6-1 2.6-1 1.8.3 2.5 1a3.4 3.4 0 0 1 .6 4.3 3.7 3.7 0 0 1-3 1.8zm23.2-33.5h6v23.3c0 2.1-.4 4-1.3 5.5a9.1 9.1 0 0 1-3.8 3.5c-1.6.8-3.5 1.3-5.7 1.3-2 0-3.7-.4-5.3-1s-2.8-1.8-3.7-3.2c-.9-1.3-1.4-3-1.4-5h6c.1.8.3 1.6.7 2.2s1 1.2 1.6 1.5c.7.4 1.5.5 2.4.5 1 0 1.8-.2 2.4-.6a4 4 0 0 0 1.6-1.8c.3-.8.5-1.8.5-3V45.5zm30.9 9.1a4.4 4.4 0 0 0-2-3.3 7.5 7.5 0 0 0-4.3-1.1c-1.3 0-2.4.2-3.3.5-.9.4-1.6 1-2 1.6a3.5 3.5 0 0 0-.3 4c.3.5.7.9 1.3 1.2l1.8 1 2 .5 3.2.8c1.3.3 2.5.7 3.7 1.2a13 13 0 0 1 3.2 1.8 8.1 8.1 0 0 1 3 6.5c0 2-.5 3.7-1.5 5.1a10 10 0 0 1-4.4 3.5c-1.8.8-4.1 1.2-6.8 1.2-2.6 0-4.9-.4-6.8-1.2-2-.8-3.4-2-4.5-3.5a10 10 0 0 1-1.7-5.6h6a5 5 0 0 0 3.5 4.6c1 .4 2.2.6 3.4.6 1.3 0 2.5-.2 3.5-.6 1-.4 1.8-1 2.4-1.7a4 4 0 0 0 .8-2.4c0-.9-.2-1.6-.7-2.2a11 11 0 0 0-2.1-1.4l-3.2-1-3.8-1c-2.8-.7-5-1.7-6.6-3.2a7.2 7.2 0 0 1-2.4-5.7 8 8 0 0 1 1.7-5 10 10 0 0 1 4.3-3.5c2-.8 4-1.2 6.4-1.2 2.3 0 4.4.4 6.2 1.2 1.8.8 3.2 2 4.3 3.4 1 1.4 1.5 3 1.5 5h-5.8z"/></svg>
```

### `./frontend/public/syllabi-logo.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" zoomAndPan="magnify" viewBox="0 0 810 809.999993" height="1080" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><clipPath id="5cc0ed38f1"><path d="M 96.910156 10.339844 L 733.539062 10.339844 L 733.539062 810 L 96.910156 810 Z M 96.910156 10.339844 " clip-rule="nonzero"/></clipPath></defs><g clip-path="url(#5cc0ed38f1)"><g transform="matrix(1.870779, 0, 0, 1.870815, -1091.580182, -188.627779)"><image x="0" y="0" width="1600" xlink:href="data:image/jpeg;base64,/9j/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/2wBDAQICAgICAgUDAwUKBwYHCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgr/wAARCAOABkADAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgBN49DQAtABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAEdABQBJQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAEdAElABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFACbx6GgBnn+1ABQAUAFABQAUAFABQA/ePQ0ALQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAm8ehoAZQAUAFABQAUAHke9ABQAUAFABQAUAFABQAef7UASUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBHQAUAFABQAUASUAFABQAUAR0AFABQAUAFABQAUAFABQAUAP3j0NAC0AFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFACbx6GgBnn+1ABQAUAFABQBJQAUAFAEdABQAUAFAEmQOpoFdEdOzC6CkMKACgAoAKACgAoAKACgAoAKADz/agCSgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAj8/2oAKACgAoAKACgAoAKAJKAEfp+NADKAAcjNRzNakp824VLr26D9mnuBIHJqo029WS6igeE/tPf8FHv2K/2PIJh+0D+0j4b0O8jGBoiXf2nUnPtbQeZMf8Av3XdRwVStstO5zzxsIaM/OL9qL/g7G8IaaLjQv2Pv2dLjV5MYh8ReO7z7Lbf+AMX72X/AL+xV6FPKKnU5qmOTWh+cP7U/wDwWX/4KL/tc/aNK+Jv7Repabod1/zLPg3/AIlNj5X/ADyl8r97L/21llr0aWWKK2PPqYtt7kf7K/8AwWK/4KIfsj/Z9J+Fn7SWrX2j2v8AzLPiz/ibWPlf88Yopf3sX/bKWKirliktjOnmDTP0l/Za/wCDsPwPrLW3h/8AbM/Z9vtEnyY5vEvgSb7Va/8AbW2l/eRf9spZq86plE7+6ehTzONrM/R39mT/AIKI/sWfteWsI/Z9/aN8N+ILpxj+xhe/Z7/PvazCKUD/ALZ151bBVaPxLTudkMbCeiPcwQeRXFKDWqOlVFMKlV3tYtU0gJA5NVz31E5coVYwoAKACgAoAKACgAoAKAH7x6GgBaACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAjoAKACgAoAKAJKACgAoAjoAKACgCSgAyB1NAro8X/aX/by/ZE/ZE02S+/aM/aD8N+GGxiPT7m982+k46x2sQkmkP0jrqp4adW1l/X9drnPUqKCbufn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nW4XSorXzxH5ssR8uSVzcvnygYgIx+8OePncxxSxD0PawVLk3P0VPzLkmvJp009Wd9Z2Q6tBrYKBklABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBHVP4ip/CfzF/8ABxf/AMpd/iZ/156D/wCmW1r63Jv4Z8vj/jPh+vWe5whSAKACgAoAKAI6AJKACgAoAKACgAoAKACgAoFZBQFkFAwoAKACgAoAKAI6ACgAoAKACgCSgAoAKzAkg70Cex9if8EDv+Utvwg/7CWqf+mq6rgzP+HL0Z2YH4z+oyvjpn08PgRIfpQtBtJifJ7U7sXLEZSJWgUAFBoFAElABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBHVP4ip/CfzF/8HF3/ACl4+KP/AF5aD/6ZbSvrcl/hI+Xx/wAZ8P16z3OEKQBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAeR70AR+R70ASUAFAEdAElABWYBB3oE9j7I/wCCB3/KW34Qf9hLVP8A01XVefma/dy9GdmB+M/qMr4+Z9PD4EP3j0NBQtABQZkdABQaBQBJQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAR1K+MifwM/mM/wCDi7/lLh8Tf+vPQf8A0y2tfXZP8B8xj/jPh6vZe5ykdIAoAkoAKACgApW5hVnfY2/h98OPH/xY8Y6f8PPhZ4O1HX9f1Oby9O0TSrP7Tc3Un/TKKlKqqUW5PRCo02xnjb4e/ED4V+KLjwP8TfAGt+G9Ytf+PzSdc02W2uov+2UtZxxUZuyZXs5JmXW8YKeo9UR0hBQAUAFABQAUAFABQAUAFABQAUASU3BQVyI1XN2Lnhrw34j8Ya9b+FfCnhy+1fVLr/jz07TrOW5ll/7ZRVhLFxg9Wbxw0pq5J428B+OPhj4tvPA3xG8Hal4f1yw/5CWk6tZy211a/uvN/exS/wCqrVVFNaGNam0ZdDXKOlorMKYyOftQAUAFAElABB3prcT2Psb/AIIIf8pbfhB/2EtQ/wDTVdVwZ3/CfoduX/Gj+o6viH8R9ND4ESUyiOgAoMwoAIO9BoSUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAU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AFPVyGali4rzP32xnj6V+Qxf75n63JXoL5EyfdFavcFsMn7UhhQaBB3oAkoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoE9iAkLge1Zx+MLfuXbsfkF/wAFav2bdF+KP7WHibxNouq/YdYWCwEomOYrkC1iwM/8svrX6pwrf2C/rufivElW2NlY/P8A8beA/GPw91T+w/GOlSW0n/LH/nlL/wBcq+padzyoTT6mPRZnVFJq5J5HvSJI/I96ACgAoAKftL7md7hR7stw5Zb3Of8AHnw48KePLT/iaweVcf8ALG7i/wBbFXBXwUbXPUw+PlfU8P8AHvwm8VeA5ZLie3FzZ/8AP3af+1f+eVeNWwji9EfQUMbzLc5OuNqx6aaewUhhQAUAFABQAUAFABQAUAFABTSuJtJXOw+Hvwf8R+PP9O/48tP/AOfuaH/0V/z2rso4RyeqPDrYyyaue4eCfhv4V8B2vkaHY5uP+W13N/rJa9mjgo2PHr46V7HQV1xtHQ8/kYVvGpoNKwVmBHQAUAHke9AElBk3Y6DwH8PfFfxB1T+yvC2lSXMn/Lab/llF/wBdaCXOyPu3/gll+zToPw3/AGsfB3iLWL59S1eKS7EUxHlxRD7JL/qx3rwOI9MDL0PQ4cqN42K8z9hY+efUV+Qx/js/a3rQRMBgYrUBH6fjQAyg0CDvQBJQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQ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120Obe5k55liHBPT94OfrX0mA4gxFFJSd1+P/BPksy4To1W5RWp8M/FX4J/En4J65/wj/wAQ/D0luJf+PO7/ANZbXJ9I5Oxr9HyzOKeJSakmfmuaZPLCtrlOVr1qsufVangU04Nph5HvWydy9woWuwPTcKACgAoAj8j3oAkqeUV7FfUtH0rWLCTStVsYrm3lh/fQyw+ZScdB+1aPB/i1+x/5Pma58K5/N/57aTNN/wCipa53e5208W3ozwfUtNvtHv5NK1WxktriKb99FND+9iosz0KWIurEdI3I6ACgAoAsabpt9rF/HY6VYS3NxL/qYoYfM82tuUxq4iyPdPhL+yLPN5eufE391H/yx0mGb/0bLRynnVcW1oe8aPo+laDYR6VpVjFbW8X+pihh6V08qOJ1ZMuUWQr3CoGFABQAUAFD03BahSdrDswrKjPk1ZFRObsjsfg98DfiR8cNc/sbwN4ekuBFxd6hL+7trc+kknUn2FeRmmcUsKm3JI97K8nnimlyv7j7k/Z3/YO+G/weS38Q+J4Ytd1+I+YLy7g/d20nH+qjxgHr+861+cZhxBXrJpOy/H/gH6blvCdCg1KSPoBLaNItqnivm53rvXY+uo04YWNkT1oMKAI6ACgCSg0CgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgCOgAoAkoAKAA9OlAHP8AjXwN4P8AiFoU/hjxn4ft9RsblcTWl1CJEb8K2p4ipSkrOzOHFZXQxMGmkfGH7RH/AATW13REuPFPwHklvbT/AFk3h+7lIuYveKX/AJad+Dz/ANda+6yTiiOHahV08+n/AAD85zjg2NSUpQPlrUtM1XSL+TStcspLa4im8uaK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2QUDJKDMjoAKACgB6dPxoNBaACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKAEfp+NADKACgzCgCSg0I6AJKDMCMjFAbkKggEE7hmiUY1FoRGM6Xxao5X4l/CnwH8XvD8nhrx74et7+0lBOJVy8Z/56I4OYz9K6sNjMVgpqUJW/rqcOLy/CY+LUo6s+J/2iv8Agnb8QPAM1x4o+FEU2u6RnzJdPP8Ax+2/A5H/AD169I8Hg8V97lPFLqyjCo7X+7+vU/Ms44RqYdOUNUfN/k3EMv2eeARyV9rGrGtFNM+KlhK1CVmFdBk9AoAjoAKAJKACgAoMwoAKACgCOhamhJQ0K6Cs5YyhQi2yo4StXnZH0P8As7f8E+viP8T5rfxN8SIZvD2ik+YIZogt7ddesZ/1XT/lpk+1fGZvxbGg3Gnqz7TJuEZ4lKUtj7f+GHwg8A/CHw/H4f8AAXhy20+34MpiA8yU/wDPSSTrIfr61+eYrGYrGy5qkrn6rhMtwmBilCJ1rZ28tj3rhThR33O6cZVPh0RKM45rQAoAjoNAoAkoMyOgAoAKAJKDQKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACg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AUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBHQAUAFABQZhQAUAFABQaBQAUAFAEbID8zHArP8AjIqVRU1qEsEE8eJR+lUpyw67o5KlCljFqj5s/aJ/4J8fD/4pG58S/DR7fw7rcnzzR+Rm2uSPWP8A5Ynn/Wxc/WvpMu4mrwspybS+/wD4P9bnyWccJ0cTFuK1PiT4l/CL4lfBzXf+Ee+IXheezn/5YzSn91L/ANcpf+Wtfo2W5lSxVJSjJP5n5pjcolls2lF/cN+HHwt8ffFjxFH4d+Hnh251G4/5beV/qov+usv/ACyozHMaeGpuTkvvOfLsrnXqW5Xr5H2p+zl/wTw8GfD9YfE/xUMGu6vtyLfyB9jtvYA/6z6n8q/PMx4mrJtRlZPr1P0zLeFKMoqU0fTltbQwRFYhjjrXy6rvErQ+0oYalhFZIdHGFOQc/hUqCpao7PaRnoiatSAoAjoAKACgzCgAoAKACgAoAKDQkoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgCPz/agAoAKACgAoAfvHoaAFoAKACgAoAKACgAoAKACgAoAKACgAoAjoAKACgAoAKACgAoMwoAKACgCSgAoAD9KFoW0mFJ6odrEdZwXKwXvKzMHxt8P/CHxD0OTw/4z8O2uo2coxLbXUIdTXbSrVKb0djzcVl9PEbpMXwT8OvB/w30WPQPBmg22nWUX3YLWIAVNStOpu2GGy+GHeiSN2uWcXI9JrlVkFWlYApgFBmFABQAUAFABQAUGgUAFABQBJQAUAFABQAUAFABQAUAFABQAm8ehoAN49DQAtABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBHQAUAFABQAUAFABQAUAFABQAUAFABQAUASUAFABQAUAFABQBHQAUAFABQAUAFABQAUGYUAFABQBJQBHQAUGgUAIzYGazFUfLsIGEnsRQ5yiKFRMBhOOTRCTkOdS2iHZ4zg1tYUHzElSUR0AFBmFABQAUAFABQAUGgUAFAD06fjQAtABQAUAFABQAUAR0AFABQAUAFABQAUAFABQAUAP3j0NAC0AJvHoaADePQ0AMoAKAJKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAjoAKACgAoAKAJKAI6ACgAoAKACgAoAKACgAoAfvHoaAFoAKAE3j0NABvHoaAGUAFABQBJQBHQAUAFABQAUAFABQAUAFBmFABQAUASEA8GgHruJtHpQ9QWgbV9KFpsD13FAA4FALTYjoAKACgAoAKACgAoNAoAKACgAoAkoAKACgAoAKACgAoAKACgCOgAoAKACgAoAKACgAoAKACgAoAKACgCSgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoACQOpoAjoAKV0AUXQBTAKBXQUDCgAoFdBQMKACgdmFK6EFF0AUwem5JQAUAR0AFABQBJQAUAJvHoaAGUAFABQAUAFABQAUAFABQZhQBJQBHQAUASUAR0AFABQAUAFABQAUAFABQaBQAUAFABQAUAFAD949DQAygCSgAoAMgdTQBHQAUAFABQAUAFABQAUAFABQAUAFAElABQBHQAUAFABQBJQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAiqR1puSZnGLTI2BPQ1LVzZNWFrOMnN2C8UQz3EFvEJpZxGnqatYeU3ZasXtIJHnnjD9r79lH4eu1v49/aa8A6HJH1j1bxjY2x/wDIsorVYOpfZmHt433Ob/4eTf8ABP3zvI/4bX+FX/he2H/x2t1gK1r8v5B9Yh3Ok8H/ALXH7Kvj5/K8D/tI+Btakf8A5Z6b4utJT+AEhrmdKvtYFOjfVnocF5DdxefbzxSRnpJGahwrJ2aNVKi1oybFSnKIOEX1DINHtrbidFMK0vcq1goAaEPUnFTytluSQ7I9RSdJ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QAUAFADXYjgVFtbEVHZ2QKSQSaXO0KnFS3HVfJLuW5rsFHJLuL2i7BRyyKU4hVWtuJu+w7fyP1rKD5ldjGMwXrRUg1sZ+0sLVKE31K9ouwU+SXcftF2Cq1FyrsFF2Plj2Ci7Dlj2CjVitFBRyy7j9qgpezD2qE3r60lLUn2ltg3DOKpasTrNC0gvcKAJKDQKAImBK461Cp8uqIqtMFHHJo5ZSe46UVuBbAziqneKuifa3FBBHFOEm1qTyqWwU3uUFIAoNCSgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAjoAKAJKACgVkFAwoFZEdAySgAoAjoAkoMxH6fjQAygAoAKDQKACgAoAKACgCSgAoAjoCyWwUAFBmFABQAUAFBoFABQAUAFAElAEdAElABQAUAFAEdABQKyJKAsgoGJvHoaAGUCsgoGFBmFABQAUAFBoFABQAUASUAFABQBHQBJQAUCshN49DQMWgCOgCSgAoAT5PagBaBWQUBZBQQGB6CndisiOkMKACgAoAkoAT5PagBcD0FAEdABQAUAEHeg0JKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAjoAKAJKACgAoAjoAkoAKAE3j0NAC0GZHQAUAFABQaBQAUAFABSuh2YUxBQAUrodmFMQUAFBmFABQFmFABSujQKLodmFMQUAFABQAUAFABSugCi6AkyPUUwAkDqaA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Nejhc0+rUHTS3/rsedjcjdat7S9z2iFWRAj9uleLOrDnuevh4zhTUWef/H34E+GPj74Lk8Ka/NJbuZfMtL6FAZLaTsRXpYDGVMJe3Xc8vNcphipJ2F/Z++D+p/AzwJH4FvPHl9r1ranGnTX8EccltFj/AFXy9R9a56uI+tVWzowuGeCpJIyP2n/2ZLD9o/w1pehXXi250r+zL43PmwQiQykxGPBz9a6cux0svnfc5s5yqGdUrdTxeX/glfLMSrfHrUQn/YIjP/tSvflxZRpR96mr+v8AwD5bD8I4ujJqErL+vMSD/glkYuY/j1qbD20yP/45U1OKKOIi17NL5/8AALXCmYUJczndf15n0B+zl8EYPgF8OovAMGvyaiIryW5+1TxCMkyHpgZr5vG1PrM7x0Pq8sw1XDwtN3Z6FXMemFABQAUASUGgUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUARz9qACgCSgApNJgR0WQElFkAUwI6DNabDyqntSaTHdjKEkti3ruSUwCgAIB6igAwPQUmkwDA9BTWgPUKAClZAFMAwPQUAR0A9dwoAkwB0FAEdJpMCSmAUAJsHqaAFwMYxSsgDA9BTAjoAkoAKAClZABAPUUwI6AJKAI6AJMD0FJpPdAGB6ChJIApgR0DuySlZCI6YPXckoAMD0oBaBSaTAMAdBQkkBHTAKDMKAD/llQaD06fjQAtABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAR0AE/agAoAkoATePQ0ALQAm8ehoMxaAE3j0NBoLQAUAFACbx6GgBaACgAoAKAE3j0NADPP9qAJKACgAoAjoAkoATePQ0ALQBH5/tQAef7UASUAFAEdABQA/ePQ0AG8ehoAWgAoATePQ0AMoAfvHoaAFoAj8/2oAkoAKACgCOgCSgCOgzCgAoNCSgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgCOgAoAKDMKACgu6CgLoKCAoAKACgAoAkoAjoAKACgAoAKACgAoAKACgAoAKACgAoAkoAjoAKACgAoAKACgAoAkoAjoAkoAjoAKACgAoAKACgAoAe/T8aAGUAFABQAUASUGgUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBHQZhQAZHqKCLsMj3/KgLskyPUUFkdABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAElABQaBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBHQAUGYUAGB6CgizDA9/zoCzCgsKADA9BQRZhge/50BZhQWFABgegoIswwPf8AOgLMMD3/ADoCzDA9/wA6AswoLCgAwPQUEWYYHv8AnQFmGB7/AJ0BZhge/wCdAWYUFhQAUAFABQAUAFABQAYHoKCLMMD3/OgLMKCwoAKACgAoAKACgAoAMD0FBFmGB7/nQFmGB7/nQFmGB7/nQFmSUG4UAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAR0GYUAFBdkFAWQUEBQAUF2QUBZBQQFABQXZBQFkFAWQUBZBQQFABQXZBQFkFAWQUBZBQQSUAJsHqaAGfuqAH7B6mgA2D1NADKAD91QAUF2QUBZBQQFABQAUAFABQAUAFABQXZBB3oCyH7B6mgLIWgLIKBhQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAJsHqaAFoATYPU0ALQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAf/Z" height="896" preserveAspectRatio="xMidYMid meet"/></g></g></svg>
```

### `./frontend/public/vercel.svg`

```xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1155 1000"><path d="m577.3 0 577.4 1000H0z" fill="#fff"/></svg>
```

### `./frontend/public/window.svg`

```xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
```

### `./frontend/README.md`

```markdown
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

### `./frontend/src/app/dashboard/assessments/page.tsx`

```tsx
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type Course = {
  id: string;
  course_code: string;
  course_name: string;
};

type Assessment = {
  id: string;
  course_id: string;
  title: string;
  assessment_type: string;
  due_date: string;
  weight_percentage: number;
  is_completed: boolean;
};

type AssessmentFormData = {
  title: string;
  course_id: string;
  assessment_type: string;
  due_date: string;
  weight_percentage: string;
};

const initialFormData: AssessmentFormData = {
  title: "",
  course_id: "",
  assessment_type: "Exam",
  due_date: "",
  weight_percentage: "",
};

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<AssessmentFormData>(initialFormData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, assessmentsResponse] = await Promise.all([
          api.get<Course[]>("/courses/"),
          api.get<Assessment[]>("/assessments/"),
        ]);

        setCourses(coursesResponse.data);
        setAssessments(assessmentsResponse.data);
      } catch (fetchError) {
        console.error("Failed to fetch assessments data:", fetchError);
        setError("Unable to load assessments right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const courseCodeMap = useMemo(() => {
    return courses.reduce<Record<string, string>>((acc, course) => {
      acc[course.id] = course.course_code;
      return acc;
    }, {});
  }, [courses]);

  const parseLocalDate = (dateString: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(dateString.replace(/-/g, "/"));
    }
    return new Date(dateString);
  };

  const sortedAssessments = useMemo(() => {
    return [...assessments].sort(
      (a, b) => parseLocalDate(a.due_date).getTime() - parseLocalDate(b.due_date).getTime(),
    );
  }, [assessments]);

  const formatDate = (dateString: string) => {
    const localDate = parseLocalDate(dateString);
    return localDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const openModal = () => {
    setError("");
    setIsModalOpen(true);
    setFormData((prev) => ({
      ...prev,
      course_id: prev.course_id || courses[0]?.id || "",
    }));
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setFormData(initialFormData);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        title: formData.title.trim(),
        course_id: formData.course_id,
        assessment_type: formData.assessment_type,
        due_date: formData.due_date,
        weight_percentage: Number(formData.weight_percentage),
      };

      const response = await api.post<Assessment>("/assessments/", payload);
      setAssessments((prev) => [response.data, ...prev]);
      closeModal();
    } catch (submitError) {
      console.error("Failed to create assessment:", submitError);
      setError("Could not add assessment. Please check your input and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "h-10 w-full rounded-xl border border-[#E9ECEF] bg-white px-3 text-sm text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 transition-colors";
  const labelClass = "mb-1.5 block text-sm font-medium text-[#6C757D]";

  return (
    <div className="mx-auto w-full max-w-[1100px] p-6 md:p-8">
      <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">Upcoming Assessments</h1>
          <p className="mt-1 text-sm text-[#6C757D]">Keep track of deadlines across all your courses.</p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          <span className="material-symbols-outlined !text-[20px]">add_task</span>
          Add Task
        </button>
      </section>

      {loading ? (
        <div className="rounded-xl border border-[#E9ECEF] bg-white p-8 shadow-sm text-sm text-[#6C757D]">
          Loading assessments...
        </div>
      ) : sortedAssessments.length === 0 ? (
        <div className="rounded-xl border border-[#E9ECEF] bg-white p-10 shadow-sm text-center">
          <span className="material-symbols-outlined !text-4xl text-[#CED4DA]">event_busy</span>
          <h2 className="mt-3 text-lg font-semibold text-black">No upcoming tasks yet</h2>
          <p className="mt-1 text-sm text-[#6C757D]">
            Add your first assessment to start managing deadlines.
          </p>
        </div>
      ) : (
        <section className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm overflow-hidden">
          {sortedAssessments.map((assessment) => (
            <article
              key={assessment.id}
              className="flex items-center gap-4 border-b border-[#E9ECEF] last:border-b-0 p-4 hover:bg-[#F8F9FA] transition-colors"
            >
              <div className="h-10 w-1 rounded-full bg-[#288028]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-black">{assessment.title}</p>
                <p className="text-xs text-[#6C757D]">
                  {courseCodeMap[assessment.course_id] ?? "Unknown Course"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-black">{formatDate(assessment.due_date)}</p>
                <p className="mt-1 text-[11px] text-[#6C757D]">{assessment.weight_percentage}% weight</p>
              </div>
              <span className="rounded-full border border-[#E9ECEF] bg-[#F8F9FA] px-2.5 py-1 text-xs font-medium text-[#6C757D]">
                {assessment.assessment_type}
              </span>
            </article>
          ))}
        </section>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Add Assessment</h2>
              <button type="button" onClick={closeModal} aria-label="Close modal" className="rounded-lg p-1 text-[#6C757D] transition-colors hover:bg-[#F8F9FA] hover:text-black">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className={labelClass}>Title</label>
                <input id="title" type="text" value={formData.title} onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="course_id" className={labelClass}>Course</label>
                <select id="course_id" value={formData.course_id} onChange={(event) => setFormData((prev) => ({ ...prev, course_id: event.target.value }))} required className={inputClass}>
                  <option value="" disabled>Select a course</option>
                  {courses.map((course) => (<option key={course.id} value={course.id}>{course.course_code} - {course.course_name}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="assessment_type" className={labelClass}>Type</label>
                <select id="assessment_type" value={formData.assessment_type} onChange={(event) => setFormData((prev) => ({ ...prev, assessment_type: event.target.value }))} required className={inputClass}>
                  <option value="Exam">Exam</option>
                  <option value="Essay">Essay</option>
                  <option value="Project">Project</option>
                  <option value="Assignment">Assignment</option>
                </select>
              </div>
              <div>
                <label htmlFor="due_date" className={labelClass}>Due Date</label>
                <input id="due_date" type="date" value={formData.due_date} onChange={(event) => setFormData((prev) => ({ ...prev, due_date: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="weight_percentage" className={labelClass}>Weight %</label>
                <input id="weight_percentage" type="number" min="0" max="100" step="0.5" value={formData.weight_percentage} onChange={(event) => setFormData((prev) => ({ ...prev, weight_percentage: event.target.value }))} required className={inputClass} />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} disabled={submitting} className="h-10 rounded-xl border border-[#E9ECEF] px-4 text-sm font-medium text-[#6C757D] transition-colors hover:bg-[#F8F9FA] disabled:opacity-60">Cancel</button>
                <button type="submit" disabled={submitting || courses.length === 0} className="h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60">{submitting ? "Adding..." : "Add Task"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

```

### `./frontend/src/app/dashboard/calendar/page.tsx`

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type Course = {
  id: string;
  course_code: string;
  course_name: string;
};

type Assessment = {
  id: string;
  course_id: string;
  title: string;
  assessment_type: string;
  due_date: string;
  weight_percentage: number;
  is_completed: boolean;
};

type StudySession = {
  id: string;
  course_id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_completed: boolean;
};

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toLocalDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocalDate(dateString: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString.replace(/-/g, "/"));
  }
  return new Date(dateString);
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

function getOptionalTimeLabel(value: string) {
  if (!value || !value.includes("T")) return null;
  const parsed = parseLocalDate(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return formatTime(parsed);
}

function generateCalendarDays(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const leadingPadding = firstOfMonth.getDay();
  const totalDaysInMonth = lastOfMonth.getDate();
  const days: Date[] = [];
  for (let i = leadingPadding; i > 0; i -= 1) days.push(new Date(year, month, 1 - i));
  for (let day = 1; day <= totalDaysInMonth; day += 1) days.push(new Date(year, month, day));
  const trailingPadding = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= trailingPadding; i += 1) days.push(new Date(year, month + 1, i));
  return days;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, assessmentsRes, sessionsRes] = await Promise.all([
          api.get<Course[]>("/courses/"),
          api.get<Assessment[]>("/assessments/"),
          api.get<StudySession[]>("/study-sessions/"),
        ]);
        setCourses(coursesRes.data);
        setAssessments(assessmentsRes.data);
        setStudySessions(sessionsRes.data);
      } catch (error) {
        console.error("Failed to load calendar data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calendarDays = useMemo(() => generateCalendarDays(currentDate), [currentDate]);
  const courseCodeById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const course of courses) map[course.id] = course.course_code;
    return map;
  }, [courses]);

  const assessmentMap = useMemo(() => {
    return assessments.reduce<Record<string, Assessment[]>>((acc, a) => {
      const key = toLocalDateKey(parseLocalDate(a.due_date));
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
      return acc;
    }, {});
  }, [assessments]);

  const sessionMap = useMemo(() => {
    return studySessions.reduce<Record<string, StudySession[]>>((acc, s) => {
      const key = toLocalDateKey(new Date(s.start_time));
      if (!acc[key]) acc[key] = [];
      acc[key].push(s);
      return acc;
    }, {});
  }, [studySessions]);

  const today = startOfLocalDay(new Date());
  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth();
  const goPrevMonth = () => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goNextMonth = () => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const goToday = () => { const now = new Date(); setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1)); };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">Calendar Overview</h1>
          <p className="mt-1 text-sm text-[#6C757D]">View your assessments and study sessions at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-xl border border-[#E9ECEF] bg-white p-1 shadow-sm">
            {(["month", "week", "day"] as const).map((mode) => (
              <button key={mode} type="button" onClick={() => setViewMode(mode)} className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors ${viewMode === mode ? "bg-[#F8F9FA] text-black" : "text-[#6C757D] hover:bg-[#F8F9FA]"}`}>
                {mode[0].toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800">
            <span className="material-symbols-outlined !text-[18px]">add</span>
            New Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-[#E9ECEF] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">{formatMonthYear(currentDate)}</h2>
              <div className="flex items-center gap-1">
                <button type="button" onClick={goPrevMonth} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6C757D] transition-colors hover:bg-[#F8F9FA]" aria-label="Previous month">
                  <span className="material-symbols-outlined !text-[18px]">chevron_left</span>
                </button>
                <button type="button" onClick={goNextMonth} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6C757D] transition-colors hover:bg-[#F8F9FA]" aria-label="Next month">
                  <span className="material-symbols-outlined !text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="mb-3 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-widest text-[#ADB5BD]">
              {["S","M","T","W","T","F","S"].map((d, idx) => <span key={`${d}-${idx}`}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#6C757D]">
              {calendarDays.slice(0, 35).map((day) => {
                const key = toLocalDateKey(day);
                const isToday = key === toLocalDateKey(startOfLocalDay(new Date()));
                const inMonth = day.getMonth() === viewMonth && day.getFullYear() === viewYear;
                return (
                  <span key={key} className={`py-1 ${!inMonth ? "text-[#DEE2E6]" : ""} ${isToday ? "rounded-lg bg-[#288028] text-white font-bold" : ""}`}>
                    {day.getDate()}
                  </span>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-[#E9ECEF] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-black">Event Types</h3>
            <div className="mt-4 space-y-3 text-sm text-[#6C757D]">
              <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-[#288028]" /><span>Quizzes</span></div>
              <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-amber-500" /><span>Midterms</span></div>
              <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-rose-500" /><span>Exams</span></div>
              <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-[#ADB5BD]" /><span>Study Sessions</span></div>
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-[#E9ECEF] bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">{formatMonthYear(currentDate)}</h2>
            <div className="flex items-center rounded-xl border border-[#E9ECEF] bg-white p-1 shadow-sm">
              <button type="button" onClick={goPrevMonth} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#6C757D] transition-colors hover:bg-[#F8F9FA]" aria-label="Previous month">
                <span className="material-symbols-outlined !text-[20px]">chevron_left</span>
              </button>
              <button type="button" onClick={goToday} className="mx-1 h-9 rounded-lg px-3 text-xs font-semibold text-[#6C757D] transition-colors hover:bg-[#F8F9FA]">Today</button>
              <button type="button" onClick={goNextMonth} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#6C757D] transition-colors hover:bg-[#F8F9FA]" aria-label="Next month">
                <span className="material-symbols-outlined !text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-[#6C757D]">Loading calendar...</div>
          ) : (
            <>
              <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-[#E9ECEF]">
                {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((day) => (
                  <div key={day} className="border-r border-[#E9ECEF] py-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#ADB5BD] last:border-r-0">{day}</div>
                ))}
              </div>
              <div className="mt-0 grid grid-cols-7 auto-rows-fr overflow-hidden rounded-b-xl border border-t-0 border-[#E9ECEF]">
                {calendarDays.map((day) => {
                  const dayKey = toLocalDateKey(day);
                  const isToday = dayKey === toLocalDateKey(today);
                  const isCurrentMonth = day.getMonth() === viewMonth && day.getFullYear() === viewYear;
                  const dayAssessments = assessmentMap[dayKey] ?? [];
                  const daySessions = sessionMap[dayKey] ?? [];

                  type DayEvent = { id: string; timestamp: number; label: string; pillClass: string };
                  const events: DayEvent[] = [];

                  for (const assessment of dayAssessments) {
                    const courseCode = courseCodeById[assessment.course_id] ?? "";
                    const timeLabel = getOptionalTimeLabel(assessment.due_date);
                    const when = parseLocalDate(assessment.due_date);
                    const prefix = timeLabel ? `${timeLabel} - ` : "";
                    const head = courseCode ? `${prefix}${courseCode}` : prefix.trim();
                    const label = head ? `${head} - ${assessment.title}` : assessment.title;
                    const typeLower = String(assessment.assessment_type || "").trim().toLowerCase();
                    const titleLower = String(assessment.title || "").trim().toLowerCase();
                    const pillClass =
                      titleLower.includes("final") || typeLower === "exam"
                        ? "bg-rose-50 text-rose-700 border-rose-400"
                        : titleLower.includes("midterm") || typeLower.includes("midterm")
                          ? "bg-amber-50 text-amber-700 border-amber-400"
                          : "bg-[#e8f5e8] text-[#288028] border-[#288028]";
                    events.push({ id: `a-${assessment.id}`, timestamp: Number.isNaN(when.getTime()) ? 0 : when.getTime(), label, pillClass });
                  }

                  for (const session of daySessions) {
                    const courseCode = courseCodeById[session.course_id] ?? "";
                    const start = new Date(session.start_time);
                    const timeLabel = Number.isNaN(start.getTime()) ? "" : formatTime(start);
                    const head = courseCode ? `${timeLabel} - ${courseCode}` : timeLabel;
                    const label = head ? `${head} - ${session.title}` : session.title;
                    events.push({ id: `s-${session.id}`, timestamp: Number.isNaN(start.getTime()) ? 0 : start.getTime(), label, pillClass: "bg-gray-50 text-[#6C757D] border-[#CED4DA]" });
                  }

                  events.sort((a, b) => a.timestamp - b.timestamp);
                  const visible = events.slice(0, 3);
                  const extraCount = Math.max(0, events.length - visible.length);
                  const cellBorderRight = day.getDay() !== 6 ? "border-r border-[#E9ECEF]" : "";

                  return (
                    <div key={dayKey} className={`calendar-grid-cell border-b border-[#E9ECEF] p-3 ${cellBorderRight} ${isCurrentMonth ? "bg-white" : "bg-[#F8F9FA]"}`}>
                      <div className="flex items-start justify-between">
                        {isToday ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#288028] text-[11px] font-bold text-white">{day.getDate()}</span>
                        ) : (
                          <span className={`text-xs font-semibold ${isCurrentMonth ? "text-[#6C757D]" : "text-[#DEE2E6]"}`}>{day.getDate()}</span>
                        )}
                      </div>
                      <div className="mt-2">
                        {visible.map((event) => (
                          <div key={event.id} className={`mb-1 truncate rounded-r-md border-l-[4px] px-2 py-1 text-[10px] font-semibold ${event.pillClass}`} title={event.label}>{event.label}</div>
                        ))}
                        {extraCount > 0 ? <div className="mt-1 text-[10px] font-medium text-[#ADB5BD]">+{extraCount} more</div> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

```

### `./frontend/src/app/dashboard/courses/[id]/page.tsx`

```tsx
"use client";

import Link from "next/link";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Check, Layers, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

type Course = {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
  target_grade: string;
};

type Assessment = {
  id: string;
  course_id: string;
  title: string;
  assessment_type: string;
  due_date: string;
  weight_percentage: number;
  is_completed: boolean;
  earned_score?: number | null;
};

type AssessmentEditDraft = {
  title: string;
  assessment_type: string;
  due_date: string;
  weight_percentage: string;
};

type BulkAddDraft = {
  baseTitle: string;
  count: string;
  totalWeight: string;
  startDate: string;
  frequency: "weekly" | "biweekly";
};

type PreviewItem = {
  title: string;
  due_date: string;
};

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const courseId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [deletingAssessmentId, setDeletingAssessmentId] = useState<string | null>(null);
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
  const [savingAssessmentId, setSavingAssessmentId] = useState<string | null>(null);
  const [creatingAssessment, setCreatingAssessment] = useState(false);
  const [savingGradeAssessmentId, setSavingGradeAssessmentId] = useState<string | null>(null);
  const [gradeDraftById, setGradeDraftById] = useState<Record<string, string>>({});
  const [targetGradeInput, setTargetGradeInput] = useState("90");
  const [whatIfGrade, setWhatIfGrade] = useState("");
  const [dropLowestQuizCount, setDropLowestQuizCount] = useState("0");
  const [editDraft, setEditDraft] = useState<AssessmentEditDraft>({
    title: "",
    assessment_type: "quiz",
    due_date: "",
    weight_percentage: "",
  });
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [bulkDraft, setBulkDraft] = useState<BulkAddDraft>({
    baseTitle: "Quiz",
    count: "10",
    totalWeight: "20",
    startDate: "",
    frequency: "weekly",
  });
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [shiftFollowingDates, setShiftFollowingDates] = useState(false);

  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    try {
      const [coursesRes, assessmentsRes] = await Promise.all([
        api.get<Course[]>("/courses/"),
        api.get<Assessment[]>("/assessments/", { params: { course_id: courseId } }),
      ]);
      setCourse(coursesRes.data.find((c) => c.id === courseId) ?? null);
      setAssessments(assessmentsRes.data);
    } catch (error) {
      console.error("Failed to load course details:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  useEffect(() => {
    const nextDrafts: Record<string, string> = {};
    for (const assessment of assessments) {
      nextDrafts[assessment.id] =
        assessment.earned_score === null || assessment.earned_score === undefined
          ? ""
          : String(assessment.earned_score);
    }
    setGradeDraftById(nextDrafts);
  }, [assessments]);

  useEffect(() => {
    if (course?.target_grade) {
      setTargetGradeInput(course.target_grade);
    }
  }, [course?.target_grade]);

  useEffect(() => {
    if (!bulkDraft.startDate) {
      const today = new Date();
      const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setBulkDraft((prev) => ({ ...prev, startDate: localToday }));
    }
  }, [bulkDraft.startDate]);

  useEffect(() => {
    if (!bulkMenuOpen) {
      setPreviewItems([]);
      setShiftFollowingDates(false);
    }
  }, [bulkMenuOpen]);

  const isReadingWeekDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month || !day) return false;
    const date = new Date(year, month - 1, day);

    // Family Day: third Monday of February.
    const febFirst = new Date(year, 1, 1);
    const febFirstDay = febFirst.getDay();
    const daysToMonday = (8 - febFirstDay) % 7;
    const firstMonday = 1 + daysToMonday;
    const thirdMonday = firstMonday + 14;
    const readingWeekStartFeb = new Date(year, 1, thirdMonday);
    const readingWeekEndFeb = new Date(year, 1, thirdMonday + 6);

    // Late October reading week (approx): Monday of the week that contains Oct 25.
    const octAnchor = new Date(year, 9, 25);
    const octDay = octAnchor.getDay();
    const mondayOffset = (octDay + 6) % 7;
    const readingWeekStartOct = new Date(year, 9, 25 - mondayOffset);
    const readingWeekEndOct = new Date(year, 9, readingWeekStartOct.getDate() + 6);

    return (
      (date >= readingWeekStartFeb && date <= readingWeekEndFeb) ||
      (date >= readingWeekStartOct && date <= readingWeekEndOct)
    );
  };

  const buildPreviewItems = () => {
    const count = Number(bulkDraft.count);
    if (!Number.isFinite(count) || count <= 0 || !bulkDraft.startDate) {
      setPreviewItems([]);
      return [];
    }
    const baseTitle = bulkDraft.baseTitle.trim() || "Item";
    const dayOffset = bulkDraft.frequency === "biweekly" ? 14 : 7;
    const [year, month, day] = bulkDraft.startDate.split("-").map(Number);
    const start = new Date(year, (month || 1) - 1, day || 1);
    const nextItems: PreviewItem[] = Array.from({ length: count }, (_, index) => {
      const itemDate = new Date(start);
      itemDate.setDate(start.getDate() + index * dayOffset);
      const localDate = new Date(itemDate.getTime() - itemDate.getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .split("T")[0];
      return {
        title: `${baseTitle} ${index + 1}`,
        due_date: localDate,
      };
    });
    setPreviewItems(nextItems);
    return nextItems;
  };

  const formatDate = (dateString: string) => {
    const [datePart = ""] = dateString.split("T");
    const [yearRaw, monthRaw, dayRaw] = datePart.split("-");
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);

    if (!year || !month || !day) return dateString;

    // Build local date from YYYY-MM-DD only to avoid timezone offset date shifting.
    const localDate = new Date(year, month - 1, day);
    const baseDate = localDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const timeMatch = dateString.match(/T(\d{2}):(\d{2})/);
    if (!timeMatch) return baseDate;

    const hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    if (hour === 0 && minute === 0) return baseDate;

    const timeDate = new Date(2000, 0, 1, hour, minute);
    const formattedTime = timeDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${baseDate} at ${formattedTime}`;
  };

  const getAssessmentStyle = (assessment: Assessment) => {
    const type = assessment.assessment_type.trim().toLowerCase();
    if (type === "midterm") {
      return {
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-300",
        borderClass: "border-l-4 border-amber-300",
      };
    }
    if (type === "exam") {
      return {
        badgeClass: "bg-rose-50 text-rose-700 border border-rose-300",
        borderClass: "border-l-4 border-rose-300",
      };
    }
    if (type === "quiz") {
      return {
        badgeClass: "bg-[#e8f5e8] text-[#288028] border border-[#288028]/30",
        borderClass: "border-l-4 border-[#288028]/30",
      };
    }
    return {
      badgeClass: "bg-[#F8F9FA] text-[#6C757D] border border-[#E9ECEF]",
      borderClass: "border-l-4 border-[#E9ECEF]",
    };
  };

  const sortedAssessments = useMemo(
    () =>
      [...assessments].sort(
        (a, b) => {
          const aDatePart = (a.due_date || "").split("T")[0];
          const bDatePart = (b.due_date || "").split("T")[0];
          const [ay, am, ad] = aDatePart.split("-").map(Number);
          const [by, bm, bd] = bDatePart.split("-").map(Number);
          return new Date(ay, (am || 1) - 1, ad || 1).getTime() - new Date(by, (bm || 1) - 1, bd || 1).getTime();
        },
      ),
    [assessments],
  );

  const hasQuizzes = useMemo(
    () => assessments.some((item) => String(item.assessment_type || "").trim().toLowerCase() === "quiz"),
    [assessments],
  );

  useEffect(() => {
    if (!hasQuizzes && dropLowestQuizCount !== "0") {
      setDropLowestQuizCount("0");
    }
  }, [hasQuizzes, dropLowestQuizCount]);

  const droppedQuizAssessmentIds = useMemo(() => {
    const gradedQuizzes = assessments.filter((item) => {
      const type = String(item.assessment_type || "").trim().toLowerCase();
      const hasGrade =
        item.earned_score !== null &&
        item.earned_score !== undefined &&
        !Number.isNaN(Number(item.earned_score));
      return type === "quiz" && hasGrade;
    });

    if (gradedQuizzes.length < 2) return new Set<string>();

    const requestedCount = Number(dropLowestQuizCount);
    if (Number.isNaN(requestedCount) || requestedCount <= 0) return new Set<string>();

    const maxDroppable = Math.max(0, gradedQuizzes.length - 1);
    const dropCount = Math.min(requestedCount, maxDroppable);
    if (dropCount <= 0) return new Set<string>();

    const sorted = [...gradedQuizzes].sort(
      (a, b) => Number(a.earned_score || 0) - Number(b.earned_score || 0),
    );
    return new Set(sorted.slice(0, dropCount).map((item) => item.id));
  }, [assessments, dropLowestQuizCount]);

  const summary = useMemo(() => {
    const totalCourseWeight = assessments.reduce((sum, item) => sum + Number(item.weight_percentage || 0), 0);
    const droppedWeight = assessments.reduce((sum, item) => {
      if (!droppedQuizAssessmentIds.has(item.id)) return sum;
      return sum + Number(item.weight_percentage || 0);
    }, 0);
    const activeWeight = Math.max(0, totalCourseWeight - droppedWeight);
    const multiplier = activeWeight > 0 ? 100 / activeWeight : 1;

    const scaledWeightById: Record<string, number> = {};
    for (const assessment of assessments) {
      const original = Number(assessment.weight_percentage || 0);
      const isDropped = droppedQuizAssessmentIds.has(assessment.id);
      scaledWeightById[assessment.id] = isDropped ? 0 : original * multiplier;
    }

    const gradedActive = assessments.filter((item) => {
      const hasGrade =
        item.earned_score !== null &&
        item.earned_score !== undefined &&
        !Number.isNaN(Number(item.earned_score));
      return hasGrade && !droppedQuizAssessmentIds.has(item.id);
    });

    const gradedWeight = gradedActive.reduce((sum, item) => sum + (scaledWeightById[item.id] ?? 0), 0);
    const projectedTotal = gradedActive.reduce(
      (sum, item) => sum + (Number(item.earned_score || 0) * Number(scaledWeightById[item.id] ?? 0)) / 100,
      0,
    );
    const currentAverage = gradedWeight > 0 ? projectedTotal / (gradedWeight / 100) : null;

    const targetGrade = Number(targetGradeInput);
    const remainingWeight = assessments.reduce((sum, item) => {
      const hasGrade =
        item.earned_score !== null &&
        item.earned_score !== undefined &&
        !Number.isNaN(Number(item.earned_score));
      if (hasGrade) return sum;
      return sum + (scaledWeightById[item.id] ?? 0);
    }, 0);
    const requiredRemainingAverage =
      remainingWeight > 0 && !Number.isNaN(targetGrade)
        ? (((targetGrade / 100) * 100 - projectedTotal) / remainingWeight) * 100
        : null;

    // Min projection: 0% on all remaining work
    const minProjection = gradedWeight > 0 ? projectedTotal : 0;
    // Max projection: 100% on all remaining work
    const maxProjection = projectedTotal + remainingWeight;

    // What-if: if user enters a specific grade, what would their average become?
    const whatIfGradeNum = Number(whatIfGrade);
    const whatIfAverage =
      !Number.isNaN(whatIfGradeNum) && whatIfGrade.trim() !== "" && remainingWeight > 0
        ? (projectedTotal + (whatIfGradeNum / 100) * remainingWeight) / ((gradedWeight + remainingWeight) / 100)
        : null;

    return {
      gradedWeight,
      currentAverage,
      projectedTotal,
      totalCourseWeight,
      droppedWeight,
      activeWeight,
      multiplier,
      scaledWeightById,
      remainingScaledWeight: remainingWeight,
      requiredRemainingAverage,
      targetGrade,
      minProjection,
      maxProjection,
      whatIfAverage,
    };
  }, [assessments, droppedQuizAssessmentIds, targetGradeInput, whatIfGrade]);

  const handleUploadSyllabus = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !courseId) return;

    const formData = new FormData();
    formData.append("file", file);
    const loadingToastId = toast.loading("Analyzing Syllabus...");

    setUploading(true);
    try {
      const response = await api.post(`/courses/${courseId}/upload-syllabus`, formData);
      await fetchCourseData();
      window.dispatchEvent(new Event("assessments-updated"));
      toast.success(
        response.data?.message
          ? `${response.data.assessments_created ?? 0} assessments created.`
          : "Syllabus processed.",
        { id: loadingToastId },
      );
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed to process syllabus.", {
        id: loadingToastId,
      });
      console.error("Failed to upload syllabus:", error);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleClearAllAssessments = async () => {
    if (!courseId) return;
    const confirmed = window.confirm(
      "Clear all assessments for this course? This cannot be undone.",
    );
    if (!confirmed) return;

    setClearingAll(true);
    try {
      await api.delete(`/courses/${courseId}/assessments`);
      setAssessments([]);
      await fetchCourseData();
      window.dispatchEvent(new Event("assessments-updated"));
      toast.success("All assessments cleared");
      window.location.reload();
    } catch (error) {
      console.error("Failed to clear assessments:", error);
      toast.error("Failed to clear assessments");
    } finally {
      setClearingAll(false);
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    setDeletingAssessmentId(assessmentId);
    try {
      await api.delete(`/assessments/${assessmentId}`);
      await fetchCourseData();
      window.dispatchEvent(new Event("assessments-updated"));
      toast.success("Assessment removed");
    } catch (error) {
      console.error("Failed to delete assessment:", error);
      toast.error("Failed to delete assessment");
    } finally {
      setDeletingAssessmentId(null);
    }
  };

  const startEditingAssessment = (assessment: Assessment) => {
    setEditingAssessmentId(assessment.id);
    setEditDraft({
      title: assessment.title,
      assessment_type: assessment.assessment_type.toLowerCase(),
      due_date: (assessment.due_date || "").split("T")[0],
      weight_percentage: String(assessment.weight_percentage),
    });
  };

  const cancelEditingAssessment = () => {
    setEditingAssessmentId(null);
    setSavingAssessmentId(null);
    setEditDraft({
      title: "",
      assessment_type: "quiz",
      due_date: "",
      weight_percentage: "",
    });
  };

  const saveAssessmentEdits = async (assessment: Assessment) => {
    if (!editingAssessmentId || editingAssessmentId !== assessment.id) return;
    const trimmedTitle = editDraft.title.trim();
    const parsedWeight = Number(editDraft.weight_percentage);
    if (!trimmedTitle) {
      toast.error("Title cannot be empty");
      return;
    }
    if (!editDraft.due_date) {
      toast.error("Due date is required");
      return;
    }
    if (Number.isNaN(parsedWeight) || parsedWeight < 0 || parsedWeight > 100) {
      toast.error("Weight must be between 0 and 100");
      return;
    }

    const previousAssessments = assessments;
    const optimisticDueDate =
      assessment.due_date && assessment.due_date.includes("T")
        ? `${editDraft.due_date}${assessment.due_date.slice(10)}`
        : editDraft.due_date;

    setAssessments((prev) =>
      prev.map((item) =>
        item.id === assessment.id
          ? {
              ...item,
              title: trimmedTitle,
              assessment_type: editDraft.assessment_type,
              due_date: optimisticDueDate,
              weight_percentage: parsedWeight,
            }
          : item,
      ),
    );

    setSavingAssessmentId(assessment.id);
    try {
      const response = await api.patch<Assessment>(`/assessments/${assessment.id}`, {
        title: trimmedTitle,
        assessment_type: editDraft.assessment_type,
        due_date: editDraft.due_date,
        weight_percentage: parsedWeight,
      });
      setAssessments((prev) => prev.map((item) => (item.id === assessment.id ? response.data : item)));
      setEditingAssessmentId(null);
      toast.success("Assessment updated");
      window.dispatchEvent(new Event("assessments-updated"));
    } catch (error) {
      setAssessments(previousAssessments);
      console.error("Failed to update assessment:", error);
      toast.error("Failed to update assessment");
    } finally {
      setSavingAssessmentId(null);
    }
  };

  const handleAddAssessment = async () => {
    if (!courseId) return;
    setCreatingAssessment(true);
    try {
      const today = new Date();
      const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const response = await api.post<Assessment>("/assessments/", {
        course_id: courseId,
        assessment_type: "Quiz",
        title: "New Quiz",
        due_date: localToday,
        weight_percentage: 0,
      });
      const created = response.data;
      setAssessments((prev) => [...prev, created]);
      startEditingAssessment(created);
      window.dispatchEvent(new Event("assessments-updated"));
      toast.success("Assessment added");
    } catch (error) {
      console.error("Failed to add assessment:", error);
      toast.error("Failed to add assessment");
    } finally {
      setCreatingAssessment(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (!courseId) return;
    const count = Number(bulkDraft.count);
    const totalWeight = Number(bulkDraft.totalWeight);
    if (!bulkDraft.baseTitle.trim()) {
      toast.error("Base title is required");
      return;
    }
    if (!bulkDraft.startDate) {
      toast.error("Start date is required");
      return;
    }
    if (!Number.isFinite(count) || count <= 0) {
      toast.error("Count must be greater than 0");
      return;
    }
    if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
      toast.error("Total weight must be greater than 0");
      return;
    }

    const perWeight = Number((totalWeight / count).toFixed(2));
    const baseTitle = bulkDraft.baseTitle.trim();
    const titleLower = baseTitle.toLowerCase();
    const assessmentType =
      titleLower.includes("midterm") ? "midterm" : titleLower.includes("exam") ? "exam" : "quiz";
    const itemsSource = previewItems.length > 0 ? previewItems : buildPreviewItems();
    if (itemsSource.length === 0) {
      toast.error("Preview schedule first.");
      return;
    }

    const items = itemsSource.map((item) => ({
      course_id: courseId,
      assessment_type: assessmentType,
      title: item.title,
      due_date: item.due_date,
      weight_percentage: perWeight,
    }));

    setBulkSubmitting(true);
    try {
      const response = await api.post<Assessment[]>("/assessments/bulk", { items });
      setAssessments((prev) => [...prev, ...response.data]);
      setBulkMenuOpen(false);
      toast.success("Assessments created");
    } catch (error) {
      console.error("Failed to bulk add assessments:", error);
      toast.error("Failed to bulk add assessments");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const saveGradeForAssessment = async (assessment: Assessment) => {
    const rawValue = (gradeDraftById[assessment.id] ?? "").trim();
    if (!rawValue) return;
    const parsedGrade = Number(rawValue);
    if (Number.isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 100) {
      toast.error("Grade must be between 0 and 100");
      return;
    }

    const previousAssessments = assessments;
    setAssessments((prev) =>
      prev.map((item) =>
        item.id === assessment.id
          ? {
              ...item,
              earned_score: parsedGrade,
            }
          : item,
      ),
    );

    setSavingGradeAssessmentId(assessment.id);
    try {
      const response = await api.patch<Assessment>(`/assessments/${assessment.id}`, {
        earned_score: parsedGrade,
      });
      setAssessments((prev) => prev.map((item) => (item.id === assessment.id ? response.data : item)));
    } catch (error) {
      setAssessments(previousAssessments);
      console.error("Failed to save grade:", error);
      toast.error("Failed to save grade");
    } finally {
      setSavingGradeAssessmentId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] p-6 md:p-8">
        <div className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm p-8 text-sm text-[#6C757D]">
          Loading course details...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto w-full max-w-[1200px] p-6 md:p-8">
        <Link href="/dashboard/courses" className="text-sm font-medium text-black hover:underline">
          Back to Courses
        </Link>
        <div className="mt-4 rounded-xl border border-[#E9ECEF] bg-white shadow-sm p-8 text-sm text-[#6C757D]">
          Course not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="mx-auto w-full max-w-[1200px] space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/dashboard/courses" className="text-sm font-medium text-black hover:underline">
              Back to Courses
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-black">
              {course.course_code} - {course.course_name}
            </h1>
          </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleClearAllAssessments()}
            disabled={clearingAll || uploading}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {clearingAll ? (
              <span className="material-symbols-outlined animate-spin !text-[18px]">sync</span>
            ) : (
              <Trash2 size={16} />
            )}
            {clearingAll ? "Clearing..." : "Clear All"}
          </button>
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              uploading
                ? "bg-[#F8F9FA] text-[#6C757D]"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {uploading ? (
              <span className="material-symbols-outlined animate-spin !text-[18px]">sync</span>
            ) : (
              <span className="material-symbols-outlined !text-[18px]">school</span>
            )}
            {uploading ? "Reading Syllabus..." : "Upload Syllabus (Waterloo Portal)"}
            <input
              type="file"
              accept=".pdf,.html,.htm,text/html,application/pdf"
              onChange={handleUploadSyllabus}
              disabled={uploading || clearingAll}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <section className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm transition-all duration-200 hover:shadow-md">
        {/* Deliverables Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-[#E9ECEF]">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/courses" className="text-[#6C757D] hover:text-black transition-colors">
              <span className="material-symbols-outlined !text-[20px]">arrow_back</span>
            </Link>
            <h2 className="text-lg font-semibold text-black">Grading Scheme</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkMenuOpen((prev) => !prev)}
              disabled={uploading || clearingAll}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E9ECEF] bg-white px-3 py-2 text-sm font-medium text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => void handleAddAssessment()}
              disabled={creatingAssessment || uploading || clearingAll}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} />
              {creatingAssessment ? "Adding..." : "Add"}
            </button>
            {bulkMenuOpen ? (
              <div className="absolute right-0 top-full z-10 mt-2 w-72 rounded-xl border border-[#E9ECEF] bg-white shadow-sm p-3">
                <div className="space-y-2">
                  <label className="flex flex-col gap-1 text-xs text-[#6C757D]">
                    Base Title
                    <input
                      type="text"
                      value={bulkDraft.baseTitle}
                      onChange={(event) =>
                        setBulkDraft((prev) => ({ ...prev, baseTitle: event.target.value }))
                      }
                      className="rounded-xl border border-[#E9ECEF] bg-white px-2 py-1 text-xs text-[#6C757D] outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1 text-xs text-[#6C757D]">
                      Count
                      <input
                        type="number"
                        min={1}
                        step="1"
                        value={bulkDraft.count}
                        onChange={(event) =>
                          setBulkDraft((prev) => ({ ...prev, count: event.target.value }))
                        }
                        className="rounded-xl border border-[#E9ECEF] bg-white px-2 py-1 text-xs text-[#6C757D] outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-[#6C757D]">
                      Total Weight
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={bulkDraft.totalWeight}
                        onChange={(event) =>
                          setBulkDraft((prev) => ({ ...prev, totalWeight: event.target.value }))
                        }
                        className="rounded-xl border border-[#E9ECEF] bg-white px-2 py-1 text-xs text-[#6C757D] outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1 text-xs text-[#6C757D]">
                    Start Date
                    <input
                      type="date"
                      value={bulkDraft.startDate}
                      onChange={(event) =>
                        setBulkDraft((prev) => ({ ...prev, startDate: event.target.value }))
                      }
                      className="rounded-xl border border-[#E9ECEF] bg-white px-2 py-1 text-xs text-[#6C757D] outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-[#6C757D]">
                    Frequency
                    <select
                      value={bulkDraft.frequency}
                      onChange={(event) =>
                        setBulkDraft((prev) => ({
                          ...prev,
                          frequency: event.target.value as BulkAddDraft["frequency"],
                        }))
                      }
                      className="rounded-xl border border-[#E9ECEF] bg-white px-2 py-1 text-xs text-[#6C757D] outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                    </select>
                  </label>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={buildPreviewItems}
                      className="text-xs font-semibold text-[#6C757D] hover:text-black"
                    >
                      Preview Schedule
                    </button>
                    <label className="flex items-center gap-2 text-[11px] text-[#6C757D]">
                      <input
                        type="checkbox"
                        checked={shiftFollowingDates}
                        onChange={(event) => setShiftFollowingDates(event.target.checked)}
                        className="h-3.5 w-3.5 accent-[#288028]"
                      />
                      Shift all following dates
                    </label>
                  </div>
                  {previewItems.length > 0 ? (
                    <div className="mt-2 max-h-40 space-y-2 overflow-auto rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] p-2">
                      {previewItems.map((item, index) => (
                        <div key={item.title} className="flex items-center justify-between gap-2 text-xs text-[#6C757D]">
                          <span className="truncate">{item.title}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={item.due_date}
                              onChange={(event) => {
                                const nextValue = event.target.value;
                                setPreviewItems((prev) => {
                                  const next = [...prev];
                                  const previousDate = prev[index]?.due_date;
                                  next[index] = { ...next[index], due_date: nextValue };
                                  if (shiftFollowingDates && previousDate) {
                                    const [py, pm, pd] = previousDate.split("-").map(Number);
                                    const [ny, nm, nd] = nextValue.split("-").map(Number);
                                    const prevDate = new Date(py, (pm || 1) - 1, pd || 1);
                                    const newDate = new Date(ny, (nm || 1) - 1, nd || 1);
                                    const deltaDays = Math.round(
                                      (newDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
                                    );
                                    for (let i = index + 1; i < next.length; i += 1) {
                                      const [iy, im, id] = next[i].due_date.split("-").map(Number);
                                      const base = new Date(iy, (im || 1) - 1, id || 1);
                                      base.setDate(base.getDate() + deltaDays);
                                      const localDate = new Date(
                                        base.getTime() - base.getTimezoneOffset() * 60 * 1000,
                                      )
                                        .toISOString()
                                        .split("T")[0];
                                      next[i] = { ...next[i], due_date: localDate };
                                    }
                                  }
                                  return next;
                                });
                              }}
                              className={`w-32 rounded-xl border px-2 py-0.5 text-xs text-[#6C757D] outline-none ${
                                isReadingWeekDate(item.due_date)
                                  ? "border-amber-300 bg-amber-50 text-amber-700"
                                  : "border-[#E9ECEF] bg-white"
                              }`}
                            />
                            {isReadingWeekDate(item.due_date) ? (
                              <span className="text-[10px] font-semibold text-amber-700">RW</span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkMenuOpen(false)}
                    className="rounded-xl border border-[#E9ECEF] bg-white px-3 py-1 text-xs font-semibold text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleBulkGenerate()}
                    disabled={bulkSubmitting}
                    className="rounded-xl border border-emerald-800 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400 transition-all duration-200 hover:bg-emerald-900/40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {bulkSubmitting ? "Creating..." : "Confirm & Create"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {sortedAssessments.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <span className="material-symbols-outlined !text-4xl text-[#CED4DA]">assignment</span>
            <p className="mt-3 text-sm text-[#6C757D]">
              No assessments found. Upload a syllabus or add items to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* === KPI Cards Row === */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* 1. Overall Average Card with Progress Ring */}
              <div className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm p-6 flex flex-col items-center justify-center transition-all duration-200 hover:shadow-md">
                <h3 className="text-sm font-semibold text-[#6C757D] mb-4">Overall Average</h3>
                <div className="relative flex items-center justify-center">
                  <svg viewBox="0 0 120 120" className="h-40 w-40">
                    <circle cx="60" cy="60" r="52" fill="transparent" stroke="#E9ECEF" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="52"
                      fill="transparent"
                      stroke="#288028"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      strokeDashoffset={
                        summary.currentAverage === null
                          ? 2 * Math.PI * 52
                          : 2 * Math.PI * 52 - (2 * Math.PI * 52 * Math.min(summary.currentAverage, 100)) / 100
                      }
                      className="transition-all duration-700"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-black">
                      {summary.currentAverage === null ? "--" : `${summary.currentAverage.toFixed(1)}`}%
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-[#6C757D]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#6C757D]">Target</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={targetGradeInput}
                      onChange={(event) => setTargetGradeInput(event.target.value)}
                      className="w-16 rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] px-2 py-1 text-center text-xs font-semibold text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                    />
                    <span>%</span>
                  </div>
                  {hasQuizzes && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#6C757D]">Drop</span>
                      <input
                        type="number"
                        min={0}
                        max={Math.max(
                          0,
                          assessments.filter(
                            (item) =>
                              String(item.assessment_type || "").trim().toLowerCase() === "quiz" &&
                              item.earned_score !== null &&
                              item.earned_score !== undefined,
                          ).length,
                        )}
                        step="1"
                        value={dropLowestQuizCount}
                        onChange={(event) => setDropLowestQuizCount(event.target.value)}
                        className="w-12 rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] px-2 py-1 text-center text-xs font-semibold text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                      />
                    </div>
                  )}
                </div>
                <p className="mt-3 text-[10px] text-[#ADB5BD] text-center leading-relaxed">
                  note that this is an approximation based on {summary.gradedWeight.toFixed(0)}% of graded coursework
                </p>
              </div>

              {/* 2. Grade Calculator Card */}
              <div className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm p-6 transition-all duration-200 hover:shadow-md">
                <h3 className="text-sm font-semibold text-[#6C757D] mb-4">Enter Specific Grade (%)</h3>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={whatIfGrade}
                  onChange={(event) => setWhatIfGrade(event.target.value)}
                  placeholder="e.g. 85"
                  className="w-full rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] px-4 py-3 text-lg font-semibold text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 placeholder:text-[#CED4DA] transition-colors"
                />
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[100, 90, 80, 70, 60, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setWhatIfGrade(String(pct))}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                        whatIfGrade === String(pct)
                          ? "border-[#288028] bg-[#e8f5e8] text-[#288028]"
                          : "border-[#E9ECEF] bg-white text-[#6C757D] hover:bg-[#F8F9FA] hover:text-black"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ADB5BD]">Desired Average</p>
                  <p className="mt-1 text-lg font-bold text-black">
                    {summary.whatIfAverage !== null
                      ? `${summary.whatIfAverage.toFixed(1)}%`
                      : summary.remainingScaledWeight <= 0
                        ? "All graded"
                        : "Enter a grade above"}
                  </p>
                  <p
                    className={`mt-2 text-xs leading-relaxed ${
                      summary.requiredRemainingAverage !== null && summary.requiredRemainingAverage > 100
                        ? "text-red-600"
                        : summary.requiredRemainingAverage !== null && summary.requiredRemainingAverage < 50
                          ? "text-[#288028]"
                          : "text-[#6C757D]"
                    }`}
                  >
                    {Number.isNaN(summary.targetGrade)
                      ? "Enter a valid target grade."
                      : summary.remainingScaledWeight <= 0
                        ? "All assessments graded."
                        : summary.requiredRemainingAverage === null
                          ? "Need more graded items."
                          : (
                            <>
                              You need <span className="font-semibold text-black">{summary.requiredRemainingAverage.toFixed(1)}%</span> on remaining work to reach <span className="font-semibold text-black">{summary.targetGrade}%</span>.
                            </>
                          )}
                  </p>
                  {summary.droppedWeight > 0 ? (
                    <p className="mt-1 text-[11px] italic text-[#ADB5BD]">
                      {summary.droppedWeight.toFixed(1)}% dropped. Scaled by {summary.multiplier.toFixed(3)}x.
                    </p>
                  ) : null}
                </div>
              </div>

              {/* 3. Projections Card (Min / Max) */}
              <div className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm p-6 transition-all duration-200 hover:shadow-md">
                <h3 className="text-sm font-semibold text-[#6C757D] mb-6">Projections</h3>
                <div className="space-y-6">
                  <div className="rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ADB5BD]">Minimum</p>
                    <p className="mt-1 text-3xl font-bold text-black">
                      {summary.gradedWeight > 0 ? `${summary.minProjection.toFixed(1)}%` : "--%"}
                    </p>
                    <p className="mt-1 text-xs text-[#6C757D]">
                      Assuming 0% on all remaining assessments
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ADB5BD]">Maximum</p>
                    <p className="mt-1 text-3xl font-bold text-black">
                      {summary.gradedWeight > 0 ? `${summary.maxProjection.toFixed(1)}%` : "--%"}
                    </p>
                    <p className="mt-1 text-xs text-[#6C757D]">
                      Assuming 100% on all remaining assessments
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E9ECEF]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6C757D]">Graded Weight</span>
                    <span className="font-semibold text-black">{summary.gradedWeight.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-[#6C757D]">Remaining Weight</span>
                    <span className="font-semibold text-black">{summary.remainingScaledWeight.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-[#6C757D]">Projected Total</span>
                    <span className="font-semibold text-black">{summary.projectedTotal.toFixed(1)} / 100</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Table Header */}
            <div className="grid grid-cols-12 items-center gap-4 px-6 py-3 border-b border-[#E9ECEF] bg-[#F8F9FA] rounded-t-xl">
              <div className="col-span-5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ADB5BD]">Name</span>
              </div>
              <div className="col-span-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ADB5BD]">Due Date</span>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ADB5BD]">Weight</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ADB5BD]">Grade</span>
              </div>
              <div className="col-span-1 text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ADB5BD]">Actions</span>
              </div>
            </div>

            {/* Table Rows */}
            {sortedAssessments.map((assessment, index) => (
              (() => {
                const isEditing = editingAssessmentId === assessment.id;
                const isDropped = droppedQuizAssessmentIds.has(assessment.id);
                const originalWeight = Number(assessment.weight_percentage || 0);
                const scaledWeight = Number(summary.scaledWeightById[assessment.id] ?? originalWeight);
                const displayWeight =
                  summary.droppedWeight > 0 ? (isDropped ? 0 : scaledWeight) : originalWeight;
                const styleTarget: Assessment = isEditing
                  ? {
                      ...assessment,
                      assessment_type: editDraft.assessment_type || assessment.assessment_type,
                    }
                  : assessment;
                const style = getAssessmentStyle(styleTarget);

                return isEditing ? (
                  /* ===== EDITING ROW ===== */
                  <div
                    key={assessment.id}
                    className={`px-6 py-5 ${index !== sortedAssessments.length - 1 ? "border-b border-[#E9ECEF]" : ""} bg-[#F8F9FA]/50`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={editDraft.title}
                        onChange={(event) => setEditDraft((prev) => ({ ...prev, title: event.target.value }))}
                        className="flex-1 min-w-[200px] rounded-xl border border-[#E9ECEF] bg-white px-3 py-2 text-sm font-semibold text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                      />
                      <select
                        value={editDraft.assessment_type}
                        onChange={(event) => setEditDraft((prev) => ({ ...prev, assessment_type: event.target.value }))}
                        className={`rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide outline-none ${style.badgeClass}`}
                      >
                        <option value="quiz">quiz</option>
                        <option value="midterm">midterm</option>
                        <option value="exam">exam</option>
                      </select>
                      <input
                        type="date"
                        value={editDraft.due_date}
                        onChange={(event) => setEditDraft((prev) => ({ ...prev, due_date: event.target.value }))}
                        className="rounded-xl border border-[#E9ECEF] bg-white px-3 py-2 text-xs text-[#6C757D] outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.1"
                          value={editDraft.weight_percentage}
                          onChange={(event) => setEditDraft((prev) => ({ ...prev, weight_percentage: event.target.value }))}
                          className="w-20 rounded-xl border border-[#E9ECEF] bg-white px-3 py-2 text-xs text-[#6C757D] outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                        />
                        <span className="text-xs text-[#6C757D]">%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => void saveAssessmentEdits(assessment)}
                        disabled={savingAssessmentId === assessment.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#288028] text-white transition-all duration-200 hover:bg-[#1f6b1f] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingAssessmentId === assessment.id ? (
                          <span className="material-symbols-outlined animate-spin !text-[16px]">sync</span>
                        ) : (
                          <Check size={14} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingAssessment}
                        disabled={savingAssessmentId === assessment.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E9ECEF] bg-white text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ===== DISPLAY ROW ===== */
                  <div
                    key={assessment.id}
                    className={`grid grid-cols-12 items-center gap-4 px-6 py-5 ${index !== sortedAssessments.length - 1 ? "border-b border-[#E9ECEF]" : ""} hover:bg-[#F8F9FA]/50 transition-colors ${isDropped ? "opacity-40" : ""}`}
                  >
                    {/* Name */}
                    <div className="col-span-5 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <p className="truncate text-sm font-semibold text-black">{assessment.title}</p>
                        <span
                          className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.badgeClass} ${isDropped ? "grayscale" : ""}`}
                        >
                          {assessment.assessment_type}
                        </span>
                        {isDropped ? (
                          <span className="inline-flex shrink-0 rounded-full bg-[#F8F9FA] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6C757D]">
                            Dropped
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="col-span-3">
                      <p className="text-sm text-[#6C757D]">{formatDate(assessment.due_date)}</p>
                    </div>

                    {/* Weight */}
                    <div className="col-span-1 text-center">
                      <span
                        className={`text-sm font-semibold ${isDropped ? "line-through text-red-600" : "text-black"}`}
                      >
                        {displayWeight.toFixed(1).replace(/\.0$/, "")}%
                      </span>
                    </div>

                    {/* Grade */}
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        value={gradeDraftById[assessment.id] ?? ""}
                        onChange={(event) =>
                          setGradeDraftById((prev) => ({
                            ...prev,
                            [assessment.id]: event.target.value,
                          }))
                        }
                        onBlur={() => void saveGradeForAssessment(assessment)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            (event.currentTarget as HTMLInputElement).blur();
                          }
                        }}
                        className={`w-16 rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] px-2 py-1.5 text-center text-sm font-semibold outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 transition-colors ${
                          isDropped ? "line-through text-red-600" : "text-black"
                        }`}
                        placeholder="--"
                      />
                      <span className="text-sm text-[#6C757D]">%</span>
                      {savingGradeAssessmentId === assessment.id ? (
                        <span className="material-symbols-outlined animate-spin text-[#6C757D] !text-[14px]">sync</span>
                      ) : null}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Edit ${assessment.title}`}
                        disabled={deletingAssessmentId === assessment.id || savingAssessmentId === assessment.id}
                        onClick={() => startEditingAssessment(assessment)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#CED4DA] transition-all duration-200 hover:bg-[#F8F9FA] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${assessment.title}`}
                        disabled={deletingAssessmentId === assessment.id || savingAssessmentId === assessment.id}
                        onClick={() => void handleDeleteAssessment(assessment.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#CED4DA] transition-all duration-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })()
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}

```

### `./frontend/src/app/dashboard/courses/page.tsx`

```tsx
"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import api from "@/lib/api";

type Course = {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
  target_grade: string;
};

type CourseFormData = {
  course_code: string;
  course_name: string;
  credits: string;
  target_grade: string;
};

const initialFormData: CourseFormData = {
  course_code: "",
  course_name: "",
  credits: "0.5",
  target_grade: "",
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await api.get<Course[]>("/courses/");
      setCourses(response.data);
    } catch (fetchError) {
      console.error("Failed to fetch courses:", fetchError);
      setError("Unable to load courses right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const openModal = () => { setError(""); setIsModalOpen(true); };
  const closeModal = () => { if (submitting) return; setIsModalOpen(false); setFormData(initialFormData); setError(""); };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = { course_code: formData.course_code.trim(), course_name: formData.course_name.trim(), credits: Number(formData.credits), target_grade: formData.target_grade.trim() };
      const response = await api.post<Course>("/courses/", payload);
      setCourses((prev) => [response.data, ...prev]);
      closeModal();
    } catch (submitError) {
      console.error("Failed to create course:", submitError);
      setError("Could not add course. Please check your input and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCourse = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this course? This will also delete all associated study sessions and assessments.");
    if (!confirmed) return;
    try { await api.delete(`/courses/${id}`); await fetchCourses(); } catch (deleteError) { console.error("Failed to delete course:", deleteError); }
  };

  const handleEditCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCourse) return;
    setSubmitting(true);
    try { await api.patch(`/courses/${editingCourse.id}`, editingCourse); await fetchCourses(); setEditingCourse(null); } catch (editError) { console.error("Failed to update course:", editError); setError("Could not update course. Please try again."); } finally { setSubmitting(false); }
  };

  const inputClass = "h-10 w-full rounded-xl border border-[#E9ECEF] bg-white px-3 text-sm text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 transition-colors";
  const labelClass = "mb-1.5 block text-sm font-medium text-[#6C757D]";

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6 md:p-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">My Courses</h1>
          <p className="mt-1 text-sm text-[#6C757D]">Track your classes and keep your targets visible.</p>
        </div>
        <button type="button" onClick={openModal} className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800">
          <span className="material-symbols-outlined !text-[20px]">add</span>
          Add Course
        </button>
      </section>

      {loading ? (
        <div className="rounded-xl border border-[#E9ECEF] bg-white p-8 shadow-sm text-sm text-[#6C757D]">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-[#E9ECEF] bg-white p-10 shadow-sm text-center">
          <span className="material-symbols-outlined !text-4xl text-[#CED4DA]">school</span>
          <h2 className="mt-3 text-lg font-semibold text-black">No courses yet</h2>
          <p className="mt-1 text-sm text-[#6C757D]">Add your first course to start building your study plan.</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <article key={course.id} className="flex h-full flex-col rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#288028]"></span>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6C757D]">{course.course_code}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="rounded-full bg-[#F8F9FA] border border-[#E9ECEF] px-2.5 py-1 text-xs font-medium text-[#6C757D]">{course.credits} cr</span>
                    <button onClick={() => setEditingCourse(course)} className="text-[#CED4DA] hover:text-[#288028] transition-colors p-1"><span className="material-symbols-outlined !text-[18px]">edit</span></button>
                    <button onClick={() => deleteCourse(course.id)} className="text-[#CED4DA] hover:text-red-500 transition-colors p-1"><span className="material-symbols-outlined !text-[18px]">delete</span></button>
                  </div>
                </div>
                <h3 className="line-clamp-2 text-lg font-semibold text-black">{course.course_name}</h3>
                <p className="mt-3 text-sm text-[#6C757D]">Target: <span className="font-semibold text-black">{course.target_grade}</span></p>
              </div>
              <div className="mt-6 w-full">
                <Link href={`/dashboard/courses/${course.id}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#E9ECEF]">View Course <span className="material-symbols-outlined !text-[16px]">arrow_forward</span></Link>
              </div>
            </article>
          ))}
        </section>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Add Course</h2>
              <button type="button" onClick={closeModal} aria-label="Close modal" className="rounded-lg p-1 text-[#6C757D] transition-colors hover:bg-[#F8F9FA] hover:text-black">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label htmlFor="course_code" className={labelClass}>Course Code</label><input id="course_code" type="text" value={formData.course_code} onChange={(e) => setFormData((prev) => ({ ...prev, course_code: e.target.value }))} required className={inputClass} /></div>
              <div><label htmlFor="course_name" className={labelClass}>Course Name</label><input id="course_name" type="text" value={formData.course_name} onChange={(e) => setFormData((prev) => ({ ...prev, course_name: e.target.value }))} required className={inputClass} /></div>
              <div><label htmlFor="credits" className={labelClass}>Credits</label><input id="credits" type="number" min="0" step="0.5" value={formData.credits} onChange={(e) => setFormData((prev) => ({ ...prev, credits: e.target.value }))} required className={inputClass} /></div>
              <div><label htmlFor="target_grade" className={labelClass}>Target Grade</label><input id="target_grade" type="text" value={formData.target_grade} onChange={(e) => setFormData((prev) => ({ ...prev, target_grade: e.target.value }))} required className={inputClass} /></div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} disabled={submitting} className="h-10 rounded-xl border border-[#E9ECEF] px-4 text-sm font-medium text-[#6C757D] transition-colors hover:bg-[#F8F9FA] disabled:opacity-60">Cancel</button>
                <button type="submit" disabled={submitting} className="h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60">{submitting ? "Adding..." : "Add Course"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editingCourse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Edit Course</h2>
              <button type="button" onClick={() => setEditingCourse(null)} aria-label="Close modal" className="rounded-lg p-1 text-[#6C757D] transition-colors hover:bg-[#F8F9FA] hover:text-black">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleEditCourse} className="space-y-4">
              <div><label htmlFor="edit_course_code" className={labelClass}>Course Code</label><input id="edit_course_code" type="text" value={editingCourse.course_code} onChange={(e) => setEditingCourse({ ...editingCourse, course_code: e.target.value })} required className={inputClass} /></div>
              <div><label htmlFor="edit_course_name" className={labelClass}>Course Name</label><input id="edit_course_name" type="text" value={editingCourse.course_name} onChange={(e) => setEditingCourse({ ...editingCourse, course_name: e.target.value })} required className={inputClass} /></div>
              <div><label htmlFor="edit_credits" className={labelClass}>Credits</label><input id="edit_credits" type="number" min="0" step="0.5" value={editingCourse.credits} onChange={(e) => setEditingCourse({ ...editingCourse, credits: Number(e.target.value) })} required className={inputClass} /></div>
              <div><label htmlFor="edit_target_grade" className={labelClass}>Target Grade</label><input id="edit_target_grade" type="text" value={editingCourse.target_grade} onChange={(e) => setEditingCourse({ ...editingCourse, target_grade: e.target.value })} required className={inputClass} /></div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingCourse(null)} disabled={submitting} className="h-10 rounded-xl border border-[#E9ECEF] px-4 text-sm font-medium text-[#6C757D] transition-colors hover:bg-[#F8F9FA] disabled:opacity-60">Cancel</button>
                <button type="submit" disabled={submitting} className="h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60">{submitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

```

### `./frontend/src/app/dashboard/insights/page.tsx`

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Course = {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
};

type Assessment = {
  id: string;
  course_id: string;
  title: string;
  assessment_type: string;
  due_date: string;
  weight_percentage: number;
  is_completed: boolean;
};

type StudySession = {
  id: string;
  course_id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_completed: boolean;
};

const PIE_COLORS = ["#288028", "#3da63d", "#6abf6a", "#a3d9a3", "#d4eed4"];

export default function InsightsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, assessmentsResponse, studySessionsResponse] = await Promise.all([
          api.get<Course[]>("/courses/"),
          api.get<Assessment[]>("/assessments/"),
          api.get<StudySession[]>("/study-sessions/"),
        ]);

        setCourses(coursesResponse.data);
        setAssessments(assessmentsResponse.data);
        setStudySessions(studySessionsResponse.data);
      } catch (error) {
        console.error("Failed to load insights data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const timePerCourseData = useMemo(() => {
    return courses.map((course) => {
      const totalMinutes = studySessions
        .filter((session) => session.course_id === course.id)
        .reduce((sum, session) => sum + session.duration_minutes, 0);

      return {
        name: course.course_code,
        minutes: totalMinutes,
      };
    });
  }, [courses, studySessions]);

  const assessmentsPerCourseData = useMemo(() => {
    return courses.map((course) => {
      const count = assessments.filter(
        (assessment) => assessment.course_id === course.id && !assessment.is_completed,
      ).length;

      return {
        name: course.course_code,
        count,
      };
    });
  }, [courses, assessments]);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8 p-6 md:p-8">
      <section>
        <h1 className="text-2xl font-semibold text-black">Study Insights</h1>
        <p className="mt-1 text-sm text-[#6C757D]">
          Visualize where your time goes and which courses have the most pending deadlines.
        </p>
      </section>

      {loading ? (
        <div className="rounded-xl border border-[#E9ECEF] bg-white p-8 shadow-sm text-sm text-[#6C757D]">
          Loading insights...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-black">Total Study Time per Course</h2>
            <div className="mt-4 h-[300px]">
              {timePerCourseData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#6C757D]">
                  No course data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timePerCourseData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
                    <XAxis dataKey="name" tick={{ fill: "#6C757D", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#6C757D", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(0, 0, 0, 0.03)" }}
                      contentStyle={{ borderRadius: 12, borderColor: "#E9ECEF", backgroundColor: "#fff" }}
                    />
                    <Bar dataKey="minutes" fill="#288028" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-black">Pending Deadlines by Course</h2>
            <div className="mt-4 h-[300px]">
              {assessmentsPerCourseData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#6C757D]">
                  No assessment data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assessmentsPerCourseData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={60}
                      paddingAngle={3}
                    >
                      {assessmentsPerCourseData.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#E9ECEF" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

```

### `./frontend/src/app/dashboard/layout.tsx`

```tsx
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen overflow-hidden bg-[#F8F9FA] text-black font-display">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header />
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

```

### `./frontend/src/app/dashboard/page.tsx`

```tsx
"use client";

import Link from "next/link";
import { getRelativeDateLabel } from "@/app/utils/dateHelpers";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type Course = {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
  target_grade?: string | number;
  daily_target_hours?: number | null;
};

type Assessment = {
  id: string;
  course_id: string;
  title: string;
  assessment_type: string;
  due_date: string;
  weight_percentage: number;
  is_completed: boolean;
  earned_score?: number | null;
};

type StudySession = {
  id: string;
  course_id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_completed: boolean;
};

type StudySessionForm = {
  course_id: string;
  title: string;
  date: string;
  start_time: string;
  duration_minutes: string;
};

type CourseStudyTime = {
  course_id: string;
  hours: number;
};

type CourseForm = {
  course_code: string;
  course_name: string;
  credits: string;
};

type AssessmentForm = {
  course_id: string;
  title: string;
  assessment_type: string;
  due_date: string;
  weight_percentage: string;
};

type Term = {
  id: string;
  season: "Winter" | "Spring" | "Fall";
  year: number;
  is_current: boolean;
  course_count: number;
  status: "Active" | "Archived";
};

function getSeasonIcon(season: string): string {
  switch (season) {
    case "Winter":
      return "ac_unit";
    case "Fall":
      return "park";
    case "Spring":
      return "light_mode";
    default:
      return "calendar_today";
  }
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString.replace(/-/g, "/"));
  }
  return new Date(dateString);
}

function getDueText(dateString: string) {
  return getRelativeDateLabel(dateString);
}

function formatDueDate(dateString: string) {
  return parseLocalDate(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatSessionTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function getCurrentWeekDates(weekOffset = 0) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
}

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [courseStudyTime, setCourseStudyTime] = useState<CourseStudyTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [terms, setTerms] = useState<Term[]>([]);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showPacingModal, setShowPacingModal] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [questText, setQuestText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerCourseId, setTimerCourseId] = useState("");
  const [sessionForm, setSessionForm] = useState<StudySessionForm>({
    course_id: "",
    title: "",
    date: "",
    start_time: "",
    duration_minutes: "60",
  });
  const [courseForm, setCourseForm] = useState<CourseForm>({
    course_code: "",
    course_name: "",
    credits: "0.5",
  });
  const [assessmentForm, setAssessmentForm] = useState<AssessmentForm>({
    course_id: "",
    title: "",
    assessment_type: "Exam",
    due_date: "",
    weight_percentage: "10",
  });
  const [newDeadline, setNewDeadline] = useState({
    title: "",
    course_id: "",
    due_date: "",
    weight_percentage: 0,
    assessment_type: "Assignment",
  });
  const [quickStudy, setQuickStudy] = useState({ course_id: "", duration_minutes: 60 });
  const [gradeAssessmentId, setGradeAssessmentId] = useState("");
  const [earnedScore, setEarnedScore] = useState<number | "">("");
  const [pacingTargetInput, setPacingTargetInput] = useState("4.0");

  const fetchDashboardData = useCallback(async () => {
    try {
      const [coursesResponse, assessmentsResponse, studySessionsResponse] = await Promise.all([
        api.get<Course[]>("/courses/"),
        api.get<Assessment[]>("/assessments/"),
        api.get<StudySession[]>("/study-sessions/"),
      ]);

      setCourses(coursesResponse.data);
      setAssessments(assessmentsResponse.data);
      setStudySessions(studySessionsResponse.data);

      try {
        const studyTimeResponse = await api.get<CourseStudyTime[]>("/analytics/study-time");
        setCourseStudyTime(studyTimeResponse.data || []);
      } catch (error) {
        console.warn("Failed to load course study time analytics (non-blocking):", error);

        const now = new Date();
        const weekStart = startOfDay(new Date(now));
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = startOfDay(new Date(weekStart));
        weekEnd.setDate(weekStart.getDate() + 7);

        const minutesByCourseId = studySessionsResponse.data.reduce<Record<string, number>>(
          (acc, session) => {
            const start = new Date(session.start_time);
            if (start >= weekStart && start < weekEnd) {
              acc[session.course_id] = (acc[session.course_id] ?? 0) + Number(session.duration_minutes || 0);
            }
            return acc;
          },
          {},
        );

        setCourseStudyTime(
          (coursesResponse.data || []).map((course) => ({
            course_id: course.id,
            hours: Number(((minutesByCourseId[course.id] ?? 0) / 60).toFixed(1)),
          })),
        );
      }

      // Fetch terms — fall back to a synthetic current term if the endpoint isn't available yet.
      try {
        const termsResponse = await api.get<Term[]>("/terms/");
        setTerms(termsResponse.data || []);
      } catch {
        // Endpoint doesn't exist yet — build a fallback from what we know.
        const currentYear = new Date().getFullYear();
        const month = new Date().getMonth();
        const currentSeason: Term["season"] = month >= 8 ? "Fall" : month >= 4 ? "Spring" : "Winter";
        setTerms([
          { id: "current", season: currentSeason, year: currentYear, is_current: true, course_count: coursesResponse.data.length, status: "Active" },
          { id: "prev-1", season: "Fall", year: currentYear - 1, is_current: false, course_count: 0, status: "Archived" },
          { id: "prev-2", season: "Spring", year: currentYear - 1, is_current: false, course_count: 0, status: "Archived" },
          { id: "prev-3", season: "Winter", year: currentYear - 1, is_current: false, course_count: 0, status: "Archived" },
        ]);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const handleAssessmentsUpdated = () => {
      void fetchDashboardData();
    };
    window.addEventListener("assessments-updated", handleAssessmentsUpdated);
    return () => {
      window.removeEventListener("assessments-updated", handleAssessmentsUpdated);
    };
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!timerCourseId && courses.length > 0) {
      setTimerCourseId(courses[0].id);
    }
  }, [courses, timerCourseId]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }

    if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      void handleTimerComplete();
    }
  }, [isRunning, timeLeft]);

  const courseMap = useMemo(() => {
    return courses.reduce<Record<string, Course>>((acc, course) => {
      acc[course.id] = course;
      return acc;
    }, {});
  }, [courses]);

  const studyTimeByCourseId = useMemo(() => {
    return courseStudyTime.reduce<Record<string, number>>((acc, entry) => {
      const id = String(entry.course_id || "").trim();
      if (!id) return acc;
      acc[id] = Number(entry.hours || 0);
      return acc;
    }, {});
  }, [courseStudyTime]);

  const maxCourseHoursRaw = useMemo(() => {
    return courses.reduce((acc, course) => Math.max(acc, studyTimeByCourseId[course.id] ?? 0), 0);
  }, [courses, studyTimeByCourseId]);

  const maxCourseHours = maxCourseHoursRaw > 0 ? maxCourseHoursRaw : 1;

  const upcomingDeadlines = useMemo(() => {
    const today = startOfDay(new Date());
    const inSevenDays = startOfDay(new Date());
    inSevenDays.setDate(inSevenDays.getDate() + 7);

    return assessments
      .filter((assessment) => !assessment.is_completed)
      .filter((assessment) => assessment.earned_score === null || assessment.earned_score === undefined)
      .filter((assessment) => {
        const dueDate = startOfDay(parseLocalDate(assessment.due_date));
        return dueDate >= today && dueDate <= inSevenDays;
      })
      .sort((a, b) => parseLocalDate(a.due_date).getTime() - parseLocalDate(b.due_date).getTime())
      .slice(0, 5);
  }, [assessments]);

  const todaysSessions = useMemo(() => {
    const todayKey = toLocalDateKey(new Date());
    return studySessions
      .filter((session) => !session.is_completed)
      .filter((session) => toLocalDateKey(new Date(session.start_time)) === todayKey)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [studySessions]);

  const calendarDays = useMemo(() => getCurrentWeekDates(weekOffset), [weekOffset]);
  const HOURS_PER_CREDIT_MULTIPLIER = 24 / 18;
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const expectedWeeklyMinutes = totalCredits > 0 ? totalCredits * HOURS_PER_CREDIT_MULTIPLIER * 60 : 1;
  const targetCourse = courses.length > 0 ? courses[0] : null;
  const dailyTargetHours = Number(targetCourse?.daily_target_hours ?? 4.0);

  const now = new Date();
  const weekStart = startOfDay(new Date(now));
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = startOfDay(new Date(weekStart));
  weekEnd.setDate(weekStart.getDate() + 7);

  const thisWeekSessions = studySessions.filter((session) => {
    const start = new Date(session.start_time);
    return start >= weekStart && start < weekEnd;
  });
  const thisWeekMinutes = thisWeekSessions.reduce((sum, session) => sum + session.duration_minutes, 0);
  const thisWeekHours = (thisWeekMinutes / 60).toFixed(1);
  const lastWeekStart = startOfDay(new Date(weekStart));
  lastWeekStart.setDate(weekStart.getDate() - 7);
  const lastWeekSessions = studySessions.filter((session) => {
    const start = new Date(session.start_time);
    return start >= lastWeekStart && start < weekStart;
  });
  const lastWeekMinutes = lastWeekSessions.reduce((sum, session) => sum + session.duration_minutes, 0);
  const weeklyDiffHours = ((thisWeekMinutes - lastWeekMinutes) / 60).toFixed(1);
  const diffColor = Number(weeklyDiffHours) >= 0 ? "text-black" : "text-[#6C757D]";
  const diffSign = Number(weeklyDiffHours) > 0 ? "+" : "";
  const diffIcon = Number(weeklyDiffHours) >= 0 ? "trending_up" : "trending_down";
  const workloadPercentage = Math.min(
    100,
    Math.round((thisWeekMinutes / expectedWeeklyMinutes) * 100),
  );

  const todaysMinutes = todaysSessions.reduce((sum, session) => sum + session.duration_minutes, 0);
  const remainingDailyHours = Math.max(0, 6 - todaysMinutes / 60).toFixed(1);

  const gaugeCircumference = 364.42;
  const gaugeOffset = gaugeCircumference - (gaugeCircumference * workloadPercentage) / 100;

  const actualHours = Number((thisWeekMinutes / 60).toFixed(1));
  const plannedHours = Number((totalCredits * HOURS_PER_CREDIT_MULTIPLIER).toFixed(1));
  const safePlannedHours = plannedHours > 0 ? plannedHours : 1;
  const efficiency = actualHours <= 0 ? 0 : Math.min(100, Math.round((actualHours / safePlannedHours) * 100));
  const hasLoggedThisWeek = thisWeekSessions.length > 0;
  const daysElapsedThisWeek = Math.min(
    7,
    Math.max(1, Math.floor((startOfDay(new Date()).getTime() - weekStart.getTime()) / MS_PER_DAY) + 1),
  );
  const expectedByNow = (safePlannedHours / 7) * daysElapsedThisWeek;
  const showInitialNeutral = !hasLoggedThisWeek && actualHours === 0;
  const isBehindDailyTarget = !showInitialNeutral && actualHours < expectedByNow;
  const debtDisplay = showInitialNeutral
    ? "0h balance"
    : isBehindDailyTarget
      ? `-${(expectedByNow - actualHours).toFixed(1)}h behind`
      : `+${(actualHours - expectedByNow).toFixed(1)}h ahead`;
  const debtColorClass = showInitialNeutral
    ? "text-[#6C757D]"
    : isBehindDailyTarget
      ? "text-[#6C757D]"
      : "text-black";
  const debtStatusLabel = showInitialNeutral
    ? "NEUTRAL"
    : isBehindDailyTarget
      ? "ACTION REQUIRED"
      : "ON TRACK";

  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  // KPI: Term Average
  const totalTargetCredits = courses.reduce((acc, curr) => acc + Number(curr.credits || 0), 0);
  const weightedTargetSum = courses.reduce(
    (acc, curr) => acc + Number(curr.target_grade || 0) * Number(curr.credits || 0),
    0,
  );
  const targetGPA = totalTargetCredits > 0 ? Math.round(weightedTargetSum / totalTargetCredits) : 0;
  const gradedAssessments = assessments.filter(
    (a) => a.is_completed && a.earned_score !== null && a.earned_score !== undefined,
  );
  let totalEarned = 0;
  let totalWeight = 0;
  gradedAssessments.forEach((a) => {
    totalEarned += a.earned_score! * (a.weight_percentage / 100);
    totalWeight += a.weight_percentage;
  });
  const currentGPA: number | null = totalWeight > 0 ? Math.round((totalEarned / totalWeight) * 100) : null;

  // KPI: Deliverables Due (next 7 days)
  const deliverablesDue = assessments.filter((assessment) => {
    if (assessment.is_completed) return false;
    const dueDate = parseLocalDate(assessment.due_date);
    return dueDate >= today && dueDate <= nextWeek;
  }).length;

  const badgeConfig =
    workloadPercentage < 50
      ? { label: "Light", className: "bg-[#F8F9FA] border border-[#E9ECEF] text-[#6C757D]", dotClass: "bg-[#6C757D]", pace: "light" }
      : workloadPercentage <= 85
        ? { label: "Balanced", className: "bg-[#F8F9FA] border border-[#E9ECEF] text-black", dotClass: "bg-[#288028]", pace: "sustainable" }
        : { label: "Heavy", className: "bg-[#F8F9FA] border border-[#E9ECEF] text-[#6C757D]", dotClass: "bg-[#6C757D]", pace: "heavy" };

  useEffect(() => {
    if (!showPacingModal) {
      setPacingTargetInput(dailyTargetHours.toFixed(1));
    }
  }, [dailyTargetHours, showPacingModal]);

  const closeSessionModal = () => {
    if (submitting) return;
    setIsSessionModalOpen(false);
    setSessionForm({
      course_id: "",
      title: "",
      date: "",
      start_time: "",
      duration_minutes: "60",
    });
  };

  const closeCourseModal = () => {
    if (submitting) return;
    setIsCourseModalOpen(false);
    setCourseForm({
      course_code: "",
      course_name: "",
      credits: "0.5",
    });
  };

  const closeAssessmentModal = () => {
    if (submitting) return;
    setIsAssessmentModalOpen(false);
    setAssessmentForm({
      course_id: "",
      title: "",
      assessment_type: "Exam",
      due_date: "",
      weight_percentage: "10",
    });
  };

  const closeQuestModal = () => {
    if (isImporting) return;
    setIsQuestModalOpen(false);
    setQuestText("");
  };

  const handleCreateSession = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const [year, month, day] = sessionForm.date.split("-").map(Number);
      const [hours, minutes] = sessionForm.start_time.split(":").map(Number);
      const durationMinutes = Number(sessionForm.duration_minutes);

      const startDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

      const payload = {
        course_id: sessionForm.course_id,
        title: sessionForm.title.trim(),
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        duration_minutes: durationMinutes,
      };

      const response = await api.post<StudySession>("/study-sessions/", payload);
      setStudySessions((prev) => [response.data, ...prev]);
      closeSessionModal();
    } catch (error) {
      console.error("Failed to create study session:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveTarget = async (value: number) => {
    if (!targetCourse) {
      throw new Error("No course available to persist daily target.");
    }
    if (Number.isNaN(value) || value < 0 || value > 12) {
      return;
    }

    try {
      await api.patch<Course>(`/courses/${targetCourse.id}`, {
        daily_target_hours: value,
      });
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to update daily target:", error);
      throw error;
    }
  };

  const handleSubmitPacingTarget = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(pacingTargetInput);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 12) {
      alert("Please enter a target between 0 and 12 hours.");
      return;
    }
    if (!targetCourse) {
      alert("Add at least one course before setting a daily target.");
      return;
    }

    try {
      await handleSaveTarget(parsed);
      setShowPacingModal(false);
    } catch {
      alert("Failed to update pacing target. Please try again.");
    }
  };

  const handleCreateCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/courses/", {
        course_code: courseForm.course_code.trim(),
        course_name: courseForm.course_name.trim(),
        credits: Number(courseForm.credits),
      });
      closeCourseModal();
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to create course:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAssessment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/assessments/", {
        course_id: assessmentForm.course_id,
        title: assessmentForm.title.trim(),
        assessment_type: assessmentForm.assessment_type,
        due_date: assessmentForm.due_date,
        weight_percentage: Number(assessmentForm.weight_percentage),
      });
      closeAssessmentModal();
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to create assessment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportQuest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsImporting(true);

    try {
      const regex = /([A-Z]{2,4}\s+\d{3}[A-Z]?)\s+-\s+([^\n]+)/g;
      const matches = [...questText.matchAll(regex)];
      const seenCourseCodes = new Set<string>();
      const parsedCourses: Array<{ course_code: string; course_name: string; credits: number; target_grade: string }> = [];

      for (const match of matches) {
        const course_code = (match[1] ?? "").trim().replace(/\s+/g, " ");
        const course_name = (match[2] ?? "").trim();

        if (!course_code || !course_name || seenCourseCodes.has(course_code)) {
          continue;
        }

        seenCourseCodes.add(course_code);
        parsedCourses.push({
          course_code,
          course_name,
          credits: 0.5,
          target_grade: "85",
        });
      }

      if (parsedCourses.length === 0) {
        alert("No courses found. Please make sure you copied the List View from Quest.");
        return;
      }

      await Promise.all(parsedCourses.map((course) => api.post("/courses/", course)));

      closeQuestModal();
      setQuestText("");
      await fetchDashboardData();
      alert(`Imported ${parsedCourses.length} course${parsedCourses.length === 1 ? "" : "s"}.`);
    } catch (error) {
      console.error("Failed to import courses from Quest:", error);
      alert("Failed to import courses. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleOptimizeSchedule = async () => {
    try {
      setIsOptimizing(true);
      const response = await api.post<{ message?: string }>("/plan/generate");
      await fetchDashboardData();
      alert(response.data?.message ?? "Schedule optimized!");
    } catch (error) {
      console.error("Failed to optimize schedule:", error);
      alert("Failed to optimize schedule. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    setIsOptimized(false);

    setTimeout(() => {
      setIsOptimizing(false);
      setIsOptimized(true);

      setTimeout(() => {
        setIsOptimized(false);
      }, 3000);
    }, 2000);
  };

  const handleCreateDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: newDeadline.title.trim(),
        course_id: newDeadline.course_id,
        assessment_type: newDeadline.assessment_type.trim(),
        weight_percentage: Number(newDeadline.weight_percentage),
        due_date: newDeadline.due_date,
      };

      await api.post("/assessments/", payload);
      await fetchDashboardData();
      setShowDeadlineModal(false);
      setNewDeadline({
        title: "",
        course_id: "",
        due_date: "",
        weight_percentage: 0,
        assessment_type: "Assignment",
      });
    } catch (error: any) {
      console.error("Failed to create deadline:", error);
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail
          .map((err: any) => `${err.loc?.[err.loc.length - 1]}: ${err.msg}`)
          .join("\n");
        alert(`Backend rejected the data:\n${messages}`);
      } else if (detail) {
        alert(`Failed to save: ${JSON.stringify(detail)}`);
      } else {
        alert(`Failed to save: ${error?.message ?? "Unknown error"}`);
      }
    }
  };

  const handleQuickStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStudy.course_id) {
      alert("Please select a course.");
      return;
    }

    try {
      const end_time = new Date();
      const start_time = new Date(Date.now() - Number(quickStudy.duration_minutes) * 60000);
      const payload = {
        title: "Manual Study Session",
        course_id: quickStudy.course_id,
        start_time: start_time.toISOString(),
        end_time: end_time.toISOString(),
        duration_minutes: Number(quickStudy.duration_minutes),
        is_completed: true,
      };

      await api.post("/study-sessions/", payload);
      await fetchDashboardData();
      setShowStudyModal(false);
      setQuickStudy({ course_id: "", duration_minutes: 60 });
    } catch (error: any) {
      console.error("Failed to create quick study session:", error);
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail
          .map((err: any) => `${err.loc?.[err.loc.length - 1]}: ${err.msg}`)
          .join("\n");
        alert(`Backend rejected the data:\n${messages}`);
      } else if (detail) {
        alert(`Failed to save: ${JSON.stringify(detail)}`);
      } else {
        alert(`Failed to save: ${error?.message ?? "Unknown error"}`);
      }
    }
  };

  const handleLogGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeAssessmentId) {
      alert("Please select an assessment.");
      return;
    }
    if (earnedScore === "") {
      alert("Please enter a score.");
      return;
    }

    try {
      await api.patch(`/assessments/${gradeAssessmentId}/toggle-complete`, {
        earned_score: Number(earnedScore),
      });
      await fetchDashboardData();
      setShowGradeModal(false);
      setGradeAssessmentId("");
      setEarnedScore("");
    } catch (error: any) {
      console.error("Failed to log grade:", error);
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail
          .map((err: any) => `${err.loc?.[err.loc.length - 1]}: ${err.msg}`)
          .join("\n");
        alert(`Backend rejected the data:\n${messages}`);
      } else if (detail) {
        alert(`Failed to save: ${JSON.stringify(detail)}`);
      } else {
        alert(`Failed to save: ${error?.message ?? "Unknown error"}`);
      }
    }
  };

  const toggleAssessment = async (id: string) => {
    try {
      await api.patch(`/assessments/${id}/toggle-complete`);
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to toggle assessment:", error);
    }
  };

  const toggleSession = async (id: string) => {
    try {
      await api.patch(`/study-sessions/${id}/toggle-complete`);
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to toggle session:", error);
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this deadline?");
      if (!confirmed) return;
      await api.delete(`/assessments/${id}`);
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to delete assessment:", error);
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this study session?");
      if (!confirmed) return;
      await api.delete(`/study-sessions/${id}`);
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleTimerComplete = async () => {
    alert("Pomodoro complete! Great job.");

    try {
      if (timerCourseId) {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 25 * 60 * 1000);

        await api.post("/study-sessions/", {
          course_id: timerCourseId,
          title: "Pomodoro Session",
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_minutes: 25,
          is_completed: true,
        });

        await fetchDashboardData();
      }
    } catch (error) {
      console.error("Failed to log pomodoro session:", error);
    } finally {
      setTimeLeft(25 * 60);
    }
  };

  // Shared modal/input class constants
  const inputClass = "h-10 w-full rounded-xl border border-[#E9ECEF] bg-white px-3 text-sm text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 transition-all duration-200";
  const labelClass = "mb-1.5 block text-sm font-medium text-[#6C757D]";
  const cancelBtnClass = "h-10 rounded-xl border border-[#E9ECEF] px-4 text-sm font-medium text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] disabled:opacity-60";
  const submitBtnClass = "h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 disabled:opacity-60";
  const modalOverlayClass = "fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4";
  const modalPanelClass = "w-full max-w-lg rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm";

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto w-full">
      {/* Hero Section: Workload Status */}
      <section className="bg-white rounded-xl p-8 border border-[#E9ECEF] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Circular Progress Gauge */}
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle className="text-[#E9ECEF]" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
              <circle className="text-[#288028]" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.42" strokeDashoffset={gaugeOffset} strokeLinecap="round" strokeWidth="8"></circle>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-black">{workloadPercentage}%</span>
              <span className="text-[10px] font-semibold text-[#6C757D] uppercase tracking-widest">Load</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <h2 className="text-2xl font-bold text-black">Workload Status</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-bold ${badgeConfig.className}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${badgeConfig.dotClass}`}></span>
                {badgeConfig.label}
              </span>
            </div>
            <p className="text-[#6C757D] max-w-md">Your current study pace is {badgeConfig.pace}. You have approximately {remainingDailyHours} hours remaining today for deep work.</p>
          </div>
        </div>
        <button
          onClick={handleOptimizeSchedule}
          disabled={isOptimizing}
          className="bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-200 flex items-center gap-2 group shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isOptimizing ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">bolt</span>
          )}
          {isOptimizing ? "Optimizing..." : "Optimize My Schedule"}
        </button>
      </section>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl p-6 border border-[#E9ECEF] shadow-sm transition-all duration-200 hover:shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">Term Average</span>
          <p className="mt-2 text-4xl font-bold text-[#288028]">{currentGPA === null ? "--%" : `${currentGPA}%`}</p>
          <p className="mt-1 text-xs text-[#6C757D]">Target: {targetGPA > 0 ? `${targetGPA}%` : "--"}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#E9ECEF] shadow-sm transition-all duration-200 hover:shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">Deliverables Due</span>
          <p className="mt-2 text-4xl font-bold text-black">{deliverablesDue}</p>
          <p className="mt-1 text-xs text-[#6C757D]">Next 7 days</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#E9ECEF] shadow-sm transition-all duration-200 hover:shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">GPA Projection</span>
          <div className="relative mt-2 flex items-center gap-3">
            <p className="text-4xl font-bold text-[#288028]">{currentGPA === null ? "--%" : `${currentGPA}%`}</p>
          </div>
          <p className="mt-1 text-xs text-[#6C757D]">Based on {gradedAssessments.length} graded items</p>
        </div>
      </div>

      {/* Course Calendar */}
      <div className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm p-6 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#288028]">calendar_month</span>
            <h3 className="text-lg font-semibold text-black">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] p-0.5">
              <button type="button" className="h-8 rounded-lg px-3 text-xs font-semibold bg-white text-black shadow-sm border border-[#E9ECEF]">Week</button>
              <button type="button" className="h-8 rounded-lg px-3 text-xs font-semibold text-[#6C757D] hover:text-black transition-colors">Month</button>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6C757D] hover:bg-[#F8F9FA] transition-colors">
                <span className="material-symbols-outlined !text-[18px]">chevron_left</span>
              </button>
              <Link href="/dashboard/schedule" className="h-8 rounded-lg px-3 text-xs font-semibold text-[#6C757D] hover:bg-[#F8F9FA] transition-colors flex items-center">
                Today
              </Link>
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6C757D] hover:bg-[#F8F9FA] transition-colors">
                <span className="material-symbols-outlined !text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
            <div key={day} className="text-center text-[10px] font-semibold uppercase tracking-widest text-[#ADB5BD] py-2">{day}</div>
          ))}
        </div>
        {/* Calendar Week View — current week */}
        <div className="grid grid-cols-7 gap-0">
          {calendarDays.map((day) => {
            const dayKey = toLocalDateKey(day);
            const todayKey = toLocalDateKey(new Date());
            const isToday = dayKey === todayKey;
            const hasDeliverable = assessments.some((a) => {
              if (a.is_completed) return false;
              const dueKey = a.due_date.split("T")[0];
              return dueKey === dayKey;
            });
            const hasSession = studySessions.some(
              (session) => toLocalDateKey(new Date(session.start_time)) === dayKey,
            );
            const isPast = day < startOfDay(new Date());

            return (
              <div
                key={dayKey}
                className={`flex flex-col items-center justify-center py-3 rounded-xl transition-colors ${
                  isToday ? "bg-[#288028] text-white" : isPast ? "text-[#CED4DA]" : "text-black"
                }`}
              >
                <span className={`text-lg font-semibold ${isToday ? "text-white" : ""}`}>{day.getDate()}</span>
                <div className="flex items-center gap-1 mt-1 h-2">
                  {hasDeliverable ? (
                    <span className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-white" : "bg-[#288028]"}`}></span>
                  ) : null}
                  {hasSession ? (
                    <span className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-white/60" : "bg-[#ADB5BD]"}`}></span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-6 text-xs text-[#6C757D]">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#288028]"></span> Deliverable due</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ADB5BD]"></span> Study session</div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Deadlines List */}
        <div className="bg-white rounded-xl p-6 border border-[#E9ECEF] shadow-sm flex flex-col transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-black flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6C757D]">event_upcoming</span>
              Upcoming Deadlines
            </h3>
            <div className="flex items-center gap-1">
              <Link href="/dashboard/schedule" className="text-xs font-bold text-[#6C757D] hover:text-black transition-all duration-200">View All</Link>
              <button onClick={() => setIsAssessmentModalOpen(true)} className="p-1 hover:bg-[#F8F9FA] rounded-xl text-[#6C757D] transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">add</span></button>
            </div>
          </div>
          <div className="space-y-0 flex-1">
            {loading ? (
              <p className="text-sm text-[#6C757D]">Loading deadlines...</p>
            ) : upcomingDeadlines.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#F8F9FA] text-sm text-[#6C757D]">
                You&apos;re all caught up! No upcoming deadlines for the next 7 days.
              </div>
            ) : (
              upcomingDeadlines.map((assessment) => {
                const course = courseMap[assessment.course_id];
                const dueText = getDueText(assessment.due_date);
                const dueDate = formatDueDate(assessment.due_date);
                const dueTextClass =
                  dueText === "TODAY" || dueText === "OVERDUE" ? "text-black" : "text-[#6C757D]";

                return (
                  <div key={assessment.id} className="flex items-center gap-4 p-3 border-b border-[#E9ECEF] group hover:bg-[#F8F9FA] transition-all duration-200">
                    <div className="h-10 w-1 bg-[#288028] rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-black truncate">{assessment.title}</p>
                      <p className="text-xs text-[#6C757D]">{course?.course_name || course?.course_code || "Unknown Course"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#6C757D]">{dueDate}</p>
                      <p className={`text-[10px] font-bold uppercase ${dueTextClass}`}>{dueText}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleAssessment(assessment.id)} className="flex-shrink-0 text-[#ADB5BD] hover:text-black transition-all duration-200"><span className="material-symbols-outlined">radio_button_unchecked</span></button>
                      <button onClick={() => deleteAssessment(assessment.id)} className="flex-shrink-0 text-[#ADB5BD] hover:text-black transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">delete</span></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Study Sessions Calendar Preview */}
        <div className="bg-white rounded-xl p-6 border border-[#E9ECEF] shadow-sm flex flex-col transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-black flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6C757D]">calendar_month</span>
              Study Sessions
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setIsSessionModalOpen(true)}
                className="p-1 hover:bg-[#F8F9FA] rounded-xl text-[#6C757D] transition-all duration-200"
              >
                <span className="material-symbols-outlined !text-[18px]">add</span>
              </button>
              <button onClick={() => setWeekOffset((prev) => prev - 1)} className="p-1 hover:bg-[#F8F9FA] rounded-xl text-[#6C757D] transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">chevron_left</span></button>
              <button onClick={() => setWeekOffset((prev) => prev + 1)} className="p-1 hover:bg-[#F8F9FA] rounded-xl text-[#6C757D] transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">chevron_right</span></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {["M","T","W","T","F","S","S"].map((d, i) => (
              <span key={`${d}-${i}`} className="text-[10px] font-bold text-[#ADB5BD] uppercase">{d}</span>
            ))}
            {calendarDays.map((day) => {
              const dayKey = toLocalDateKey(day);
              const todayKey = toLocalDateKey(new Date());
              const isToday = dayKey === todayKey;
              const hasSession = studySessions.some(
                (session) => toLocalDateKey(new Date(session.start_time)) === dayKey,
              );
              const isPast = day < startOfDay(new Date());

              if (isToday) {
                return (
                  <span
                    key={dayKey}
                    className="p-2 text-xs font-bold text-white bg-black rounded-xl"
                  >
                    {day.getDate()}
                  </span>
                );
              }

              return (
                <span
                  key={dayKey}
                  className={`p-2 text-xs font-medium rounded-xl relative ${isPast ? "text-[#ADB5BD]" : "text-[#6C757D]"}`}
                >
                  {day.getDate()}
                  {hasSession ? (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#288028] rounded-full"></span>
                  ) : null}
                </span>
              );
            })}
          </div>
          <div className="space-y-3 mt-auto">
            {loading ? (
              <p className="text-xs text-[#6C757D]">Loading sessions...</p>
            ) : todaysSessions.length === 0 ? (
              <p className="text-xs text-[#6C757D]">No study sessions scheduled for today.</p>
            ) : (
              todaysSessions.map((session) => {
                const course = courseMap[session.course_id];

                return (
                  <div
                    key={session.id}
                    className="p-3 bg-[#F8F9FA] border-l-2 border-[#288028] rounded-r-xl mb-2 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#6C757D] uppercase">
                        {course?.course_name || course?.course_code || "Study Session"}
                      </p>
                      <p className="text-xs font-bold text-black">{session.title}</p>
                      <p className="text-[10px] text-[#6C757D]">
                        {formatSessionTime(session.start_time)} - {formatSessionTime(session.end_time)} (
                        {session.duration_minutes} min)
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleSession(session.id)} className="flex-shrink-0 text-[#ADB5BD] hover:text-black transition-all duration-200"><span className="material-symbols-outlined">radio_button_unchecked</span></button>
                      <button onClick={() => deleteSession(session.id)} className="flex-shrink-0 text-[#ADB5BD] hover:text-black transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">delete</span></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Course Breakdown Bar Chart */}
        <div className="bg-white rounded-xl p-6 border border-[#E9ECEF] shadow-sm flex flex-col transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-black flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6C757D]">bar_chart</span>
              Course Breakdown
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsCourseModalOpen(true)} className="p-1 hover:bg-[#F8F9FA] rounded-xl text-[#6C757D] transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">add</span></button>
              <button onClick={() => setIsQuestModalOpen(true)} type="button" title="Import from Quest" className="p-1 hover:bg-[#F8F9FA] rounded-xl text-[#6C757D] transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">content_paste_go</span></button>
              <Link href="/dashboard/courses" title="Manage Courses" className="p-1.5 hover:bg-[#F8F9FA] rounded-xl text-[#6C757D] flex items-center transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">more_horiz</span></Link>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between px-2 gap-4 h-40">
            {loading ? (
              <div className="w-full text-center text-xs text-[#6C757D]">Loading...</div>
            ) : courses.length === 0 ? (
              <div className="w-full text-center text-xs text-[#6C757D]">No courses added yet</div>
            ) : maxCourseHoursRaw <= 0 ? (
              <div className="w-full text-center text-xs text-[#6C757D]">Start a timer to see your breakdown.</div>
            ) : (
              courses.map((course) => {
                const hours = studyTimeByCourseId[course.id] ?? 0;
                const heightPct = Math.max(0, Math.min(100, Math.round((hours / maxCourseHours) * 100)));
                const barClass = hours <= 0 ? "bg-[#E9ECEF]" : "bg-[#288028]";
                const barHeightStyle =
                  hours <= 0 ? { height: "6%" } : { height: `${heightPct}%` };

                return (
                  <div key={course.id} className="flex-1 flex flex-col items-center gap-2 min-w-0 self-stretch">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        title={`${hours.toFixed(1)}h`}
                        className={`w-full rounded-t-xl transition-all duration-500 ${barClass}`}
                        style={barHeightStyle}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-[#6C757D] uppercase truncate w-full text-center">
                      {course.course_code}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-[#E9ECEF] flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs font-bold text-black">{thisWeekHours}h</p>
              <p className="text-[10px] text-[#6C757D] uppercase font-medium">This Week</p>
            </div>
            <div className="h-6 w-[1px] bg-[#E9ECEF]"></div>
            <div className="text-center">
              <p className={`text-xs font-bold ${diffColor} inline-flex items-center gap-1`}>
                <span className="material-symbols-outlined !text-[16px]">{diffIcon}</span>
                {diffSign}
                {weeklyDiffHours}h
              </p>
              <p className="text-[10px] text-[#6C757D] uppercase font-medium">Vs Last Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- PRODUCTIVITY HUB --- */}
      <section className="mt-12 space-y-6">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-black">Productivity Hub</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* 1. Pomodoro Timer */}
          <div className="col-span-1 flex flex-col rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">POMODORO TIMER</span>
              <span className="material-symbols-outlined text-[#ADB5BD]">timer</span>
            </div>
            <div className="mt-6 flex flex-1 flex-col items-center justify-center">
              <h3 className="text-6xl font-bold tracking-tight text-black">{formatTime(timeLeft)}</h3>
              <select
                value={timerCourseId}
                onChange={(event) => setTimerCourseId(event.target.value)}
                disabled={courses.length === 0}
                className="mt-4 w-32 cursor-pointer appearance-none rounded-xl border border-[#E9ECEF] bg-white px-4 py-1.5 text-center text-sm font-medium text-[#6C757D] outline-none transition-all duration-200"
              >
                {courses.length === 0 ? (
                  <option value="" disabled>No courses</option>
                ) : (
                  <>
                    <option value="" disabled>Select course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>{course.course_code}</option>
                    ))}
                  </>
                )}
              </select>
              <div className="mt-8 flex items-center gap-4">
                <button onClick={() => setIsRunning(true)} className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white transition-all duration-200 hover:bg-gray-800">
                  <span className="material-symbols-outlined !text-[24px]">play_arrow</span>
                </button>
                <button onClick={() => setIsRunning(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8F9FA] text-[#6C757D] transition-all duration-200 hover:bg-[#E9ECEF]">
                  <span className="material-symbols-outlined !text-[20px]">pause</span>
                </button>
                <button onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8F9FA] text-[#6C757D] transition-all duration-200 hover:bg-[#E9ECEF]">
                  <span className="material-symbols-outlined !text-[20px]">stop</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Study Debt Tracker */}
          <div className="col-span-1 flex flex-col rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm md:col-span-2 transition-all duration-200 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">STUDY DEBT TRACKER</span>
                <h3 className="mt-1 text-lg font-bold text-black">Weekly Commitment Balance</h3>
              </div>
              <div className="text-right">
                <span className={`text-xl font-bold ${debtColorClass}`}>{debtDisplay}</span>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6C757D]">{debtStatusLabel}</p>
              </div>
            </div>

            <div className="mt-8 flex-1 space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">
                  <span>PLANNED PROGRESS</span>
                  <span>24.0 HOURS</span>
                </div>
                <div className="h-3 w-full rounded-xl bg-[#E9ECEF]">
                  <div className="h-3 w-full rounded-xl bg-[#ADB5BD]"></div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">
                  <span>ACTUAL WORK DONE</span>
                  <span>{actualHours} HOURS</span>
                </div>
                <div className="h-3 w-full rounded-xl bg-[#E9ECEF]">
                  <div className="h-3 rounded-xl bg-[#288028]" style={{ width: `${efficiency}%` }}></div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <div className="flex-1 rounded-xl border border-[#E9ECEF] bg-white p-4">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">TODAY&apos;S TARGET</span>
                <button
                  type="button"
                  onClick={() => {
                    if (!targetCourse) {
                      alert("Add at least one course before setting a daily target.");
                      return;
                    }
                    setPacingTargetInput(dailyTargetHours.toFixed(1));
                    setShowPacingModal(true);
                  }}
                  className="mt-1 inline-flex items-center gap-1 rounded-xl px-1 -mx-1 text-xl font-bold text-black transition-all duration-200 hover:bg-[#F8F9FA]"
                >
                  {dailyTargetHours.toFixed(1)}h
                  <span className="material-symbols-outlined !text-[14px] text-[#6C757D]">edit</span>
                </button>
              </div>
              <div className="flex-1 rounded-xl border border-[#E9ECEF] bg-white p-4">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">EFFICIENCY</span>
                <p className="mt-1 text-xl font-bold text-black">{efficiency}%</p>
              </div>
            </div>
          </div>

          {/* 3. GPA Forecaster */}
          <div className="col-span-1 flex flex-col rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">GPA FORECASTER</span>
              <span className="material-symbols-outlined text-[#ADB5BD]">show_chart</span>
            </div>
            <div className="relative mt-6 flex flex-1 flex-col items-center justify-center">
              <div className="relative flex h-36 w-36 items-center justify-center">
                <svg viewBox="0 0 36 36" className="h-36 w-36 -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="transparent" className="stroke-[#E9ECEF]" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="16" fill="transparent" className={`${currentGPA === null ? "stroke-[#E9ECEF]" : "stroke-[#288028]"} transition-all duration-500`} strokeWidth="2.5" strokeDasharray="100" strokeDashoffset={currentGPA === null ? 100 : 100 - currentGPA} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-[#288028]">{currentGPA === null ? "--%" : `${currentGPA}%`}</span>
                  <span className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#6C757D]">CURRENT FORECAST</span>
                </div>
              </div>
              <p className="mt-6 text-sm font-semibold text-[#6C757D]">Target: <span className="text-[#288028]">{currentGPA === null ? "--%" : `${targetGPA}%`}</span></p>
            </div>
          </div>

          {/* 4. Term Archive — Dynamic */}
          <div className="col-span-1 md:col-span-2 rounded-2xl border border-[#E9ECEF] bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">TERM ARCHIVE</span>
                <p className="mt-0.5 text-sm font-semibold text-black">Browse previous terms</p>
              </div>
              <Link href="/dashboard/courses" className="text-xs font-bold text-[#6C757D] hover:text-black transition-colors">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {terms.map((term) => (
                <div
                  key={term.id}
                  className={`p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-transform hover:scale-105 cursor-pointer ${
                    term.is_current
                      ? "bg-green-50 border-2 border-green-600"
                      : "bg-white border border-slate-200 hover:border-green-600"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined !text-[28px] mb-2 ${
                      term.is_current ? "text-green-700" : "text-[#ADB5BD]"
                    }`}
                  >
                    {getSeasonIcon(term.season)}
                  </span>
                  <p className={`text-sm font-bold ${term.is_current ? "text-green-800" : "text-black"}`}>
                    {term.season} &apos;{String(term.year).slice(2)}
                  </p>
                  <p className={`text-[10px] uppercase font-semibold mt-1 ${
                    term.is_current ? "text-green-600" : "text-[#6C757D]"
                  }`}>
                    {term.is_current ? `${term.course_count} courses` : "Archived"}
                  </p>
                </div>
              ))}

              {/* Add Term Button — always last */}
              <button
                type="button"
                onClick={() => console.log("Add Term clicked — placeholder")}
                className="p-6 rounded-2xl border-2 border-dashed border-[#E9ECEF] bg-[#F8F9FA] flex flex-col items-center justify-center text-center transition-transform hover:scale-105 hover:border-green-600 hover:bg-green-50 cursor-pointer group"
              >
                <span className="material-symbols-outlined text-[#CED4DA] !text-[32px] group-hover:text-green-600 transition-colors">add</span>
                <p className="text-xs font-semibold text-[#ADB5BD] mt-1 group-hover:text-green-600 transition-colors">Add Term</p>
              </button>
            </div>
          </div>

          {/* 5. Quick-Add Hub */}
          <div className="col-span-1 mt-2 flex flex-col justify-between gap-4 rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm sm:flex-row sm:items-center md:col-span-3 transition-all duration-200 hover:shadow-md">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">QUICK-ADD HUB</span>
              <p className="mt-1 text-sm font-medium text-black">Update your progress instantly</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowGradeModal(true)}
                className="flex items-center gap-2 rounded-xl border border-[#E9ECEF] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#6C757D] transition-all duration-200 hover:bg-[#E9ECEF]"
              >
                <span className="material-symbols-outlined !text-[18px]">star</span>
                Log Grade
              </button>
              <button
                onClick={() => setShowDeadlineModal(true)}
                className="flex items-center gap-2 rounded-xl border border-[#E9ECEF] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#6C757D] transition-all duration-200 hover:bg-[#E9ECEF]"
              >
                <span className="material-symbols-outlined !text-[18px]">add_task</span>
                Add Deadline
              </button>
              <button
                onClick={() => setShowStudyModal(true)}
                className="flex items-center gap-2 rounded-xl border border-[#E9ECEF] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#6C757D] transition-all duration-200 hover:bg-[#E9ECEF]"
              >
                <span className="material-symbols-outlined !text-[18px]">rocket_launch</span>
                Quick Study
              </button>
            </div>
          </div>
        </div>

        {/* ===== MODALS ===== */}

        {showDeadlineModal ? (
          <div className={modalOverlayClass}>
            <div className="w-full max-w-md rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-black">Add Deadline</h3>
              <form onSubmit={handleCreateDeadline} className="space-y-4">
                <div>
                  <label className={labelClass}>Course</label>
                  <select value={newDeadline.course_id} onChange={(e) => setNewDeadline((prev) => ({ ...prev, course_id: e.target.value }))} required className={inputClass}>
                    <option value="" disabled>Select a course...</option>
                    {courses.map((course) => (<option key={course.id} value={course.id}>{course.course_code}</option>))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Title</label>
                  <input type="text" value={newDeadline.title} onChange={(e) => setNewDeadline((prev) => ({ ...prev, title: e.target.value }))} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Due Date</label>
                  <input type="date" value={newDeadline.due_date} onChange={(e) => setNewDeadline((prev) => ({ ...prev, due_date: e.target.value }))} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Weight</label>
                  <input type="number" value={newDeadline.weight_percentage} onChange={(e) => setNewDeadline((prev) => ({ ...prev, weight_percentage: Number(e.target.value) }))} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select value={newDeadline.assessment_type} onChange={(e) => setNewDeadline((prev) => ({ ...prev, assessment_type: e.target.value }))} required className={inputClass}>
                    <option value="Assignment">Assignment</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Final">Final</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowDeadlineModal(false)} className={cancelBtnClass}>Cancel</button>
                  <button type="submit" className={submitBtnClass}>Save Deadline</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {showStudyModal ? (
          <div className={modalOverlayClass}>
            <div className="w-full max-w-md rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-black">Log Study Session</h3>
              <form onSubmit={handleQuickStudy} className="space-y-4">
                <div>
                  <label className={labelClass}>Course</label>
                  <select value={quickStudy.course_id} onChange={(e) => setQuickStudy((prev) => ({ ...prev, course_id: e.target.value }))} required className={inputClass}>
                    <option value="" disabled>Select a course...</option>
                    {courses.map((course) => (<option key={course.id} value={course.id}>{course.course_code}</option>))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Duration (Minutes)</label>
                  <input type="number" min="1" value={quickStudy.duration_minutes} onChange={(e) => setQuickStudy((prev) => ({ ...prev, duration_minutes: Number(e.target.value) }))} required className={inputClass} />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowStudyModal(false)} className={cancelBtnClass}>Cancel</button>
                  <button type="submit" className={submitBtnClass}>Save Session</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {showGradeModal ? (
          <div className={modalOverlayClass}>
            <div className="w-full max-w-md rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-black">Log Grade</h3>
              <form onSubmit={handleLogGrade} className="space-y-4">
                <div>
                  <label className={labelClass}>Assessment</label>
                  <select value={gradeAssessmentId} onChange={(e) => setGradeAssessmentId(e.target.value)} required className={inputClass}>
                    {assessments.filter((a) => !a.is_completed).length === 0 ? (
                      <option value="" disabled>No pending assessments</option>
                    ) : (
                      <>
                        <option value="" disabled>Select an assessment...</option>
                        {assessments.filter((a) => !a.is_completed).map((assessment) => (
                          <option key={assessment.id} value={assessment.id}>{assessment.title}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Score (%)</label>
                  <input type="number" min="0" max="100" value={earnedScore} onChange={(e) => setEarnedScore(e.target.value === "" ? "" : Number(e.target.value))} required className={inputClass} />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowGradeModal(false)} className={cancelBtnClass}>Cancel</button>
                  <button type="submit" className={submitBtnClass}>Mark Completed</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {showPacingModal ? (
          <div className={modalOverlayClass}>
            <div className="w-full max-w-md rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-black">Adjust Pacing</h3>
              <form onSubmit={handleSubmitPacingTarget} className="space-y-4">
                {!targetCourse ? (
                  <p className="rounded-xl border border-[#E9ECEF] bg-white px-3 py-2 text-sm text-[#6C757D]">
                    Add at least one course before setting a daily target.
                  </p>
                ) : null}
                <div>
                  <label className={labelClass}>Today&apos;s Target (Hours)</label>
                  <input type="range" min="0" max="12" step="0.5" value={Number(pacingTargetInput)} onChange={(event) => setPacingTargetInput(event.target.value)} className="w-full accent-[#288028]" />
                  <input type="number" min="0" max="12" step="0.5" value={pacingTargetInput} onChange={(event) => setPacingTargetInput(event.target.value)} className={`mt-3 ${inputClass}`} />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowPacingModal(false)} className={cancelBtnClass}>Cancel</button>
                  <button type="submit" disabled={!targetCourse} className={submitBtnClass}>Save Target</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </section>

      {isSessionModalOpen ? (
        <div className={modalOverlayClass}>
          <div className={modalPanelClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Add Study Session</h2>
              <button type="button" onClick={closeSessionModal} aria-label="Close modal" className="rounded-xl p-1 text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] hover:text-black">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label htmlFor="session_course_id" className={labelClass}>Course</label>
                <select id="session_course_id" value={sessionForm.course_id} onChange={(event) => setSessionForm((prev) => ({ ...prev, course_id: event.target.value }))} required className={inputClass}>
                  <option value="" disabled>Select a course</option>
                  {courses.map((course) => (<option key={course.id} value={course.id}>{course.course_code} - {course.course_name}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="session_title" className={labelClass}>Title</label>
                <input id="session_title" type="text" value={sessionForm.title} onChange={(event) => setSessionForm((prev) => ({ ...prev, title: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="session_date" className={labelClass}>Date</label>
                <input id="session_date" type="date" value={sessionForm.date} onChange={(event) => setSessionForm((prev) => ({ ...prev, date: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="session_start_time" className={labelClass}>Start Time</label>
                <input id="session_start_time" type="time" value={sessionForm.start_time} onChange={(event) => setSessionForm((prev) => ({ ...prev, start_time: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="session_duration" className={labelClass}>Duration (Minutes)</label>
                <input id="session_duration" type="number" min="1" value={sessionForm.duration_minutes} onChange={(event) => setSessionForm((prev) => ({ ...prev, duration_minutes: event.target.value }))} required className={inputClass} />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeSessionModal} disabled={submitting} className={cancelBtnClass}>Cancel</button>
                <button type="submit" disabled={submitting || courses.length === 0} className={submitBtnClass}>{submitting ? "Adding..." : "Add Session"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isCourseModalOpen ? (
        <div className={modalOverlayClass}>
          <div className={modalPanelClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Add Course</h2>
              <button type="button" onClick={closeCourseModal} aria-label="Close modal" className="rounded-xl p-1 text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] hover:text-black">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label htmlFor="course_code" className={labelClass}>Course Code</label>
                <input id="course_code" type="text" value={courseForm.course_code} onChange={(event) => setCourseForm((prev) => ({ ...prev, course_code: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="course_name" className={labelClass}>Course Name</label>
                <input id="course_name" type="text" value={courseForm.course_name} onChange={(event) => setCourseForm((prev) => ({ ...prev, course_name: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="course_credits" className={labelClass}>Credits</label>
                <input id="course_credits" type="number" min="0" step="0.5" value={courseForm.credits} onChange={(event) => setCourseForm((prev) => ({ ...prev, credits: event.target.value }))} required className={inputClass} />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeCourseModal} disabled={submitting} className={cancelBtnClass}>Cancel</button>
                <button type="submit" disabled={submitting} className={submitBtnClass}>{submitting ? "Adding..." : "Add Course"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isAssessmentModalOpen ? (
        <div className={modalOverlayClass}>
          <div className={modalPanelClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Add Assessment</h2>
              <button type="button" onClick={closeAssessmentModal} aria-label="Close modal" className="rounded-xl p-1 text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] hover:text-black">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div>
                <label htmlFor="assessment_course" className={labelClass}>Course</label>
                <select id="assessment_course" value={assessmentForm.course_id} onChange={(event) => setAssessmentForm((prev) => ({ ...prev, course_id: event.target.value }))} required className={inputClass}>
                  <option value="" disabled>Select a course</option>
                  {courses.map((course) => (<option key={course.id} value={course.id}>{course.course_code} - {course.course_name}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="assessment_title" className={labelClass}>Title</label>
                <input id="assessment_title" type="text" value={assessmentForm.title} onChange={(event) => setAssessmentForm((prev) => ({ ...prev, title: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="assessment_type" className={labelClass}>Type</label>
                <select id="assessment_type" value={assessmentForm.assessment_type} onChange={(event) => setAssessmentForm((prev) => ({ ...prev, assessment_type: event.target.value }))} required className={inputClass}>
                  <option value="Exam">Exam</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Project">Project</option>
                </select>
              </div>
              <div>
                <label htmlFor="assessment_due_date" className={labelClass}>Due Date</label>
                <input id="assessment_due_date" type="date" value={assessmentForm.due_date} onChange={(event) => setAssessmentForm((prev) => ({ ...prev, due_date: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="assessment_weight" className={labelClass}>Weight Percentage</label>
                <input id="assessment_weight" type="number" min="1" max="100" value={assessmentForm.weight_percentage} onChange={(event) => setAssessmentForm((prev) => ({ ...prev, weight_percentage: event.target.value }))} required className={inputClass} />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeAssessmentModal} disabled={submitting} className={cancelBtnClass}>Cancel</button>
                <button type="submit" disabled={submitting} className={submitBtnClass}>{submitting ? "Adding..." : "Add Assessment"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isQuestModalOpen ? (
        <div className={modalOverlayClass}>
          <div className="w-full max-w-2xl rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Import from Quest</h2>
              <button type="button" onClick={closeQuestModal} aria-label="Close modal" disabled={isImporting} className="rounded-xl p-1 text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] hover:text-black disabled:opacity-60">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            <p className="mb-5 text-sm text-[#6C757D]">
              Go to Quest &gt; Enroll &gt; My Class Schedule &gt; List View. Press Ctrl+A to select all, copy, and paste it below.
            </p>
            <form onSubmit={handleImportQuest} className="space-y-4">
              <div>
                <textarea value={questText} onChange={(event) => setQuestText(event.target.value)} placeholder="Paste your Quest List View text here..." className="min-h-[220px] w-full rounded-xl border border-[#E9ECEF] bg-white px-3 py-2 text-sm text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 placeholder:text-[#ADB5BD] transition-all duration-200" required />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeQuestModal} disabled={isImporting} className={cancelBtnClass}>Cancel</button>
                <button type="submit" disabled={isImporting || questText.trim().length === 0} className={submitBtnClass}>{isImporting ? "Importing..." : "Import Courses"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

```

### `./frontend/src/app/dashboard/schedule/page.tsx`

```tsx
"use client";

export { default } from "../calendar/page";


```

### `./frontend/src/app/dashboard/settings/page.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type User = {
  id: string;
  email: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get<User>("/auth/me");
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8 p-6 md:p-8">
      <section>
        <h1 className="text-2xl font-semibold text-black">Settings</h1>
        <p className="mt-1 text-sm text-[#6C757D]">Manage your account and preferences.</p>
      </section>

      {loading ? (
        <div className="rounded-xl border border-[#E9ECEF] bg-white p-8 shadow-sm text-sm text-[#6C757D]">
          Loading settings...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-black">Profile Information</h2>
            <div className="mt-5 space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[#6C757D]">
                Email
              </label>
              <input
                id="email"
                type="email"
                readOnly
                value={user?.email ?? ""}
                className="h-10 w-full rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] px-3 text-sm text-[#6C757D] outline-none"
              />
            </div>
          </section>

          <section className="rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-black">Account Actions</h2>
            <p className="mt-3 text-sm text-[#6C757D]">
              Sign out of your account on this device. You can sign in again at any time.
            </p>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                <span className="material-symbols-outlined !text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

```

### `./frontend/src/app/globals.css`

```css
@import "tailwindcss";

@theme {
  --color-background: #F8F9FA;
  --color-card: #FFFFFF;
  --color-border: #E9ECEF;
  --color-text-primary: #000000;
  --color-text-secondary: #6C757D;
  --color-accent: #288028;
  --color-accent-light: #e8f5e8;

  --font-display: "Inter", sans-serif;
}

@layer base {
  body {
    font-family: var(--font-display);
    background-color: var(--color-background);
    color: var(--color-text-primary);
  }

  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined' !important;
    font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
    font-size: 24px;
    line-height: 1;
    display: inline-block;
  }

  .filled-icon {
    font-variation-settings: 'FILL' 1, 'wght' 300;
  }
}

```

### `./frontend/src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Load Optimizer",
  description: "AI-Powered Study Planning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#F8F9FA] text-black">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

```

### `./frontend/src/app/login/page.tsx`

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import api from "@/lib/api";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password
      });

      const token = response.data?.access_token;

      if (!token) {
        throw new Error("Missing access token in login response.");
      }

      localStorage.setItem("token", token);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("FastAPI Error Response:", error.response?.data);
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-xl border border-[#E9ECEF] bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-[#288028] flex items-center justify-center">
              <span className="material-symbols-outlined text-white !text-[16px]">query_stats</span>
            </div>
            <span className="text-lg font-semibold">StudyLoad</span>
          </div>
          <h1 className="text-2xl font-semibold text-black">Welcome back</h1>
          <p className="mt-1 text-sm text-[#6C757D]">
            Log in to continue to your study dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#6C757D]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
                className="w-full rounded-xl border border-[#E9ECEF] px-3 py-2 text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#6C757D]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                required
                className="w-full rounded-xl border border-[#E9ECEF] px-3 py-2 text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 transition-colors"
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6C757D]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-black underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

```

### `./frontend/src/app/page.tsx`

```tsx
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}

```

### `./frontend/src/app/register/page.tsx`

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import api from "@/lib/api";

type RegisterFormData = {
  email: string;
  full_name: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    full_name: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", formData);
      router.push("/login");
    } catch {
      setError("Registration failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-xl border border-[#E9ECEF] bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-[#288028] flex items-center justify-center">
              <span className="material-symbols-outlined text-white !text-[16px]">query_stats</span>
            </div>
            <span className="text-lg font-semibold">StudyLoad</span>
          </div>
          <h1 className="text-2xl font-semibold text-black">Create account</h1>
          <p className="mt-1 text-sm text-[#6C757D]">
            Register to start planning your study load.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#6C757D]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
                className="w-full rounded-xl border border-[#E9ECEF] px-3 py-2 text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-[#6C757D]">
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                }
                required
                className="w-full rounded-xl border border-[#E9ECEF] px-3 py-2 text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#6C757D]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                required
                className="w-full rounded-xl border border-[#E9ECEF] px-3 py-2 text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 transition-colors"
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6C757D]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-black underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

```

### `./frontend/src/app/utils/dateHelpers.ts`

```tsx
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function parseLocalDate(dateString: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString.replace(/-/g, "/"));
  }
  return new Date(dateString);
}

export function getRelativeDateLabel(dateString: string) {
  const today = startOfDay(new Date());
  const dueDate = startOfDay(parseLocalDate(dateString));
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / MS_PER_DAY);

  if (diffDays < 0) return "OVERDUE";
  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "TOMORROW";
  if (diffDays <= 7) return `IN ${diffDays} DAYS`;
  return `IN ${diffDays} DAYS`;
}

```

### `./frontend/src/components/auth/ProtectedRoute.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the token exists in the browser
    const token = localStorage.getItem('token');
    
    if (!token) {
      // If no token, kick them to the login page
      router.push('/login');
    } else {
      // If token exists, unlock the dashboard
      setIsAuthenticated(true);
    }
  }, [router]);

  // Don't render the dashboard HTML until we confirm they are allowed to see it
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-gray">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ); 
  }

  return <>{children}</>;
}
```

### `./frontend/src/components/layout/Header.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface User {
  full_name: string;
  email: string;
}

interface SearchCourse {
  id: string;
  course_code: string;
  course_name: string;
}

interface SearchAssessment {
  id: string;
  title: string;
  assessment_type: string;
}

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/schedule": "Schedule",
  "/dashboard/courses": "Courses",
  "/dashboard/insights": "Insights",
  "/dashboard/settings": "Settings",
  "/dashboard/assessments": "Assessments",
  "/dashboard/calendar": "Calendar",
};

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    courses: SearchCourse[];
    assessments: SearchAssessment[];
  }>({ courses: [], assessments: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const runSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults({ courses: [], assessments: [] });
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const [coursesResponse, assessmentsResponse] = await Promise.all([
          api.get<SearchCourse[]>('/courses/'),
          api.get<SearchAssessment[]>('/assessments/'),
        ]);

        const query = searchQuery.toLowerCase();
        const courses = coursesResponse.data.filter(
          (course) =>
            course.course_code.toLowerCase().includes(query) ||
            course.course_name.toLowerCase().includes(query),
        );
        const assessments = assessmentsResponse.data.filter(
          (assessment) =>
            assessment.title.toLowerCase().includes(query) ||
            assessment.assessment_type.toLowerCase().includes(query),
        );

        setSearchResults({ courses, assessments });
      } catch (error) {
        console.error("Failed to search data:", error);
        setSearchResults({ courses: [], assessments: [] });
      } finally {
        setIsSearching(false);
      }
    };

    void runSearch();
  }, [searchQuery]);

  const displayName = user?.full_name || user?.email || 'Loading...';
  const hasResults = searchResults.courses.length > 0 || searchResults.assessments.length > 0;

  // Build breadcrumb
  const currentPage = breadcrumbMap[pathname] || (pathname.includes("/courses/") ? "Course Detail" : "Page");

  return (
    <header className="h-14 bg-white border-b border-[#E9ECEF] flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-[#6C757D] hover:text-black transition-colors">Home</Link>
        <span className="text-[#CED4DA]">›</span>
        <span className="text-[#6C757D]">Winter 2025</span>
        <span className="text-[#CED4DA]">›</span>
        <span className="font-semibold text-black">{currentPage}</span>
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D] group-focus-within:text-[#288028] !text-[18px]">search</span>
          <input
            className="w-64 pl-9 pr-4 py-1.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#288028]/20 focus:border-[#288028] placeholder:text-[#ADB5BD] transition-colors"
            placeholder="Search..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length >= 2 ? (
            <div className="absolute top-full mt-2 w-full max-w-md rounded-xl border border-[#E9ECEF] bg-white p-2 shadow-lg z-50">
              {isSearching ? (
                <p className="px-2 py-2 text-sm text-[#6C757D]">Searching...</p>
              ) : !hasResults ? (
                <p className="px-2 py-2 text-sm text-[#6C757D]">No results for &quot;{searchQuery}&quot;</p>
              ) : (
                <div className="space-y-1">
                  {searchResults.courses.map((course) => (
                    <button
                      key={`course-${course.id}`}
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults({ courses: [], assessments: [] });
                      }}
                      className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-[#F8F9FA] cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#6C757D] !text-[18px]">book_5</span>
                      <span className="text-sm text-black">{course.course_code}</span>
                    </button>
                  ))}
                  {searchResults.assessments.map((assessment) => (
                    <button
                      key={`assessment-${assessment.id}`}
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults({ courses: [], assessments: [] });
                      }}
                      className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-[#F8F9FA] cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#6C757D] !text-[18px]">add_task</span>
                      <span className="text-sm text-black">{assessment.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Notification */}
        <button
          type="button"
          className="relative text-[#6C757D] hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined !text-[22px]">notifications</span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full overflow-hidden border border-[#E9ECEF]">
            <img
              alt="User Profile"
              className="h-full w-full object-cover"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=288028&color=ffffff&size=32`}
            />
          </div>
          <span className="text-sm font-medium text-black hidden lg:block">{displayName}</span>
        </div>
      </div>
    </header>
  );
}

```

### `./frontend/src/components/layout/Sidebar.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

type Course = {
  id: string;
  course_code: string;
  course_name: string;
};

const navLinks = [
  { href: "/dashboard", icon: "grid_view", label: "Home" },
  { href: "/dashboard/schedule", icon: "calendar_today", label: "Schedule" },
  { href: "/dashboard/insights", icon: "analytics", label: "Insights" },
  { href: "/dashboard/settings", icon: "settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [courses, setCourses] = useState<Course[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get<Course[]>("/courses/");
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses for sidebar:", error);
      }
    };
    fetchCourses();

    const handleUpdate = () => void fetchCourses();
    window.addEventListener("courses-updated", handleUpdate);
    window.addEventListener("assessments-updated", handleUpdate);
    return () => {
      window.removeEventListener("courses-updated", handleUpdate);
      window.removeEventListener("assessments-updated", handleUpdate);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isCourseActive = (courseId: string) =>
    pathname === `/dashboard/courses/${courseId}`;

  const allCoursesActive =
    pathname.startsWith("/dashboard/courses") &&
    !courses.some((c) => isCourseActive(c.id));

  const labelTx =
    "transition-[opacity,transform,width] duration-[400ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]";
  const labelOn = "opacity-100 translate-x-0 w-auto";
  const labelOff =
    "opacity-0 -translate-x-3 w-0 pointer-events-none overflow-hidden";

  const ease = "cubic-bezier(0.25, 0.1, 0.25, 1)";

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/10 lg:hidden transition-opacity duration-300 ${
          expanded ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setExpanded(false)}
      />

      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          width: expanded ? 300 : 200,
          transition: `width 400ms ${ease}`,
        }}
        className="bg-white border-r border-[#E9ECEF] flex flex-col items-start shrink-0 z-40 overflow-hidden"
      >
        {/* ─────────────────────── Logo ─────────────────────── */}
        <div className={`flex justify-start items-center gap-3 px-6 w-full transition-all duration-[400ms] ${expanded ? 'pt-4 pb-2' : 'pt-4 pb-3'}`}>
          {/* Logo fills the available width minus padding, no fixed px size */}
          <div className={`shrink-0 rounded-lg overflow-hidden transition-all duration-[400ms] ${expanded ? 'max-w-[36px]' : 'max-w-[40px]'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/syllabi-logo.svg"
              alt="Syllabi"
              className="w-full h-auto object-contain"
            />
          </div>
          <div
            className={`flex flex-col justify-center whitespace-nowrap min-w-0 shrink-0 ${labelTx} ${
              expanded ? labelOn : labelOff
            }`}
          >
            <span className="text-[16px] font-semibold text-slate-800 leading-none">
              Syllabi
            </span>
            <span className="text-[11px] font-normal text-slate-400 mt-1">
              Study Planner
            </span>
          </div>
        </div>

        {/* ─────────────────────── Nav ─────────────────────── */}
        <nav className="flex flex-col space-y-1 px-6 w-full">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  group relative flex justify-start items-center gap-4 h-10 rounded-lg overflow-hidden
                  transition-[background-color,color] duration-150 ease-out
                  ${active
                    ? "bg-[#F0FDF4] text-slate-800"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }
                `}
              >
                {active && (
                  <span className="absolute left-0 inset-y-0 w-[4px] rounded-r-full bg-[#22C55E]" />
                )}

                <span className="pl-3 shrink-0">
                  <span
                    className={`material-symbols-outlined !text-[20px] ${
                      active ? "filled-icon text-slate-800" : ""
                    }`}
                  >
                    {link.icon}
                  </span>
                </span>

                <span
                  className={`text-[13px] font-medium whitespace-nowrap ${labelTx} ${
                    expanded ? labelOn : labelOff
                  }`}
                >
                  {link.label}
                </span>

                {!expanded && (
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 pointer-events-none -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out z-50">
                    {link.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ─────────────────────── Divider ─────────────────────── */}
        <div className="h-px bg-slate-100 my-4 mx-6 w-[calc(100%-48px)]" />

        {/* ─────────────────────── Courses ─────────────────────── */}
        <div className="flex flex-col space-y-1 flex-1 overflow-y-auto overflow-x-hidden px-6 w-full">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 pl-3">
            {expanded ? "Courses" : "•••"}
          </span>

          {courses.map((course) => {
            const active = isCourseActive(course.id);
            return (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}`}
                className={`
                  group relative flex justify-start items-center gap-4 h-10 rounded-lg overflow-hidden
                  transition-[background-color,color] duration-150 ease-out
                  ${active
                    ? "bg-[#F0FDF4] text-slate-800"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }
                `}
              >
                {active && (
                  <span className="absolute left-0 inset-y-0 w-[4px] rounded-r-full bg-[#22C55E]" />
                )}

                <span className="pl-3 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wide">
                    {course.course_code.replace(/\s+/g, "").slice(0, 7)}
                  </span>
                </span>

                <span
                  className={`text-[12px] font-normal text-slate-400 truncate min-w-0 ${labelTx} ${
                    expanded ? labelOn : labelOff
                  }`}
                >
                  {course.course_name}
                </span>

                {!expanded && (
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 pointer-events-none -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out z-50">
                    {course.course_code}
                  </span>
                )}
              </Link>
            );
          })}

          {courses.length === 0 && (
            <Link
              href="/dashboard/courses"
              className="group relative flex justify-start items-center gap-4 h-10 rounded-lg overflow-hidden text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-[background-color,color] duration-150 ease-out"
            >
              <span className="pl-3 shrink-0">
                <span className="material-symbols-outlined !text-[20px] transition-transform duration-200 group-hover:rotate-90">
                  add
                </span>
              </span>
              <span
                className={`text-[13px] font-medium whitespace-nowrap ${labelTx} ${
                  expanded ? labelOn : labelOff
                }`}
              >
                Add courses
              </span>
              {!expanded && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 pointer-events-none -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out z-50">
                  Add courses
                </span>
              )}
            </Link>
          )}
        </div>

        {/* ─────────────────────── Bottom: All Courses ─────────────────────── */}
        <div className="px-6 pb-4 pt-2 w-full">
          <Link
            href="/dashboard/courses"
            className={`
              group relative flex justify-start items-center gap-4 h-10 rounded-lg overflow-hidden
              transition-[background-color,color] duration-150 ease-out
              ${allCoursesActive
                ? "bg-[#F0FDF4] text-slate-800"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }
            `}
          >
            {allCoursesActive && (
              <span className="absolute left-0 inset-y-0 w-[4px] rounded-r-full bg-[#22C55E]" />
            )}
            <span className="pl-3 shrink-0">
              <span
                className={`material-symbols-outlined !text-[20px] ${
                  allCoursesActive ? "filled-icon" : ""
                }`}
              >
                book_5
              </span>
            </span>
            <span
              className={`text-[13px] font-medium whitespace-nowrap ${labelTx} ${
                expanded ? labelOn : labelOff
              }`}
            >
              All Courses
            </span>
            {!expanded && (
              <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 pointer-events-none -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out z-50">
                All Courses
              </span>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}

```

### `./frontend/src/lib/api.ts`

```tsx
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;

```

### `./frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}

```

### `./pytest.ini`

```ini
[pytest]
pythonpath = backend

```

### `./tests/__init__.py`

```python

```

### `./tests/conftest.py`

```python
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

```

### `./tests/README.md`

```markdown
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

```

### `./tests/test_example.py`

```python
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

```

### `./tests/test_planner.py`

```python
"""
Integration tests for the study plan generator.
"""

from datetime import date, time, timedelta
from app.models.course import Course
from app.models.assessment import Assessment
from app.models.availability import Availability
from app.models.study_block import StudyBlock


def test_generate_plan_idempotency(client, db_session, test_user, auth_headers):
    """
    Test that plan generation is idempotent - regenerating for the same date range
    should not create duplicate blocks.
    """
    # Setup: Create a Course for the test user
    course = Course(
        user_id=test_user.id,
        code="CS135",
        name="Designing Functional Programs",
        color="#3b82f6",
    )
    db_session.add(course)
    db_session.commit()
    db_session.refresh(course)
    
    # Setup: Create an Assessment for the course
    # Must have status != 'done' and hours_completed < expected_hours for planner to pick it up
    assessment = Assessment(
        user_id=test_user.id,
        course_id=course.id,
        title="Assignment 1",
        type="assignment",
        due_date=date.today() + timedelta(days=5),  # Due in 5 days
        weight_percent=25.0,
        expected_hours=10.0,
        hours_completed=0.0,
        status="not_started",
    )
    db_session.add(assessment)
    db_session.commit()
    db_session.refresh(assessment)
    
    # Setup: Create Availability records so the planner can generate blocks
    # Create availability for multiple days of the week
    days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    for day in days_of_week:
        availability = Availability(
            user_id=test_user.id,
            day_of_week=day,
            start_time=time(9, 0),  # 9:00 AM
            end_time=time(17, 0),  # 5:00 PM
        )
        db_session.add(availability)
    db_session.commit()
    
    # Define date range for the plan
    start_date = date.today()
    end_date = date.today() + timedelta(days=7)
    
    # First Generation: Generate the plan
    response1 = client.post(
        "/api/v1/plan/generate",
        json={
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
        },
        headers=auth_headers,
    )
    
    # Assert first generation was successful
    assert response1.status_code == 201, f"Expected 201, got {response1.status_code}: {response1.text}"
    response_data1 = response1.json()
    assert "blocks_created" in response_data1
    assert response_data1["blocks_created"] > 0, "No blocks were created in first generation"
    first_generation_count = response_data1["blocks_created"]
    
    # Query the database to verify blocks were created
    blocks_after_first = db_session.query(StudyBlock).filter(
        StudyBlock.user_id == test_user.id
    ).all()
    assert len(blocks_after_first) == first_generation_count, \
        f"Expected {first_generation_count} blocks, found {len(blocks_after_first)}"
    
    # Second Generation (The Idempotency Check): Generate the plan again
    response2 = client.post(
        "/api/v1/plan/generate",
        json={
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
        },
        headers=auth_headers,
    )
    
    # Assert second generation was successful (not 409 Conflict)
    assert response2.status_code == 201, \
        f"Expected 201, got {response2.status_code}: {response2.text}. " \
        f"This indicates the plan generation is not idempotent."
    response_data2 = response2.json()
    assert "blocks_created" in response_data2
    second_generation_count = response_data2["blocks_created"]
    
    # Query the database for all StudyBlock records for this user
    blocks_after_second = db_session.query(StudyBlock).filter(
        StudyBlock.user_id == test_user.id
    ).all()
    total_blocks = len(blocks_after_second)
    
    # Assert that the total number of blocks hasn't doubled
    # It should be approximately equal to the second generation count
    # (allowing for small variations due to timing/availability differences)
    assert total_blocks <= first_generation_count + 2, \
        f"Total blocks ({total_blocks}) is too high. " \
        f"Expected around {second_generation_count}, suggesting old blocks were not deleted. " \
        f"First generation: {first_generation_count}, Second generation: {second_generation_count}"
    
    # More strict assertion: total should be close to second generation count
    # (allowing for 1-2 block difference due to planner algorithm variations)
    assert abs(total_blocks - second_generation_count) <= 2, \
        f"Total blocks ({total_blocks}) doesn't match second generation count ({second_generation_count}). " \
        f"This suggests old blocks were not properly deleted before creating new ones."

```

