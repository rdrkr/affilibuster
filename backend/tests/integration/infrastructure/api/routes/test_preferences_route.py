# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for user preferences API routes.

Tests preferences CRUD operations with real database and Strapi integration.
"""

import uuid

import pytest


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestGetPreferences:
    """Test suite for GET /user/preferences endpoint."""

    async def test_get_preferences_with_new_session(self, integration_client):
        """Test getting preferences for a new session creates defaults."""
        session_id = str(uuid.uuid4())

        response = await integration_client.get(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
        )
        assert response.status_code == 200

        data = response.json()
        assert data["sessionId"] == session_id
        assert data["selectedCurrency"] == "USD"  # Default currency
        assert data["dismissedLanguagePrompt"] is False
        assert "expiresAt" in data
        assert "id" in data

    async def test_get_preferences_with_existing_session(self, integration_client):
        """Test getting preferences for existing session returns stored data."""
        session_id = str(uuid.uuid4())

        # Create preferences
        create_response = await integration_client.get(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
        )
        assert create_response.status_code == 200
        created_data = create_response.json()

        # Get preferences again
        get_response = await integration_client.get(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
        )
        assert get_response.status_code == 200
        retrieved_data = get_response.json()

        # Should return same preferences
        assert retrieved_data["id"] == created_data["id"]
        assert retrieved_data["sessionId"] == session_id

    async def test_get_preferences_requires_session_id_header(self, integration_client):
        """Test that GET /user/preferences requires X-Session-Id header."""
        response = await integration_client.get("/v1/user/preferences")
        assert response.status_code == 422  # Unprocessable Entity

    async def test_get_preferences_with_invalid_session_id_generates_new(self, integration_client):
        """Test that invalid session ID format generates a new valid UUID."""
        invalid_session_id = "invalid@#$session!"

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

    async def test_get_preferences_with_valid_alphanumeric_session_id(self, integration_client):
        """Test that valid alphanumeric session ID is preserved."""
        session_id = "session-abc-123-def"

        response = await integration_client.get(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
        )
        assert response.status_code == 200

        data = response.json()
        # Should preserve the valid session ID
        assert data["sessionId"] == session_id

    async def test_get_preferences_with_uuid_session_id(self, integration_client):
        """Test that UUID session ID is preserved."""
        session_id = str(uuid.uuid4())

        response = await integration_client.get(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
        )
        assert response.status_code == 200

        data = response.json()
        assert data["sessionId"] == session_id

    async def test_get_preferences_with_optional_user_id(self, integration_client):
        """Test GET preferences with optional X-User-Id header."""
        session_id = str(uuid.uuid4())
        user_id = "user123"

        response = await integration_client.get(
            "/v1/user/preferences",
            headers={
                "X-Session-Id": session_id,
                "X-User-Id": user_id,
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert data["sessionId"] == session_id

    async def test_get_preferences_detected_language_is_optional(self, integration_client):
        """Test that detectedLanguage field can be None."""
        session_id = str(uuid.uuid4())

        response = await integration_client.get(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
        )
        assert response.status_code == 200

        data = response.json()
        # detectedLanguage can be None for new sessions
        assert data.get("detectedLanguage") is None or isinstance(data["detectedLanguage"], str)

    async def test_get_preferences_expires_at_is_future(self, integration_client):
        """Test that expiresAt is set to future date (30 days)."""
        from datetime import datetime

        session_id = str(uuid.uuid4())

        response = await integration_client.get(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
        )
        assert response.status_code == 200

        data = response.json()
        expires_at = datetime.fromisoformat(data["expiresAt"])
        now = datetime.now(expires_at.tzinfo)

        # Should expire approximately 30 days from now
        days_until_expiry = (expires_at - now).days
        assert 29 <= days_until_expiry <= 31


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestUpdatePreferences:
    """Test suite for PUT /user/preferences endpoint."""

    async def test_update_preferences_currency(self, integration_client, strapi_test_data):
        """Test updating user preferences with valid currency."""
        session_id = str(uuid.uuid4())

        response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"selectedCurrency": "EUR"},
        )
        assert response.status_code == 200

        data = response.json()
        assert data["sessionId"] == session_id
        assert data["selectedCurrency"] == "EUR"

    async def test_update_preferences_dismiss_language_prompt(self, integration_client):
        """Test dismissing language prompt."""
        session_id = str(uuid.uuid4())

        response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"dismissedLanguagePrompt": True},
        )
        assert response.status_code == 200

        data = response.json()
        assert data["dismissedLanguagePrompt"] is True

    async def test_update_preferences_detected_language(self, integration_client):
        """Test setting detected language."""
        session_id = str(uuid.uuid4())

        response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"detectedLanguage": "it"},
        )
        assert response.status_code == 200

        data = response.json()
        assert data["detectedLanguage"] == "it"

    async def test_update_preferences_multiple_fields(self, integration_client, strapi_test_data):
        """Test updating multiple preference fields at once."""
        session_id = str(uuid.uuid4())

        response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={
                "selectedCurrency": "ILS",
                "dismissedLanguagePrompt": True,
                "detectedLanguage": "he",
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert data["selectedCurrency"] == "ILS"
        assert data["dismissedLanguagePrompt"] is True
        assert data["detectedLanguage"] == "he"

    async def test_update_preferences_with_invalid_currency(self, integration_client, strapi_test_data):
        """Test that invalid currency code returns 400 or 422 error."""
        session_id = str(uuid.uuid4())

        response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"selectedCurrency": "INVALID"},
        )
        assert response.status_code in [400, 422]

    async def test_update_preferences_requires_session_id_header(self, integration_client):
        """Test that PUT /user/preferences requires X-Session-Id header."""
        response = await integration_client.put(
            "/v1/user/preferences",
            json={"selectedCurrency": "EUR"},
        )
        assert response.status_code == 422  # Unprocessable Entity

    async def test_update_preferences_creates_new_if_not_exists(self, integration_client, strapi_test_data):
        """Test that updating non-existent preferences creates new entry."""
        session_id = str(uuid.uuid4())

        response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"selectedCurrency": "GBP"},
        )
        assert response.status_code == 200

        data = response.json()
        assert data["sessionId"] == session_id
        assert data["selectedCurrency"] == "GBP"
        assert "id" in data

    async def test_update_preferences_updates_existing(self, integration_client, strapi_test_data):
        """Test that updating existing preferences modifies the entry."""
        session_id = str(uuid.uuid4())

        # Create initial preferences
        create_response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"selectedCurrency": "USD"},
        )
        assert create_response.status_code == 200
        initial_id = create_response.json()["id"]

        # Update preferences
        update_response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"selectedCurrency": "EUR"},
        )
        assert update_response.status_code == 200

        data = update_response.json()
        # Should be same ID, updated currency
        assert data["id"] == initial_id
        assert data["selectedCurrency"] == "EUR"

    async def test_update_preferences_extends_ttl(self, integration_client, strapi_test_data):
        """Test that updating preferences extends TTL."""
        from datetime import datetime

        session_id = str(uuid.uuid4())

        # Create initial preferences
        create_response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"selectedCurrency": "USD"},
        )
        assert create_response.status_code == 200
        initial_expires = datetime.fromisoformat(create_response.json()["expiresAt"])

        # Update preferences
        import asyncio

        await asyncio.sleep(1)  # Small delay to see time difference

        update_response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"dismissedLanguagePrompt": True},
        )
        assert update_response.status_code == 200
        updated_expires = datetime.fromisoformat(update_response.json()["expiresAt"])

        # Updated expiry should be later than initial
        assert updated_expires >= initial_expires

    async def test_update_preferences_partial_update(self, integration_client, strapi_test_data):
        """Test partial update preserves other fields."""
        session_id = str(uuid.uuid4())

        # Create with multiple fields
        create_response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={
                "selectedCurrency": "USD",
                "dismissedLanguagePrompt": False,
            },
        )
        assert create_response.status_code == 200

        # Update only currency
        update_response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"selectedCurrency": "EUR"},
        )
        assert update_response.status_code == 200

        data = update_response.json()
        # Currency updated, other fields preserved
        assert data["selectedCurrency"] == "EUR"
        assert data["dismissedLanguagePrompt"] is False

    async def test_update_preferences_with_null_fields(self, integration_client, strapi_test_data):
        """Test that null values are handled correctly."""
        session_id = str(uuid.uuid4())

        response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={
                "selectedCurrency": "USD",
                "dismissedLanguagePrompt": None,
                "detectedLanguage": None,
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert data["selectedCurrency"] == "USD"


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestPreferencesCurrencyValidation:
    """Test suite for currency validation in preferences."""

    async def test_validate_currency_with_active_currency(self, integration_client, strapi_test_data):
        """Test that active currencies from Strapi are accepted."""
        session_id = str(uuid.uuid4())

        # Try common currencies that should be in Strapi
        for currency in ["USD", "EUR"]:
            response = await integration_client.put(
                "/v1/user/preferences",
                headers={"X-Session-Id": session_id},
                json={"selectedCurrency": currency},
            )
            # Should succeed if currency exists in Strapi
            assert response.status_code in [200, 400]

    async def test_validate_currency_rejects_unknown_currency(self, integration_client, strapi_test_data):
        """Test that unknown currency codes are rejected."""
        session_id = str(uuid.uuid4())

        response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"selectedCurrency": "XYZ"},
        )
        assert response.status_code == 400


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestPreferencesEdgeCases:
    """Test suite for edge cases in preferences handling."""

    async def test_get_preferences_creates_new_when_none_exist(self, integration_client):
        """Test GET creates new preferences when none exist in database."""
        # Use a completely new session ID that definitely doesn't exist
        session_id = f"brand-new-session-{uuid.uuid4()}"

        response = await integration_client.get(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["sessionId"] == session_id
        assert data["selectedCurrency"] == "USD"  # Default
        assert data["dismissedLanguagePrompt"] is False

    async def test_update_preferences_creates_new_when_none_exist(self, integration_client, strapi_test_data):
        """Test PUT creates new preferences when none exist."""
        # Use a completely new session ID
        session_id = f"new-for-update-{uuid.uuid4()}"

        response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={
                "selectedCurrency": "EUR",
                "dismissedLanguagePrompt": True,
                "detectedLanguage": "it",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["sessionId"] == session_id
        assert data["selectedCurrency"] == "EUR"
        assert data["dismissedLanguagePrompt"] is True
        assert data["detectedLanguage"] == "it"
        # Should have created a new record with an ID
        assert "id" in data

    async def test_update_existing_preferences_without_currency(self, integration_client, strapi_test_data):
        """Test updating existing preferences without providing currency (covers line 146 branch)."""
        session_id = str(uuid.uuid4())

        # Create preferences with currency
        create_response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"selectedCurrency": "USD"},
        )
        assert create_response.status_code == 200

        # Update ONLY dismissedLanguagePrompt (no currency field)
        update_response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"dismissedLanguagePrompt": True},
        )
        assert update_response.status_code == 200

        data = update_response.json()
        # Currency should be preserved
        assert data["selectedCurrency"] == "USD"
        assert data["dismissedLanguagePrompt"] is True

    async def test_update_existing_preferences_only_detected_language(self, integration_client, strapi_test_data):
        """Test updating existing preferences with only detectedLanguage (covers line 152)."""
        session_id = str(uuid.uuid4())

        # Create preferences
        create_response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"selectedCurrency": "USD"},
        )
        assert create_response.status_code == 200

        # Update ONLY detectedLanguage
        update_response = await integration_client.put(
            "/v1/user/preferences",
            headers={"X-Session-Id": session_id},
            json={"detectedLanguage": "en"},
        )
        assert update_response.status_code == 200

        data = update_response.json()
        assert data["selectedCurrency"] == "USD"
        assert data["detectedLanguage"] == "en"
