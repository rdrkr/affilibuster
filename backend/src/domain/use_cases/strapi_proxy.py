# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Generic Strapi Proxy Use Cases.

Provides reusable use cases for proxying requests to Strapi.
Maintains clean architecture while avoiding code duplication for multiple endpoints.
"""

from typing import Any, Dict, Optional

from domain.repositories.cache_service import ICacheService
from domain.repositories.strapi_repository import IStrapiRepository


class StrapiProxyGetUseCase:
    """
    Generic GET proxy use case for any Strapi endpoint.

    Fetches data from Strapi and optionally caches it.
    """

    def __init__(
        self,
        strapi_repo: IStrapiRepository,
        cache_service: ICacheService,
        cache_ttl: int = 300,
    ):
        """
        Initialize the use case.

        Args:
            strapi_repo: Strapi repository
            cache_service: Cache service
            cache_ttl: Cache time-to-live in seconds (default 5 minutes)
        """
        self._strapi = strapi_repo
        self._cache = cache_service
        self._cache_ttl = cache_ttl

    async def execute(
        self,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """
        Execute GET proxy.

        Args:
            path: Strapi API path
            params: Query parameters
            use_cache: Whether to use caching (default True)

        Returns:
            Data from Strapi

        Raises:
            StrapiAPIError: If Strapi request fails
        """
        # Build cache key
        param_str = ":".join(f"{k}={v}" for k, v in (params or {}).items())
        cache_key = f"strapi:{path}:{param_str}"

        # Try cache first
        if use_cache:
            cached = await self._cache.get(cache_key)
            if cached is not None:
                return cached

        # Fetch from Strapi
        result = await self._strapi.get(path, params)

        # Cache result
        if use_cache:
            await self._cache.set(cache_key, result, ttl=self._cache_ttl)

        return result


class StrapiProxyMutateUseCase:
    """
    Generic mutation proxy use case for POST/PUT/DELETE to Strapi.

    Creates, updates, or deletes data in Strapi and invalidates cache.
    """

    def __init__(
        self,
        strapi_repo: IStrapiRepository,
        cache_service: ICacheService,
    ):
        """
        Initialize the use case.

        Args:
            strapi_repo: Strapi repository
            cache_service: Cache service
        """
        self._strapi = strapi_repo
        self._cache = cache_service

    async def post(
        self,
        path: str,
        data: Dict[str, Any],
        invalidate_pattern: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Execute POST mutation.

        Args:
            path: Strapi API path
            data: Request payload
            invalidate_pattern: Cache key pattern to invalidate (optional)

        Returns:
            Created data from Strapi

        Raises:
            StrapiAPIError: If Strapi request fails
        """
        # Execute mutation
        result = await self._strapi.post(path, data)

        # Invalidate cache
        if invalidate_pattern:
            await self._cache.delete(f"{invalidate_pattern}:*")

        return result

    async def put(
        self,
        path: str,
        data: Dict[str, Any],
        invalidate_pattern: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Execute PUT mutation.

        Args:
            path: Strapi API path
            data: Request payload
            invalidate_pattern: Cache key pattern to invalidate (optional)

        Returns:
            Updated data from Strapi

        Raises:
            StrapiAPIError: If Strapi request fails
        """
        # Execute mutation
        result = await self._strapi.put(path, data)

        # Invalidate cache
        if invalidate_pattern:
            await self._cache.delete(f"{invalidate_pattern}:*")

        return result

    async def delete(
        self,
        path: str,
        invalidate_pattern: Optional[str] = None,
    ) -> None:
        """
        Execute DELETE mutation.

        Args:
            path: Strapi API path
            invalidate_pattern: Cache key pattern to invalidate (optional)

        Raises:
            StrapiAPIError: If Strapi request fails
        """
        # Execute mutation
        await self._strapi.delete(path)

        # Invalidate cache
        if invalidate_pattern:
            await self._cache.delete(f"{invalidate_pattern}:*")
