# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Dependency Injection Configuration.

Centralizes all DI setup to avoid circular imports.
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from domain.repositories.cache_service import ICacheService
from domain.repositories.preferences_repository import IUserPreferencesRepository
from domain.repositories.strapi_repository import IStrapiRepository
from domain.use_cases.get_user_preferences import GetUserPreferences
from domain.use_cases.strapi_proxy import StrapiProxyGetUseCase, StrapiProxyPostUseCase
from domain.use_cases.update_user_preferences import UpdateUserPreferences
from infrastructure.cache.redis_cache import RedisCacheService
from infrastructure.cms.strapi_repository_impl import StrapiRepositoryImpl
from infrastructure.database.config import get_db
from infrastructure.database.repositories.preferences_repository import (
    UserPreferencesRepository,
)

# Singleton instances (created once at startup)
_strapi_repo: IStrapiRepository | None = None


def initialize_dependencies() -> None:
    """Initialize singleton instances. Call this at app startup."""
    global _strapi_repo
    _strapi_repo = StrapiRepositoryImpl()


def get_strapi_repo() -> IStrapiRepository:
    """Provide Strapi repository instance."""
    if _strapi_repo is None:
        raise RuntimeError("Dependencies not initialized. Call initialize_dependencies() at startup.")
    return _strapi_repo


def get_strapi_proxy_get_use_case(
    strapi_repo: IStrapiRepository = Depends(get_strapi_repo),
) -> StrapiProxyGetUseCase:
    """Provide StrapiProxyGetUseCase instance."""
    return StrapiProxyGetUseCase(strapi_repo)


def get_strapi_proxy_post_use_case(
    strapi_repo: IStrapiRepository = Depends(get_strapi_repo),
) -> StrapiProxyPostUseCase:
    """Provide StrapiProxyPostUseCase instance."""
    return StrapiProxyPostUseCase(strapi_repo)


def get_cache_service() -> ICacheService:
    """
    Provide cache service instance.

    Creates a new RedisCacheService for each request.
    Redis client internally uses connection pooling, so this is efficient.
    """
    return RedisCacheService()


def get_preferences_repo(
    db: AsyncSession = Depends(get_db),
) -> IUserPreferencesRepository:
    """
    Provide user preferences repository instance.

    Creates a new repository instance with the current database session.
    """
    return UserPreferencesRepository(db)


def get_get_user_preferences_use_case(
    prefs_repo: IUserPreferencesRepository = Depends(get_preferences_repo),
    cache_service: ICacheService = Depends(get_cache_service),
) -> GetUserPreferences:
    """Provide GetUserPreferences use case instance."""
    return GetUserPreferences(prefs_repo, cache_service)


def get_update_user_preferences_use_case(
    prefs_repo: IUserPreferencesRepository = Depends(get_preferences_repo),
    cache_service: ICacheService = Depends(get_cache_service),
) -> UpdateUserPreferences:
    """Provide UpdateUserPreferences use case instance."""
    return UpdateUserPreferences(prefs_repo, cache_service)


# Type aliases for use in route signatures
StrapiRepoDep = Annotated[IStrapiRepository, Depends(get_strapi_repo)]
StrapiProxyGetUseCaseDep = Annotated[StrapiProxyGetUseCase, Depends(get_strapi_proxy_get_use_case)]
StrapiProxyPostUseCaseDep = Annotated[StrapiProxyPostUseCase, Depends(get_strapi_proxy_post_use_case)]
CacheServiceDep = Annotated[ICacheService, Depends(get_cache_service)]
PreferencesRepoDep = Annotated[IUserPreferencesRepository, Depends(get_preferences_repo)]
GetUserPreferencesUseCaseDep = Annotated[GetUserPreferences, Depends(get_get_user_preferences_use_case)]
UpdateUserPreferencesUseCaseDep = Annotated[UpdateUserPreferences, Depends(get_update_user_preferences_use_case)]
