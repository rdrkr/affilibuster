# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy model for UserPreferences entity.

Reference: data-model.md:666-677
"""

import uuid as uuid_module
from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Enum, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from affilibuster_backend.domain.entities.generated.models import CurrencyCode, LanguageCode
from affilibuster_backend.infrastructure.database.models import Base


class UserPreferencesModel(Base):
    """
    SQLAlchemy model for user_preferences table.

    Maps to domain entity: domain.entities.user_preferences.UserPreferences
    """

    __tablename__ = "user_preferences"

    # Primary Key
    id: Mapped[uuid_module.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid_module.uuid4)

    # Session/User Identifiers
    session_id: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    user_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Currency and Language as enums (sourced from OpenAPI-generated models)
    # Store as VARCHAR strings, not PostgreSQL enum types
    selected_currency: Mapped[CurrencyCode] = mapped_column(
        Enum(CurrencyCode, native_enum=False, length=10), nullable=False, default=CurrencyCode.USD
    )
    detected_language: Mapped[LanguageCode | None] = mapped_column(
        Enum(LanguageCode, native_enum=False, length=10), nullable=True
    )

    # Preferences
    dismissed_language_prompt: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
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
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # Constraints
    __table_args__ = (UniqueConstraint("session_id", name="uq_session_id"),)

    def __repr__(self) -> str:
        """Return string representation of UserPreferencesModel."""
        return (
            f"<UserPreferencesModel(id='{self.id}', "
            f"session_id='{self.session_id}', "
            f"currency='{self.selected_currency}')>"
        )
