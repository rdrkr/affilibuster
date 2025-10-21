# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for content API route with refactored architecture.

Covers:
- GET /content/{lang}/{slug} endpoint
- GET /content/list/{lang} endpoint with pagination
- GET /content/single-types/{lang}/{type_name} endpoint
- Strapi response transformation
- Error handling for missing content
"""

from unittest.mock import AsyncMock

import pytest


class TestGetContent:
    """Test GET /content/{lang}/{slug} endpoint."""

    @pytest.mark.asyncio
    async def test_get_content_by_slug(self, async_client, mocker):
        """Test GET /content/{lang}/{slug} returns content."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = {
            "data": [
                {
                    "id": 1,
                    "documentId": "doc-123",
                    "attributes": {
                        "title": "Test Product",
                        "slug": "test-product",
                        "content": "Product description",
                        "excerpt": "Short excerpt",
                        "metaTitle": "Test Product SEO",
                        "metaDescription": "Product description for SEO",
                        "metaKeywords": ["test", "product"],
                        "publishedAt": "2025-01-01T00:00:00Z",
                    },
                }
            ]
        }

        # Act
        response = await async_client.get("/v1/content/en/test-product")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "doc-123"
        assert data["title"] == "Test Product"
        assert data["slug"] == "test-product"
        assert data["language"] == "en"
        assert data["status"] == "published"
        assert data["seo"]["title"] == "Test Product SEO"

    @pytest.mark.asyncio
    async def test_get_content_not_found(self, async_client, mocker):
        """Test GET /content/{lang}/{slug} returns 404 when not found."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = {"data": []}  # No content found

        # Act
        response = await async_client.get("/v1/content/en/missing-slug")

        # Assert
        assert response.status_code == 404
        data = response.json()
        assert data["code"] == "CONTENT_NOT_FOUND"
        assert "not found" in data["message"].lower()

    @pytest.mark.asyncio
    async def test_get_content_unpublished_is_draft(self, async_client, mocker):
        """Test GET /content shows draft status for unpublished content."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = {
            "data": [
                {
                    "id": 1,
                    "documentId": "doc-456",
                    "attributes": {
                        "title": "Draft Product",
                        "slug": "draft-product",
                        "content": "Not published",
                        "excerpt": "Draft",
                        "metaTitle": "Draft",
                        "metaDescription": "Draft",
                        "metaKeywords": [],
                        "publishedAt": None,  # Not published
                    },
                }
            ]
        }

        # Act
        response = await async_client.get("/v1/content/en/draft-product")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "draft"


class TestListContent:
    """Test GET /content/list/{lang} endpoint with pagination."""

    @pytest.mark.asyncio
    async def test_list_content_returns_paginated_results(self, async_client, mocker):
        """Test GET /content/list/{lang} returns paginated content."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = {
            "data": [
                {
                    "id": 1,
                    "documentId": "doc-1",
                    "attributes": {
                        "title": "Product 1",
                        "slug": "product-1",
                        "excerpt": "First product",
                        "publishedAt": "2025-01-01T00:00:00Z",
                    },
                },
                {
                    "id": 2,
                    "documentId": "doc-2",
                    "attributes": {
                        "title": "Product 2",
                        "slug": "product-2",
                        "excerpt": "Second product",
                        "publishedAt": "2025-01-02T00:00:00Z",
                    },
                },
            ],
            "meta": {"pagination": {"page": 1, "pageSize": 20, "total": 2, "pageCount": 1}},
        }

        # Act
        response = await async_client.get("/v1/content/list/en")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 2
        assert data["pagination"]["total"] == 2
        assert data["pagination"]["pageCount"] == 1
        assert data["pagination"]["hasNext"] is False
        assert data["pagination"]["hasPrevious"] is False

    @pytest.mark.asyncio
    async def test_list_content_with_custom_pagination(self, async_client, mocker):
        """Test GET /content/list with custom page and pageSize."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = {
            "data": [
                {
                    "id": 21,
                    "documentId": "doc-21",
                    "attributes": {
                        "title": "Product 21",
                        "slug": "product-21",
                        "excerpt": "21st product",
                        "publishedAt": "2025-01-21T00:00:00Z",
                    },
                }
            ],
            "meta": {"pagination": {"page": 2, "pageSize": 20, "total": 50, "pageCount": 3}},
        }

        # Act
        response = await async_client.get("/v1/content/list/en?page=2&pageSize=20")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["pagination"]["page"] == 2
        assert data["pagination"]["pageSize"] == 20
        assert data["pagination"]["total"] == 50
        assert data["pagination"]["hasNext"] is True
        assert data["pagination"]["hasPrevious"] is True

    @pytest.mark.asyncio
    async def test_list_content_empty_result(self, async_client, mocker):
        """Test GET /content/list returns empty for non-existent language."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = {
            "data": [],
            "meta": {"pagination": {"page": 1, "pageSize": 20, "total": 0, "pageCount": 0}},
        }

        # Act
        response = await async_client.get("/v1/content/list/fr")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 0
        assert data["pagination"]["total"] == 0


class TestGetSingleType:
    """Test GET /content/single-types/{lang}/{type_name} endpoint."""

    @pytest.mark.asyncio
    async def test_get_single_type_homepage(self, async_client, mocker):
        """Test GET /content/single-types/{lang}/homepage returns homepage."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = {
            "data": {
                "id": 1,
                "attributes": {
                    "title": "Welcome to Affilibuster",
                    "heroTitle": "Best Affiliate Products",
                    "content": "Homepage content",
                    "publishedAt": "2025-01-01T00:00:00Z",
                },
            }
        }

        # Act
        response = await async_client.get("/v1/content/single-types/en/homepage")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Welcome to Affilibuster"
        assert data["content"] == "Homepage content"

    @pytest.mark.asyncio
    async def test_get_single_type_unpublished_returns_404(self, async_client, mocker):
        """Test GET /content/single-types returns 404 for unpublished content."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = {
            "data": {
                "id": 1,
                "attributes": {
                    "title": "Unpublished Page",
                    "content": "Not ready",
                    "publishedAt": None,  # Not published
                },
            }
        }

        # Act
        response = await async_client.get("/v1/content/single-types/en/about")

        # Assert
        assert response.status_code == 404
        data = response.json()
        assert data["code"] == "CONTENT_NOT_FOUND"
        assert "not published" in data["message"].lower()

    @pytest.mark.asyncio
    async def test_get_single_type_not_found(self, async_client, mocker):
        """Test GET /content/single-types returns 404 when type doesn't exist."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.side_effect = Exception("404 Not Found")

        # Act
        response = await async_client.get("/v1/content/single-types/en/nonexistent")

        # Assert
        assert response.status_code == 404
        data = response.json()
        assert data["code"] == "CONTENT_NOT_FOUND"

    @pytest.mark.asyncio
    async def test_get_single_type_strapi_error(self, async_client, mocker):
        """Test GET /content/single-types handles Strapi errors."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.side_effect = Exception("Connection timeout")

        # Act
        response = await async_client.get("/v1/content/single-types/en/about")

        # Assert
        assert response.status_code == 502
        data = response.json()
        assert "Failed to fetch single-type" in data["detail"]
