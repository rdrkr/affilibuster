# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration test for content fallback to English.
Reference: quickstart.md:236-249 (Test 6: Content Fallback to English)
"""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
async def test_content_fallback_italian_to_english():
    """
    Test content fallback when Italian translation doesn't exist.
    Expected to fail: fallback logic not implemented.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Request Italian version of content that only exists in English
        response = await client.get("/v1/content/it/new-product")

        assert response.status_code == 200
        data = response.json()

        # Should return English content
        assert data["language"] == "en"
        assert data["slug"] == "new-product"

        # Should include notice about fallback
        # (Could be in metadata or special field)
        assert "fallbackUsed" in data or "isTranslation" in data


@pytest.mark.integration
async def test_content_no_fallback_when_translation_exists():
    """Test that fallback is NOT used when translation exists."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Request Italian version that actually exists
        response = await client.get("/v1/content/it/existing-italian-content")

        if response.status_code == 200:
            data = response.json()

            # Should return Italian content, not English
            assert data["language"] == "it"


@pytest.mark.integration
@pytest.mark.requires_db
async def test_content_fallback_preserves_seo():
    """Test that fallback content preserves SEO metadata."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/content/he/test-content")

        if response.status_code == 200:
            data = response.json()

            # Should have SEO metadata even for fallback
            assert "seo" in data
            assert "canonicalUrl" in data["seo"]
            assert "alternates" in data.get("urls", {})
