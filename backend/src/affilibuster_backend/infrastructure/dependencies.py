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
from affilibuster_backend.domain.repositories.preferences_repository import IUserPreferencesRepository
from affilibuster_backend.domain.use_cases.get_cms_content_use_case import GetCMSContentUseCase
from affilibuster_backend.domain.use_cases.get_user_preferences_use_case import GetUserPreferencesUseCase
from affilibuster_backend.domain.use_cases.update_user_preferences_use_case import UpdateUserPreferencesUseCase
from affilibuster_backend.infrastructure.cache.redis_cache import RedisCacheService
from affilibuster_backend.infrastructure.cms.strapi_repository_impl import StrapiRepositoryImpl
from affilibuster_backend.infrastructure.database.config import get_db
from affilibuster_backend.infrastructure.database.repositories.preferences_repository import (
    UserPreferencesRepository,
)

# Singleton instances (created once at startup)
_cms_repo: ICMSRepository | None = None


def initialize_dependencies() -> None:
    """Initialize singleton instances. Call this at app startup."""
    global _cms_repo  # noqa: PLW0603
    _cms_repo = StrapiRepositoryImpl()


def get_cms_repo() -> ICMSRepository:
    """Provide Strapi repository instance."""
    if _cms_repo is None:
        raise RuntimeError("Dependencies not initialized. Call initialize_dependencies() at startup.")
    return _cms_repo


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


# Type aliases for use in route signatures
CMSRepoDep = Annotated[ICMSRepository, Depends(get_cms_repo)]
GetCMSContentUseCaseDep = Annotated[GetCMSContentUseCase, Depends(get_cms_content_use_case)]
CacheServiceDep = Annotated[ICacheService, Depends(get_cache_service)]
PreferencesRepoDep = Annotated[IUserPreferencesRepository, Depends(get_preferences_repo)]
GetUserPreferencesUseCaseDep = Annotated[GetUserPreferencesUseCase, Depends(get_get_user_preferences_use_case)]
UpdateUserPreferencesUseCaseDep = Annotated[UpdateUserPreferencesUseCase, Depends(get_update_user_preferences_use_case)]
