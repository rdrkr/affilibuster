# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Contract test for GET /v1/content/{lang} endpoint.
Reference: contracts/api-v1.yaml:52-73
"""

import pytest
from httpx import AsyncClient


@pytest.mark.contract
async def test_list_content_by_language():
    """
    Test listing content for a specific language.
    Expected to fail: endpoint not implemented yet.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/content/en")

        assert response.status_code == 200
        data = response.json()

        # Validate ContentListResponse structure
        assert "data" in data
        assert "pagination" in data


@pytest.mark.contract
async def test_list_content_response_schema():
    """
    Test that response matches ContentListResponse schema.
    Reference: contracts/api-v1.yaml:500-561
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/content/en")

        assert response.status_code == 200
        data = response.json()

        # Data array
        assert isinstance(data["data"], list)

        # Pagination object
        pagination = data["pagination"]
        assert "page" in pagination
        assert "pageSize" in pagination
        assert "totalPages" in pagination
        assert "totalItems" in pagination
        assert "hasNext" in pagination
        assert "hasPrevious" in pagination

        # Type validation
        assert isinstance(pagination["page"], int)
        assert isinstance(pagination["pageSize"], int)
        assert isinstance(pagination["totalPages"], int)
        assert isinstance(pagination["totalItems"], int)
        assert isinstance(pagination["hasNext"], bool)
        assert isinstance(pagination["hasPrevious"], bool)


@pytest.mark.contract
async def test_list_content_with_pagination():
    """Test pagination parameters."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/content/en?page=1&pageSize=10")

        assert response.status_code == 200
        data = response.json()

        pagination = data["pagination"]
        assert pagination["page"] == 1
        assert pagination["pageSize"] == 10


@pytest.mark.contract
async def test_list_content_filter_by_type():
    """Test filtering content by type."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/content/en?type=product")

        assert response.status_code == 200
        data = response.json()

        # All items should be products
        for item in data["data"]:
            assert item["type"] == "product"


@pytest.mark.contract
async def test_list_content_summary_schema():
    """
    Test that each item matches ContentSummary schema.
    Reference: contracts/api-v1.yaml:513-540
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/content/en")

        assert response.status_code == 200
        data = response.json()

        if len(data["data"]) > 0:
            item = data["data"][0]

            # Required fields in ContentSummary
            assert "id" in item
            assert "type" in item
            assert "slug" in item
            assert "language" in item
            assert "title" in item
            assert "status" in item
            assert "updatedAt" in item
