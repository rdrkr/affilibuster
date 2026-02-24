# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""Widen consent_version column from VARCHAR(20) to VARCHAR(50).

Revision ID: 005
Revises: 004
Create Date: 2026-02-24 16:00:00

The frontend sends CMS publishedAt timestamps as the consent version
(e.g. '2026-02-24T12:33:13.063000Z', 28 chars), which exceeded the
previous 20-character limit causing StringDataRightTruncationError.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "005"
down_revision: str | None = "004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Widen consent_version column to VARCHAR(50)."""
    op.alter_column(
        "consent_records",
        "consent_version",
        existing_type=sa.String(length=20),
        type_=sa.String(length=50),
        existing_nullable=True,
    )


def downgrade() -> None:
    """Revert consent_version column to VARCHAR(20)."""
    op.alter_column(
        "consent_records",
        "consent_version",
        existing_type=sa.String(length=50),
        type_=sa.String(length=20),
        existing_nullable=True,
    )
