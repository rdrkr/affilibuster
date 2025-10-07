"""create_currencies_table

Revision ID: fd491fe02268
Revises: ed905301392f
Create Date: 2025-10-08 04:09:01.931853+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fd491fe02268'
down_revision: Union[str, None] = 'ed905301392f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'currencies',
        sa.Column('code', sa.VARCHAR(3), primary_key=True),
        sa.Column('name', sa.VARCHAR(100), nullable=False),
        sa.Column('symbol', sa.VARCHAR(10), nullable=False),
        sa.Column('decimal_places', sa.Integer, nullable=False, server_default='2'),
        sa.Column('symbol_position', sa.VARCHAR(10), nullable=False),
        sa.Column('thousands_separator', sa.VARCHAR(5), nullable=False),
        sa.Column('decimal_separator', sa.VARCHAR(5), nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('sort_order', sa.Integer, nullable=False),
        sa.CheckConstraint('decimal_places BETWEEN 0 AND 3', name='decimal_places_check'),
        sa.CheckConstraint("symbol_position IN ('before', 'after')", name='symbol_position_check'),
    )


def downgrade() -> None:
    op.drop_table('currencies')
