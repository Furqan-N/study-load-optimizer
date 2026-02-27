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
