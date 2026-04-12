"""add processing_message to video

Revision ID: f3b1a2c4e5d6
Revises: 87f6c7656bb5
Create Date: 2026-04-12 17:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f3b1a2c4e5d6'
down_revision = '87f6c7656bb5'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('videos', sa.Column('processing_message', sa.String(), nullable=True))


def downgrade():
    op.drop_column('videos', 'processing_message')
