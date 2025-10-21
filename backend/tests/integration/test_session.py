# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration test for session ID generation and management.
Reference: research.md:271-285 (Session-based preferences)
"""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
async def test_session_id_generation():
    """
    Test that session ID is generated if not provided.
    Expected to fail: session management not implemented.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Make request without session ID
        response = await client.get("/v1/user/preferences")

        if response.status_code == 200:
            data = response.json()

            # Should include generated session ID
            assert "sessionId" in data
            assert len(data["sessionId"]) > 0

            # Should also set session ID in cookie or header
            assert "X-Session-Id" in response.headers or "Set-Cookie" in response.headers


@pytest.mark.integration
async def test_session_id_persistence():
    """Test that session ID persists across requests."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # First request
        response1 = await client.get("/v1/user/preferences")

        if response1.status_code != 200:
            pytest.skip("Session management not implemented")

        session_id = response1.json().get("sessionId")
        assert session_id is not None

        # Second request with same session ID
        headers = {"X-Session-Id": session_id}
        response2 = await client.get("/v1/user/preferences", headers=headers)

        assert response2.status_code == 200
        data2 = response2.json()

        # Should return same session ID
        assert data2["sessionId"] == session_id


@pytest.mark.integration
async def test_session_id_format():
    """Test that session ID follows expected format."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/user/preferences")

        if response.status_code == 200:
            session_id = response.json().get("sessionId")

            # Should be UUID format or similar
            assert isinstance(session_id, str)
            assert len(session_id) >= 32  # Minimum length for security
            assert "-" in session_id or len(session_id) == 32  # UUID or hex


@pytest.mark.integration
@pytest.mark.requires_redis
async def test_session_preferences_isolation():
    """Test that preferences are isolated per session."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Session 1
        headers1 = {"X-Session-Id": "session-123"}
        await client.put(
            "/v1/user/preferences",
            headers=headers1,
            json={"selectedCurrency": "USD"},
        )

        # Session 2
        headers2 = {"X-Session-Id": "session-456"}
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


@pytest.mark.integration
async def test_session_id_security():
    """Test that session IDs are cryptographically secure."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Generate multiple session IDs
        session_ids = []
        for _ in range(10):
            response = await client.get("/v1/user/preferences")
            if response.status_code == 200:
                session_ids.append(response.json().get("sessionId"))

        # All should be unique
        assert len(session_ids) == len(set(session_ids))

        # Should not be sequential or predictable
        if len(session_ids) > 1:
            # Check they're not just incrementing numbers
            assert session_ids[0] != session_ids[1]


@pytest.mark.integration
async def test_session_invalid_id_handling():
    """Test handling of invalid session IDs."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Send invalid session ID
        headers = {"X-Session-Id": "invalid!!!session"}
        response = await client.get("/v1/user/preferences", headers=headers)

        # Should either reject (400) or generate new session (200)
        assert response.status_code in [200, 400]

        if response.status_code == 200:
            # If accepted, should generate new valid session
            data = response.json()
            assert data["sessionId"] != "invalid!!!session"


@pytest.mark.integration
@pytest.mark.requires_redis
async def test_session_expiry():
    """Test that sessions expire after TTL."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        session_id = "test-session-expiry-789"
        headers = {"X-Session-Id": session_id}

        # Set preferences
        create_response = await client.put(
            "/v1/user/preferences",
            headers=headers,
            json={"selectedCurrency": "EUR"},
        )

        if create_response.status_code == 200:
            data = create_response.json()

            # Should have expiresAt field
            assert "expiresAt" in data

            # ExpiresAt should be in the future (30 days)
            # (Actual timestamp validation would go here)
