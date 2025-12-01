# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""add api_config table.

Revision ID: 003
Revises: 002
Create Date: 2025-12-01 10:59:00

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: str | None = "002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create api_config table for storing shared configuration values."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if not inspector.has_table("api_config"):
        op.create_table(
            "api_config",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("key", sa.String(length=255), nullable=False),
            sa.Column("value", sa.Text(), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("TIMEZONE('utc', CURRENT_TIMESTAMP)"),
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("TIMEZONE('utc', CURRENT_TIMESTAMP)"),
            ),
            sa.PrimaryKeyConstraint("id"),
        )

        # Create unique index on key field
        op.create_index(op.f("ix_api_config_key"), "api_config", ["key"], unique=True)


def downgrade() -> None:
    """Drop api_config table."""
    op.drop_index(op.f("ix_api_config_key"), table_name="api_config")
    op.drop_table("api_config")
