# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Contract test for GET /v1/languages endpoint.
Reference: contracts/api-v1.yaml:76-89
"""

import pytest
from httpx import AsyncClient


@pytest.mark.contract
async def test_get_languages_returns_array():
    """
    Test that GET /v1/languages returns an array of languages.
    Expected to fail: endpoint not implemented yet.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/languages")

        assert response.status_code == 200
        data = response.json()

        # Validate response is an array
        assert isinstance(data, list)

        # Should have 3 languages: en, it, he
        assert len(data) == 3


@pytest.mark.contract
async def test_get_languages_schema():
    """
    Test that each language matches the Language schema.
    Reference: contracts/api-v1.yaml:276-313
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/languages")

        assert response.status_code == 200
        languages = response.json()

        # Validate schema for each language
        for lang in languages:
            # Required fields
            assert "code" in lang
            assert "displayName" in lang
            assert "nativeName" in lang
            assert "direction" in lang
            assert "urlPrefix" in lang
            assert "defaultCurrency" in lang
            assert "localeCode" in lang
            assert "isDefault" in lang
            assert "isActive" in lang
            assert "sortOrder" in lang

            # Type validation
            assert lang["code"] in ["en", "it", "he"]
            assert lang["direction"] in ["ltr", "rtl"]
            assert isinstance(lang["isDefault"], bool)
            assert isinstance(lang["isActive"], bool)
            assert isinstance(lang["sortOrder"], int)


@pytest.mark.contract
async def test_get_languages_includes_required_codes():
    """Test that response includes en, it, and he languages."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/languages")

        assert response.status_code == 200
        languages = response.json()

        codes = [lang["code"] for lang in languages]
        assert "en" in codes
        assert "it" in codes
        assert "he" in codes


@pytest.mark.contract
async def test_get_languages_english_is_default():
    """Test that English is marked as the default language."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/languages")

        assert response.status_code == 200
        languages = response.json()

        # Find English
        english = next((lang for lang in languages if lang["code"] == "en"), None)
        assert english is not None
        assert english["isDefault"] is True

        # Ensure only one default
        defaults = [lang for lang in languages if lang["isDefault"]]
        assert len(defaults) == 1


@pytest.mark.contract
async def test_get_languages_hebrew_is_rtl():
    """Test that Hebrew has RTL direction."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/languages")

        assert response.status_code == 200
        languages = response.json()

        hebrew = next((lang for lang in languages if lang["code"] == "he"), None)
        assert hebrew is not None
        assert hebrew["direction"] == "rtl"
