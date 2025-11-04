# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Repository interfaces for the Affilibuster platform.

These interfaces define the contracts for data access and are implemented
by infrastructure adapters (PostgreSQL, Redis, Strapi, etc.).
"""

from affilibuster_backend.domain.repositories.cache_service import ICacheService
from affilibuster_backend.domain.repositories.cms_repository import ICMSRepository
from affilibuster_backend.domain.repositories.preferences_repository import IUserPreferencesRepository

__all__ = [
    "ICMSRepository",
    "ICacheService",
    "IUserPreferencesRepository",
]
