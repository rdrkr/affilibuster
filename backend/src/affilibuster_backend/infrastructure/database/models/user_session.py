# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy model for UserSession entity.

Maps the UserSession domain entity to the user_sessions database table.
"""

import uuid as uuid_module
from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from affilibuster_backend.infrastructure.database.models import Base


class UserSessionModel(Base):
    """
    SQLAlchemy model for user_sessions table.

    Maps to domain entity: domain.entities.user_session.UserSession

    Schema:
        - id: UUID primary key
        - user_id: Foreign key to users table
        - token_hash: SHA-256 hash of session token (64 hex chars)
        - expires_at: Session expiration timestamp
        - remember_me: Whether this is a long-lived "remember me" session
        - created_at: Session creation timestamp

    Indexes:
        - idx_user_sessions_user_id: For querying sessions by user
        - idx_user_sessions_token_hash: For fast token lookup (unique)
        - idx_user_sessions_expires_at: For cleanup of expired sessions
    """

    __tablename__ = "user_sessions"

    # Primary Key
    id: Mapped[uuid_module.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid_module.uuid4)

    # Foreign Key to User
    user_id: Mapped[uuid_module.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Session Token
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)

    # Session Metadata
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    remember_me: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    # Audit Fields
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        server_default="NOW()",
    )

    # Indexes
    __table_args__ = (
        Index("idx_user_sessions_user_id", "user_id"),
        Index("idx_user_sessions_token_hash", "token_hash", unique=True),
        Index("idx_user_sessions_expires_at", "expires_at"),
    )

    def __repr__(self) -> str:
        """
        Return string representation of UserSessionModel.

        Returns:
            String representation without sensitive data (token hash).
        """
        return f"<UserSessionModel(id='{self.id}', user_id='{self.user_id}', expires_at='{self.expires_at}')>"
