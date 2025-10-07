# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy model for UserPreferences entity.

Reference: data-model.md:666-677
"""

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from . import Base


class UserPreferencesModel(Base):
    """
    SQLAlchemy model for user_preferences table.

    Maps to domain entity: domain.entities.user_preferences.UserPreferences
    """

    __tablename__ = 'user_preferences'

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Session/User Identifiers
    session_id = Column(String(100), nullable=False, unique=True)
    user_id = Column(String(100), nullable=True)

    # Foreign Keys
    selected_currency = Column(String(3), ForeignKey('currencies.code'), nullable=False)
    detected_language = Column(String(2), ForeignKey('languages.code'), nullable=True)

    # Preferences
    dismissed_language_prompt = Column(Boolean, nullable=False, default=False, server_default='false')

    # Audit Fields
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default='NOW()')
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow, server_default='NOW()')
    expires_at = Column(DateTime, nullable=False)

    # Constraints
    __table_args__ = (
        UniqueConstraint('session_id', name='uq_session_id'),
    )

    # Relationships
    currency = relationship(
        "CurrencyModel",
        back_populates="user_preferences",
        foreign_keys=[selected_currency]
    )

    def __repr__(self):
        return f"<UserPreferencesModel(id='{self.id}', session_id='{self.session_id}', currency='{self.selected_currency}')>"
