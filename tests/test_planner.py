"""
Integration tests for the study plan generator.
"""

from datetime import date, time, timedelta
from app.models.course import Course
from app.models.term import Term

from app.models.assessment import Assessment
from app.models.availability import Availability
from app.models.study_block import StudyBlock


def test_generate_plan_creates_blocks(client, db_session, test_user, auth_headers):
    """
    Test that plan generation creates study blocks from assessments
    and user availability.
    """
    # Setup: Term → Course → Assessment
    term = Term(
        user_id=test_user.id,
        season="Winter",
        year=2026,
        sort_order=0,
    )
    db_session.add(term)
    db_session.commit()
    db_session.refresh(term)

    course = Course(
        user_id=test_user.id,
        term_id=term.id,
        course_code="CS135",
        course_name="Designing Functional Programs",
        credits=0.5,
        target_grade="85%",
        daily_target_hours=4.0,
    )
    db_session.add(course)
    db_session.commit()
    db_session.refresh(course)

    assessment = Assessment(
        user_id=test_user.id,
        course_id=course.id,
        title="Assignment 1",
        assessment_type="assignment",
        due_date=date.today() + timedelta(days=5),
        weight_percentage=20.0,
        is_completed=False,
    )
    db_session.add(assessment)
    db_session.commit()

    # Availability: Mon–Fri 9 AM – 5 PM
    for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
        db_session.add(
            Availability(
                user_id=test_user.id,
                day_of_week=day,
                start_time=time(9, 0),
                end_time=time(17, 0),
            )
        )
    db_session.commit()

    start_date = date.today()
    end_date = date.today() + timedelta(days=7)

    response = client.post(
        "/api/v1/plan/generate",
        json={
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
        },
        headers=auth_headers,
    )

    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert "blocks_created" in data
    assert data["blocks_created"] > 0, "No blocks were created"
    assert len(data["blocks"]) == data["blocks_created"]


def test_generate_plan_idempotency(client, db_session, test_user, auth_headers):
    """
    Test that regenerating a plan for the same date range does not
    duplicate blocks — old blocks are deleted first.
    """
    # Setup: Term → Course → Assessment
    term = Term(
        user_id=test_user.id,
        season="Winter",
        year=2026,
        sort_order=0,
    )
    db_session.add(term)
    db_session.commit()
    db_session.refresh(term)

    course = Course(
        user_id=test_user.id,
        term_id=term.id,
        course_code="CS135",
        course_name="Designing Functional Programs",
        credits=0.5,
        target_grade="85%",
        daily_target_hours=4.0,
    )
    db_session.add(course)
    db_session.commit()
    db_session.refresh(course)

    assessment = Assessment(
        user_id=test_user.id,
        course_id=course.id,
        title="Assignment 1",
        assessment_type="assignment",
        due_date=date.today() + timedelta(days=5),
        weight_percentage=20.0,
        is_completed=False,
    )
    db_session.add(assessment)
    db_session.commit()

    for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
        db_session.add(
            Availability(
                user_id=test_user.id,
                day_of_week=day,
                start_time=time(9, 0),
                end_time=time(17, 0),
            )
        )
    db_session.commit()

    payload = {
        "start_date": date.today().isoformat(),
        "end_date": (date.today() + timedelta(days=7)).isoformat(),
    }

    # First generation
    r1 = client.post("/api/v1/plan/generate", json=payload, headers=auth_headers)
    assert r1.status_code == 201
    first_count = r1.json()["blocks_created"]
    assert first_count > 0

    # Second generation (idempotency check)
    r2 = client.post("/api/v1/plan/generate", json=payload, headers=auth_headers)
    assert r2.status_code == 201
    second_count = r2.json()["blocks_created"]

    # Total blocks in DB should equal the second generation, not double.
    total = db_session.query(StudyBlock).filter(
        StudyBlock.user_id == test_user.id
    ).count()

    assert total == second_count, (
        f"Expected {second_count} blocks after regeneration, found {total}. "
        f"Old blocks were not deleted (first run created {first_count})."
    )


def test_generate_plan_no_assessments(client, db_session, test_user, auth_headers):
    """
    When there are no upcoming assessments the endpoint should return
    zero blocks without error.
    """
    response = client.post(
        "/api/v1/plan/generate",
        json={
            "start_date": date.today().isoformat(),
            "end_date": (date.today() + timedelta(days=7)).isoformat(),
        },
        headers=auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["blocks_created"] == 0
    assert data["blocks"] == []
