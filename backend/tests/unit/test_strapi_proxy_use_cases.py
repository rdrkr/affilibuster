# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for generic Strapi proxy use cases.

Covers:
- StrapiProxyGetUseCase as passthrough to Strapi (read-only)
- StrapiProxyPostUseCase for POST operations
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from unittest.mock import AsyncMock

import pytest

from domain.repositories.strapi_repository import IStrapiRepository
from domain.use_cases.strapi_proxy import (
    StrapiProxyGetUseCase,
    StrapiProxyPostUseCase,
)


class TestStrapiProxyGetUseCase:
    """Test StrapiProxyGetUseCase for reading data from Strapi."""

    @pytest.mark.asyncio
    async def test_execute_returns_strapi_data(self):
        """Test that execute() returns data from Strapi."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        strapi_response = {"data": [{"id": 1, "name": "Test"}]}
        mock_strapi.get.return_value = strapi_response

        use_case = StrapiProxyGetUseCase(mock_strapi)

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
        strapi_response = {"data": []}
        mock_strapi.get.return_value = strapi_response

        use_case = StrapiProxyGetUseCase(mock_strapi)
        params = {"locale": "en", "sort": "createdAt"}

        # Act
        await use_case.execute("/products", params=params)

        # Assert
        mock_strapi.get.assert_called_once_with("/products", params)


class TestStrapiProxyPostUseCase:
    """Test StrapiProxyPostUseCase for POST operations to Strapi."""

    @pytest.mark.asyncio
    async def test_post_creates_resource(self):
        """Test that post() creates a resource in Strapi."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)

        request_data = {"name": "New Product"}
        strapi_response = {"data": {"id": 1, "name": "New Product"}}
        mock_strapi.post.return_value = strapi_response

        use_case = StrapiProxyPostUseCase(mock_strapi)

        # Act
        result = await use_case.post("/products", request_data)

        # Assert
        assert result == strapi_response
        mock_strapi.post.assert_called_once_with("/products", request_data, None)

    @pytest.mark.asyncio
    async def test_post_passes_params_to_strapi(self):
        """Test that post() passes parameters to Strapi."""
        # Arrange
        mock_strapi = AsyncMock(spec=IStrapiRepository)
        strapi_response = {"data": {"id": 1}}
        mock_strapi.post.return_value = strapi_response

        use_case = StrapiProxyPostUseCase(mock_strapi)
        request_data = {"name": "Product"}
        params = {"locale": "en"}

        # Act
        await use_case.post("/products", request_data, params=params)

        # Assert
        mock_strapi.post.assert_called_once_with("/products", request_data, params)
