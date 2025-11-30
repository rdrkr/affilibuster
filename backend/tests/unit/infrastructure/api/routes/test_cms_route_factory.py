# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for CMS route factory functions.

Tests the factory functions that create FastAPI routers for CMS proxy endpoints,
focusing on error handling and dependency injection.
"""

import pytest
from fastapi import HTTPException
from pytest_mock import MockerFixture

from affilibuster_backend.domain.entities.generated.models import (
    AboutGetParametersQuery,
    AboutGetResponse,
    ProductsGetParametersQuery,
    ProductsGetResponse,
    ProductsIdGetParametersQuery,
    ProductsIdGetResponse,
)
from affilibuster_backend.infrastructure.api.routes.cms_route_factory import (
    CMSCollectionConfig,
    CMSSingleTypeConfig,
    create_collection_router,
    create_single_type_router,
)


@pytest.mark.unit
class TestSingleTypeRouterErrorHandling:
    """Test suite for single-type router error handling."""

    async def test_single_type_endpoint_handles_use_case_exception(self, mocker: MockerFixture) -> None:
        """Test that single-type endpoint converts use case exceptions to HTTPException."""
        # Create a router using the factory
        config = CMSSingleTypeConfig(
            path="/about",
            tag="about",
            params_model=AboutGetParametersQuery,
            response_model=AboutGetResponse,
            description="Get About page content",
        )
        router = create_single_type_router(config)

        # Find the registered endpoint handler
        route = next(r for r in router.routes if r.path == "/about")  # type: ignore[attr-defined]
        handler = route.endpoint  # type: ignore[attr-defined]

        # Mock the use case to raise an exception
        mock_use_case = mocker.AsyncMock()
        mock_use_case.execute.side_effect = Exception("CMS connection failed")

        # Mock the params
        mock_params = mocker.Mock(spec=AboutGetParametersQuery)

        # Call the handler and expect HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await handler(use_case=mock_use_case, params=mock_params)

        # Verify the exception details
        assert exc_info.value.status_code == 502
        assert "Failed to fetch about from Strapi" in exc_info.value.detail
        assert "CMS connection failed" in exc_info.value.detail


@pytest.mark.unit
class TestCollectionRouterErrorHandling:
    """Test suite for collection router error handling."""

    async def test_list_endpoint_handles_use_case_exception(self, mocker: MockerFixture) -> None:
        """Test that list endpoint converts use case exceptions to HTTPException."""
        # Create a router using the factory
        config = CMSCollectionConfig(
            path="/products",
            tag="product",
            list_params_model=ProductsGetParametersQuery,
            list_response_model=ProductsGetResponse,
            item_params_model=ProductsIdGetParametersQuery,
            item_response_model=ProductsIdGetResponse,
            list_description="List all products",
            item_description="Get product by ID",
        )
        router = create_collection_router(config)

        # Find the list endpoint handler (path is empty string for list route)
        route = next(r for r in router.routes if r.path == "/products")  # type: ignore[attr-defined]
        handler = route.endpoint  # type: ignore[attr-defined]

        # Mock the use case to raise an exception
        mock_use_case = mocker.AsyncMock()
        mock_use_case.execute.side_effect = Exception("Database timeout")

        # Mock the params
        mock_params = mocker.Mock(spec=ProductsGetParametersQuery)

        # Call the handler and expect HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await handler(use_case=mock_use_case, params=mock_params)

        # Verify the exception details
        assert exc_info.value.status_code == 502
        assert "Failed to fetch product list from Strapi" in exc_info.value.detail
        assert "Database timeout" in exc_info.value.detail

    async def test_item_endpoint_handles_use_case_exception(self, mocker: MockerFixture) -> None:
        """Test that item endpoint converts use case exceptions to HTTPException."""
        # Create a router using the factory
        config = CMSCollectionConfig(
            path="/products",
            tag="product",
            list_params_model=ProductsGetParametersQuery,
            list_response_model=ProductsGetResponse,
            item_params_model=ProductsIdGetParametersQuery,
            item_response_model=ProductsIdGetResponse,
            id_description="Product document ID or slug",
            list_description="List all products",
            item_description="Get product by ID",
        )
        router = create_collection_router(config)

        # Find the item endpoint handler (path has {id} parameter)
        route = next(r for r in router.routes if "{id}" in r.path)  # type: ignore[attr-defined]
        handler = route.endpoint  # type: ignore[attr-defined]

        # Mock the use case to raise an exception
        mock_use_case = mocker.AsyncMock()
        mock_use_case.execute.side_effect = Exception("Product not found in CMS")

        # Mock the params
        mock_params = mocker.Mock(spec=ProductsIdGetParametersQuery)

        # Call the handler and expect HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await handler(use_case=mock_use_case, item_id="test-product-123", params=mock_params)

        # Verify the exception details
        assert exc_info.value.status_code == 502
        assert "Failed to fetch product from Strapi" in exc_info.value.detail
        assert "Product not found in CMS" in exc_info.value.detail


@pytest.mark.unit
class TestRouterConfiguration:
    """Test suite for router configuration and registration."""

    def test_single_type_router_configuration(self) -> None:
        """Test that single-type router is configured correctly."""
        config = CMSSingleTypeConfig(
            path="/about",
            tag="about",
            params_model=AboutGetParametersQuery,
            response_model=AboutGetResponse,
            description="Get About page content",
        )
        router = create_single_type_router(config)

        # Verify router configuration
        assert len(router.routes) == 1
        route = router.routes[0]
        assert route.path == "/about"  # type: ignore[attr-defined]
        assert "GET" in route.methods  # type: ignore[attr-defined]
        assert "about" in router.tags

    def test_collection_router_configuration(self) -> None:
        """Test that collection router is configured correctly."""
        config = CMSCollectionConfig(
            path="/products",
            tag="product",
            list_params_model=ProductsGetParametersQuery,
            list_response_model=ProductsGetResponse,
            item_params_model=ProductsIdGetParametersQuery,
            item_response_model=ProductsIdGetResponse,
        )
        router = create_collection_router(config)

        # Verify router has two routes (list and item)
        assert len(router.routes) == 2

        # Verify list route
        list_route = next(r for r in router.routes if r.path == "/products")  # type: ignore[attr-defined]
        assert "GET" in list_route.methods  # type: ignore[attr-defined]

        # Verify item route
        item_route = next(r for r in router.routes if "{id}" in r.path)  # type: ignore[attr-defined]
        assert "GET" in item_route.methods  # type: ignore[attr-defined]
        assert "product" in router.tags
