# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Dependency Injection Configuration.

Centralizes all DI setup to avoid circular imports.
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from affilibuster_backend.domain.repositories.cache_service import ICacheService
from affilibuster_backend.domain.repositories.cms_repository import ICMSRepository
from affilibuster_backend.domain.repositories.consent_repository import IConsentRepository
from affilibuster_backend.domain.repositories.email_verification_token_repository import (
    IEmailVerificationTokenRepository,
)
from affilibuster_backend.domain.repositories.password_reset_token_repository import (
    IPasswordResetTokenRepository,
)
from affilibuster_backend.domain.repositories.preferences_repository import IUserPreferencesRepository
from affilibuster_backend.domain.repositories.url_redirect_repository import IURLRedirectRepository
from affilibuster_backend.domain.use_cases.cms.get_cms_content_use_case import GetCMSContentUseCase
from affilibuster_backend.domain.use_cases.cms.get_url_redirect_use_case import GetURLRedirectUseCase
from affilibuster_backend.domain.use_cases.consent.record_consent_use_case import RecordConsentUseCase
from affilibuster_backend.domain.use_cases.preferences.get_user_preferences_use_case import GetUserPreferencesUseCase
from affilibuster_backend.domain.use_cases.preferences.update_user_preferences_use_case import (
    UpdateUserPreferencesUseCase,
)
from affilibuster_backend.infrastructure.cache.redis_cache import RedisCacheService
from affilibuster_backend.infrastructure.cms.strapi_repository_impl import StrapiRepositoryImpl
from affilibuster_backend.infrastructure.database.config import get_db
from affilibuster_backend.infrastructure.database.repositories.preferences_repository import (
    UserPreferencesRepository,
)


class _DependencyContainer:
    """Container for singleton dependency instances."""

    def __init__(self) -> None:
        """Initialize container with None values."""
        self.cms_repo: ICMSRepository | None = None


# Singleton container instance
_container = _DependencyContainer()


def initialize_dependencies(strapi_api_token: str) -> None:
    """
    Initialize singleton instances. Call this at app startup.

    Args:
        strapi_api_token: API token for Strapi CMS authentication (loaded from database)

    """
    _container.cms_repo = StrapiRepositoryImpl(api_token=strapi_api_token)


def get_cms_repo() -> ICMSRepository:
    """Provide Strapi repository instance."""
    if _container.cms_repo is None:
        raise RuntimeError("Dependencies not initialized. Call initialize_dependencies() at startup.")
    return _container.cms_repo


def get_cms_content_use_case(
    cms_repo: Annotated[ICMSRepository, Depends(get_cms_repo)],
) -> GetCMSContentUseCase:
    """Provide GetCMSContentUseCase instance."""
    return GetCMSContentUseCase(cms_repo)


def get_cache_service() -> ICacheService:
    """
    Provide cache service instance.

    Creates a new RedisCacheService for each request.
    Redis client internally uses connection pooling, so this is efficient.
    """
    return RedisCacheService()


def get_preferences_repo(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> IUserPreferencesRepository:
    """
    Provide user preferences repository instance.

    Creates a new repository instance with the current database session.
    """
    return UserPreferencesRepository(db)


def get_get_user_preferences_use_case(
    prefs_repo: Annotated[IUserPreferencesRepository, Depends(get_preferences_repo)],
    cache_service: Annotated[ICacheService, Depends(get_cache_service)],
) -> GetUserPreferencesUseCase:
    """Provide GetUserPreferencesUseCase use case instance."""
    return GetUserPreferencesUseCase(prefs_repo, cache_service)


def get_update_user_preferences_use_case(
    prefs_repo: Annotated[IUserPreferencesRepository, Depends(get_preferences_repo)],
    cache_service: Annotated[ICacheService, Depends(get_cache_service)],
) -> UpdateUserPreferencesUseCase:
    """Provide UpdateUserPreferencesUseCase use case instance."""
    return UpdateUserPreferencesUseCase(prefs_repo, cache_service)


def get_email_verification_token_repo(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> IEmailVerificationTokenRepository:
    """
    Provide email verification token repository instance.

    Uses local imports to avoid circular dependencies at module load time.
    """
    from affilibuster_backend.infrastructure.database.repositories.email_verification_token_repository import (
        EmailVerificationTokenRepository,
    )

    return EmailVerificationTokenRepository(db)


def get_password_reset_token_repo(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> IPasswordResetTokenRepository:
    """
    Provide password reset token repository instance.

    Uses local imports to avoid circular dependencies at module load time.
    """
    from affilibuster_backend.infrastructure.database.repositories.password_reset_token_repository import (
        PasswordResetTokenRepository,
    )

    return PasswordResetTokenRepository(db)


def get_url_redirect_repo(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> IURLRedirectRepository:
    """
    Provide URL redirect repository instance.

    Creates a new repository instance with the current database session.
    """
    from affilibuster_backend.infrastructure.database.repositories.url_redirect_repository import (
        URLRedirectRepository,
    )

    return URLRedirectRepository(db)


def get_url_redirect_use_case(
    redirect_repo: Annotated[IURLRedirectRepository, Depends(get_url_redirect_repo)],
) -> GetURLRedirectUseCase:
    """Provide GetURLRedirectUseCase instance."""
    return GetURLRedirectUseCase(redirect_repo)


def get_consent_repo(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> IConsentRepository:
    """
    Provide consent repository instance.

    Creates a new repository instance with the current database session.
    """
    from affilibuster_backend.infrastructure.database.repositories.consent_repository import ConsentRepository

    return ConsentRepository(db)


def get_record_consent_use_case(
    consent_repo: Annotated[IConsentRepository, Depends(get_consent_repo)],
) -> RecordConsentUseCase:
    """Provide RecordConsentUseCase instance."""
    return RecordConsentUseCase(consent_repo)


# Type aliases for use in route signatures
CMSRepoDep = Annotated[ICMSRepository, Depends(get_cms_repo)]
GetCMSContentUseCaseDep = Annotated[GetCMSContentUseCase, Depends(get_cms_content_use_case)]
CacheServiceDep = Annotated[ICacheService, Depends(get_cache_service)]
PreferencesRepoDep = Annotated[IUserPreferencesRepository, Depends(get_preferences_repo)]
GetUserPreferencesUseCaseDep = Annotated[GetUserPreferencesUseCase, Depends(get_get_user_preferences_use_case)]
UpdateUserPreferencesUseCaseDep = Annotated[UpdateUserPreferencesUseCase, Depends(get_update_user_preferences_use_case)]
URLRedirectRepoDep = Annotated[IURLRedirectRepository, Depends(get_url_redirect_repo)]
GetURLRedirectUseCaseDep = Annotated[GetURLRedirectUseCase, Depends(get_url_redirect_use_case)]
ConsentRepoDep = Annotated[IConsentRepository, Depends(get_consent_repo)]
RecordConsentUseCaseDep = Annotated[RecordConsentUseCase, Depends(get_record_consent_use_case)]
