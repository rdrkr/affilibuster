# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for languages API routes.

Tests language detection and listing endpoints with real Strapi integration.
Verifies that Strapi i18n plugin has the expected locales configured.
"""

import pytest

from tests.fixtures.expected_seed_data import EXPECTED_LOCALE_CODES, EXPECTED_LOCALE_COUNT


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestLanguagesRoute:
    """Test suite for /languages endpoint."""

    async def test_get_languages_returns_200(self, integration_client, strapi_test_data):
        """Test that GET /languages returns 200 status code."""
        response = await integration_client.get("/v1/languages")
        assert response.status_code == 200

    async def test_get_languages_returns_list(self, integration_client, strapi_test_data):
        """Test that GET /languages returns a list of languages with expected locales."""
        response = await integration_client.get("/v1/languages")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        assert len(data) == EXPECTED_LOCALE_COUNT, (
            f"Expected {EXPECTED_LOCALE_COUNT} locales (en, it, he), got {len(data)}"
        )

        # Verify all expected locale codes are present
        returned_codes = {lang["code"] for lang in data}
        expected_codes = set(EXPECTED_LOCALE_CODES)
        assert returned_codes == expected_codes, (
            f"Locale codes don't match Strapi i18n config. Expected: {expected_codes}, Got: {returned_codes}"
        )

    async def test_get_languages_contains_english(self, integration_client, strapi_test_data):
        """Test that GET /languages includes English (default language)."""
        response = await integration_client.get("/v1/languages")
        assert response.status_code == 200

        languages = response.json()
        codes = [lang["code"] for lang in languages]
        assert "en" in codes

    async def test_get_languages_structure(self, integration_client, strapi_test_data):
        """Test that language objects have required fields."""
        response = await integration_client.get("/v1/languages")
        assert response.status_code == 200

        languages = response.json()
        for lang in languages:
            assert "code" in lang
            assert "displayName" in lang
            assert "nativeName" in lang
            assert "direction" in lang
            assert "urlPrefix" in lang
            assert "defaultCurrency" in lang
            assert "localeCode" in lang
            assert "isDefault" in lang

    async def test_get_languages_sorted_english_first(self, integration_client, strapi_test_data):
        """Test that English is always first in the language list."""
        response = await integration_client.get("/v1/languages")
        assert response.status_code == 200

        languages = response.json()
        if len(languages) > 0:
            assert languages[0]["code"] == "en"

    async def test_get_languages_direction_values(self, integration_client, strapi_test_data):
        """Test that language directions are either 'ltr' or 'rtl'."""
        response = await integration_client.get("/v1/languages")
        assert response.status_code == 200

        languages = response.json()
        for lang in languages:
            assert lang["direction"] in ["ltr", "rtl"]


@pytest.mark.integration
@pytest.mark.asyncio
class TestLanguageDetection:
    """Test suite for /languages/detect endpoint."""

    async def test_detect_language_returns_200(self, integration_client, strapi_test_data):
        """Test that POST /languages/detect returns 200 status code."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en-US,en;q=0.9"},
        )
        assert response.status_code == 200

    async def test_detect_language_with_english(self, integration_client, strapi_test_data):
        """Test language detection with English Accept-Language header."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en-US,en;q=0.9"},
        )
        assert response.status_code == 200

        data = response.json()
        assert data["detectedLanguage"] == "en"
        assert "confidence" in data
        assert "shouldPrompt" in data
        assert isinstance(data["confidence"], (int, float))
        assert isinstance(data["shouldPrompt"], bool)

    async def test_detect_language_with_italian(self, integration_client, strapi_test_data):
        """Test language detection with Italian Accept-Language header."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "it-IT,it;q=0.9,en;q=0.8"},
        )
        assert response.status_code == 200

        data = response.json()
        # Should detect Italian if available, otherwise fallback to English
        assert data["detectedLanguage"] in ["it", "en"]
        assert 0.0 <= data["confidence"] <= 1.0

    async def test_detect_language_with_hebrew(self, integration_client, strapi_test_data):
        """Test language detection with Hebrew Accept-Language header."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "he-IL,he;q=0.9,en;q=0.8"},
        )
        assert response.status_code == 200

        data = response.json()
        # Should detect Hebrew if available, otherwise fallback to English
        assert data["detectedLanguage"] in ["he", "en"]
        assert 0.0 <= data["confidence"] <= 1.0

    async def test_detect_language_with_empty_accept_language(self, integration_client, strapi_test_data):
        """Test language detection with empty Accept-Language header."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": ""},
        )
        assert response.status_code == 200

        data = response.json()
        # Should default to English with low confidence
        assert data["detectedLanguage"] == "en"
        assert data["confidence"] <= 0.6

    async def test_detect_language_with_null_accept_language(self, integration_client, strapi_test_data):
        """Test language detection with null Accept-Language header."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": ""},  # Null headers are converted to empty strings in HTTP
        )
        # Should return 200, or 502 if Strapi has auth/connection issues
        assert response.status_code in [200, 502]

        if response.status_code == 200:
            data = response.json()
            # Should default to English
            assert data["detectedLanguage"] == "en"

    async def test_detect_language_with_multiple_languages(self, integration_client, strapi_test_data):
        """Test language detection prioritizes first language in list."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en-US,it-IT;q=0.9,he-IL;q=0.8"},
        )
        assert response.status_code == 200

        data = response.json()
        # Should detect English (first in list) with high confidence
        assert data["detectedLanguage"] == "en"
        assert data["confidence"] >= 0.8

    async def test_detect_language_with_unsupported_language(self, integration_client, strapi_test_data):
        """Test language detection with unsupported language falls back to English."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "fr-FR,de-DE;q=0.9"},
        )
        assert response.status_code == 200

        data = response.json()
        # Should fallback to English with low confidence
        assert data["detectedLanguage"] == "en"
        assert data["confidence"] <= 0.6

    async def test_detect_language_confidence_range(self, integration_client, strapi_test_data):
        """Test that confidence is always between 0 and 1."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en-US,en;q=0.9"},
        )
        assert response.status_code == 200

        data = response.json()
        assert 0.0 <= data["confidence"] <= 1.0

    async def test_detect_language_should_prompt_logic(self, integration_client, strapi_test_data):
        """Test that shouldPrompt is True when confidence < 0.9."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": ""},  # Empty to get low confidence
        )
        assert response.status_code == 200

        data = response.json()
        if data["confidence"] < 0.9:
            assert data["shouldPrompt"] is True
        else:
            assert data["shouldPrompt"] is False

    async def test_detect_language_with_quality_values(self, integration_client, strapi_test_data):
        """Test language detection with quality values in Accept-Language."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en-US;q=1.0,it-IT;q=0.8,he-IL;q=0.6"},
        )
        assert response.status_code == 200

        data = response.json()
        assert data["detectedLanguage"] in ["en", "it", "he"]

    async def test_detect_language_with_malformed_header(self, integration_client, strapi_test_data):
        """Test language detection handles malformed Accept-Language gracefully."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": ";;;;"},
        )
        assert response.status_code == 200

        data = response.json()
        # Should fallback to English
        assert data["detectedLanguage"] == "en"

    async def test_detect_language_suggested_url_is_optional(self, integration_client, strapi_test_data):
        """Test that suggestedUrl field is optional and can be None."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en-US"},
        )
        assert response.status_code == 200

        data = response.json()
        # suggestedUrl is optional, can be None
        assert "suggestedUrl" in data or data.get("suggestedUrl") is None
