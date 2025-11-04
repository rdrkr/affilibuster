# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy database models for the Affilibuster platform.

These models map domain entities to database tables.

Architecture: Backend database contains only app-specific data:
- user_preferences: User session and preference settings

All user-facing content and system metadata comes directly from Strapi.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""


# Import all models to ensure they are registered with SQLAlchemy
from .user_preferences import UserPreferencesModel  # noqa: E402

__all__ = [
    "Base",
    "UserPreferencesModel",
]
