# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for error handling in languages API routes.

Tests error scenarios that are difficult to trigger with the real CMS,
such as 502 Bad Gateway when the CMS is unreachable or returns errors.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from httpx import AsyncClient

from affilibuster_backend.domain.use_cases.get_cms_content_use_case import GetCMSContentUseCase
from affilibuster_backend.infrastructure.dependencies import get_cms_content_use_case


@pytest.mark.integration
@pytest.mark.asyncio
async def test_get_languages_handles_cms_error(integration_app: FastAPI, integration_client: AsyncClient) -> None:
    """Test that get languages handles CMS errors gracefully."""
    # Mock the use case to raise an exception
    mock_use_case = MagicMock(spec=GetCMSContentUseCase)
    mock_use_case.execute = AsyncMock(side_effect=Exception("CMS Error"))

    # Override the dependency
    integration_app.dependency_overrides[get_cms_content_use_case] = lambda: mock_use_case

    try:
        response = await integration_client.get("/v1/languages")
        assert response.status_code == 502
        data = response.json()
        assert "Failed to fetch languages" in data["detail"]
    finally:
        # Clean up
        integration_app.dependency_overrides = {}


@pytest.mark.integration
@pytest.mark.asyncio
async def test_detect_language_handles_cms_error(integration_app: FastAPI, integration_client: AsyncClient) -> None:
    """Test that detect language handles CMS errors gracefully."""
    # Mock the use case to raise an exception
    mock_use_case = MagicMock(spec=GetCMSContentUseCase)
    mock_use_case.execute = AsyncMock(side_effect=Exception("CMS Error"))

    # Override the dependency
    integration_app.dependency_overrides[get_cms_content_use_case] = lambda: mock_use_case

    try:
        response = await integration_client.post("/v1/languages/detect", json={"acceptLanguage": "en"})
        assert response.status_code == 502
        data = response.json()
        assert "Failed to detect language" in data["detail"]
    finally:
        # Clean up
        integration_app.dependency_overrides = {}
