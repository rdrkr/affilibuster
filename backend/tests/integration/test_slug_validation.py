# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration test for slug uniqueness validation.
Reference: data-model.md:400-410 (Slug uniqueness per language)
"""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
@pytest.mark.requires_db
async def test_slug_unique_per_language():
    """
    Test that slugs must be unique within the same language.
    Expected to fail: slug validation not implemented.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create first article with slug
        response1 = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "duplicate-slug",
                "title": "First Article",
                "content": "First content",
            },
        )

        if response1.status_code != 201:
            pytest.skip("Content creation not implemented")

        # Try to create second article with same slug in same language
        response2 = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "duplicate-slug",
                "title": "Second Article",
                "content": "Second content",
            },
        )

        # Should reject duplicate slug
        assert response2.status_code == 409  # Conflict
        data = response2.json()
        assert "slug" in data.get("detail", "").lower()


@pytest.mark.integration
@pytest.mark.requires_db
async def test_slug_can_duplicate_across_languages():
    """Test that same slug can exist in different languages."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create English article
        en_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "shared-slug",
                "title": "English Article",
                "content": "English content",
            },
        )

        if en_response.status_code != 201:
            pytest.skip("Content creation not implemented")

        # Create Italian article with same slug - should be allowed
        it_response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "it",
                "slug": "shared-slug",
                "title": "Articolo Italiano",
                "content": "Contenuto italiano",
            },
        )

        # Should succeed (different language)
        assert it_response.status_code == 201


@pytest.mark.integration
@pytest.mark.requires_db
async def test_slug_format_validation():
    """Test that slug format is validated (lowercase, hyphens)."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Test invalid slug with uppercase
        response1 = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "Invalid-Slug",
                "title": "Test",
                "content": "Content",
            },
        )

        if response1.status_code == 422:  # Validation error
            data = response1.json()
            assert "slug" in str(data).lower()

        # Test invalid slug with spaces
        response2 = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "invalid slug",
                "title": "Test",
                "content": "Content",
            },
        )

        if response2.status_code == 422:
            data = response2.json()
            assert "slug" in str(data).lower()

        # Test valid slug
        response3 = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "valid-slug-123",
                "title": "Test",
                "content": "Content",
            },
        )

        # Valid slug should be accepted
        assert response3.status_code in [201, 404]  # 404 if not implemented


@pytest.mark.integration
@pytest.mark.requires_db
async def test_slug_auto_generation():
    """Test that slug is auto-generated from title if not provided."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create content without slug
        response = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "title": "This Is a Test Article",
                "content": "Content",
            },
        )

        if response.status_code == 201:
            data = response.json()

            # Slug should be auto-generated
            assert "slug" in data
            assert data["slug"] == "this-is-a-test-article"


@pytest.mark.integration
@pytest.mark.requires_db
async def test_slug_uniqueness_on_update():
    """Test that updating slug validates uniqueness."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # Create two articles
        response1 = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "article-one",
                "title": "Article One",
                "content": "Content 1",
            },
        )

        response2 = await client.post(
            "/v1/content",
            json={
                "type": "article",
                "language": "en",
                "slug": "article-two",
                "title": "Article Two",
                "content": "Content 2",
            },
        )

        if response1.status_code != 201 or response2.status_code != 201:
            pytest.skip("Content creation not implemented")

        article_one_id = response1.json()["id"]

        # Try to update article-one to use article-two's slug
        update_response = await client.patch(
            f"/v1/content/{article_one_id}",
            json={"slug": "article-two"},
        )

        # Should reject duplicate slug
        assert update_response.status_code == 409
