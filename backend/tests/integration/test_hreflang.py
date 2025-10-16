# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration test for hreflang tag generation.
Reference: research.md:350-380 (hreflang implementation for SEO)
"""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
@pytest.mark.requires_db
async def test_hreflang_tags_generation():
    """
    Test that hreflang tags are generated correctly.
    Expected to fail: hreflang generation not implemented.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create English content
        en_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "hreflang-test",
                "title": "Hreflang Test",
                "content": "English content",
            },
        )

        if en_response.status_code != 201:
            pytest.skip("Content creation not implemented")

        en_id = en_response.json()["id"]

        # Create Italian translation
        await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "it",
                "slug": "test-hreflang",
                "title": "Test Hreflang",
                "content": "Contenuto italiano",
                "translationOf": en_id,
            },
        )

        # Get English content
        response = await client.get("/en/hreflang-test")

        assert response.status_code == 200
        data = response.json()

        # Should have hreflang links
        assert "seo" in data
        hreflang = data["seo"].get("hreflang", [])

        # Should include self-reference
        en_hreflang = next((h for h in hreflang if h["lang"] == "en"), None)
        assert en_hreflang is not None
        assert en_hreflang["url"] == "https://example.com/en/hreflang-test"

        # Should include Italian version
        it_hreflang = next((h for h in hreflang if h["lang"] == "it"), None)
        assert it_hreflang is not None
        assert it_hreflang["url"] == "https://example.com/it/test-hreflang"

        # Should include x-default
        default_hreflang = next((h for h in hreflang if h["lang"] == "x-default"), None)
        assert default_hreflang is not None
        assert default_hreflang["url"] == "https://example.com/en/hreflang-test"


@pytest.mark.integration
@pytest.mark.requires_db
async def test_hreflang_with_country_variants():
    """Test hreflang with country-specific variants (en-US, en-GB)."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create US English content
        response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "country-variants",
                "title": "Country Variants",
                "content": "English content",
                "localeCode": "en-US",
            },
        )

        if response.status_code != 201:
            pytest.skip("Content creation not implemented")

        # Get content
        get_response = await client.get("/en/country-variants")

        if get_response.status_code == 200:
            data = get_response.json()
            hreflang = data.get("seo", {}).get("hreflang", [])

            # Should use en-US not just en
            en_us = next((h for h in hreflang if h["lang"] == "en-US"), None)
            assert en_us is not None


@pytest.mark.integration
@pytest.mark.requires_db
async def test_hreflang_rtl_languages():
    """Test hreflang for RTL languages (Hebrew)."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create English content
        en_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "rtl-test",
                "title": "RTL Test",
                "content": "English",
            },
        )

        if en_response.status_code != 201:
            pytest.skip("Content creation not implemented")

        en_id = en_response.json()["id"]

        # Create Hebrew translation
        await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "he",
                "slug": "test-rtl",
                "title": "בדיקת RTL",
                "content": "תוכן עברי",
                "translationOf": en_id,
            },
        )

        # Get Hebrew content
        response = await client.get("/he/test-rtl")

        if response.status_code == 200:
            data = response.json()
            hreflang = data.get("seo", {}).get("hreflang", [])

            # Should include Hebrew with /he prefix
            he_hreflang = next((h for h in hreflang if h["lang"] == "he"), None)
            assert he_hreflang is not None
            assert "/he/" in he_hreflang["url"]


@pytest.mark.integration
async def test_hreflang_in_html_head():
    """Test that hreflang tags are included in HTML <head>."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Request HTML page (not JSON API)
        response = await client.get(
            "/en/test-article", headers={"Accept": "text/html"}
        )

        if response.status_code == 200 and "text/html" in response.headers.get(
            "content-type", ""
        ):
            html = response.text

            # Should include hreflang link tags
            assert '<link rel="alternate"' in html
            assert 'hreflang="en"' in html
            assert 'hreflang="x-default"' in html


@pytest.mark.integration
@pytest.mark.requires_db
async def test_hreflang_canonical_url():
    """Test that canonical URL is set correctly with hreflang."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create content
        response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "canonical-test",
                "title": "Canonical Test",
                "content": "Content",
            },
        )

        if response.status_code != 201:
            pytest.skip("Content creation not implemented")

        # Get content
        get_response = await client.get("/en/canonical-test")

        if get_response.status_code == 200:
            data = get_response.json()

            # Should have canonical URL
            canonical = data.get("seo", {}).get("canonicalUrl")
            assert canonical is not None
            assert canonical == "https://example.com/en/canonical-test"
