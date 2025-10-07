# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Contract test for POST /v1/languages/detect endpoint.
Reference: contracts/api-v1.yaml:91-121
"""

import pytest
from httpx import AsyncClient


@pytest.mark.contract
async def test_detect_language_italian():
    """
    Test language detection with Italian Accept-Language header.
    Expected to fail: endpoint not implemented yet.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "acceptLanguage": "it-IT,it;q=0.9,en;q=0.8",
            "userAgent": "Mozilla/5.0",
        }
        response = await client.post("/v1/languages/detect", json=payload)

        assert response.status_code == 200
        data = response.json()

        # Should detect Italian
        assert data["detected"] == "it"
        assert data["preferred"] == "it"


@pytest.mark.contract
async def test_detect_language_response_schema():
    """
    Test that response matches DetectedLanguage schema.
    Reference: contracts/api-v1.yaml:315-340
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "acceptLanguage": "it-IT,it;q=0.9",
        }
        response = await client.post("/v1/languages/detect", json=payload)

        assert response.status_code == 200
        data = response.json()

        # Required fields
        assert "detected" in data
        assert "preferred" in data
        assert "browserLanguages" in data
        assert "fallback" in data

        # Type validation
        assert data["detected"] in ["en", "it", "he"]
        assert data["preferred"] in ["en", "it", "he"]
        assert isinstance(data["browserLanguages"], list)
        assert data["fallback"] in ["en", "it", "he"]


@pytest.mark.contract
async def test_detect_language_with_country_code():
    """Test language detection with country code."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "acceptLanguage": "en-US,en;q=0.9",
            "countryCode": "IT",
        }
        response = await client.post("/v1/languages/detect", json=payload)

        assert response.status_code == 200
        data = response.json()

        # Should have detected and preferred fields
        assert "detected" in data
        assert "preferred" in data


@pytest.mark.contract
async def test_detect_language_fallback_to_english():
    """Test that unsupported languages fall back to English."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "acceptLanguage": "fr-FR,fr;q=0.9",  # French not supported
        }
        response = await client.post("/v1/languages/detect", json=payload)

        assert response.status_code == 200
        data = response.json()

        # Should fall back to English
        assert data["fallback"] == "en"
        assert data["preferred"] == "en"


@pytest.mark.contract
async def test_detect_language_missing_accept_language():
    """Test that missing acceptLanguage returns 422."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {}
        response = await client.post("/v1/languages/detect", json=payload)

        # FastAPI should return 422 for missing required field
        assert response.status_code == 422
