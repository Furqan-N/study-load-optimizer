"""add_sort_order_to_terms

Revision ID: a1b2c3d4e5f6
Revises: c0d7069e616a
Create Date: 2026-03-28 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'c0d7069e616a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('terms', sa.Column('sort_order', sa.Integer(), nullable=True))

    # Backfill: assign sort_order based on year desc, season for each user
    op.execute("""
        UPDATE terms
        SET sort_order = sub.rn
        FROM (
            SELECT id,
                   ROW_NUMBER() OVER (
                       PARTITION BY user_id
                       ORDER BY year DESC, season
                   ) - 1 AS rn
            FROM terms
        ) sub
        WHERE terms.id = sub.id
    """)

    op.alter_column('terms', 'sort_order', nullable=False, server_default='0')


def downgrade() -> None:
    op.drop_column('terms', 'sort_order')
