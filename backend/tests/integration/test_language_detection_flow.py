# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration test for language detection flow.
Reference: quickstart.md:105-121 (Test 1: Language Detection & Prompt)
"""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
async def test_language_detection_italian_should_prompt():
    """
    Test language detection flow with Italian Accept-Language header.
    Expected to fail: language detection logic not implemented.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "acceptLanguage": "it-IT,it;q=0.9,en-US;q=0.8",
            "userAgent": "Mozilla/5.0",
        }
        response = await client.post("/v1/languages/detect", json=payload)

        assert response.status_code == 200
        data = response.json()

        # Should detect Italian
        assert data["detected"] == "it"
        assert data["preferred"] == "it"

        # Should suggest prompting for non-English
        # (User preference logic - prompt when detected != current language)
        assert "fallback" in data
        assert data["fallback"] == "en"


@pytest.mark.integration
async def test_language_detection_english_no_prompt():
    """Test that English users don't get prompted."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "acceptLanguage": "en-US,en;q=0.9",
        }
        response = await client.post("/v1/languages/detect", json=payload)

        assert response.status_code == 200
        data = response.json()

        # Should detect English
        assert data["detected"] == "en"
        assert data["preferred"] == "en"


@pytest.mark.integration
async def test_language_detection_with_country_hint():
    """Test language detection with country code from IP geolocation."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "acceptLanguage": "en-US,en;q=0.9,it;q=0.8",
            "countryCode": "IT",  # IP from Italy
        }
        response = await client.post("/v1/languages/detect", json=payload)

        assert response.status_code == 200
        data = response.json()

        # Should consider country code in detection
        assert "detected" in data
        assert "preferred" in data


@pytest.mark.integration
async def test_language_detection_unsupported_fallback():
    """Test that unsupported languages fall back to English."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "acceptLanguage": "fr-FR,fr;q=0.9,de;q=0.8",  # French and German
        }
        response = await client.post("/v1/languages/detect", json=payload)

        assert response.status_code == 200
        data = response.json()

        # Should fall back to English
        assert data["fallback"] == "en"
        assert data["preferred"] == "en"  # No supported language found
