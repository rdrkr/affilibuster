# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Create url_redirects table for 301/410 redirect handling.

Revision ID: 002
Revises: 001
Create Date: 2025-11-21 00:00:00.000000+00:00

This migration creates the url_redirects table for storing URL redirect mappings.

Reference: data-model.md:642-650, T145 (URL redirect handling)
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: str = "001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create url_redirects table."""
    op.create_table(
        "url_redirects",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("from_path", sa.String(500), nullable=False),
        sa.Column("to_path", sa.String(500), nullable=True),
        sa.Column("status_code", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(100), nullable=True),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("from_path", name="uq_url_redirects_from_path"),
        sa.CheckConstraint("status_code IN (301, 410)", name="ck_status_code"),
    )
    op.create_index("ix_url_redirects_from_path", "url_redirects", ["from_path"])


def downgrade() -> None:
    """Drop url_redirects table."""
    op.drop_index("ix_url_redirects_from_path", table_name="url_redirects")
    op.drop_table("url_redirects")
