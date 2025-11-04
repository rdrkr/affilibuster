# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for route error handling.

Tests exception handling paths in all API routes using mocked dependencies.
"""

from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException


@pytest.mark.asyncio
@pytest.mark.unit
class TestLanguagesRouteErrorHandling:
    """Test error handling in languages routes."""

    async def test_get_languages_raises_502_on_exception(self):
        """Test that GET /languages raises HTTPException on error."""
        from affilibuster_backend.infrastructure.api.routes.languages import get_languages

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")

        with pytest.raises(HTTPException) as exc_info:
            await get_languages(use_case)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch languages from Strapi" in exc_info.value.detail

    async def test_detect_language_raises_502_on_exception(self):
        """Test that POST /languages/detect raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import LanguagesDetectPostRequest
        from affilibuster_backend.infrastructure.api.routes.languages import detect_language

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        request = LanguagesDetectPostRequest(acceptLanguage="en-US")

        with pytest.raises(HTTPException) as exc_info:
            await detect_language(request, use_case)

        assert exc_info.value.status_code == 502
        assert "Failed to detect language" in exc_info.value.detail


@pytest.mark.asyncio
@pytest.mark.unit
class TestCurrenciesRouteErrorHandling:
    """Test error handling in currencies routes."""

    async def test_get_currencies_raises_502_on_exception(self):
        """Test that GET /currencies raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import CurrenciesGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.currencies import get_currencies

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = CurrenciesGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await get_currencies(use_case, params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch currencies from Strapi" in exc_info.value.detail

    async def test_get_currency_raises_502_on_exception(self):
        """Test that GET /currencies/{id} raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import CurrenciesIdGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.currencies import get_currency

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = CurrenciesIdGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await get_currency(use_case, "1", params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch currency from Strapi" in exc_info.value.detail


@pytest.mark.asyncio
@pytest.mark.unit
class TestProductsRouteErrorHandling:
    """Test error handling in products routes."""

    async def test_get_products_raises_502_on_exception(self):
        """Test that GET /products raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import ProductsGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.products import get_products

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = ProductsGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await get_products(use_case, params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch products from Strapi" in exc_info.value.detail

    async def test_get_product_raises_502_on_exception(self):
        """Test that GET /products/{id} raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import ProductsIdGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.products import get_product

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = ProductsIdGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await get_product(use_case, "1", params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch product from Strapi" in exc_info.value.detail


@pytest.mark.asyncio
@pytest.mark.unit
class TestComponentsRouteErrorHandling:
    """Test error handling in components routes."""

    async def test_get_components_raises_502_on_exception(self):
        """Test that GET /components raises HTTPException on error."""
        from affilibuster_backend.infrastructure.api.routes.components import get_components

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")

        with pytest.raises(HTTPException) as exc_info:
            await get_components(use_case)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch components from Strapi" in exc_info.value.detail

    async def test_get_component_raises_502_on_exception(self):
        """Test that GET /components/{uid} raises HTTPException on error."""
        from affilibuster_backend.infrastructure.api.routes.components import get_component

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")

        with pytest.raises(HTTPException) as exc_info:
            await get_component(use_case, "test.component")

        assert exc_info.value.status_code == 502
        assert "Failed to fetch component test.component from Strapi" in exc_info.value.detail


@pytest.mark.asyncio
@pytest.mark.unit
class TestFilesRouteErrorHandling:
    """Test error handling in files routes."""

    async def test_get_files_raises_502_on_exception(self):
        """Test that GET /files raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import FilesGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.files import get_files

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = FilesGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await get_files(use_case, params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch files from Strapi" in exc_info.value.detail

    async def test_get_file_raises_502_on_exception(self):
        """Test that GET /files/{id} raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import FilesIdGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.files import get_file

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = FilesIdGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await get_file(use_case, "1", params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch file 1 from Strapi" in exc_info.value.detail


@pytest.mark.asyncio
@pytest.mark.unit
class TestSimpleProxyRoutesErrorHandling:
    """Test error handling in simple proxy routes."""

    async def test_about_raises_502_on_exception(self):
        """Test that GET /about raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import AboutGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.about import about_get_about

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = AboutGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await about_get_about(use_case, params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch about page from Strapi" in exc_info.value.detail

    async def test_contact_raises_502_on_exception(self):
        """Test that GET /contact raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import ContactGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.contact import contact_get_contact

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = ContactGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await contact_get_contact(use_case, params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch contact page from Strapi" in exc_info.value.detail

    async def test_error_404_raises_502_on_exception(self):
        """Test that GET /error-404 raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import Error404GetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.error_404 import error_404_get_error_404

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = Error404GetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await error_404_get_error_404(use_case, params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch 404 error page from Strapi" in exc_info.value.detail

    async def test_error_410_raises_502_on_exception(self):
        """Test that GET /error-410 raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import Error410GetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.error_410 import error_410_get_error_410

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = Error410GetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await error_410_get_error_410(use_case, params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch 410 error page from Strapi" in exc_info.value.detail

    async def test_footer_raises_502_on_exception(self):
        """Test that GET /footer raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import FooterGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.footer import footer_get_footer

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = FooterGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await footer_get_footer(use_case, params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch footer from Strapi" in exc_info.value.detail

    async def test_homepage_raises_502_on_exception(self):
        """Test that GET /homepage raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import HomepageGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.homepage import homepage_get_homepage

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = HomepageGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await homepage_get_homepage(use_case, params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch homepage from Strapi" in exc_info.value.detail

    async def test_navigation_raises_502_on_exception(self):
        """Test that GET /navigation raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import NavigationGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.navigation import navigation_get_navigation

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = NavigationGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await navigation_get_navigation(use_case, params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch navigation from Strapi" in exc_info.value.detail

    async def test_privacy_raises_502_on_exception(self):
        """Test that GET /privacy raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import PrivacyGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.privacy import privacy_get_privacy

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = PrivacyGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await privacy_get_privacy(use_case, params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch privacy policy from Strapi" in exc_info.value.detail

    async def test_product_page_raises_502_on_exception(self):
        """Test that GET /product-page raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import ProductPageGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.product_page import product_page_get_product_page

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = ProductPageGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await product_page_get_product_page(use_case, params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch product page template from Strapi" in exc_info.value.detail

    async def test_system_message_raises_502_on_exception(self):
        """Test that GET /system-message raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import SystemMessageGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.system_message import system_message_get_system_message

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = SystemMessageGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await system_message_get_system_message(use_case, params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch system message from Strapi" in exc_info.value.detail

    async def test_term_raises_502_on_exception(self):
        """Test that GET /term raises HTTPException on error."""
        from affilibuster_backend.domain.entities.generated.models import TermGetParametersQuery
        from affilibuster_backend.infrastructure.api.routes.term import term_get_term

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")
        params = TermGetParametersQuery()

        with pytest.raises(HTTPException) as exc_info:
            await term_get_term(use_case, params)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch terms of service from Strapi" in exc_info.value.detail


@pytest.mark.asyncio
@pytest.mark.unit
class TestLocalesRouteErrorHandling:
    """Test error handling in locales route."""

    async def test_get_locales_raises_502_on_exception(self):
        """Test that GET /locales raises HTTPException on error."""
        from affilibuster_backend.infrastructure.api.routes.locales import get_locales

        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Strapi connection failed")

        with pytest.raises(HTTPException) as exc_info:
            await get_locales(use_case)

        assert exc_info.value.status_code == 502
        assert "Failed to fetch locales from Strapi" in exc_info.value.detail
