"""add brand and start_date to challenges

Revision ID: beb747f01187
Revises: ed2ee0262d0d
Create Date: 2026-04-05 20:52:13.272148

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'beb747f01187'
down_revision: Union[str, Sequence[str], None] = 'ed2ee0262d0d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Safely add columns to challenges table
    op.add_column('challenges', sa.Column('brand', sa.String(), nullable=True))
    op.add_column('challenges', sa.Column('start_date', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('challenges', 'start_date')
    op.drop_column('challenges', 'brand')
