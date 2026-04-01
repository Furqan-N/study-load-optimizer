"""
Study plan optimization service.

Constraint-based planner that generates optimized study blocks
based on upcoming assessments and user availability windows.
"""

from datetime import date, time, timedelta
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.assessment import Assessment
from app.models.availability import Availability
from app.models.study_block import StudyBlock

# Hours of study estimated per percentage-point of assessment weight.
HOURS_PER_WEIGHT_POINT = 0.5

# Maximum length (hours) of a single study block.
MAX_BLOCK_HOURS = 2.0


def get_day_name(d: date) -> str:
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return days[d.weekday()]


def time_to_minutes(t: time) -> int:
    return t.hour * 60 + t.minute


def minutes_to_time(minutes: int) -> time:
    return time(hour=minutes // 60, minute=minutes % 60)


def time_diff_hours(start: time, end: time) -> float:
    start_m = time_to_minutes(start)
    end_m = time_to_minutes(end)
    if end_m < start_m:
        end_m += 24 * 60
    return (end_m - start_m) / 60.0


def generate_study_plan(
    db: Session,
    user_id: UUID,
    start_date: date,
    end_date: date,
) -> List[StudyBlock]:
    """
    Generate an optimized study plan for the given date range.

    1. Fetches incomplete assessments and estimates hours needed from weight.
    2. Prioritises by due-date then weight (descending).
    3. Walks each day, computes free windows from availability minus
       existing blocks, and allocates study blocks into those windows.

    Returns a list of *unsaved* StudyBlock objects.
    """

    # --- data fetch -----------------------------------------------------------
    assessments = (
        db.query(Assessment)
        .filter(
            and_(
                Assessment.user_id == user_id,
                Assessment.is_completed.is_(False),
                Assessment.due_date >= start_date,
            )
        )
        .all()
    )

    availabilities = (
        db.query(Availability)
        .filter(Availability.user_id == user_id)
        .all()
    )

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

    # --- prioritisation -------------------------------------------------------
    assessments_sorted = sorted(
        assessments,
        key=lambda a: (
            a.due_date if a.due_date is not None else date.max,
            -a.weight_percentage,
        ),
    )

    # --- lookup structures ----------------------------------------------------
    blocks_by_date: dict[date, List[StudyBlock]] = {}
    for block in existing_blocks:
        blocks_by_date.setdefault(block.date, []).append(block)

    avail_by_day: dict[str, List[Availability]] = {}
    for avail in availabilities:
        avail_by_day.setdefault(avail.day_of_week, []).append(avail)

    # Estimate total hours needed per assessment from its weight.
    expected_hours: dict[UUID, float] = {
        a.id: a.weight_percentage * HOURS_PER_WEIGHT_POINT
        for a in assessments_sorted
    }
    hours_allocated: dict[UUID, float] = {a.id: 0.0 for a in assessments_sorted}

    new_blocks: List[StudyBlock] = []

    # --- day-by-day allocation ------------------------------------------------
    current = start_date
    while current <= end_date:
        day_name = get_day_name(current)
        day_avails = avail_by_day.get(day_name, [])

        # Build free windows for this day
        free_windows: list[tuple[time, time]] = []
        for avail in day_avails:
            window_start = avail.start_time
            window_end = avail.end_time

            for block in sorted(
                blocks_by_date.get(current, []), key=lambda b: b.start_time
            ):
                if block.start_time < window_end and block.end_time > window_start:
                    if block.start_time > window_start:
                        free_windows.append((window_start, block.start_time))
                    window_start = max(window_start, block.end_time)

            if window_start < window_end:
                free_windows.append((window_start, window_end))

        free_windows.sort(key=lambda w: w[0])
        available_windows = free_windows.copy()

        for assessment in assessments_sorted:
            remaining = expected_hours[assessment.id] - hours_allocated[assessment.id]
            if remaining <= 0:
                continue

            idx = 0
            while idx < len(available_windows) and remaining > 0:
                ws, we = available_windows[idx]
                window_dur = time_diff_hours(ws, we)
                if window_dur <= 0:
                    available_windows.pop(idx)
                    continue

                block_dur = min(window_dur, remaining, MAX_BLOCK_HOURS)
                block_end = minutes_to_time(time_to_minutes(ws) + round(block_dur * 60))
                actual_dur = time_diff_hours(ws, block_end)

                new_blocks.append(
                    StudyBlock(
                        user_id=user_id,
                        course_id=assessment.course_id,
                        assessment_id=assessment.id,
                        date=current,
                        start_time=ws,
                        end_time=block_end,
                        duration_hours=max(1, round(actual_dur)),
                        description=f"Study for {assessment.title}",
                    )
                )

                hours_allocated[assessment.id] += actual_dur
                remaining -= actual_dur

                if block_dur < window_dur:
                    available_windows[idx] = (block_end, we)
                    idx += 1
                else:
                    available_windows.pop(idx)

        current += timedelta(days=1)

    return new_blocks
