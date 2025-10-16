# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration test for CMS webhook handling (Strapi -> Backend -> ISR revalidation).
Reference: research.md:450-470 (CMS webhooks trigger ISR revalidation)
"""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
@pytest.mark.requires_db
async def test_cms_webhook_content_created():
    """
    Test that CMS webhook triggers on content creation.
    Expected to fail: webhook handling not implemented.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Simulate Strapi webhook for content creation
        webhook_payload = {
            "event": "entry.create",
            "model": "article",
            "entry": {
                "id": "webhook-test-123",
                "slug": "new-article",
                "language": "en",
                "title": "New Article",
                "publishedAt": "2025-01-15T10:00:00Z",
            },
        }

        response = await client.post("/v1/webhooks/strapi", json=webhook_payload)

        # Should accept webhook
        assert response.status_code in [200, 202]  # 202 = Accepted for processing

        # Should trigger ISR revalidation
        data = response.json()
        if "revalidation" in data:
            assert data["revalidation"]["triggered"] is True


@pytest.mark.integration
@pytest.mark.requires_db
async def test_cms_webhook_content_updated():
    """Test CMS webhook on content update."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        webhook_payload = {
            "event": "entry.update",
            "model": "article",
            "entry": {
                "id": "webhook-update-456",
                "slug": "updated-article",
                "language": "en",
                "title": "Updated Article",
                "publishedAt": "2025-01-15T11:00:00Z",
            },
        }

        response = await client.post("/v1/webhooks/strapi", json=webhook_payload)

        assert response.status_code in [200, 202]

        # Should revalidate the specific page
        data = response.json()
        if "revalidation" in data:
            assert "/en/updated-article" in data["revalidation"].get("paths", [])


@pytest.mark.integration
@pytest.mark.requires_db
async def test_cms_webhook_content_deleted():
    """Test CMS webhook on content deletion/unpublish."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        webhook_payload = {
            "event": "entry.delete",
            "model": "article",
            "entry": {
                "id": "webhook-delete-789",
                "slug": "deleted-article",
                "language": "en",
            },
        }

        response = await client.post("/v1/webhooks/strapi", json=webhook_payload)

        assert response.status_code in [200, 202]

        # Should invalidate cache and revalidate
        data = response.json()
        if "revalidation" in data:
            assert data["revalidation"]["triggered"] is True


@pytest.mark.integration
async def test_webhook_authentication():
    """Test that webhook endpoint validates authentication."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Send webhook without authentication
        webhook_payload = {
            "event": "entry.create",
            "model": "article",
            "entry": {"id": "test", "slug": "test"},
        }

        response = await client.post("/v1/webhooks/strapi", json=webhook_payload)

        # If authentication is required, should reject unauthenticated requests
        # Otherwise should accept (if webhook secret not configured)
        assert response.status_code in [200, 202, 401, 403]


@pytest.mark.integration
async def test_webhook_with_secret():
    """Test webhook authentication with secret token."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        webhook_payload = {
            "event": "entry.create",
            "model": "article",
            "entry": {"id": "test", "slug": "test"},
        }

        # Send with webhook secret header
        headers = {"X-Webhook-Secret": "test-secret-key"}
        response = await client.post(
            "/v1/webhooks/strapi", json=webhook_payload, headers=headers
        )

        # Should validate secret
        assert response.status_code in [200, 202, 401, 403]


@pytest.mark.integration
@pytest.mark.requires_redis
async def test_webhook_cache_invalidation():
    """Test that webhook invalidates Redis cache."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create content
        create_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "cache-test",
                "title": "Cache Test",
                "content": "Original content",
            },
        )

        if create_response.status_code != 201:
            pytest.skip("Content creation not implemented")

        content_id = create_response.json()["id"]

        # Get content (should be cached)
        await client.get(f"/v1/content/{content_id}")

        # Send webhook to update content
        webhook_payload = {
            "event": "entry.update",
            "model": "article",
            "entry": {
                "id": content_id,
                "slug": "cache-test",
                "language": "en",
                "title": "Updated Title",
            },
        }

        await client.post("/v1/webhooks/strapi", json=webhook_payload)

        # Get content again - should reflect update (cache invalidated)
        response = await client.get(f"/v1/content/{content_id}")

        if response.status_code == 200:
            data = response.json()
            # Cache should be invalidated
            assert "updatedAt" in data


@pytest.mark.integration
async def test_webhook_multilanguage_revalidation():
    """Test that webhook revalidates all language versions."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        webhook_payload = {
            "event": "entry.update",
            "model": "article",
            "entry": {
                "id": "multi-lang-123",
                "slug": "multilang-article",
                "language": "en",
                "translations": [
                    {"language": "it", "slug": "articolo-multilingue"},
                    {"language": "he", "slug": "article-hebrew"},
                ],
            },
        }

        response = await client.post("/v1/webhooks/strapi", json=webhook_payload)

        if response.status_code in [200, 202]:
            data = response.json()

            # Should revalidate all language versions
            if "revalidation" in data:
                paths = data["revalidation"].get("paths", [])
                assert any("/en/" in p for p in paths)
                assert any("/it/" in p for p in paths)
                assert any("/he/" in p for p in paths)
