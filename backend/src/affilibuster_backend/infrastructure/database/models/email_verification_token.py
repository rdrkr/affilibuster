# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy model for EmailVerificationToken entity.

Maps the EmailVerificationToken domain entity to the email_verification_tokens
database table.
"""

import uuid as uuid_module
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from affilibuster_backend.infrastructure.database.models import Base


class EmailVerificationTokenModel(Base):
    """
    SQLAlchemy model for email_verification_tokens table.

    Maps to domain entity: domain.entities.email_verification_token.EmailVerificationToken

    Schema:
        - id: UUID primary key
        - user_id: Foreign key to users table
        - token_hash: SHA-256 hash of verification token (64 hex chars)
        - expires_at: Token expiration timestamp (typically 24 hours)
        - used_at: When token was used (NULL if unused)
        - created_at: Token creation timestamp

    Indexes:
        - idx_email_verification_tokens_user_id: For querying tokens by user
        - idx_email_verification_tokens_token_hash: For fast token lookup (unique)
        - idx_email_verification_tokens_expires_at: For cleanup of expired tokens
    """

    __tablename__ = "email_verification_tokens"

    # Primary Key
    id: Mapped[uuid_module.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid_module.uuid4)

    # Foreign Key to User
    user_id: Mapped[uuid_module.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Token Data
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)

    # Token Lifecycle
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    used_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Audit Fields
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        server_default="NOW()",
    )

    # Indexes
    __table_args__ = (
        Index("idx_email_verification_tokens_user_id", "user_id"),
        Index("idx_email_verification_tokens_token_hash", "token_hash", unique=True),
        Index("idx_email_verification_tokens_expires_at", "expires_at"),
    )

    def __repr__(self) -> str:
        """
        Return string representation of EmailVerificationTokenModel.

        Returns:
            String representation without sensitive data (token hash).
        """
        return f"<EmailVerificationTokenModel(id='{self.id}', user_id='{self.user_id}', used_at='{self.used_at}')>"
