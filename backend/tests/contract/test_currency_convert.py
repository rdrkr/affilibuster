# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Contract test for POST /v1/currencies/convert endpoint.
Reference: contracts/api-v1.yaml:139-175
"""

import pytest
from httpx import AsyncClient


@pytest.mark.contract
async def test_convert_currency_usd_to_eur():
    """
    Test currency conversion from USD to EUR.
    Expected to fail: endpoint not implemented yet.
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "amount": 29.99,
            "fromCurrency": "USD",
            "toCurrency": "EUR",
        }
        response = await client.post("/v1/currencies/convert", json=payload)

        assert response.status_code == 200
        data = response.json()

        # Should have converted amount
        assert "convertedAmount" in data
        assert isinstance(data["convertedAmount"], (int, float))


@pytest.mark.contract
async def test_convert_currency_response_schema():
    """
    Test that response matches ConvertedCurrency schema.
    Reference: contracts/api-v1.yaml:376-398
    """
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "amount": 100.00,
            "fromCurrency": "USD",
            "toCurrency": "EUR",
        }
        response = await client.post("/v1/currencies/convert", json=payload)

        assert response.status_code == 200
        data = response.json()

        # Required fields
        assert "amount" in data
        assert "fromCurrency" in data
        assert "toCurrency" in data
        assert "rate" in data
        assert "convertedAmount" in data
        assert "timestamp" in data

        # Type validation
        assert isinstance(data["amount"], (int, float))
        assert data["fromCurrency"] == "USD"
        assert data["toCurrency"] == "EUR"
        assert isinstance(data["rate"], (int, float))
        assert isinstance(data["convertedAmount"], (int, float))


@pytest.mark.contract
async def test_convert_currency_with_locale():
    """Test currency conversion with locale formatting."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "amount": 29.99,
            "fromCurrency": "USD",
            "toCurrency": "EUR",
            "locale": "it-IT",
        }
        response = await client.post("/v1/currencies/convert", json=payload)

        assert response.status_code == 200
        data = response.json()

        assert data["fromCurrency"] == "USD"
        assert data["toCurrency"] == "EUR"


@pytest.mark.contract
async def test_convert_currency_missing_required_fields():
    """Test that missing required fields returns 422."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "amount": 29.99,
            # Missing fromCurrency and toCurrency
        }
        response = await client.post("/v1/currencies/convert", json=payload)

        assert response.status_code == 422


@pytest.mark.contract
async def test_convert_currency_invalid_currency_code():
    """Test that invalid currency code returns error."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "amount": 29.99,
            "fromCurrency": "XXX",  # Invalid
            "toCurrency": "EUR",
        }
        response = await client.post("/v1/currencies/convert", json=payload)

        # Should return 400 or 404
        assert response.status_code in [400, 404, 422]
