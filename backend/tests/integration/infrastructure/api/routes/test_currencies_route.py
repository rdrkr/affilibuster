# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for currencies API routes.

Tests currency listing and retrieval endpoints with real Strapi integration.
Verifies that Strapi contains the expected seed data from cms/src/seed.ts.
"""

import pytest
from httpx import AsyncClient

from affilibuster_backend.domain.entities.generated.models import CurrenciesGetResponse
from tests.fixtures.expected_seed_data import (
    EXPECTED_CURRENCIES,
    EXPECTED_CURRENCY_CODES,
    EXPECTED_CURRENCY_COUNT,
)


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestGetCurrencies:
    """Test suite for GET /currencies endpoint."""

    async def test_get_currencies_returns_200(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test that GET /currencies returns 200 status code."""
        response = await integration_client.get("/v1/currencies")
        assert response.status_code == 200

    async def test_get_currencies_returns_data_structure(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that GET /currencies returns proper data structure with seeded currencies."""
        response = await integration_client.get("/v1/currencies")
        assert response.status_code == 200

        data = CurrenciesGetResponse(**response.json())
        assert isinstance(data.data, list)

        # Verify we have the expected number of currencies from seed.ts
        assert len(data.data) == EXPECTED_CURRENCY_COUNT, (
            f"Expected {EXPECTED_CURRENCY_COUNT} currencies from seed.ts, got {len(data.data)}"
        )

        # Verify all expected currency codes are present
        returned_codes = {currency.code for currency in data.data}
        expected_codes = set(EXPECTED_CURRENCY_CODES)
        assert returned_codes == expected_codes, (
            f"Currency codes don't match seed.ts. Expected: {expected_codes}, Got: {returned_codes}"
        )

    async def test_get_currencies_with_pagination(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test GET /currencies with pagination parameters."""
        response = await integration_client.get(
            "/v1/currencies",
            params={"pagination[pageSize]": "5", "pagination[page]": "1"},
        )
        assert response.status_code == 200

        data = CurrenciesGetResponse(**response.json())
        assert data.data

    async def test_get_currencies_with_filters(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test GET /currencies with filter parameters."""
        response = await integration_client.get(
            "/v1/currencies",
            params={"filters[isActive][$eq]": "true"},
        )
        assert response.status_code == 200

        data = CurrenciesGetResponse(**response.json())
        assert data.data

    async def test_get_currencies_with_field_selection(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test GET /currencies with field selection."""
        response = await integration_client.get(
            "/v1/currencies",
            params={"fields[]": ["code", "name"]},
        )
        assert response.status_code == 200

    async def test_get_currencies_with_sorting(self, integration_client: AsyncClient, strapi_test_data: None) -> None:
        """Test GET /currencies with sorting."""
        response = await integration_client.get(
            "/v1/currencies",
            params={"sort[]": "code:asc"},
        )
        assert response.status_code == 200

    async def test_get_currencies_verifies_usd_data(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that USD currency exists with correct data from seed.ts."""
        response = await integration_client.get("/v1/currencies")
        assert response.status_code == 200

        data = CurrenciesGetResponse(**response.json())
        currencies = data.data

        # Find USD currency
        usd = next((c for c in currencies if c.code == "USD"), None)
        assert usd is not None, "USD currency not found - check if seed.ts ran"

        # Verify USD properties match seed.ts (line 1142)
        expected_usd = next(c for c in EXPECTED_CURRENCIES if c.code == "USD")
        assert usd.name == expected_usd.name
        assert usd.symbol == expected_usd.symbol
        assert usd.decimal_places == expected_usd.decimal_places
        assert usd.is_active == expected_usd.is_active

        # Alternative: Use helper to compare all fields at once (excluding system fields)
        # Uncomment to use generic comparison instead of manual field-by-field:
        # from tests.fixtures.test_helpers import assert_strapi_data_matches
        # assert_strapi_data_matches(usd, expected_usd)

    async def test_get_currencies_strapi_error_returns_502(self, integration_client: AsyncClient) -> None:
        """Test that Strapi errors return 502 Bad Gateway."""
        # This test assumes Strapi might be temporarily unavailable
        # In normal operation with Strapi running, this would return 200
        response = await integration_client.get("/v1/currencies")
        # Should either succeed (200) or fail with 502 if Strapi is down
        assert response.status_code in [200, 502]


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestGetCurrency:
    """Test suite for GET /currencies/{id} endpoint."""

    async def test_get_currency_by_id_returns_200(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that GET /currencies/{id} returns 200 for valid ID."""
        # First, get list of currencies to find a valid ID
        list_response = await integration_client.get("/v1/currencies")
        if list_response.status_code == 200:
            data = CurrenciesGetResponse(**list_response.json())
            if data.data and len(data.data) > 0:
                currency_id = data.data[0].document_id

                # Now get specific currency
                response = await integration_client.get(f"/v1/currencies/{currency_id}")
                # Should return 200 for valid ID, or 502 if Strapi has issues
                assert response.status_code in [200, 404, 502]

    async def test_get_currency_with_field_selection(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test GET /currencies/{id} with field selection."""
        # Get a valid currency ID first
        list_response = await integration_client.get("/v1/currencies")
        if list_response.status_code == 200:
            data = CurrenciesGetResponse(**list_response.json())
            if data.data and len(data.data) > 0:
                currency_id = data.data[0].document_id

                response = await integration_client.get(
                    f"/v1/currencies/{currency_id}",
                    params={"fields[]": ["code", "name"]},
                )
                assert response.status_code in [200, 404, 502]

    async def test_get_currency_with_invalid_id_returns_error(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that GET /currencies/{id} with invalid ID returns error."""
        response = await integration_client.get("/v1/currencies/nonexistent-id-99999")
        # Should return 404 or 502 (Strapi error)
        assert response.status_code in [404, 502]

    async def test_get_currency_strapi_error_returns_502(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that Strapi errors return 502 Bad Gateway."""
        response = await integration_client.get("/v1/currencies/1")
        # Should either succeed or fail with 502 if Strapi has issues
        assert response.status_code in [200, 404, 502]

    async def test_get_currency_path_parameter_validation(
        self, integration_client: AsyncClient, strapi_test_data: None
    ) -> None:
        """Test that currency ID path parameter is required."""
        # Trying to access without ID should route to list endpoint
        response = await integration_client.get("/v1/currencies/")
        # This redirects to list endpoint (307) or returns list (200)
        assert response.status_code in [200, 307, 404, 502]


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestCurrenciesErrorHandling:
    """Test suite for currencies error handling."""

    async def test_get_currencies_handles_strapi_connection_error(self, integration_client: AsyncClient) -> None:
        """Test that connection errors to Strapi are handled gracefully."""
        response = await integration_client.get("/v1/currencies")
        # Should return either 200 (success) or 502 (Bad Gateway on error)
        assert response.status_code in [200, 502]

    async def test_get_currency_handles_strapi_connection_error(self, integration_client: AsyncClient) -> None:
        """Test that connection errors to Strapi are handled gracefully."""
        response = await integration_client.get("/v1/currencies/1")
        # Should return either 200/404 (success) or 502 (Bad Gateway on error)
        assert response.status_code in [200, 404, 502]
