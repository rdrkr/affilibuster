# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for languages API route with refactored architecture.

Covers:
- GET /languages endpoint
- POST /languages/detect endpoint
- Strapi i18n data transformation
- Language detection algorithm
- Confidence scoring
"""

from unittest.mock import AsyncMock

import pytest


class TestGetLanguages:
    """Test GET /languages endpoint."""

    @pytest.mark.asyncio
    async def test_get_languages_returns_sorted_list(self, async_client, mocker):
        """Test GET /languages returns list sorted with EN first."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = [
            {
                "id": 2,
                "code": "it",
                "name": "Italian",
                "isDefault": False,
            },
            {
                "id": 1,
                "code": "en",
                "name": "English",
                "isDefault": True,
            },
            {
                "id": 3,
                "code": "he",
                "name": "Hebrew",
                "isDefault": False,
            },
        ]

        # Act
        response = await async_client.get("/v1/languages")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        assert data[0]["code"] == "en"  # EN first
        assert data[1]["code"] == "he"  # Then sorted by code
        assert data[2]["code"] == "it"

    @pytest.mark.asyncio
    async def test_get_languages_transforms_strapi_format(self, async_client, mocker):
        """Test that GET /languages transforms Strapi format correctly."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = [
            {
                "id": 1,
                "code": "en",
                "name": "English",
                "isDefault": True,
            }
        ]

        # Act
        response = await async_client.get("/v1/languages")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data[0]["code"] == "en"
        assert data[0]["displayName"] == "English"
        assert data[0]["nativeName"] == "English"
        assert data[0]["direction"] == "ltr"
        assert data[0]["urlPrefix"] == "/en"
        assert data[0]["defaultCurrency"] == "USD"
        assert data[0]["localeCode"] == "en"
        assert data[0]["isDefault"] is True

    @pytest.mark.asyncio
    async def test_get_languages_hebrew_is_rtl(self, async_client, mocker):
        """Test that Hebrew language has RTL direction."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = [
            {
                "id": 1,
                "code": "he",
                "name": "Hebrew",
                "isDefault": False,
            }
        ]

        # Act
        response = await async_client.get("/v1/languages")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data[0]["direction"] == "rtl"

    @pytest.mark.asyncio
    async def test_get_languages_italian_currency_is_eur(self, async_client, mocker):
        """Test that Italian language has EUR as default currency."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = [
            {
                "id": 1,
                "code": "it",
                "name": "Italian",
                "isDefault": False,
            }
        ]

        # Act
        response = await async_client.get("/v1/languages")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data[0]["defaultCurrency"] == "EUR"

    @pytest.mark.asyncio
    async def test_get_languages_handles_strapi_error(self, async_client, mocker):
        """Test GET /languages handles Strapi errors."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )
        mock_strapi_get.side_effect = Exception("Connection failed")

        # Act
        response = await async_client.get("/v1/languages")

        # Assert
        assert response.status_code == 502
        data = response.json()
        assert "Failed to fetch languages" in data["detail"]


class TestDetectLanguage:
    """Test POST /languages/detect endpoint."""

    @pytest.mark.asyncio
    async def test_detect_language_from_accept_language_header(self, async_client, mocker):
        """Test language detection from Accept-Language header."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = [
            {"id": 1, "code": "en", "name": "English", "isDefault": True},
            {"id": 2, "code": "it", "name": "Italian", "isDefault": False},
        ]

        # Act
        response = await async_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "it, en;q=0.9, fr;q=0.8"},
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["detectedLanguage"] == "it"  # First match
        assert data["confidence"] >= 0.6  # Should have confidence

    @pytest.mark.asyncio
    async def test_detect_language_fallback_to_en(self, async_client, mocker):
        """Test language detection falls back to EN."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = [{"id": 1, "code": "en", "name": "English", "isDefault": True}]

        # Act
        response = await async_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "fr, de, es"},  # No match
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["detectedLanguage"] == "en"
        assert data["confidence"] < 0.7  # Low confidence

    @pytest.mark.asyncio
    async def test_detect_language_high_confidence_exact_match(self, async_client, mocker):
        """Test high confidence for exact language match."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = [
            {"id": 1, "code": "en", "name": "English", "isDefault": True},
            {"id": 2, "code": "it", "name": "Italian", "isDefault": False},
        ]

        # Act
        response = await async_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en, it;q=0.9"},
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["detectedLanguage"] == "en"
        assert data["confidence"] >= 0.85  # High confidence

    @pytest.mark.asyncio
    async def test_detect_language_lower_confidence_for_lower_priority(self, async_client, mocker):
        """Test lower confidence for lower priority languages."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = [
            {"id": 1, "code": "en", "name": "English", "isDefault": True},
            {"id": 2, "code": "it", "name": "Italian", "isDefault": False},
        ]

        # Act
        response = await async_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "fr, it;q=0.8"},
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["detectedLanguage"] == "it"
        assert data["confidence"] < 0.85  # Lower than first choice

    @pytest.mark.asyncio
    async def test_detect_language_should_prompt_low_confidence(self, async_client, mocker):
        """Test shouldPrompt flag when confidence is low."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = [{"id": 1, "code": "en", "name": "English", "isDefault": True}]

        # Act
        response = await async_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "fr, de, es"},  # No match
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["shouldPrompt"] is True  # Should ask user

    @pytest.mark.asyncio
    async def test_detect_language_no_prompt_high_confidence(self, async_client, mocker):
        """Test shouldPrompt=False when confidence is high."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = [{"id": 1, "code": "en", "name": "English", "isDefault": True}]

        # Act
        response = await async_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en, it;q=0.9"},
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["shouldPrompt"] is False  # High confidence, no prompt needed

    @pytest.mark.asyncio
    async def test_detect_language_handles_strapi_error(self, async_client, mocker):
        """Test language detection handles Strapi errors."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )
        mock_strapi_get.side_effect = Exception("Strapi down")

        # Act
        response = await async_client.post(
            "/v1/languages/detect",
            json={"acceptLanguage": "en"},
        )

        # Assert
        assert response.status_code == 502
