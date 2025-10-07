# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration test for currency conversion.
Reference: quickstart.md:150-168 (Test 3: Currency Selection & Persistence)
"""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
async def test_currency_conversion_usd_to_eur():
    """
    Test USD to EUR conversion with proper formatting.
    Expected to fail: currency conversion not implemented.
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

        # Should have conversion result
        assert data["amount"] == 29.99
        assert data["fromCurrency"] == "USD"
        assert data["toCurrency"] == "EUR"
        assert "convertedAmount" in data
        assert "rate" in data

        # Converted amount should be reasonable (assuming ~0.92 exchange rate)
        assert 25.0 < data["convertedAmount"] < 30.0


@pytest.mark.integration
async def test_currency_conversion_with_locale_formatting():
    """Test that conversion respects locale formatting."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "amount": 1234.56,
            "fromCurrency": "USD",
            "toCurrency": "EUR",
            "locale": "it-IT",  # Italian formatting
        }
        response = await client.post("/v1/currencies/convert", json=payload)

        assert response.status_code == 200
        data = response.json()

        # Should include converted amount
        assert "convertedAmount" in data


@pytest.mark.integration
async def test_currency_conversion_rate_caching():
    """Test that exchange rates are cached (performance)."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "amount": 100.00,
            "fromCurrency": "USD",
            "toCurrency": "EUR",
        }

        # First request
        response1 = await client.post("/v1/currencies/convert", json=payload)
        assert response1.status_code == 200
        data1 = response1.json()

        # Second request (should use cached rate)
        response2 = await client.post("/v1/currencies/convert", json=payload)
        assert response2.status_code == 200
        data2 = response2.json()

        # Rates should be identical (cached)
        assert data1["rate"] == data2["rate"]


@pytest.mark.integration
async def test_currency_conversion_same_currency():
    """Test conversion when from and to currencies are the same."""
    async with AsyncClient(base_url="http://localhost:8000") as client:
        payload = {
            "amount": 50.00,
            "fromCurrency": "USD",
            "toCurrency": "USD",
        }
        response = await client.post("/v1/currencies/convert", json=payload)

        assert response.status_code == 200
        data = response.json()

        # Should return same amount with rate of 1.0
        assert data["convertedAmount"] == 50.00
        assert data["rate"] == 1.0
