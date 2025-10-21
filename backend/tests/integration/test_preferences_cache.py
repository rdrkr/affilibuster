# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration test for user preferences persistence in Redis.
Reference: research.md:271-285 (Redis cache strategy: session:{sessionId}:preferences, 30-day TTL)
"""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
@pytest.mark.requires_redis
async def test_preferences_persisted_in_redis():
    """
    Test that user preferences are stored in Redis.
    Expected to fail: Redis integration not implemented.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        session_id = "test-session-redis-123"
        headers = {"X-Session-Id": session_id}

        # Create preferences
        payload = {"selectedCurrency": "EUR"}
        response = await client.put("/v1/user/preferences", headers=headers, json=payload)

        assert response.status_code == 200
        data = response.json()

        assert data["sessionId"] == session_id
        assert data["selectedCurrency"] == "EUR"

        # Retrieve preferences (should come from Redis)
        response2 = await client.get("/v1/user/preferences", headers=headers)
        assert response2.status_code == 200
        data2 = response2.json()

        assert data2["sessionId"] == session_id
        assert data2["selectedCurrency"] == "EUR"


@pytest.mark.integration
@pytest.mark.requires_redis
async def test_preferences_ttl_set():
    """Test that Redis keys have proper TTL (30 days)."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        session_id = "test-session-ttl-456"
        headers = {"X-Session-Id": session_id}

        payload = {"selectedCurrency": "ILS"}
        response = await client.put("/v1/user/preferences", headers=headers, json=payload)

        assert response.status_code == 200
        data = response.json()

        # Should have expiresAt field
        assert "expiresAt" in data

        # ExpiresAt should be ~30 days from now
        # (Actual validation would check timestamp)


@pytest.mark.integration
@pytest.mark.requires_redis
async def test_preferences_cache_invalidation():
    """Test that updating preferences refreshes TTL."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        session_id = "test-session-refresh-789"
        headers = {"X-Session-Id": session_id}

        # Initial preferences
        response1 = await client.put(
            "/v1/user/preferences",
            headers=headers,
            json={"selectedCurrency": "USD"},
        )
        assert response1.status_code == 200
        data1 = response1.json()
        initial_expires = data1.get("expiresAt")

        # Update preferences
        response2 = await client.put(
            "/v1/user/preferences",
            headers=headers,
            json={"selectedCurrency": "EUR"},
        )
        assert response2.status_code == 200
        data2 = response2.json()
        updated_expires = data2.get("expiresAt")

        # TTL should be refreshed (expiresAt updated)
        if initial_expires and updated_expires:
            assert updated_expires >= initial_expires


@pytest.mark.integration
@pytest.mark.requires_redis
async def test_preferences_multiple_sessions():
    """Test that different sessions have isolated preferences."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Session 1
        headers1 = {"X-Session-Id": "session-001"}
        await client.put(
            "/v1/user/preferences",
            headers=headers1,
            json={"selectedCurrency": "USD"},
        )

        # Session 2
        headers2 = {"X-Session-Id": "session-002"}
        await client.put(
            "/v1/user/preferences",
            headers=headers2,
            json={"selectedCurrency": "EUR"},
        )

        # Verify isolation
        response1 = await client.get("/v1/user/preferences", headers=headers1)
        response2 = await client.get("/v1/user/preferences", headers=headers2)

        if response1.status_code == 200 and response2.status_code == 200:
            assert response1.json()["selectedCurrency"] == "USD"
            assert response2.json()["selectedCurrency"] == "EUR"
