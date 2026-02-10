# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy model for ConsentRecord entity.

Stores GDPR-compliant consent records for cookie consent,
terms acceptance, and privacy policy acknowledgement.
"""

import uuid as uuid_module
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from affilibuster_backend.infrastructure.database.models import Base


class ConsentRecordModel(Base):
    """
    SQLAlchemy model for consent_records table.

    Stores an immutable audit trail of user consent decisions
    for GDPR compliance. Each row represents a single consent event
    (accept, reject, customize, or revoke).
    """

    __tablename__ = "consent_records"

    # Primary Key
    id: Mapped[uuid_module.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid_module.uuid4)

    # User identification (one of user_id or session_id should be set)
    user_id: Mapped[uuid_module.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    session_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)

    # Consent details
    consent_type: Mapped[str] = mapped_column(String(50), nullable=False)
    categories: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    action: Mapped[str] = mapped_column(String(20), nullable=False)

    # Request metadata for audit trail
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Version tracking for consent policy changes
    consent_version: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # Timestamp (immutable - consent records are append-only)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        server_default="NOW()",
    )

    def __repr__(self) -> str:
        """Return string representation of ConsentRecordModel."""
        return f"<ConsentRecordModel(id='{self.id}', consent_type='{self.consent_type}', action='{self.action}')>"
