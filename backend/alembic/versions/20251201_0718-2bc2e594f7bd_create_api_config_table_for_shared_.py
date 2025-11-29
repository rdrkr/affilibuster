# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""Create api_config table for shared configuration.

Revision ID: 2bc2e594f7bd
Revises: 8231cb048e8c
Create Date: 2025-12-01 07:18:13.121248+00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "2bc2e594f7bd"
down_revision: str | Sequence[str] | None = "8231cb048e8c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema - Create api_config table."""
    op.create_table(
        "api_config",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("key", sa.String(length=255), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("key"),
    )
    op.create_index(op.f("ix_api_config_key"), "api_config", ["key"], unique=False)


def downgrade() -> None:
    """Downgrade schema - Drop api_config table."""
    op.drop_index(op.f("ix_api_config_key"), table_name="api_config")
    op.drop_table("api_config")
