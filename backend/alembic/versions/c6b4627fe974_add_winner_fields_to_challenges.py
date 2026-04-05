"""add winner fields to challenges

Revision ID: c6b4627fe974
Revises: beb747f01187
Create Date: 2026-04-05 21:16:46.679501

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c6b4627fe974'
down_revision: Union[str, Sequence[str], None] = 'beb747f01187'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Safely add columns
    op.add_column('challenge_entries', sa.Column('is_winner', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('challenges', sa.Column('winner_picked', sa.Boolean(), nullable=True, server_default='false'))


def downgrade() -> None:
    op.drop_column('challenges', 'winner_picked')
    op.drop_column('challenge_entries', 'is_winner')
