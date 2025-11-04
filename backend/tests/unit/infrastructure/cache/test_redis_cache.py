# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""Unit tests for Redis cache service."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from affilibuster_backend.infrastructure.cache.redis_cache import RedisCacheService


@pytest.mark.unit
@pytest.mark.requires_redis
class TestRedisCacheServiceInitialization:
    """Tests for RedisCacheService initialization."""

    def test_initialization_with_default_url(self):
        """Test that service initializes with default Redis URL from settings."""
        with patch("affilibuster_backend.infrastructure.cache.redis_cache.settings") as mock_settings:
            mock_settings.redis_url = "redis://localhost:6379/0"
            service = RedisCacheService()

            assert service.redis_url == "redis://localhost:6379/0"
            assert service._client is None

    def test_initialization_with_custom_url(self):
        """Test that service accepts custom Redis URL."""
        custom_url = "redis://custom:6379/1"
        service = RedisCacheService(redis_url=custom_url)

        assert service.redis_url == custom_url
        assert service._client is None

    def test_initialization_raises_when_no_url_provided(self):
        """Test that ValueError is raised when no Redis URL is available."""
        with patch("affilibuster_backend.infrastructure.cache.redis_cache.settings") as mock_settings:
            mock_settings.redis_url = None

            with pytest.raises(ValueError) as exc_info:
                RedisCacheService()

            assert "REDIS_URL" in str(exc_info.value)


@pytest.mark.unit
@pytest.mark.requires_redis
class TestGetClient:
    """Tests for _get_client method."""

    @pytest.mark.asyncio
    async def test_get_client_creates_new_client(self):
        """Test that _get_client creates a new Redis client on first call."""
        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url", new_callable=AsyncMock
        ) as mock_from_url:
            mock_client = AsyncMock()
            mock_from_url.return_value = mock_client

            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            client = await service._get_client()

            assert client == mock_client
            assert service._client == mock_client
            mock_from_url.assert_called_once_with("redis://localhost:6379/0", decode_responses=True)

    @pytest.mark.asyncio
    async def test_get_client_returns_existing_client(self):
        """Test that _get_client returns existing client on subsequent calls."""
        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url", new_callable=AsyncMock
        ) as mock_from_url:
            mock_client = AsyncMock()
            mock_from_url.return_value = mock_client

            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            client1 = await service._get_client()
            client2 = await service._get_client()

            assert client1 == client2
            # from_url should only be called once
            mock_from_url.assert_called_once()


@pytest.mark.unit
@pytest.mark.requires_redis
class TestGet:
    """Tests for get method."""

    @pytest.mark.asyncio
    async def test_get_returns_value_for_existing_key(self):
        """Test that get returns the cached value for an existing key."""
        mock_client = AsyncMock()
        mock_client.get.return_value = "test_value"

        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url",
            new_callable=AsyncMock,
            return_value=mock_client,
        ):
            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            value = await service.get("test_key")

            assert value == "test_value"
            mock_client.get.assert_called_once_with("test_key")

    @pytest.mark.asyncio
    async def test_get_returns_none_for_nonexistent_key(self):
        """Test that get returns None for a non-existent key."""
        mock_client = AsyncMock()
        mock_client.get.return_value = None

        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url",
            new_callable=AsyncMock,
            return_value=mock_client,
        ):
            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            value = await service.get("nonexistent")

            assert value is None
            mock_client.get.assert_called_once_with("nonexistent")

    @pytest.mark.asyncio
    async def test_get_returns_none_on_exception(self):
        """Test that get returns None instead of raising exceptions."""
        mock_client = AsyncMock()
        mock_client.get.side_effect = Exception("Redis connection error")

        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url",
            new_callable=AsyncMock,
            return_value=mock_client,
        ):
            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            value = await service.get("test_key")

            assert value is None


@pytest.mark.unit
@pytest.mark.requires_redis
class TestSet:
    """Tests for set method."""

    @pytest.mark.asyncio
    async def test_set_with_default_ttl(self):
        """Test that set stores value with default TTL."""
        mock_client = AsyncMock()

        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url",
            new_callable=AsyncMock,
            return_value=mock_client,
        ):
            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            await service.set("test_key", "test_value")

            mock_client.setex.assert_called_once_with("test_key", 3600, "test_value")

    @pytest.mark.asyncio
    async def test_set_with_custom_ttl(self):
        """Test that set stores value with custom TTL."""
        mock_client = AsyncMock()

        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url",
            new_callable=AsyncMock,
            return_value=mock_client,
        ):
            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            await service.set("test_key", "test_value", ttl_seconds=7200)

            mock_client.setex.assert_called_once_with("test_key", 7200, "test_value")


@pytest.mark.unit
@pytest.mark.requires_redis
class TestDelete:
    """Tests for delete method."""

    @pytest.mark.asyncio
    async def test_delete_returns_true_when_key_exists(self):
        """Test that delete returns True when key is deleted."""
        mock_client = AsyncMock()
        mock_client.delete.return_value = 1  # 1 key deleted

        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url",
            new_callable=AsyncMock,
            return_value=mock_client,
        ):
            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            result = await service.delete("test_key")

            assert result is True
            mock_client.delete.assert_called_once_with("test_key")

    @pytest.mark.asyncio
    async def test_delete_returns_false_when_key_does_not_exist(self):
        """Test that delete returns False when key doesn't exist."""
        mock_client = AsyncMock()
        mock_client.delete.return_value = 0  # 0 keys deleted

        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url",
            new_callable=AsyncMock,
            return_value=mock_client,
        ):
            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            result = await service.delete("nonexistent")

            assert result is False


@pytest.mark.unit
@pytest.mark.requires_redis
class TestExists:
    """Tests for exists method."""

    @pytest.mark.asyncio
    async def test_exists_returns_true_when_key_exists(self):
        """Test that exists returns True when key exists."""
        mock_client = AsyncMock()
        mock_client.exists.return_value = 1  # Key exists

        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url",
            new_callable=AsyncMock,
            return_value=mock_client,
        ):
            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            result = await service.exists("test_key")

            assert result is True
            mock_client.exists.assert_called_once_with("test_key")

    @pytest.mark.asyncio
    async def test_exists_returns_false_when_key_does_not_exist(self):
        """Test that exists returns False when key doesn't exist."""
        mock_client = AsyncMock()
        mock_client.exists.return_value = 0  # Key doesn't exist

        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url",
            new_callable=AsyncMock,
            return_value=mock_client,
        ):
            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            result = await service.exists("nonexistent")

            assert result is False


@pytest.mark.unit
@pytest.mark.requires_redis
class TestGetMany:
    """Tests for get_many method."""

    @pytest.mark.asyncio
    async def test_get_many_returns_empty_dict_for_empty_keys(self):
        """Test that get_many returns empty dict when given empty keys list."""
        service = RedisCacheService(redis_url="redis://localhost:6379/0")
        result = await service.get_many([])

        assert result == {}

    @pytest.mark.asyncio
    async def test_get_many_returns_multiple_values(self):
        """Test that get_many retrieves multiple values."""
        mock_client = AsyncMock()
        mock_client.mget.return_value = ["value1", "value2", None]

        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url",
            new_callable=AsyncMock,
            return_value=mock_client,
        ):
            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            result = await service.get_many(["key1", "key2", "key3"])

            assert result == {"key1": "value1", "key2": "value2", "key3": None}
            mock_client.mget.assert_called_once_with(["key1", "key2", "key3"])


@pytest.mark.unit
@pytest.mark.requires_redis
class TestSetMany:
    """Tests for set_many method."""

    @pytest.mark.asyncio
    async def test_set_many_does_nothing_for_empty_mapping(self):
        """Test that set_many does nothing when given empty mapping."""
        service = RedisCacheService(redis_url="redis://localhost:6379/0")
        # Should not raise any errors
        await service.set_many({})

    @pytest.mark.asyncio
    async def test_set_many_sets_multiple_values_with_default_ttl(self):
        """Test that set_many stores multiple values with default TTL."""
        mock_pipe = AsyncMock()
        mock_pipeline_ctx = AsyncMock()
        mock_pipeline_ctx.__aenter__.return_value = mock_pipe
        mock_pipeline_ctx.__aexit__.return_value = None

        mock_client = AsyncMock()
        # pipeline() should NOT be async - it returns a context manager
        mock_client.pipeline = MagicMock(return_value=mock_pipeline_ctx)

        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url",
            new_callable=AsyncMock,
            return_value=mock_client,
        ):
            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            mapping = {"key1": "value1", "key2": "value2"}
            await service.set_many(mapping)

            # Verify setex called for each key-value pair
            assert mock_pipe.setex.call_count == 2
            mock_pipe.setex.assert_any_call("key1", 3600, "value1")
            mock_pipe.setex.assert_any_call("key2", 3600, "value2")
            mock_pipe.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_set_many_sets_multiple_values_with_custom_ttl(self):
        """Test that set_many stores multiple values with custom TTL."""
        mock_pipe = AsyncMock()
        mock_pipeline_ctx = AsyncMock()
        mock_pipeline_ctx.__aenter__.return_value = mock_pipe
        mock_pipeline_ctx.__aexit__.return_value = None

        mock_client = AsyncMock()
        # pipeline() should NOT be async - it returns a context manager
        mock_client.pipeline = MagicMock(return_value=mock_pipeline_ctx)

        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url",
            new_callable=AsyncMock,
            return_value=mock_client,
        ):
            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            mapping = {"key1": "value1", "key2": "value2"}
            await service.set_many(mapping, ttl_seconds=7200)

            # Verify setex called with custom TTL
            assert mock_pipe.setex.call_count == 2
            mock_pipe.setex.assert_any_call("key1", 7200, "value1")
            mock_pipe.setex.assert_any_call("key2", 7200, "value2")


@pytest.mark.unit
@pytest.mark.requires_redis
class TestClose:
    """Tests for close method."""

    @pytest.mark.asyncio
    async def test_close_closes_client(self):
        """Test that close method closes the Redis client."""
        mock_client = AsyncMock()

        with patch(
            "affilibuster_backend.infrastructure.cache.redis_cache.redis.from_url",
            new_callable=AsyncMock,
            return_value=mock_client,
        ):
            service = RedisCacheService(redis_url="redis://localhost:6379/0")
            await service._get_client()  # Create client

            assert service._client is not None

            await service.close()

            mock_client.aclose.assert_called_once()
            assert service._client is None

    @pytest.mark.asyncio
    async def test_close_does_nothing_when_no_client(self):
        """Test that close does nothing when client doesn't exist."""
        service = RedisCacheService(redis_url="redis://localhost:6379/0")

        # Should not raise any errors
        await service.close()

        assert service._client is None
