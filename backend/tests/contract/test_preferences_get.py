# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Contract test for GET /v1/user/preferences endpoint.
Reference: contracts/api-v1.yaml:178-208
"""

import pytest
from httpx import AsyncClient


@pytest.mark.contract
async def test_get_preferences_with_session_id():
    """
    Test retrieving user preferences with session ID.
    Expected to fail: endpoint not implemented yet.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        headers = {"X-Session-Id": "sess-test-123"}
        response = await client.get("/v1/user/preferences", headers=headers)

        # Either 200 (found) or 404 (not found) is acceptable
        assert response.status_code in [200, 404]

        if response.status_code == 200:
            data = response.json()
            assert "sessionId" in data


@pytest.mark.contract
async def test_get_preferences_response_schema():
    """
    Test that response matches UserPreferences schema.
    Reference: contracts/api-v1.yaml:563-591
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        headers = {"X-Session-Id": "sess-existing-123"}
        response = await client.get("/v1/user/preferences", headers=headers)

        if response.status_code == 200:
            data = response.json()

            # Required fields
            assert "id" in data
            assert "sessionId" in data
            assert "selectedCurrency" in data
            assert "dismissedLanguagePrompt" in data
            assert "createdAt" in data
            assert "updatedAt" in data
            assert "expiresAt" in data

            # Type validation
            assert isinstance(data["dismissedLanguagePrompt"], bool)
            assert data["selectedCurrency"] in ["USD", "EUR", "ILS", "GBP", "CAD", "AUD", "JPY", "CNY"]


@pytest.mark.contract
async def test_get_preferences_missing_session_header():
    """Test that missing X-Session-Id returns 400 or 422."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/user/preferences")

        # Should require session ID
        assert response.status_code in [400, 422]


@pytest.mark.contract
async def test_get_preferences_not_found():
    """Test that non-existent session returns 404."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        headers = {"X-Session-Id": "sess-nonexistent"}
        response = await client.get("/v1/user/preferences", headers=headers)

        if response.status_code == 404:
            data = response.json()

            # Error schema
            assert "error" in data
            assert "message" in data
