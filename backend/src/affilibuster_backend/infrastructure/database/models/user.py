# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy model for User entity.

Maps the User domain entity to the users database table.
"""

import uuid as uuid_module
from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Enum, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from affilibuster_backend.domain.entities.user import UserStatus
from affilibuster_backend.infrastructure.database.models import Base


class UserModel(Base):
    """
    SQLAlchemy model for users table.

    Maps to domain entity: domain.entities.user.UserEntity

    Schema:
        - id: UUID primary key
        - email: Unique email address (lowercase, max 255 chars)
        - hashed_password: Bcrypt password hash (60 chars)
        - display_name: User's display name (max 100 chars)
        - email_verified: Whether email is verified
        - status: Account status (active, locked, deleted)
        - created_at: Account creation timestamp
        - updated_at: Last update timestamp
        - last_login_at: Last successful login timestamp (nullable)
        - deleted_at: Soft deletion timestamp (nullable)
    """

    __tablename__ = "users"

    # Primary Key
    id: Mapped[uuid_module.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid_module.uuid4)

    # User Identity
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(60), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)

    # Email Verification
    email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    # Account Status
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus, native_enum=False, length=20),
        nullable=False,
        default=UserStatus.ACTIVE,
        server_default=UserStatus.ACTIVE.value,
        index=True,
    )

    # Audit Fields
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        server_default="NOW()",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        onupdate=lambda: datetime.now(UTC).replace(tzinfo=None),
        server_default="NOW()",
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)

    # Constraints
    __table_args__ = (UniqueConstraint("email", name="uq_users_email"),)

    def __repr__(self) -> str:
        """
        Return string representation of UserModel.

        Returns:
            String representation without sensitive data (password hash).
        """
        return f"<UserModel(id='{self.id}', email='{self.email}', status='{self.status}')>"
