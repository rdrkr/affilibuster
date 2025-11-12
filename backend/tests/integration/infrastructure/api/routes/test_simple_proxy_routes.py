# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for Strapi proxy routes with real Strapi service.

Tests the following routes against a real Strapi instance:
- about
- components
- contact
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

import pytest
from httpx import AsyncClient

from affilibuster_backend.domain.entities.generated.models import (
    AboutGetResponse,
    ComponentsGetResponse,
    ContactGetResponse,
    Error404GetResponse,
    Error410GetResponse,
    FilesGetResponse,
    FooterGetResponse,
    HomepageGetResponse,
    NavigationGetResponse,
    PrivacyGetResponse,
    ProductPageGetResponse,
    SystemMessageGetResponse,
    TermGetResponse,
)


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestAboutRoute:
    """Test /about route with real Strapi integration."""

    async def test_about_get_returns_200(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test GET /about returns 200 with real Strapi data."""
        response = await integration_client.get("/v1/about")
        assert response.status_code == 200
        data = AboutGetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestComponentsRoute:
    """Test /components route with real Strapi integration."""

    async def test_components_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /components returns 200."""
        response = await integration_client.get("/v1/components")
        assert response.status_code == 200
        data = ComponentsGetResponse(**response.json())
        assert isinstance(data.data, list)


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestContactRoute:
    """Test /contact route with real Strapi integration."""

    async def test_contact_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /contact returns 200."""
        response = await integration_client.get("/v1/contact")
        assert response.status_code == 200
        data = ContactGetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestError404Route:
    """Test /error-404 route with real Strapi integration."""

    async def test_error_404_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /error-404 returns 200."""
        response = await integration_client.get("/v1/error-404")
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
        response = await integration_client.get("/v1/error-410")
        assert response.status_code == 200
        data = Error410GetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestFilesRoute:
    """Test /files route with real Strapi integration."""

    async def test_files_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /files returns 200."""
        response = await integration_client.get("/v1/files")
        assert response.status_code == 200
        data = FilesGetResponse(response.json())
        # Note: Strapi upload/files endpoint returns an array, not an object
        assert isinstance(data.root, list)


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestFooterRoute:
    """Test /footer route with real Strapi integration."""

    async def test_footer_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /footer returns 200."""
        response = await integration_client.get("/v1/footer")
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
        response = await integration_client.get("/v1/homepage")
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
        response = await integration_client.get("/v1/navigation")
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
        response = await integration_client.get("/v1/privacy")
        assert response.status_code == 200
        data = PrivacyGetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestProductPageRoute:
    """Test /product-page route with real Strapi integration."""

    async def test_product_page_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /product-page returns 200."""
        response = await integration_client.get("/v1/product-page")
        assert response.status_code == 200
        data = ProductPageGetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestSystemMessageRoute:
    """Test /system-message route with real Strapi integration."""

    async def test_system_message_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /system-message returns 200."""
        response = await integration_client.get("/v1/system-message")
        assert response.status_code == 200
        data = SystemMessageGetResponse(**response.json())
        assert data.data is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestTermRoute:
    """Test /term route with real Strapi integration."""

    async def test_term_get_returns_200(self, integration_client: AsyncClient) -> None:
        """Test GET /term returns 200."""
        response = await integration_client.get("/v1/term")
        assert response.status_code == 200
        data = TermGetResponse(**response.json())
        assert data.data is not None
