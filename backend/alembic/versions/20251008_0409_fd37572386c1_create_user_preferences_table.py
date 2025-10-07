"""create_user_preferences_table

Revision ID: fd37572386c1
Revises: fd491fe02268
Create Date: 2025-10-08 04:09:02.439814+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fd37572386c1'
down_revision: Union[str, None] = 'fd491fe02268'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'user_preferences',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('session_id', sa.VARCHAR(100), nullable=False, unique=True),
        sa.Column('user_id', sa.VARCHAR(100), nullable=True),
        sa.Column('selected_currency', sa.VARCHAR(3), nullable=False),
        sa.Column('dismissed_language_prompt', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('detected_language', sa.VARCHAR(2), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('expires_at', sa.TIMESTAMP(), nullable=False),
        sa.ForeignKeyConstraint(['selected_currency'], ['currencies.code']),
        sa.ForeignKeyConstraint(['detected_language'], ['languages.code']),
    )

    # Create indexes
    op.create_index('idx_user_preferences_session_id', 'user_preferences', ['session_id'])
    op.create_index('idx_user_preferences_user_id', 'user_preferences', ['user_id'])


def downgrade() -> None:
    op.drop_index('idx_user_preferences_user_id', 'user_preferences')
    op.drop_index('idx_user_preferences_session_id', 'user_preferences')
    op.drop_table('user_preferences')
