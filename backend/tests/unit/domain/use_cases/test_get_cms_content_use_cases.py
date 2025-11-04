# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for generic Strapi proxy use cases.

Covers:
- GetCMSContentUseCase as passthrough to Strapi (read-only)
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from typing import Any
from unittest.mock import AsyncMock

import pytest
from pydantic import BaseModel

from affilibuster_backend.domain.repositories.cms_repository import ICMSRepository
from affilibuster_backend.domain.use_cases.get_cms_content_use_case import (
    GetCMSContentUseCase,
)


# Mock response model for testing
class MockResponse(BaseModel):
    """Mock response model for testing."""

    data: list[Any]


@pytest.mark.unit
class TestGetStrapiContentUseCase:
    """Test GetCMSContentUseCase for reading data from Strapi."""

    @pytest.mark.asyncio
    async def test_execute_returns_strapi_data(self):
        """Test that execute() returns data from Strapi."""
        # Arrange
        mock_strapi = AsyncMock(spec=ICMSRepository)
        mock_response = MockResponse(data=[{"id": 1, "name": "Test"}])
        mock_strapi.get.return_value = mock_response

        use_case = GetCMSContentUseCase(mock_strapi)

        # Act
        result = await use_case.execute("/test-endpoint", response_model=MockResponse)

        # Assert
        assert result == mock_response
        mock_strapi.get.assert_called_once_with("/test-endpoint", None, MockResponse)

    @pytest.mark.asyncio
    async def test_execute_passes_params_to_strapi(self):
        """Test that execute() passes parameters to Strapi."""
        # Arrange
        mock_strapi = AsyncMock(spec=ICMSRepository)
        mock_response = MockResponse(data=[])
        mock_strapi.get.return_value = mock_response

        use_case = GetCMSContentUseCase(mock_strapi)
        params = {"locale": "en", "sort": "createdAt"}

        # Act
        await use_case.execute("/products", params=params, response_model=MockResponse)

        # Assert
        mock_strapi.get.assert_called_once_with("/products", params, MockResponse)
