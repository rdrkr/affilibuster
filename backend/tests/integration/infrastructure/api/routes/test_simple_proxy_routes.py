# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for Strapi proxy routes with real Strapi service.

Tests the following routes against a real Strapi instance:
- about
- contact
- error_404
- error_410
- files
- footer
- homepage
- navigation
- privacy
- product_categories_page
- term

Tests verify successful data retrieval and response structure from real Strapi,
catching issues like authentication failures and connection problems.
"""

import pytest
from httpx import AsyncClient

from affilibuster_backend.domain.entities.generated.models import (
    AboutGetResponse,
    ContactUsGetResponse,
    Error404GetResponse,
    Error410GetResponse,
    FooterGetResponse,
    HomepageGetResponse,
    NavigationGetResponse,
    PrivacyGetResponse,
    ProductCategoriesPageGetResponse,
    TermGetResponse,
)


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestAboutRoute:
    """Test /about route with real Strapi integration."""

    async def test_about_get_returns_200(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test GET /about returns 200 with real Strapi data."""
        response = await integration_client.get("/v1/about?customPopulate=nested")
        assert response.status_code == 200
        data = AboutGetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestContactRoute:
    """Test /contact-us route with real Strapi integration."""

    async def test_contact_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /contact-us returns 200."""
        response = await integration_client.get("/v1/contact-us?customPopulate=nested")
        assert response.status_code == 200
        data = ContactUsGetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestError404Route:
    """Test /error-404 route with real Strapi integration."""

    async def test_error_404_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /error-404 returns 200."""
        response = await integration_client.get("/v1/error-404?customPopulate=nested")
        assert response.status_code == 200
        data = Error404GetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestError410Route:
    """Test /error-410 route with real Strapi integration."""

    async def test_error_410_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /error-410 returns 200."""
        response = await integration_client.get("/v1/error-410?customPopulate=nested")
        assert response.status_code == 200
        data = Error410GetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestFooterRoute:
    """Test /footer route with real Strapi integration."""

    async def test_footer_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /footer returns 200."""
        response = await integration_client.get("/v1/footer?customPopulate=nested")
        assert response.status_code == 200
        data = FooterGetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestHomepageRoute:
    """Test /homepage route with real Strapi integration."""

    async def test_homepage_get_returns_200(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test GET /homepage returns 200 with real Strapi data."""
        response = await integration_client.get("/v1/homepage?customPopulate=nested")
        assert response.status_code == 200
        data = HomepageGetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestNavigationRoute:
    """Test /navigation route with real Strapi integration."""

    async def test_navigation_get_returns_200(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test GET /navigation returns 200 with real Strapi data."""
        response = await integration_client.get("/v1/navigation?customPopulate=nested&locale=en")
        assert response.status_code == 200
        data = NavigationGetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestPrivacyRoute:
    """Test /privacy route with real Strapi integration."""

    async def test_privacy_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /privacy returns 200."""
        response = await integration_client.get("/v1/privacy?customPopulate=nested")
        assert response.status_code == 200
        data = PrivacyGetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestProductPageRoute:
    """Test /product-categories-page route with real Strapi integration."""

    async def test_product_page_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /product-categories-page returns 200."""
        response = await integration_client.get("/v1/product-categories-page?customPopulate=nested")
        assert response.status_code == 200
        data = ProductCategoriesPageGetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestTermRoute:
    """Test /term route with real Strapi integration."""

    async def test_term_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /term returns 200."""
        response = await integration_client.get("/v1/term?customPopulate=nested")
        assert response.status_code == 200
        data = TermGetResponse(**response.json())
        assert data.data is not None
