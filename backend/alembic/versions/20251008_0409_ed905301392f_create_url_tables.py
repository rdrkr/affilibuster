"""create_url_tables

Revision ID: ed905301392f
Revises: 89d924792f34
Create Date: 2025-10-08 04:09:01.583672+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'ed905301392f'
down_revision: Union[str, None] = '89d924792f34'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create url_routes table
    op.create_table(
        'url_routes',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('content_version_id', sa.UUID(), nullable=False),
        sa.Column('language_code', sa.VARCHAR(2), nullable=False),
        sa.Column('path', sa.VARCHAR(500), nullable=False, unique=True),
        sa.Column('slug', sa.VARCHAR(200), nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('is_primary', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('canonical_url', sa.VARCHAR(500), nullable=False),
        sa.Column('alternate_urls', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['content_version_id'], ['content_versions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['language_code'], ['languages.code']),
    )

    # Create indexes for url_routes
    op.create_index('idx_url_routes_content_version_id', 'url_routes', ['content_version_id'])
    op.create_index('idx_url_routes_path', 'url_routes', ['path'])

    # Create url_redirects table
    op.create_table(
        'url_redirects',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('from_path', sa.VARCHAR(500), nullable=False),
        sa.Column('to_primary_url_id', sa.UUID(), nullable=False),
        sa.Column('status_code', sa.Integer, nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('created_by', sa.VARCHAR(100), nullable=False),
        sa.Column('reason', sa.VARCHAR(50), nullable=True),
        sa.ForeignKeyConstraint(['to_primary_url_id'], ['url_routes.id']),
        sa.CheckConstraint('status_code IN (301, 410)', name='redirect_status_check'),
    )

    # Create index for url_redirects
    op.create_index('idx_url_redirects_from_path', 'url_redirects', ['from_path'])


def downgrade() -> None:
    op.drop_index('idx_url_redirects_from_path', 'url_redirects')
    op.drop_table('url_redirects')
    op.drop_index('idx_url_routes_path', 'url_routes')
    op.drop_index('idx_url_routes_content_version_id', 'url_routes')
    op.drop_table('url_routes')
