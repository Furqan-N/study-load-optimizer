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
