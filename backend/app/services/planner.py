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
