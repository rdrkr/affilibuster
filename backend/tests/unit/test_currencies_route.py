# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for currencies API route with refactored architecture.

Covers:
- GET /currencies endpoint
- POST /currencies/convert endpoint
- Strapi data transformation
- Currency validation
- Error handling
"""

from unittest.mock import AsyncMock

import pytest


class TestGetCurrencies:
    """Test GET /currencies endpoint."""

    @pytest.mark.asyncio
    async def test_get_currencies_returns_list(self, async_client, mocker):
        """Test GET /currencies returns list of active currencies."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = {
            "data": [
                {
                    "id": 1,
                    "attributes": {
                        "code": "USD",
                        "name": "US Dollar",
                        "symbol": "$",
                        "isActive": True,
                        "decimalPlaces": 2,
                        "symbolPosition": "before",
                        "thousandsSeparator": ",",
                        "decimalSeparator": ".",
                    },
                },
                {
                    "id": 2,
                    "attributes": {
                        "code": "EUR",
                        "name": "Euro",
                        "symbol": "€",
                        "isActive": True,
                        "decimalPlaces": 2,
                        "symbolPosition": "after",
                        "thousandsSeparator": ".",
                        "decimalSeparator": ",",
                    },
                },
            ]
        }

        # Act
        response = await async_client.get("/v1/currencies")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["code"] in ["EUR", "USD"]  # Sorted by code
        assert data[0]["name"] in ["Euro", "US Dollar"]

    @pytest.mark.asyncio
    async def test_get_currencies_filters_inactive(self, async_client, mocker):
        """Test GET /currencies filters out inactive currencies."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = {
            "data": [
                {
                    "id": 1,
                    "attributes": {
                        "code": "USD",
                        "name": "US Dollar",
                        "symbol": "$",
                        "isActive": True,
                        "decimalPlaces": 2,
                        "symbolPosition": "before",
                        "thousandsSeparator": ",",
                        "decimalSeparator": ".",
                    },
                },
                {
                    "id": 2,
                    "attributes": {
                        "code": "OLD",
                        "name": "Old Currency",
                        "symbol": "X",
                        "isActive": False,  # Inactive
                        "decimalPlaces": 2,
                        "symbolPosition": "before",
                        "thousandsSeparator": ",",
                        "decimalSeparator": ".",
                    },
                },
            ]
        }

        # Act
        response = await async_client.get("/v1/currencies")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["code"] == "USD"

    @pytest.mark.asyncio
    async def test_get_currencies_handles_strapi_error(self, async_client, mocker):
        """Test GET /currencies handles Strapi connection errors."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )
        mock_strapi_get.side_effect = Exception("Connection timeout")

        # Act
        response = await async_client.get("/v1/currencies")

        # Assert
        assert response.status_code == 502
        data = response.json()
        assert "Failed to fetch currencies" in data["detail"]


class TestConvertCurrency:
    """Test POST /currencies/convert endpoint."""

    @pytest.mark.asyncio
    async def test_convert_currency_valid_codes(self, async_client, mocker):
        """Test currency conversion with valid currency codes."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = {
            "data": [
                {
                    "id": 1,
                    "attributes": {
                        "code": "USD",
                        "name": "US Dollar",
                        "symbol": "$",
                        "isActive": True,
                        "decimalPlaces": 2,
                        "symbolPosition": "before",
                        "thousandsSeparator": ",",
                        "decimalSeparator": ".",
                    },
                },
                {
                    "id": 2,
                    "attributes": {
                        "code": "EUR",
                        "name": "Euro",
                        "symbol": "€",
                        "isActive": True,
                        "decimalPlaces": 2,
                        "symbolPosition": "after",
                        "thousandsSeparator": ".",
                        "decimalSeparator": ",",
                    },
                },
            ]
        }

        # Act
        response = await async_client.post(
            "/v1/currencies/convert",
            json={"fromCurrency": "USD", "toCurrency": "EUR", "amount": 100},
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["currency"] == "EUR"
        assert data["amount"] == 100  # Mock exchange rate is 1:1
        assert "€" in data["formatted"]

    @pytest.mark.asyncio
    async def test_convert_currency_invalid_from_code(self, async_client, mocker):
        """Test conversion with invalid 'from' currency code."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = {
            "data": [
                {
                    "id": 1,
                    "attributes": {
                        "code": "USD",
                        "name": "US Dollar",
                        "symbol": "$",
                        "isActive": True,
                        "decimalPlaces": 2,
                        "symbolPosition": "before",
                        "thousandsSeparator": ",",
                        "decimalSeparator": ".",
                    },
                }
            ]
        }

        # Act
        response = await async_client.post(
            "/v1/currencies/convert",
            json={"fromCurrency": "INVALID", "toCurrency": "USD", "amount": 100},
        )

        # Assert
        assert response.status_code == 400
        data = response.json()
        assert data["error"] == "Bad Request"
        assert "Invalid currency codes" in data["message"]

    @pytest.mark.asyncio
    async def test_convert_currency_invalid_to_code(self, async_client, mocker):
        """Test conversion with invalid 'to' currency code."""
        # Arrange
        mock_strapi_get = mocker.patch(
            "domain.use_cases.strapi_proxy.IStrapiRepository.get",
            new_callable=AsyncMock,
        )

        mock_strapi_get.return_value = {
            "data": [
                {
                    "id": 1,
                    "attributes": {
                        "code": "USD",
                        "name": "US Dollar",
                        "symbol": "$",
                        "isActive": True,
                        "decimalPlaces": 2,
                        "symbolPosition": "before",
                        "thousandsSeparator": ",",
                        "decimalSeparator": ".",
                    },
                }
            ]
        }

        # Act
        response = await async_client.post(
            "/v1/currencies/convert",
            json={"fromCurrency": "USD", "toCurrency": "INVALID", "amount": 100},
        )

        # Assert
        assert response.status_code == 400
