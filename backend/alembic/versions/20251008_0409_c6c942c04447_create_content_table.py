"""create_content_table

Revision ID: c6c942c04447
Revises: a473cece29af
Create Date: 2025-10-08 04:09:00.950416+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c6c942c04447'
down_revision: Union[str, None] = 'a473cece29af'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'content',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('type', sa.VARCHAR(20), nullable=False),
        sa.Column('status', sa.VARCHAR(20), nullable=False, server_default='draft'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('created_by', sa.VARCHAR(100), nullable=False),
        sa.Column('updated_by', sa.VARCHAR(100), nullable=False),
        sa.CheckConstraint("type IN ('page', 'product', 'article')", name='content_type_check'),
        sa.CheckConstraint("status IN ('draft', 'published', 'archived')", name='content_status_check'),
    )


def downgrade() -> None:
    op.drop_table('content')
