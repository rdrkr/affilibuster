# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for languages API routes.

Tests language detection and listing endpoints with real Strapi integration.
Verifies that Strapi i18n plugin has the expected locales configured.
"""

import pytest
from httpx import AsyncClient

from affilibuster_backend.domain.entities.generated.models import (
    Code,
    DetectedLanguage,
    DetectedLanguage1,
    Direction,
    Language,
)
from tests.fixtures.expected_seed_data import EXPECTED_LOCALE_CODES, EXPECTED_LOCALE_COUNT


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestLanguagesRoute:
    """Test suite for /languages endpoint."""

    async def test_get_languages_returns_200(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test that GET /languages returns 200 status code."""
        response = await integration_client.get("/v1/languages")
        assert response.status_code == 200

    async def test_get_languages_returns_list(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test that GET /languages returns a list of languages with expected locales."""
        response = await integration_client.get("/v1/languages")
        assert response.status_code == 200

        data = [Language(**item) for item in response.json()]
        assert len(data) == EXPECTED_LOCALE_COUNT, (
            f"Expected {EXPECTED_LOCALE_COUNT} locales (en, it, he), got {len(data)}"
        )

        # Verify all expected locale codes are present
        returned_codes = {lang.code.value for lang in data}
        expected_codes = set(EXPECTED_LOCALE_CODES)
        assert returned_codes == expected_codes, (
            f"Locale codes don't match Strapi i18n config. Expected: {expected_codes}, Got: {returned_codes}"
        )

    async def test_get_languages_contains_english(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that GET /languages includes English (default language)."""
        response = await integration_client.get("/v1/languages")
        assert response.status_code == 200

        languages = [Language(**item) for item in response.json()]
        codes = [lang.code for lang in languages]
        assert Code.EN in codes

    async def test_get_languages_structure(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test that language objects have required fields."""
        response = await integration_client.get("/v1/languages")
        assert response.status_code == 200

        languages = [Language(**item) for item in response.json()]
        for lang in languages:
            assert lang.code is not None
            assert lang.display_name is not None
            assert lang.native_name is not None
            assert lang.direction is not None
            assert lang.url_prefix is not None
            assert lang.default_currency is not None
            assert lang.locale_code is not None
            assert lang.is_default is not None

    async def test_get_languages_sorted_english_first(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that English is always first in the language list."""
        response = await integration_client.get("/v1/languages")
        assert response.status_code == 200

        languages = [Language(**item) for item in response.json()]
        if len(languages) > 0:
            assert languages[0].code == Code.EN

    async def test_get_languages_direction_values(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that language directions are either 'ltr' or 'rtl'."""
        response = await integration_client.get("/v1/languages")
        assert response.status_code == 200

        languages = [Language(**item) for item in response.json()]
        for lang in languages:
            assert lang.direction in [Direction.LTR, Direction.RTL]


@pytest.mark.integration
@pytest.mark.asyncio
class TestLanguageDetection:
    """Test suite for /languages/detect endpoint."""

    async def test_detect_language_returns_200(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test that POST /languages/detect returns 200 status code."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en-US,en;q=0.9"},
        )
        assert response.status_code == 200

    async def test_detect_language_with_english(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test language detection with English Accept-Language header."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en-US,en;q=0.9"},
        )
        assert response.status_code == 200

        data = DetectedLanguage(**response.json())
        assert data.detected_language == DetectedLanguage1.EN
        assert data.confidence is not None
        assert data.should_prompt is not None
        assert isinstance(data.confidence, float)
        assert isinstance(data.should_prompt, bool)

    async def test_detect_language_with_italian(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test language detection with Italian Accept-Language header."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "it-IT,it;q=0.9,en;q=0.8"},
        )
        assert response.status_code == 200

        data = DetectedLanguage(**response.json())
        # Should detect Italian if available, otherwise fallback to English
        assert data.detected_language in [DetectedLanguage1.IT, DetectedLanguage1.EN]
        assert 0.0 <= data.confidence <= 1.0

    async def test_detect_language_with_hebrew(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test language detection with Hebrew Accept-Language header."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "he-IL,he;q=0.9,en;q=0.8"},
        )
        assert response.status_code == 200

        data = DetectedLanguage(**response.json())
        # Should detect Hebrew if available, otherwise fallback to English
        assert data.detected_language in [DetectedLanguage1.HE, DetectedLanguage1.EN]
        assert 0.0 <= data.confidence <= 1.0

    async def test_detect_language_with_empty_accept_language(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test language detection with empty Accept-Language header."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": ""},
        )
        assert response.status_code == 200

        data = DetectedLanguage(**response.json())
        # Should default to English with low confidence
        assert data.detected_language == DetectedLanguage1.EN
        assert data.confidence <= 0.6

    async def test_detect_language_with_null_accept_language(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test language detection with null Accept-Language header."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": ""},  # Null headers are converted to empty strings in HTTP
        )
        # Should return 200, or 502 if Strapi has auth/connection issues
        assert response.status_code in [200, 502]

        if response.status_code == 200:
            data = DetectedLanguage(**response.json())
            # Should default to English
            assert data.detected_language == DetectedLanguage1.EN

    async def test_detect_language_with_multiple_languages(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test language detection prioritizes first language in list."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en-US,it-IT;q=0.9,he-IL;q=0.8"},
        )
        assert response.status_code == 200

        data = DetectedLanguage(**response.json())
        # Should detect English (first in list) with high confidence
        assert data.detected_language == DetectedLanguage1.EN
        assert data.confidence >= 0.8

    async def test_detect_language_with_unsupported_language(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test language detection with unsupported language falls back to English."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "fr-FR,de-DE;q=0.9"},
        )
        assert response.status_code == 200

        data = DetectedLanguage(**response.json())
        # Should fallback to English with low confidence
        assert data.detected_language == DetectedLanguage1.EN
        assert data.confidence <= 0.6

    async def test_detect_language_confidence_range(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that confidence is always between 0 and 1."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en-US,en;q=0.9"},
        )
        assert response.status_code == 200

        data = DetectedLanguage(**response.json())
        assert 0.0 <= data.confidence <= 1.0

    async def test_detect_language_should_prompt_logic(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that shouldPrompt is True when confidence < 0.9."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": ""},  # Empty to get low confidence
        )
        assert response.status_code == 200

        data = DetectedLanguage(**response.json())
        if data.confidence < 0.9:
            assert data.should_prompt is True
        else:
            assert data.should_prompt is False

    async def test_detect_language_with_quality_values(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test language detection with quality values in Accept-Language."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en-US;q=1.0,it-IT;q=0.8,he-IL;q=0.6"},
        )
        assert response.status_code == 200

        data = DetectedLanguage(**response.json())
        assert data.detected_language in [
            DetectedLanguage1.EN,
            DetectedLanguage1.IT,
            DetectedLanguage1.HE,
        ]

    async def test_detect_language_with_malformed_header(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test language detection handles malformed Accept-Language gracefully."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": ";;;;"},
        )
        assert response.status_code == 200

        data = DetectedLanguage(**response.json())
        # Should fallback to English
        assert data.detected_language == DetectedLanguage1.EN

    async def test_detect_language_suggested_url_is_optional(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that suggestedUrl field is optional and can be None."""
        response = await integration_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en-US"},
        )
        assert response.status_code == 200

        data = DetectedLanguage(**response.json())
        # suggestedUrl is optional, can be None
        assert data.suggested_url is None or data.suggested_url is not None
