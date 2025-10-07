# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Contract test for GET /v1/content/{lang}/{slug} endpoint.
Reference: contracts/api-v1.yaml:30-50
"""

import pytest
from httpx import AsyncClient


@pytest.mark.contract
async def test_get_content_by_slug():
    """
    Test retrieving content by language and slug.
    Expected to fail: endpoint not implemented yet.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/content/en/test-product")

        assert response.status_code == 200
        data = response.json()

        # Basic structure validation
        assert "id" in data
        assert "slug" in data
        assert data["slug"] == "test-product"


@pytest.mark.contract
async def test_get_content_response_schema():
    """
    Test that response matches ContentResponse schema.
    Reference: contracts/api-v1.yaml:399-453
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/content/en/eco-bottle")

        assert response.status_code == 200
        data = response.json()

        # Required fields from ContentResponse schema
        assert "id" in data
        assert "type" in data
        assert "slug" in data
        assert "language" in data
        assert "title" in data
        assert "content" in data
        assert "seo" in data
        assert "urls" in data
        assert "status" in data
        assert "createdAt" in data
        assert "updatedAt" in data

        # Type validation
        assert data["type"] in ["page", "product", "article"]
        assert data["language"] in ["en", "it", "he"]
        assert data["status"] in ["draft", "published", "archived"]

        # SEO metadata structure
        seo = data["seo"]
        assert "title" in seo
        assert "description" in seo
        assert "keywords" in seo
        assert "canonicalUrl" in seo

        # URL data structure
        urls = data["urls"]
        assert "canonical" in urls
        assert "alternates" in urls
        assert "current" in urls
        assert "languagePrefix" in urls


@pytest.mark.contract
async def test_get_content_not_found():
    """Test that non-existent content returns 404."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/content/en/non-existent-slug")

        assert response.status_code == 404
        data = response.json()

        # Error schema validation
        assert "error" in data
        assert "message" in data


@pytest.mark.contract
async def test_get_content_invalid_language():
    """Test that invalid language code returns 404 or 422."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/content/fr/test-slug")  # French not supported

        # Should return either 404 (not found) or 422 (invalid language)
        assert response.status_code in [404, 422]


@pytest.mark.contract
async def test_get_content_italian_translation():
    """Test retrieving Italian translation."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/content/it/bottiglia-eco")

        assert response.status_code == 200
        data = response.json()

        assert data["language"] == "it"
        assert data["slug"] == "bottiglia-eco"
