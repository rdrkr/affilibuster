# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for generic Strapi proxy use cases.

Covers:
- StrapiProxyGetUseCase with caching
- StrapiProxyMutateUseCase with cache invalidation
- Cache key generation
- Fallback to Strapi when cache misses
"""

from unittest.mock import AsyncMock

import pytest

from domain.repositories.cache_service import ICacheService
from domain.repositories.strapi_repository import IStrapiRepository
from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyMutateUseCase,
)


class TestStrapiProxyGetUseCase:
    """Test StrapiProxyGetUseCase for reading data from Strapi."""

    @pytest.mark.asyncio
    async def test_execute_returns_strapi_data(self):
        """Test that execute() returns data from Strapi."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        mock_cache = AsyncMock(spec=ICacheService)
        mock_cache.get.return_value = None  # Cache miss

        strapi_response = {"data": [{"id": 1, "name": "Test"}]}
        mock_strapi.get.return_value = strapi_response

        use_case = StrapiProxyGetUseCase(mock_strapi, mock_cache)

        # Act
        result = await use_case.execute("/test-endpoint")

        # Assert
        assert result == strapi_response
        mock_strapi.get.assert_called_once_with("/test-endpoint", None)

    @pytest.mark.asyncio
    async def test_execute_passes_params_to_strapi(self):
        """Test that execute() passes parameters to Strapi."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        mock_cache = AsyncMock(spec=ICacheService)
        mock_cache.get.return_value = None

        strapi_response = {"data": []}
        mock_strapi.get.return_value = strapi_response

        use_case = StrapiProxyGetUseCase(mock_strapi, mock_cache)
        params = {"locale": "en", "sort": "createdAt"}

        # Act
        await use_case.execute("/products", params=params)

        # Assert
        mock_strapi.get.assert_called_once_with("/products", params)

    @pytest.mark.asyncio
    async def test_execute_caches_result(self):
        """Test that execute() caches the result."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        mock_cache = AsyncMock(spec=ICacheService)
        mock_cache.get.return_value = None  # Cache miss first time

        strapi_response = {"data": [{"id": 1}]}
        mock_strapi.get.return_value = strapi_response

        use_case = StrapiProxyGetUseCase(mock_strapi, mock_cache, cache_ttl=300)

        # Act
        await use_case.execute("/products")

        # Assert
        mock_cache.set.assert_called_once()
        call_args = mock_cache.set.call_args
        assert call_args[0][1] == strapi_response  # Second arg is the data
        assert call_args[1]["ttl"] == 300

    @pytest.mark.asyncio
    async def test_execute_returns_cached_result(self):
        """Test that execute() returns cached result on cache hit."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        mock_cache = AsyncMock(spec=ICacheService)

        cached_response = {"data": [{"id": 1, "cached": True}]}
        mock_cache.get.return_value = cached_response  # Cache hit

        use_case = StrapiProxyGetUseCase(mock_strapi, mock_cache)

        # Act
        result = await use_case.execute("/products")

        # Assert
        assert result == cached_response
        mock_strapi.get.assert_not_called()  # Should not call Strapi

    @pytest.mark.asyncio
    async def test_execute_skips_cache_when_disabled(self):
        """Test that execute() skips cache when use_cache=False."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        mock_cache = AsyncMock(spec=ICacheService)

        strapi_response = {"data": []}
        mock_strapi.get.return_value = strapi_response

        use_case = StrapiProxyGetUseCase(mock_strapi, mock_cache)

        # Act
        result = await use_case.execute("/products", use_cache=False)

        # Assert
        assert result == strapi_response
        mock_cache.get.assert_not_called()
        mock_cache.set.assert_not_called()

    @pytest.mark.asyncio
    async def test_cache_key_includes_path(self):
        """Test that cache key includes the API path."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        mock_cache = AsyncMock(spec=ICacheService)
        mock_cache.get.return_value = None
        mock_strapi.get.return_value = {}

        use_case = StrapiProxyGetUseCase(mock_strapi, mock_cache)

        # Act
        await use_case.execute("/products")

        # Assert
        cache_key = mock_cache.set.call_args[0][0]
        assert "/products" in cache_key
        assert cache_key.startswith("strapi:")

    @pytest.mark.asyncio
    async def test_cache_key_includes_params(self):
        """Test that cache key differs for different parameters."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        mock_cache = AsyncMock(spec=ICacheService)
        mock_cache.get.return_value = None
        mock_strapi.get.return_value = {}

        use_case = StrapiProxyGetUseCase(mock_strapi, mock_cache)

        # Act - first call with params
        await use_case.execute("/products", params={"locale": "en"})
        first_key = mock_cache.set.call_args_list[0][0][0]

        mock_cache.reset_mock()
        mock_cache.get.return_value = None

        # Act - second call with different params
        await use_case.execute("/products", params={"locale": "it"})
        second_key = mock_cache.set.call_args_list[0][0][0]

        # Assert
        assert first_key != second_key


class TestStrapiProxyMutateUseCase:
    """Test StrapiProxyMutateUseCase for mutating data in Strapi."""

    @pytest.mark.asyncio
    async def test_post_creates_resource(self):
        """Test that post() creates a resource in Strapi."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        mock_cache = AsyncMock(spec=ICacheService)

        request_data = {"name": "New Product"}
        strapi_response = {"data": {"id": 1, "name": "New Product"}}
        mock_strapi.post.return_value = strapi_response

        use_case = StrapiProxyMutateUseCase(mock_strapi, mock_cache)

        # Act
        result = await use_case.post("/products", request_data)

        # Assert
        assert result == strapi_response
        mock_strapi.post.assert_called_once_with("/products", request_data)

    @pytest.mark.asyncio
    async def test_post_invalidates_cache_pattern(self):
        """Test that post() invalidates cache by pattern."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        mock_cache = AsyncMock(spec=ICacheService)

        mock_strapi.post.return_value = {"data": {}}

        use_case = StrapiProxyMutateUseCase(mock_strapi, mock_cache)

        # Act
        await use_case.post("/products", {}, invalidate_pattern="strapi:/products")

        # Assert
        mock_cache.delete.assert_called_once_with("strapi:/products:*")

    @pytest.mark.asyncio
    async def test_put_updates_resource(self):
        """Test that put() updates a resource in Strapi."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        mock_cache = AsyncMock(spec=ICacheService)

        request_data = {"name": "Updated Product"}
        strapi_response = {"data": {"id": 1, "name": "Updated Product"}}
        mock_strapi.put.return_value = strapi_response

        use_case = StrapiProxyMutateUseCase(mock_strapi, mock_cache)

        # Act
        result = await use_case.put("/products/1", request_data)

        # Assert
        assert result == strapi_response
        mock_strapi.put.assert_called_once_with("/products/1", request_data)

    @pytest.mark.asyncio
    async def test_put_invalidates_cache_pattern(self):
        """Test that put() invalidates cache by pattern."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        mock_cache = AsyncMock(spec=ICacheService)

        mock_strapi.put.return_value = {"data": {}}

        use_case = StrapiProxyMutateUseCase(mock_strapi, mock_cache)

        # Act
        await use_case.put("/products/1", {}, invalidate_pattern="strapi:/products")

        # Assert
        mock_cache.delete.assert_called_once_with("strapi:/products:*")

    @pytest.mark.asyncio
    async def test_delete_removes_resource(self):
        """Test that delete() removes a resource from Strapi."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        mock_cache = AsyncMock(spec=ICacheService)

        use_case = StrapiProxyMutateUseCase(mock_strapi, mock_cache)

        # Act
        await use_case.delete("/products/1")

        # Assert
        mock_strapi.delete.assert_called_once_with("/products/1")

    @pytest.mark.asyncio
    async def test_delete_invalidates_cache_pattern(self):
        """Test that delete() invalidates cache by pattern."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        mock_cache = AsyncMock(spec=ICacheService)

        use_case = StrapiProxyMutateUseCase(mock_strapi, mock_cache)

        # Act
        await use_case.delete("/products/1", invalidate_pattern="strapi:/products")

        # Assert
        mock_cache.delete.assert_called_once_with("strapi:/products:*")

    @pytest.mark.asyncio
    async def test_post_without_cache_invalidation(self):
        """Test that post() works without cache invalidation pattern."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        mock_cache = AsyncMock(spec=ICacheService)

        mock_strapi.post.return_value = {"data": {}}

        use_case = StrapiProxyMutateUseCase(mock_strapi, mock_cache)

        # Act
        await use_case.post("/products", {}, invalidate_pattern=None)

        # Assert
        mock_cache.delete.assert_not_called()
