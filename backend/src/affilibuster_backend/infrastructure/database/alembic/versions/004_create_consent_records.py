# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""Create consent_records table.

Revision ID: 004
Revises: 003
Create Date: 2026-02-10 10:00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "004"
down_revision: str | None = "003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create consent_records table for GDPR-compliant consent tracking."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if not inspector.has_table("consent_records"):
        op.create_table(
            "consent_records",
            sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("session_id", sa.String(length=100), nullable=True),
            sa.Column("consent_type", sa.String(length=50), nullable=False),
            sa.Column("categories", sa.dialects.postgresql.JSONB(), nullable=False),
            sa.Column("action", sa.String(length=20), nullable=False),
            sa.Column("ip_address", sa.String(length=45), nullable=True),
            sa.Column("user_agent", sa.Text(), nullable=True),
            sa.Column("consent_version", sa.String(length=50), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.text("NOW()"),
            ),
            sa.PrimaryKeyConstraint("id"),
        )

        # Create indexes for common query patterns
        op.create_index(op.f("ix_consent_records_user_id"), "consent_records", ["user_id"])
        op.create_index(op.f("ix_consent_records_session_id"), "consent_records", ["session_id"])
        op.create_index(op.f("ix_consent_records_created_at"), "consent_records", ["created_at"])


def downgrade() -> None:
    """Drop consent_records table."""
    op.drop_index(op.f("ix_consent_records_created_at"), table_name="consent_records")
    op.drop_index(op.f("ix_consent_records_session_id"), table_name="consent_records")
    op.drop_index(op.f("ix_consent_records_user_id"), table_name="consent_records")
    op.drop_table("consent_records")
