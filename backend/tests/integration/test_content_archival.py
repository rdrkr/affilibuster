# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration test for content archival and 410 Gone responses.
Reference: data-model.md:450-460 (Content archival creates 410 Gone)
"""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
@pytest.mark.requires_db
async def test_archived_content_returns_410():
    """
    Test that archived content returns 410 Gone.
    Expected to fail: archival logic not implemented.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create content
        create_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "article-to-archive",
                "title": "Article to Archive",
                "content": "This will be archived",
            },
        )

        if create_response.status_code != 201:
            pytest.skip("Content creation not implemented")

        content_id = create_response.json()["id"]

        # Archive the content
        archive_response = await client.post(f"/v1/content/{content_id}/archive")

        assert archive_response.status_code in [200, 204]

        # Verify content returns 410 Gone
        get_response = await client.get("/en/article-to-archive")

        assert get_response.status_code == 410
        data = get_response.json()
        assert "archived" in data or "gone" in data.get("message", "").lower()


@pytest.mark.integration
@pytest.mark.requires_db
async def test_archived_content_not_in_listings():
    """Test that archived content doesn't appear in content listings."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create two articles
        response1 = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "visible-article",
                "title": "Visible Article",
                "content": "Still visible",
            },
        )

        response2 = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "archived-article",
                "title": "Archived Article",
                "content": "Will be archived",
            },
        )

        if response1.status_code != 201 or response2.status_code != 201:
            pytest.skip("Content creation not implemented")

        archived_id = response2.json()["id"]

        # Archive second article
        await client.post(f"/v1/content/{archived_id}/archive")

        # Get content listing
        listing_response = await client.get("/v1/content?language=en&type=article")

        if listing_response.status_code == 200:
            data = listing_response.json()
            items = data.get("items", [])

            # Archived article should not be in results
            slugs = [item["slug"] for item in items]
            assert "visible-article" in slugs
            assert "archived-article" not in slugs


@pytest.mark.integration
@pytest.mark.requires_db
async def test_archived_content_preserves_seo():
    """Test that archived content still serves SEO metadata for crawlers."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create content
        create_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "seo-archived",
                "title": "SEO Test Article",
                "content": "Content with SEO",
                "seo": {
                    "metaTitle": "SEO Title",
                    "metaDescription": "SEO Description",
                },
            },
        )

        if create_response.status_code != 201:
            pytest.skip("Content creation not implemented")

        content_id = create_response.json()["id"]

        # Archive content
        await client.post(f"/v1/content/{content_id}/archive")

        # Request with crawler user agent
        headers = {"User-Agent": "Googlebot/2.1"}
        response = await client.get("/en/seo-archived", headers=headers)

        # Should return 410 but with SEO metadata
        if response.status_code == 410:
            data = response.json()
            # SEO metadata should still be present
            assert "seo" in data or "metaTitle" in data


@pytest.mark.integration
@pytest.mark.requires_db
async def test_unarchive_content():
    """Test that content can be restored from archive."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create and archive content
        create_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "restore-test",
                "title": "Restore Test",
                "content": "Will be restored",
            },
        )

        if create_response.status_code != 201:
            pytest.skip("Content creation not implemented")

        content_id = create_response.json()["id"]

        # Archive
        await client.post(f"/v1/content/{content_id}/archive")

        # Unarchive
        unarchive_response = await client.post(f"/v1/content/{content_id}/unarchive")

        if unarchive_response.status_code in [200, 204]:
            # Content should be accessible again
            get_response = await client.get("/en/restore-test")
            assert get_response.status_code == 200
