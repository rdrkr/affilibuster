# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for route error handling.

Tests exception handling paths in all API routes using mocked dependencies.
"""

from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException


@pytest.mark.asyncio
@pytest.mark.unit
class TestLanguagesRouteErrorHandling:
    """Test error handling in languages routes."""

    async def test_get_languages_raises_502_on_exception(self):
        """Test that GET /languages raises HTTPException on error."""
        from affilibuster_backend.infrastructure.api.routes.languages import get_languages

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")

        with pytest.raises(HTTPException) as exc_info:
            await get_languages(use_case)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch languages from Strapi" in exc_info.value.detail

    async def test_detect_language_raises_502_on_exception(self):
        """Test that POST /languages/detect raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import LanguagesDetectPostRequest
        from affilibuster_backend.infrastructure.api.routes.languages import detect_language

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        request = LanguagesDetectPostRequest(accept_language="en-US")

        with pytest.raises(HTTPException) as exc_info:
            await detect_language(request, use_case)

        assert exc_info.value.status_code == 502
        assert "Failed to detect language" in exc_info.value.detail
