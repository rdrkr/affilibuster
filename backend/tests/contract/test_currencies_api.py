# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Contract test for GET /v1/currencies endpoint.
Reference: contracts/api-v1.yaml:124-137
"""

import pytest
from httpx import AsyncClient


@pytest.mark.contract
async def test_get_currencies_returns_array():
    """
    Test that GET /v1/currencies returns an array of currencies.
    Expected to fail: endpoint not implemented yet.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/currencies")

        assert response.status_code == 200
        data = response.json()

        # Validate response is an array
        assert isinstance(data, list)

        # Should have 8 currencies
        assert len(data) >= 8


@pytest.mark.contract
async def test_get_currencies_schema():
    """
    Test that each currency matches the Currency schema.
    Reference: contracts/api-v1.yaml:342-375
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/currencies")

        assert response.status_code == 200
        currencies = response.json()

        # Validate schema for each currency
        for currency in currencies:
            # Required fields
            assert "code" in currency
            assert "symbol" in currency
            assert "symbolPosition" in currency
            assert "decimalSeparator" in currency
            assert "thousandsSeparator" in currency
            assert "decimalPlaces" in currency
            assert "displayName" in currency

            # Type validation
            assert isinstance(currency["code"], str)
            assert len(currency["code"]) == 3  # ISO 4217
            assert currency["symbolPosition"] in ["before", "after"]
            assert isinstance(currency["decimalPlaces"], int)
            assert 0 <= currency["decimalPlaces"] <= 3


@pytest.mark.contract
async def test_get_currencies_includes_common_codes():
    """Test that response includes common currencies."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/currencies")

        assert response.status_code == 200
        currencies = response.json()

        codes = [curr["code"] for curr in currencies]
        assert "USD" in codes
        assert "EUR" in codes
        assert "ILS" in codes


@pytest.mark.contract
async def test_get_currencies_formatting_rules():
    """Test that currencies have proper formatting rules."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/v1/currencies")

        assert response.status_code == 200
        currencies = response.json()

        # Find USD
        usd = next((c for c in currencies if c["code"] == "USD"), None)
        assert usd is not None
        assert usd["symbol"] == "$"
        assert usd["decimalPlaces"] == 2
        assert usd["symbolPosition"] == "before"

        # Find EUR
        eur = next((c for c in currencies if c["code"] == "EUR"), None)
        assert eur is not None
        assert eur["symbol"] == "€"
        assert eur["decimalPlaces"] == 2
