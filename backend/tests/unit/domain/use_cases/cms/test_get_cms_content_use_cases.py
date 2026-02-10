# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for generic Strapi proxy use cases.

Covers:
- GetCMSContentUseCase as passthrough to Strapi (read-only)
Backend is read-only - mutations should happen through Strapi Admin UI.
"""

from unittest.mock import AsyncMock

import pytest

from affilibuster_backend.domain.entities.generated.cms_entities import LocaleItem, LocalesResponse
from affilibuster_backend.domain.entities.generated.models import (
    AboutGetParametersQuery,
)
from affilibuster_backend.domain.repositories.cms_repository import ICMSRepository
from affilibuster_backend.domain.use_cases.cms.get_cms_content_use_case import (
    GetCMSContentUseCase,
)


@pytest.mark.unit
class TestGetStrapiContentUseCase:
    """Test GetCMSContentUseCase for reading data from Strapi."""

    @pytest.mark.asyncio
    async def test_execute_returns_strapi_data(self):
        """Test that execute() returns data from Strapi."""
        # Arrange
        mock_strapi = AsyncMock(spec=ICMSRepository)
        mock_response = LocalesResponse(
            root=[
                LocaleItem(
                    id=1,
                    document_id="550e8400-e29b-41d4-a716-446655440000",
                    name="English",
                    code="en",
                    created_at="2025-10-30T17:41:47.696Z",
                    updated_at="2025-10-30T18:23:15.432Z",
                    published_at="2025-10-30T17:41:47.696Z",
                    is_default=True,
                )
            ]
        )
        mock_strapi.get.return_value = mock_response

        use_case = GetCMSContentUseCase(mock_strapi)

        # Act
        result = await use_case.execute("/test-endpoint", response_model=LocalesResponse)

        # Assert
        assert result == mock_response
        mock_strapi.get.assert_called_once_with("/test-endpoint", None, LocalesResponse)

    @pytest.mark.asyncio
    async def test_execute_passes_params_to_strapi(self):
        """Test that execute() passes parameters to Strapi."""
        # Arrange
        mock_strapi = AsyncMock(spec=ICMSRepository)
        mock_response = LocalesResponse(root=[])
        mock_strapi.get.return_value = mock_response

        use_case = GetCMSContentUseCase(mock_strapi)
        params = AboutGetParametersQuery(locale="en", custom_populate="nested")

        # Act
        await use_case.execute("/about", params=params, response_model=LocalesResponse)

        # Assert
        mock_strapi.get.assert_called_once_with("/about", params, LocalesResponse)
