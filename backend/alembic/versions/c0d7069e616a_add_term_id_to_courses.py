"""add_term_id_to_courses

Revision ID: c0d7069e616a
Revises: 0d060bc0fd9d
Create Date: 2026-03-28 01:29:54.734217

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c0d7069e616a'
down_revision = '0d060bc0fd9d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Add as nullable first
    op.add_column('courses', sa.Column('term_id', sa.UUID(), nullable=True))

    # 2. Backfill: assign every existing course to the earliest term owned by
    #    the same user.  This handles multi-user databases correctly.
    op.execute("""
        UPDATE courses
        SET term_id = sub.first_term_id
        FROM (
            SELECT DISTINCT ON (t.user_id)
                   t.user_id,
                   t.id AS first_term_id
            FROM terms t
            ORDER BY t.user_id, t.year ASC, t.season ASC
        ) sub
        WHERE courses.user_id = sub.user_id
          AND courses.term_id IS NULL
    """)

    # 3. Make NOT NULL + add FK
    op.alter_column('courses', 'term_id', nullable=False)
    op.create_foreign_key('fk_courses_term_id', 'courses', 'terms', ['term_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('fk_courses_term_id', 'courses', type_='foreignkey')
    op.drop_column('courses', 'term_id')
