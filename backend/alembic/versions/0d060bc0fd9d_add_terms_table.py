"""add_terms_table

Revision ID: 0d060bc0fd9d
Revises: 7e5713fe52ee
Create Date: 2026-03-28 00:40:30.921786

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0d060bc0fd9d'
down_revision = '7e5713fe52ee'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('terms',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('season', sa.String(), nullable=False),
    sa.Column('year', sa.Integer(), nullable=False),
    sa.Column('is_current', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('terms')
