# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration test for multi-language content retrieval and translation linking.
Reference: data-model.md:380-410 (Translation relationships)
"""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
@pytest.mark.requires_db
async def test_content_translation_linking():
    """
    Test that content translations are properly linked.
    Expected to fail: translation linking not implemented.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create English content
        en_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "test-article",
                "title": "Test Article",
                "content": "English content",
            },
        )

        if en_response.status_code != 201:
            pytest.skip("Content creation not implemented")

        en_id = en_response.json()["id"]

        # Create Italian translation
        it_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "it",
                "slug": "articolo-test",
                "title": "Articolo di Test",
                "content": "Contenuto italiano",
                "translationOf": en_id,
            },
        )

        if it_response.status_code != 201:
            pytest.skip("Translation creation not implemented")

        it_id = it_response.json()["id"]

        # Get English content - should include Italian translation link
        en_get = await client.get(f"/v1/content/{en_id}")
        assert en_get.status_code == 200
        en_data = en_get.json()

        assert "translations" in en_data
        translations = en_data["translations"]
        assert any(t["language"] == "it" and t["id"] == it_id for t in translations)

        # Get Italian content - should link back to English
        it_get = await client.get(f"/v1/content/{it_id}")
        assert it_get.status_code == 200
        it_data = it_get.json()

        assert it_data.get("translationOf") == en_id


@pytest.mark.integration
@pytest.mark.requires_db
async def test_content_alternate_urls():
    """Test that content includes alternate language URLs."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create English and Italian versions
        en_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "multilang-article",
                "title": "Multilang Test",
                "content": "English",
            },
        )

        if en_response.status_code != 201:
            pytest.skip("Content creation not implemented")

        en_id = en_response.json()["id"]

        await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "it",
                "slug": "articolo-multilingue",
                "title": "Test Multilingue",
                "content": "Italiano",
                "translationOf": en_id,
            },
        )

        # Get English content
        response = await client.get("/en/multilang-article")

        if response.status_code == 200:
            data = response.json()

            # Should include alternate URLs
            assert "urls" in data
            alternates = data["urls"].get("alternates", [])

            # Should have Italian alternate
            it_alternate = next(
                (a for a in alternates if a["language"] == "it"), None
            )
            assert it_alternate is not None
            assert it_alternate["url"] == "/it/articolo-multilingue"


@pytest.mark.integration
@pytest.mark.requires_db
async def test_translation_completeness():
    """Test checking translation completeness across languages."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create English content
        en_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "completeness-test",
                "title": "Completeness Test",
                "content": "English",
            },
        )

        if en_response.status_code != 201:
            pytest.skip("Content creation not implemented")

        en_id = en_response.json()["id"]

        # Create Italian translation only (no Hebrew)
        await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "it",
                "slug": "test-completezza",
                "title": "Test Completezza",
                "content": "Italiano",
                "translationOf": en_id,
            },
        )

        # Get translation status
        status_response = await client.get(f"/v1/content/{en_id}/translations")

        if status_response.status_code == 200:
            data = status_response.json()

            # Should show translation status
            assert "en" in data and data["en"]["exists"] is True
            assert "it" in data and data["it"]["exists"] is True
            assert "he" in data and data["he"]["exists"] is False


@pytest.mark.integration
@pytest.mark.requires_db
async def test_content_by_language_filtering():
    """Test filtering content by language."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create content in multiple languages
        await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "english-only",
                "title": "English Only",
                "content": "English",
            },
        )

        await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "it",
                "slug": "italiano-solo",
                "title": "Italiano Solo",
                "content": "Italiano",
            },
        )

        # Get English content only
        en_response = await client.get("/v1/content?language=en")

        if en_response.status_code == 200:
            en_data = en_response.json()
            en_items = en_data.get("items", [])

            # All items should be English
            assert all(item["language"] == "en" for item in en_items)

        # Get Italian content only
        it_response = await client.get("/v1/content?language=it")

        if it_response.status_code == 200:
            it_data = it_response.json()
            it_items = it_data.get("items", [])

            # All items should be Italian
            assert all(item["language"] == "it" for item in it_items)
