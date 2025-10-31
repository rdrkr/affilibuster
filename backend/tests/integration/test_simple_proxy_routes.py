# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for Strapi proxy routes with real Strapi service.

Tests the following routes against a real Strapi instance:
- about
- components
- contact
- content_types
- error_404
- error_410
- files
- footer
- homepage
- navigation
- privacy
- product_page
- system_message
- term

Tests verify successful data retrieval and response structure from real Strapi,
catching issues like authentication failures and connection problems.
"""

import pytest_asyncio
from httpx import ASGITransport, AsyncClient


@pytest_asyncio.fixture
async def integration_client(integration_app):
    """
    Fixture providing an async HTTP client for real integration tests.

    Uses real Strapi service (no mocking).
    Depends on integration_app to ensure dependencies are reinitialized.
    """
    async with AsyncClient(transport=ASGITransport(app=integration_app), base_url="http://backend:8000") as client:
        yield client


class TestAboutRoute:
    """Test /about route with real Strapi integration."""

    async def test_about_get_returns_200(self, integration_client, strapi_test_data):
        """Test GET /about returns 200 with real Strapi data."""
        response = await integration_client.get("/v1/about")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data or isinstance(data, dict)


class TestComponentsRoute:
    """Test /components route with real Strapi integration."""

    async def test_components_get_returns_200(self, integration_client):
        """Test GET /components returns 200."""
        response = await integration_client.get("/v1/components")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestContactRoute:
    """Test /contact route with real Strapi integration."""

    async def test_contact_get_returns_200(self, integration_client):
        """Test GET /contact returns 200."""
        response = await integration_client.get("/v1/contact")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestContentTypesRoute:
    """Test /content-types route with real Strapi integration."""

    async def test_content_types_get_returns_200(self, integration_client):
        """Test GET /content-types returns 200."""
        # Note: kind parameter is required by Strapi content-type-builder API
        response = await integration_client.get("/v1/content-types?kind=collectionType")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestError404Route:
    """Test /error-404 route with real Strapi integration."""

    async def test_error_404_get_returns_200(self, integration_client):
        """Test GET /error-404 returns 200."""
        response = await integration_client.get("/v1/error-404")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestError410Route:
    """Test /error-410 route with real Strapi integration."""

    async def test_error_410_get_returns_200(self, integration_client):
        """Test GET /error-410 returns 200."""
        response = await integration_client.get("/v1/error-410")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestFilesRoute:
    """Test /files route with real Strapi integration."""

    async def test_files_get_returns_200(self, integration_client):
        """Test GET /files returns 200."""
        response = await integration_client.get("/v1/files")
        assert response.status_code == 200
        data = response.json()
        # Note: Strapi upload/files endpoint returns an array, not an object
        assert isinstance(data, list)


class TestFooterRoute:
    """Test /footer route with real Strapi integration."""

    async def test_footer_get_returns_200(self, integration_client):
        """Test GET /footer returns 200."""
        response = await integration_client.get("/v1/footer")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestHomepageRoute:
    """Test /homepage route with real Strapi integration."""

    async def test_homepage_get_returns_200(self, integration_client, strapi_test_data):
        """Test GET /homepage returns 200 with real Strapi data."""
        response = await integration_client.get("/v1/homepage")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data or isinstance(data, dict)


class TestNavigationRoute:
    """Test /navigation route with real Strapi integration."""

    async def test_navigation_get_returns_200(self, integration_client, strapi_test_data):
        """Test GET /navigation returns 200 with real Strapi data."""
        response = await integration_client.get("/v1/navigation")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data or isinstance(data, dict)


class TestPrivacyRoute:
    """Test /privacy route with real Strapi integration."""

    async def test_privacy_get_returns_200(self, integration_client):
        """Test GET /privacy returns 200."""
        response = await integration_client.get("/v1/privacy")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestProductPageRoute:
    """Test /product-page route with real Strapi integration."""

    async def test_product_page_get_returns_200(self, integration_client):
        """Test GET /product-page returns 200."""
        response = await integration_client.get("/v1/product-page")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestSystemMessageRoute:
    """Test /system-message route with real Strapi integration."""

    async def test_system_message_get_returns_200(self, integration_client):
        """Test GET /system-message returns 200."""
        response = await integration_client.get("/v1/system-message")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestTermRoute:
    """Test /term route with real Strapi integration."""

    async def test_term_get_returns_200(self, integration_client):
        """Test GET /term returns 200."""
        response = await integration_client.get("/v1/term")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
