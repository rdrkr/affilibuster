# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""Initial migration - auth tables.

Revision ID: 8231cb048e8c
Revises:
Create Date: 2025-11-23 17:09:29.422860+00:00
"""

from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "8231cb048e8c"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""


def downgrade() -> None:
    """Downgrade schema."""
