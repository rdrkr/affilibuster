# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Redis cache service implementation.

Reference: T076 (ICacheService interface), research.md:271-285
"""

import redis.asyncio as redis

from config import settings
from domain.repositories.cache_service import ICacheService


class RedisCacheService(ICacheService):
    """
    Redis implementation of ICacheService.

    Uses SETEX for atomic set-with-expiry operations.
    """

    def __init__(self, redis_url: str | None = None) -> None:
        """
        Initialize Redis client.

        Args:
            redis_url: Redis connection URL (defaults to environment variable)

        """
        self.redis_url = redis_url or settings.redis_url
        if not self.redis_url:
            raise ValueError("REDIS_URL environment variable must be set or redis_url parameter provided")
        self._client: redis.Redis | None = None

    async def _get_client(self) -> redis.Redis:
        """Get or create Redis client."""
        if self._client is None:
            self._client = await redis.from_url(self.redis_url, decode_responses=True)
        return self._client

    async def get(self, key: str) -> str | None:
        """
        Get a value from cache.

        Returns None if key doesn't exist (not exception).
        """
        client = await self._get_client()
        try:
            return await client.get(key)
        except Exception:
            # Fallback to None on any error (cache miss)
            return None

    async def set(self, key: str, value: str, ttl_seconds: int = 3600) -> None:
        """
        Set a value in cache with TTL using SETEX.

        Args:
            key: Cache key
            value: Value to cache
            ttl_seconds: Time to live in seconds (default: 1 hour)

        """
        client = await self._get_client()
        await client.setex(key, ttl_seconds, value)

    async def delete(self, key: str) -> bool:
        """
        Delete a value from cache.

        Returns:
            bool: True if deleted, False if key didn't exist

        """
        client = await self._get_client()
        result = await client.delete(key)
        return result > 0

    async def exists(self, key: str) -> bool:
        """
        Check if a key exists in cache.

        Returns:
            bool: True if key exists, False otherwise

        """
        client = await self._get_client()
        result = await client.exists(key)
        return result > 0

    async def get_many(self, keys: list[str]) -> dict[str, str | None]:
        """
        Get multiple values from cache using MGET.

        Returns:
            dict[str, Optional[str]]: Mapping of keys to values

        """
        if not keys:
            return {}

        client = await self._get_client()
        values = await client.mget(keys)
        return dict(zip(keys, values))

    async def set_many(self, mapping: dict[str, str], ttl_seconds: int = 3600) -> None:
        """
        Set multiple values in cache with TTL.

        Uses pipeline for efficiency.
        """
        if not mapping:
            return

        client = await self._get_client()
        async with client.pipeline() as pipe:
            for key, value in mapping.items():
                pipe.setex(key, ttl_seconds, value)
            await pipe.execute()

    async def close(self) -> None:
        """Close Redis connection."""
        if self._client:
            await self._client.aclose()
            self._client = None
