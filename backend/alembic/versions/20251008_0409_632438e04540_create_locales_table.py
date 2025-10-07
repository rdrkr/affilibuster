"""create_locales_table

Revision ID: 632438e04540
Revises: fd37572386c1
Create Date: 2025-10-08 04:09:03.150789+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '632438e04540'
down_revision: Union[str, None] = 'fd37572386c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'locales',
        sa.Column('code', sa.VARCHAR(10), primary_key=True),
        sa.Column('language_code', sa.VARCHAR(2), nullable=False),
        sa.Column('country_code', sa.VARCHAR(2), nullable=False),
        sa.Column('display_name', sa.VARCHAR(100), nullable=False),
        sa.Column('date_format', sa.VARCHAR(20), nullable=False),
        sa.Column('time_format', sa.VARCHAR(3), nullable=False),
        sa.Column('first_day_of_week', sa.Integer, nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.ForeignKeyConstraint(['language_code'], ['languages.code']),
        sa.CheckConstraint("time_format IN ('12h', '24h')", name='time_format_check'),
        sa.CheckConstraint('first_day_of_week BETWEEN 0 AND 6', name='first_day_of_week_check'),
    )


def downgrade() -> None:
    op.drop_table('locales')
