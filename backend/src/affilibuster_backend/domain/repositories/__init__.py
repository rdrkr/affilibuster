# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Repository interfaces for the Affilibuster platform.

These interfaces define the contracts for data access and are implemented
by infrastructure adapters (PostgreSQL, Redis, Strapi, etc.).
"""

from affilibuster_backend.domain.repositories.cache_service import ICacheService
from affilibuster_backend.domain.repositories.cms_repository import ICMSRepository
from affilibuster_backend.domain.repositories.email_verification_token_repository import (
    IEmailVerificationTokenRepository,
)
from affilibuster_backend.domain.repositories.password_reset_token_repository import (
    IPasswordResetTokenRepository,
)
from affilibuster_backend.domain.repositories.preferences_repository import IUserPreferencesRepository
from affilibuster_backend.domain.repositories.session_repository import ISessionRepository
from affilibuster_backend.domain.repositories.url_redirect_repository import IURLRedirectRepository
from affilibuster_backend.domain.repositories.user_repository import IUserRepository

__all__ = [
    "ICMSRepository",
    "ICacheService",
    "IEmailVerificationTokenRepository",
    "IPasswordResetTokenRepository",
    "ISessionRepository",
    "IURLRedirectRepository",
    "IUserPreferencesRepository",
    "IUserRepository",
]
