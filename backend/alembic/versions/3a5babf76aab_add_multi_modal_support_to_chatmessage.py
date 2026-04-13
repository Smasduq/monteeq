"""Add multi-modal support to ChatMessage

Revision ID: 3a5babf76aab
Revises: f3b1a2c4e5d6
Create Date: 2026-04-12 18:14:47.013924

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '3a5babf76aab'
down_revision: Union[str, Sequence[str], None] = 'f3b1a2c4e5d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add multi-modal columns to ChatMessage
    with op.batch_alter_table('chat_messages', schema=None) as batch_op:
        batch_op.add_column(sa.Column('message_type', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('attachment_url', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('file_metadata', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('chat_messages', schema=None) as batch_op:
        batch_op.drop_column('file_metadata')
        batch_op.drop_column('attachment_url')
        batch_op.drop_column('message_type')
