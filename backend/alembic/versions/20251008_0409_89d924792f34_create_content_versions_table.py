"""create_content_versions_table

Revision ID: 89d924792f34
Revises: c6c942c04447
Create Date: 2025-10-08 04:09:01.283910+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '89d924792f34'
down_revision: Union[str, None] = 'c6c942c04447'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'content_versions',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('content_id', sa.UUID(), nullable=False),
        sa.Column('language_code', sa.VARCHAR(2), nullable=False),
        sa.Column('title', sa.VARCHAR(500), nullable=False),
        sa.Column('slug', sa.VARCHAR(200), nullable=False),
        sa.Column('body', sa.TEXT(), nullable=False),
        sa.Column('excerpt', sa.TEXT(), nullable=True),
        sa.Column('meta_title', sa.VARCHAR(500), nullable=True),
        sa.Column('meta_description', sa.VARCHAR(1000), nullable=True),
        sa.Column('meta_keywords', postgresql.ARRAY(sa.TEXT()), nullable=True),
        sa.Column('custom_schema', postgresql.JSONB(), nullable=True),
        sa.Column('is_published', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('published_at', sa.TIMESTAMP(), nullable=True),
        sa.Column('translations', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['content_id'], ['content.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['language_code'], ['languages.code']),
        sa.UniqueConstraint('content_id', 'language_code', name='uq_content_language'),
        sa.UniqueConstraint('content_id', 'language_code', 'slug', name='uq_content_language_slug'),
    )

    # Create indexes
    op.create_index('idx_content_versions_content_id', 'content_versions', ['content_id'])
    op.create_index('idx_content_versions_language_code', 'content_versions', ['language_code'])
    op.create_index('idx_content_versions_slug', 'content_versions', ['slug'])


def downgrade() -> None:
    op.drop_index('idx_content_versions_slug', 'content_versions')
    op.drop_index('idx_content_versions_language_code', 'content_versions')
    op.drop_index('idx_content_versions_content_id', 'content_versions')
    op.drop_table('content_versions')
