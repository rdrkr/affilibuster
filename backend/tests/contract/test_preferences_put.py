# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Contract test for PUT /v1/user/preferences endpoint.
Reference: contracts/api-v1.yaml:210-233
"""

import pytest
from httpx import AsyncClient


@pytest.mark.contract
async def test_update_preferences_currency():
    """
    Test updating user currency preference.
    Expected to fail: endpoint not implemented yet.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        headers = {"X-Session-Id": "sess-test-456"}
        payload = {"selectedCurrency": "EUR"}

        response = await client.put("/v1/user/preferences", headers=headers, json=payload)

        assert response.status_code == 200
        data = response.json()

        # Should return full UserPreferences object
        assert "selectedCurrency" in data
        assert data["selectedCurrency"] == "EUR"


@pytest.mark.contract
async def test_update_preferences_response_schema():
    """
    Test that response matches UserPreferences schema.
    Reference: contracts/api-v1.yaml:563-591
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        headers = {"X-Session-Id": "sess-test-789"}
        payload = {"dismissedLanguagePrompt": True}

        response = await client.put("/v1/user/preferences", headers=headers, json=payload)

        assert response.status_code == 200
        data = response.json()

        # All UserPreferences fields should be present
        assert "id" in data
        assert "sessionId" in data
        assert "selectedCurrency" in data
        assert "dismissedLanguagePrompt" in data
        assert "createdAt" in data
        assert "updatedAt" in data
        assert "expiresAt" in data


@pytest.mark.contract
async def test_update_preferences_creates_if_not_exists():
    """Test that PUT creates preferences if they don't exist."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        headers = {"X-Session-Id": "sess-brand-new"}
        payload = {"selectedCurrency": "ILS"}

        response = await client.put("/v1/user/preferences", headers=headers, json=payload)

        # Should create and return 200
        assert response.status_code == 200
        data = response.json()

        assert data["selectedCurrency"] == "ILS"
        assert data["sessionId"] == "sess-brand-new"


@pytest.mark.contract
async def test_update_preferences_missing_session_header():
    """Test that missing X-Session-Id returns 400 or 422."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {"selectedCurrency": "EUR"}
        response = await client.put("/v1/user/preferences", json=payload)

        assert response.status_code in [400, 422]


@pytest.mark.contract
async def test_update_preferences_invalid_currency():
    """Test that invalid currency code returns 400 or 422."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        headers = {"X-Session-Id": "sess-test"}
        payload = {"selectedCurrency": "XXX"}  # Invalid

        response = await client.put("/v1/user/preferences", headers=headers, json=payload)

        assert response.status_code in [400, 422]


@pytest.mark.contract
async def test_update_preferences_multiple_fields():
    """Test updating multiple preference fields at once."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        headers = {"X-Session-Id": "sess-multi-update"}
        payload = {
            "selectedCurrency": "GBP",
            "dismissedLanguagePrompt": True,
        }

        response = await client.put("/v1/user/preferences", headers=headers, json=payload)

        assert response.status_code == 200
        data = response.json()

        assert data["selectedCurrency"] == "GBP"
        assert data["dismissedLanguagePrompt"] is True
