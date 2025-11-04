# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Cache service interface.

Reference: plan.md:122, research.md:271-285
"""

from abc import ABC, abstractmethod


class ICacheService(ABC):
    """
    Generic cache service interface.

    This interface is implementation-agnostic and can be backed by
    Redis, Memcached, or any other caching system.
    """

    @abstractmethod
    async def get(self, key: str) -> str | None:
        """
        Get a value from cache.

        Args:
            key: Cache key

        Returns:
            Optional[str]: Cached value if exists, None otherwise

        """

    @abstractmethod
    async def set(self, key: str, value: str, ttl_seconds: int = 3600) -> None:
        """
        Set a value in cache with TTL.

        Args:
            key: Cache key
            value: Value to cache (serialized as string)
            ttl_seconds: Time to live in seconds (default: 1 hour)

        """

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """
        Delete a value from cache.

        Args:
            key: Cache key

        Returns:
            bool: True if deleted, False if key didn't exist

        """

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """
        Check if a key exists in cache.

        Args:
            key: Cache key

        Returns:
            bool: True if key exists, False otherwise

        """

    @abstractmethod
    async def get_many(self, keys: list[str]) -> dict[str, str | None]:
        """
        Get multiple values from cache.

        Args:
            keys: List of cache keys

        Returns:
            dict[str, Optional[str]]: Mapping of keys to values

        """

    @abstractmethod
    async def set_many(self, mapping: dict[str, str], ttl_seconds: int = 3600) -> None:
        """
        Set multiple values in cache with TTL.

        Args:
            mapping: Dictionary of key-value pairs
            ttl_seconds: Time to live in seconds (default: 1 hour)

        """
