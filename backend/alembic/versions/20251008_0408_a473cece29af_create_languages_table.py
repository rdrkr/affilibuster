"""create_languages_table

Revision ID: a473cece29af
Revises: 
Create Date: 2025-10-08 04:08:05.374453+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a473cece29af'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'languages',
        sa.Column('code', sa.VARCHAR(2), primary_key=True),
        sa.Column('display_name', sa.VARCHAR(100), nullable=False),
        sa.Column('native_name', sa.VARCHAR(100), nullable=False),
        sa.Column('direction', sa.VARCHAR(3), nullable=False),
        sa.Column('url_prefix', sa.VARCHAR(10), nullable=False),
        sa.Column('default_currency', sa.VARCHAR(3), nullable=False),
        sa.Column('locale_code', sa.VARCHAR(10), nullable=False),
        sa.Column('is_default', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('sort_order', sa.Integer, nullable=False),
        sa.CheckConstraint("direction IN ('ltr', 'rtl')", name='direction_check'),
    )

    # Create index on is_active for filtering
    op.create_index('ix_languages_is_active', 'languages', ['is_active'])


def downgrade() -> None:
    op.drop_index('ix_languages_is_active', 'languages')
    op.drop_table('languages')
