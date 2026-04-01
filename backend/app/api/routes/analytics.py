from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.assessment import Assessment
from app.models.course import Course
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


@router.get("/grade-forecast")
async def get_grade_forecast(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    term_id: str | None = Query(default=None, description="Filter by term UUID."),
):
    """
    Per-course grade forecast.

    For each course returns:
      - earned:   weighted score from completed & graded assessments.
      - completed_weight: total weight% of assessments that are completed.
      - remaining_weight: total weight% still outstanding.
      - projected: estimated final grade assuming the student earns the same
        average rate on remaining work (returns null when nothing is graded).

    Response shape:
      [{ "course_id", "course_code", "course_name",
         "earned", "completed_weight", "remaining_weight", "projected" }, ...]
    """

    course_q = db.query(Course).filter(Course.user_id == current_user.id)
    if term_id:
        course_q = course_q.filter(Course.term_id == term_id)
    courses = course_q.all()

    results: list[dict] = []
    for course in courses:
        assessments = (
            db.query(Assessment)
            .filter(
                Assessment.user_id == current_user.id,
                Assessment.course_id == course.id,
            )
            .all()
        )

        earned = 0.0
        completed_weight = 0.0
        remaining_weight = 0.0

        for a in assessments:
            if a.is_completed and a.earned_score is not None:
                earned += a.earned_score * (a.weight_percentage / 100.0)
                completed_weight += a.weight_percentage
            else:
                remaining_weight += a.weight_percentage

        # Project final grade: assume same rate on remaining work.
        projected = None
        if completed_weight > 0:
            rate = earned / (completed_weight / 100.0)  # score per 100% weight
            projected = round(earned + rate * (remaining_weight / 100.0), 2)

        results.append(
            {
                "course_id": str(course.id),
                "course_code": course.course_code,
                "course_name": course.course_name,
                "earned": round(earned, 2),
                "completed_weight": round(completed_weight, 2),
                "remaining_weight": round(remaining_weight, 2),
                "projected": projected,
            }
        )

    return results

