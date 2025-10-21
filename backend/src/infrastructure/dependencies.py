# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Dependency Injection Configuration.

Centralizes all DI setup to avoid circular imports.
"""

from typing import Annotated

from fastapi import Depends

from domain.repositories.cache_service import ICacheService
from domain.repositories.strapi_repository import IStrapiRepository
from infrastructure.cache.redis_cache import RedisCacheService
from infrastructure.cms.strapi_repository_impl import StrapiRepositoryImpl

# Singleton instances (created once at startup)
_strapi_repo: IStrapiRepository | None = None
_cache_service: ICacheService | None = None


def initialize_dependencies() -> None:
    """Initialize singleton instances. Call this at app startup."""
    global _strapi_repo, _cache_service
    _strapi_repo = StrapiRepositoryImpl()
    _cache_service = RedisCacheService()


def get_strapi_repo() -> IStrapiRepository:
    """Provide Strapi repository instance."""
    if _strapi_repo is None:
        raise RuntimeError("Dependencies not initialized. Call initialize_dependencies() at startup.")
    return _strapi_repo


def get_cache_service() -> ICacheService:
    """Provide cache service instance."""
    if _cache_service is None:
        raise RuntimeError("Dependencies not initialized. Call initialize_dependencies() at startup.")
    return _cache_service


# Type aliases for use in route signatures
StrapiRepoDep = Annotated[IStrapiRepository, Depends(get_strapi_repo)]
CacheServiceDep = Annotated[ICacheService, Depends(get_cache_service)]
