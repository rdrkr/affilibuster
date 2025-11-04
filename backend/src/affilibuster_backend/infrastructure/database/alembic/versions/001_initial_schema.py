# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Initial schema - create app-specific tables only.

Revision ID: 001
Revises:
Create Date: 2025-10-23 18:45:00.000000+00:00

This migration creates the initial database schema for the Affilibuster backend.

Architecture: Backend database contains only app-specific data:
- user_preferences: User session and preference settings

All user-facing content and system metadata comes directly from Strapi.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create initial schema tables."""
    # Create user_preferences table
    op.create_table(
        "user_preferences",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("session_id", sa.String(100), nullable=False),
        sa.Column("user_id", sa.String(100), nullable=True),
        sa.Column("selected_currency", sa.String(3), nullable=False, server_default="USD"),
        sa.Column("detected_language", sa.String(2), nullable=True),
        sa.Column(
            "dismissed_language_prompt",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_id", name="uq_session_id"),
    )
    op.create_index("ix_user_preferences_session_id", "user_preferences", ["session_id"])


def downgrade() -> None:
    """Drop all tables."""
    op.drop_index("ix_user_preferences_session_id", table_name="user_preferences")
    op.drop_table("user_preferences")
