# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy model for UserPreferences entity.

Reference: data-model.md:666-677
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID

from . import Base


class UserPreferencesModel(Base):
    """
    SQLAlchemy model for user_preferences table.

    Maps to domain entity: domain.entities.user_preferences.UserPreferences
    """

    __tablename__ = "user_preferences"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Session/User Identifiers
    session_id = Column(String(100), nullable=False, unique=True)
    user_id = Column(String(100), nullable=True)

    # Currency and Language as strings (sourced from Strapi)
    selected_currency = Column(String(3), nullable=False, default="USD")
    detected_language = Column(String(2), nullable=True)

    # Preferences
    dismissed_language_prompt = Column(Boolean, nullable=False, default=False, server_default="false")

    # Audit Fields
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        server_default="NOW()",
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        onupdate=lambda: datetime.now(UTC).replace(tzinfo=None),
        server_default="NOW()",
    )
    expires_at = Column(DateTime, nullable=False)

    # Constraints
    __table_args__ = (UniqueConstraint("session_id", name="uq_session_id"),)

    def __repr__(self) -> str:
        """Return string representation of UserPreferencesModel."""
        return (
            f"<UserPreferencesModel(id='{self.id}', "
            f"session_id='{self.session_id}', "
            f"currency='{self.selected_currency}')>"
        )
