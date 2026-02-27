# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""NULL existing raw IP addresses in consent_records for GDPR compliance.

Revision ID: 006
Revises: 005
Create Date: 2026-02-27 12:00:00

This migration clears any raw IP addresses previously stored in consent records.
Going forward, the consent route hashes IPs at write time using salted SHA-256,
so this migration only needs to clear the legacy raw data.

GDPR References:
    - Article 5(1)(c): Data minimization
    - Article 25: Data protection by design and default
"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "006"
down_revision: str | None = "005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Set all existing raw ip_address and user_agent values to NULL."""
    op.execute(
        "UPDATE consent_records SET ip_address = NULL, user_agent = NULL"
        " WHERE ip_address IS NOT NULL OR user_agent IS NOT NULL"
    )


def downgrade() -> None:
    """No-op: raw IP data cannot be restored once cleared."""
