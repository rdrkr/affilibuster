# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for error handling in preferences API routes.

Tests scenarios like CMS errors during currency validation.
Other edge cases (create-if-not-found, invalid session ID) are covered in
test_preferences_route.py under TestGetPreferences, TestUpdatePreferences,
and TestPreferencesEdgeCases.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from httpx import AsyncClient

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
        # Remove only the specific override we added (not all overrides)
        integration_app.dependency_overrides.pop(get_cms_content_use_case, None)
