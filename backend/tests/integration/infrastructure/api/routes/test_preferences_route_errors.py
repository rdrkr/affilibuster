# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for error handling and edge cases in preferences API routes.

Tests scenarios like CMS errors during validation and creating new preferences
when none exist.
"""

import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from httpx import AsyncClient

from affilibuster_backend.domain.entities.generated.models import CurrencyCode
from affilibuster_backend.domain.use_cases.cms.get_cms_content_use_case import GetCMSContentUseCase
from affilibuster_backend.infrastructure.dependencies import get_cms_content_use_case


@pytest.mark.integration
@pytest.mark.asyncio
async def test_update_preferences_handles_cms_error_during_validation(
    integration_app: FastAPI, integration_client: AsyncClient
) -> None:
    """Test that update preferences handles CMS errors during currency validation."""
    # Mock the use case to raise an exception
    mock_use_case = MagicMock(spec=GetCMSContentUseCase)
    mock_use_case.execute = AsyncMock(side_effect=Exception("CMS Error"))

    # Override the dependency
    integration_app.dependency_overrides[get_cms_content_use_case] = lambda: mock_use_case

    try:
        # Should return 400 because validation fails (returns False on exception)
        response = await integration_client.put(
            "/v1/user/preferences",
            json={"selectedCurrency": "USD"},
            headers={"X-Session-Id": "test-session-error"},
        )
        assert response.status_code == 400
        data = response.json()
        assert "Invalid currency code" in data["message"]
    finally:
        # Clean up
        integration_app.dependency_overrides = {}


@pytest.mark.integration
@pytest.mark.asyncio
async def test_get_preferences_creates_new_if_not_found(integration_client: AsyncClient) -> None:
    """Test that get preferences creates new preferences if not found."""
    # Use a new random session ID
    session_id = str(uuid.uuid4())

    response = await integration_client.get(
        "/v1/user/preferences",
        headers={"X-Session-Id": session_id},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["sessionId"] == session_id
    assert data["selectedCurrency"] == CurrencyCode.USD.value
    assert data["dismissedLanguagePrompt"] is False


@pytest.mark.integration
@pytest.mark.asyncio
async def test_update_preferences_creates_new_if_not_found(integration_client: AsyncClient) -> None:
    """Test that update preferences creates new preferences if not found."""
    # Use a new random session ID
    session_id = str(uuid.uuid4())

    response = await integration_client.put(
        "/v1/user/preferences",
        json={"selectedCurrency": "EUR"},
        headers={"X-Session-Id": session_id},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["sessionId"] == session_id
    assert data["selectedCurrency"] == CurrencyCode.EUR.value


@pytest.mark.integration
@pytest.mark.asyncio
async def test_get_preferences_handles_invalid_session_id(integration_client: AsyncClient) -> None:
    """Test that get preferences handles invalid session ID by generating a new one."""
    # Use an invalid session ID (contains special chars)
    invalid_session_id = "invalid/session@id"

    response = await integration_client.get(
        "/v1/user/preferences",
        headers={"X-Session-Id": invalid_session_id},
    )

    assert response.status_code == 200
    data = response.json()
    # Should have generated a new valid UUID
    assert data["sessionId"] != invalid_session_id
    # Verify it's a valid UUID
    uuid.UUID(data["sessionId"])
