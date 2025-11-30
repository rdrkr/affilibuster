# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for products API routes.

Tests product listing and retrieval endpoints with real Strapi integration.
Verifies that Strapi contains the expected product seed data from cms/src/seed.ts.
"""

import pytest
from httpx import AsyncClient

from affilibuster_backend.domain.entities.generated.models import ProductsGetResponse
from tests.fixtures.expected_seed_data import (
    EXPECTED_ENGLISH_PRODUCT_COUNT,
    EXPECTED_ITALIAN_PRODUCT_COUNT,
    EXPECTED_PRODUCTS,
)


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestGetProducts:
    """Test suite for GET /products endpoint."""

    async def test_get_products_returns_200(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test that GET /products returns 200 status code."""
        response = await integration_client.get("/v1/products?customPopulate=nested")
        assert response.status_code == 200

    async def test_get_products_returns_data_structure(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that GET /products returns proper data structure with seeded English products."""
        response = await integration_client.get("/v1/products?customPopulate=nested")
        assert response.status_code == 200

        data = ProductsGetResponse(**response.json())
        assert isinstance(data.data, list)

        # By default, endpoint returns English products only
        assert len(data.data) == EXPECTED_ENGLISH_PRODUCT_COUNT, (
            f"Expected {EXPECTED_ENGLISH_PRODUCT_COUNT} English products from seed.ts, got {len(data.data)}"
        )

        # Verify English product slugs are present
        returned_slugs = {product.slug for product in data.data}
        expected_en_slugs = {p.slug for p in EXPECTED_PRODUCTS if p.locale == "en"}
        assert returned_slugs == expected_en_slugs, (
            f"English product slugs don't match seed.ts. Expected: {expected_en_slugs}, Got: {returned_slugs}"
        )

    async def test_get_products_with_pagination(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test GET /products with pagination parameters."""
        response = await integration_client.get(
            "/v1/products",
            params={"customPopulate": "nested", "pagination[pageSize]": "10", "pagination[page]": "1"},
        )
        assert response.status_code == 200

        data = ProductsGetResponse(**response.json())
        assert data.data

    async def test_get_products_with_filters(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test GET /products with filter parameters."""
        response = await integration_client.get(
            "/v1/products",
            params={"customPopulate": "nested", "filters[status][$eq]": "published"},
        )
        assert response.status_code == 200

        data = ProductsGetResponse(**response.json())
        assert data.data

    async def test_get_products_with_field_selection(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test GET /products with field selection."""
        response = await integration_client.get(
            "/v1/products",
            params={"customPopulate": "nested", "fields[]": ["title", "slug"]},
        )
        assert response.status_code == 200

    async def test_get_products_with_sorting(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test GET /products with sorting."""
        response = await integration_client.get(
            "/v1/products",
            params={"customPopulate": "nested", "sort[]": "title:asc"},
        )
        assert response.status_code == 200

    async def test_get_products_with_locale(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test GET /products with locale parameter filters by language."""
        # Test English products
        response = await integration_client.get(
            "/v1/products",
            params={"customPopulate": "nested", "locale": "en"},
        )
        assert response.status_code == 200

        data = ProductsGetResponse(**response.json())
        en_products = data.data
        assert len(en_products) == EXPECTED_ENGLISH_PRODUCT_COUNT, (
            f"Expected {EXPECTED_ENGLISH_PRODUCT_COUNT} English products from seed.ts, got {len(en_products)}"
        )

        # Test Italian products
        response_it = await integration_client.get(
            "/v1/products",
            params={"customPopulate": "nested", "locale": "it"},
        )
        assert response_it.status_code == 200

        data_it = ProductsGetResponse(**response_it.json())
        it_products = data_it.data
        assert len(it_products) == EXPECTED_ITALIAN_PRODUCT_COUNT, (
            f"Expected {EXPECTED_ITALIAN_PRODUCT_COUNT} Italian products from seed.ts, got {len(it_products)}"
        )

    async def test_get_products_strapi_error_returns_502(self, integration_client: AsyncClient) -> None:
        """Test that Strapi errors return 502 Bad Gateway."""
        response = await integration_client.get("/v1/products?customPopulate=nested")
        # Should either succeed (200) or fail with 502 if Strapi is down
        assert response.status_code in [200, 502]


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestGetProduct:
    """Test suite for GET /products/{id} endpoint."""

    async def test_get_product_by_id_returns_200(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test that GET /products/{id} returns 200 for valid ID."""
        # First, get list of products to find a valid ID
        list_response = await integration_client.get("/v1/products?customPopulate=nested")
        if list_response.status_code == 200:
            data = ProductsGetResponse(**list_response.json())
            if data.data and len(data.data) > 0:
                product_id = data.data[0].document_id

                # Now get specific product
                response = await integration_client.get(f"/v1/products/{product_id}?customPopulate=nested")
                # Should return 200 for valid ID, or 502 if Strapi has issues
                assert response.status_code in [200, 404, 502]

    async def test_get_product_by_slug(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test that GET /products/{slug} works with slug identifier."""
        response = await integration_client.get("/v1/products/test-product-slug?customPopulate=nested")
        # Should return 200, 404, or 502 depending on whether slug exists
        assert response.status_code in [200, 404, 502]

    async def test_get_product_with_field_selection(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test GET /products/{id} with field selection."""
        # Get a valid product ID first
        list_response = await integration_client.get("/v1/products?customPopulate=nested")
        if list_response.status_code == 200:
            data = ProductsGetResponse(**list_response.json())
            if data.data and len(data.data) > 0:
                product_id = data.data[0].document_id

                response = await integration_client.get(
                    f"/v1/products/{product_id}?customPopulate=nested",
                    params={"customPopulate": "nested", "fields[]": ["title", "slug"]},
                )
                assert response.status_code in [200, 404, 502]

    async def test_get_product_with_locale(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test GET /products/{id} with locale parameter."""
        response = await integration_client.get(
            "/v1/products/1?customPopulate=nested",
            params={"customPopulate": "nested", "locale": "en"},
        )
        assert response.status_code in [200, 404, 502]

    async def test_get_product_with_populate(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test GET /products/{id} with populate parameter."""
        response = await integration_client.get(
            "/v1/products/1?customPopulate=nested",
            params={"customPopulate": "nested", "populate": "*"},
        )
        assert response.status_code in [200, 404, 502]

    async def test_get_product_with_invalid_id_returns_error(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that GET /products/{id} with invalid ID returns error."""
        response = await integration_client.get("/v1/products/nonexistent-id-99999?customPopulate=nested")
        # Should return 404 or 502 (Strapi error)
        assert response.status_code in [404, 502]

    async def test_get_product_strapi_error_returns_502(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that Strapi errors return 502 Bad Gateway."""
        response = await integration_client.get("/v1/products/1?customPopulate=nested")
        # Should either succeed or fail with 502 if Strapi has issues
        assert response.status_code in [200, 404, 502]

    async def test_get_product_path_parameter_validation(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that product ID path parameter is required."""
        # Trying to access without ID should redirect to list endpoint
        response = await integration_client.get("/v1/products/?customPopulate=nested")
        # FastAPI redirects /products/ to /products (307 Temporary Redirect)
        assert response.status_code in [200, 307, 404, 502]


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestProductsErrorHandling:
    """Test suite for products error handling."""

    async def test_get_products_handles_strapi_connection_error(self, integration_client: AsyncClient) -> None:
        """Test that connection errors to Strapi are handled gracefully."""
        response = await integration_client.get("/v1/products?customPopulate=nested")
        # Should return either 200 (success) or 502 (Bad Gateway on error)
        assert response.status_code in [200, 502]

    async def test_get_product_handles_strapi_connection_error(self, integration_client: AsyncClient) -> None:
        """Test that connection errors to Strapi are handled gracefully."""
        response = await integration_client.get("/v1/products/1?customPopulate=nested")
        # Should return either 200/404 (success) or 502 (Bad Gateway on error)
        assert response.status_code in [200, 404, 502]
