# Copyright (c) 2026 Affilibuster by Ronen Druker.

"""Create users and user_sessions tables.

Revision ID: 007
Revises: 006
Create Date: 2026-02-28 14:00:00

These tables support user authentication and session management,
and are required by the GDPR data retention cleanup process.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = "007"
down_revision: str | None = "006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create users and user_sessions tables."""
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String(60), nullable=False),
        sa.Column("display_name", sa.String(100), nullable=False),
        sa.Column(
            "email_verified",
            sa.Boolean,
            nullable=False,
            server_default="false",
        ),
        sa.Column(
            "status",
            sa.String(20),
            nullable=False,
            server_default="active",
            index=True,
        ),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.text("NOW()")),
        sa.Column("last_login_at", sa.DateTime, nullable=True),
        sa.Column("deleted_at", sa.DateTime, nullable=True, index=True),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )

    op.create_table(
        "user_sessions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime, nullable=False),
        sa.Column(
            "remember_me",
            sa.Boolean,
            nullable=False,
            server_default="false",
        ),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.text("NOW()")),
        sa.Index("idx_user_sessions_user_id", "user_id"),
        sa.Index("idx_user_sessions_token_hash", "token_hash", unique=True),
        sa.Index("idx_user_sessions_expires_at", "expires_at"),
    )


def downgrade() -> None:
    """Drop user_sessions and users tables."""
    op.drop_table("user_sessions")
    op.drop_table("users")
