# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy model for URLRedirect entity.

Reference: data-model.md:642-650, T145 (URL redirect handling)

Stores URL redirect mappings for handling 301 permanent redirects
and 410 Gone status codes when URLs change or content is deleted.
"""

import uuid as uuid_module
from datetime import UTC, datetime

from sqlalchemy import CheckConstraint, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from affilibuster_backend.infrastructure.database.models import Base


class URLRedirectModel(Base):
    """
    SQLAlchemy model for url_redirects table.

    Stores redirect mappings for URL handling in frontend middleware.
    - 301: Permanent redirect from old path to new path
    - 410: Gone status (content deleted, to_path is null)
    """

    __tablename__ = "url_redirects"

    # Primary Key
    id: Mapped[uuid_module.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid_module.uuid4)

    # Redirect paths
    from_path: Mapped[str] = mapped_column(String(500), nullable=False, unique=True, index=True)
    to_path: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Null for 410 Gone

    # Status code (301 or 410)
    status_code: Mapped[int] = mapped_column(Integer, nullable=False)

    # Metadata
    reason: Mapped[str | None] = mapped_column(String(100), nullable=True)  # e.g., "slug_changed", "content_deleted"
    created_by: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Audit Fields
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        server_default="NOW()",
    )

    # Constraints
    __table_args__ = (CheckConstraint("status_code IN (301, 410)", name="ck_status_code"),)

    def __repr__(self) -> str:
        """Return string representation of URLRedirectModel."""
        return (
            f"<URLRedirectModel(id='{self.id}', "
            f"from_path='{self.from_path}', "
            f"to_path='{self.to_path}', "
            f"status_code={self.status_code})>"
        )
