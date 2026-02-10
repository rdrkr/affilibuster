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
from .api_config import ApiConfigModel  # noqa: E402
from .consent_record import ConsentRecordModel  # noqa: E402
from .email_verification_token import EmailVerificationTokenModel  # noqa: E402
from .password_reset_token import PasswordResetTokenModel  # noqa: E402
from .url_redirect import URLRedirectModel  # noqa: E402
from .user import UserModel  # noqa: E402
from .user_preferences import UserPreferencesModel  # noqa: E402
from .user_session import UserSessionModel  # noqa: E402

__all__ = [
    "ApiConfigModel",
    "Base",
    "ConsentRecordModel",
    "EmailVerificationTokenModel",
    "PasswordResetTokenModel",
    "URLRedirectModel",
    "UserModel",
    "UserPreferencesModel",
    "UserSessionModel",
]
