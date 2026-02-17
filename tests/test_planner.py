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
