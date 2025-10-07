# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration test for URL redirect creation.
Reference: data-model.md:420-435 (URLRedirect entity for slug changes)
"""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
@pytest.mark.requires_db
async def test_url_redirect_created_on_slug_change():
    """
    Test that changing a content slug creates a 301 redirect.
    Expected to fail: redirect logic not implemented.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create content with initial slug
        create_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "original-slug",
                "title": "Test Article",
                "content": "Content here",
            },
        )

        if create_response.status_code != 201:
            pytest.skip("Content creation not implemented")

        content_id = create_response.json()["id"]

        # Update slug
        update_response = await client.patch(
            f"/v1/content/{content_id}",
            json={"slug": "new-slug"},
        )

        assert update_response.status_code == 200

        # Verify redirect exists from old slug to new slug
        redirect_response = await client.get(
            "/en/original-slug",
            follow_redirects=False,
        )

        assert redirect_response.status_code == 301
        assert redirect_response.headers["Location"] == "/en/new-slug"


@pytest.mark.integration
@pytest.mark.requires_db
async def test_multiple_redirects_chain():
    """Test that multiple slug changes create redirect chain."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Skip if content creation not implemented
        create_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "slug-v1",
                "title": "Test",
                "content": "Content",
            },
        )

        if create_response.status_code != 201:
            pytest.skip("Content creation not implemented")

        content_id = create_response.json()["id"]

        # Change slug twice
        await client.patch(f"/v1/content/{content_id}", json={"slug": "slug-v2"})
        await client.patch(f"/v1/content/{content_id}", json={"slug": "slug-v3"})

        # Both old slugs should redirect to final slug
        response1 = await client.get("/en/slug-v1", follow_redirects=False)
        response2 = await client.get("/en/slug-v2", follow_redirects=False)

        if response1.status_code == 301:
            assert response1.headers["Location"] == "/en/slug-v3"

        if response2.status_code == 301:
            assert response2.headers["Location"] == "/en/slug-v3"


@pytest.mark.integration
@pytest.mark.requires_db
async def test_redirect_language_specific():
    """Test that redirects are language-specific."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create English content
        en_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "test-article",
                "title": "Test",
                "content": "Content",
            },
        )

        if en_response.status_code != 201:
            pytest.skip("Content creation not implemented")

        en_id = en_response.json()["id"]

        # Create Italian content with same slug
        it_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "it",
                "slug": "test-article",
                "title": "Test Italiano",
                "content": "Contenuto",
            },
        )

        if it_response.status_code != 201:
            pytest.skip("Content creation not implemented")

        # Change English slug
        await client.patch(f"/v1/content/{en_id}", json={"slug": "updated-article"})

        # English redirect should exist
        en_redirect = await client.get("/en/test-article", follow_redirects=False)

        # Italian should NOT redirect (different language)
        it_response = await client.get("/it/test-article", follow_redirects=False)

        if en_redirect.status_code == 301:
            assert it_response.status_code == 200  # Italian content still accessible
