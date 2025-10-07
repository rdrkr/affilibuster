# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Pydantic models for currency endpoints.

Reference: contracts/api-v1.yaml:342-398
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Literal


class CurrencyResponse(BaseModel):
    """Currency response model."""

    model_config = ConfigDict(populate_by_name=True)

    code: str = Field(..., pattern='^[A-Z]{3}$', json_schema_extra={'example': 'EUR'})
    displayName: str = Field(..., serialization_alias='displayName', validation_alias='name', json_schema_extra={'example': 'Euro'})
    symbol: str = Field(..., json_schema_extra={'example': '€'})
    decimalPlaces: int = Field(..., serialization_alias='decimalPlaces', validation_alias='decimal_places', ge=0, le=3, json_schema_extra={'example': 2})
    symbolPosition: Literal['before', 'after'] = Field(..., serialization_alias='symbolPosition', validation_alias='symbol_position', json_schema_extra={'example': 'after'})
    thousandsSeparator: str = Field(..., serialization_alias='thousandsSeparator', validation_alias='thousands_separator', json_schema_extra={'example': '.'})
    decimalSeparator: str = Field(..., serialization_alias='decimalSeparator', validation_alias='decimal_separator', json_schema_extra={'example': ','})


class ConvertCurrencyRequest(BaseModel):
    """Request model for currency conversion."""

    model_config = ConfigDict(populate_by_name=True)

    amount: float = Field(..., json_schema_extra={'example': 29.99})
    fromCurrency: str = Field(..., validation_alias='from_currency', pattern='^[A-Z]{3}$', json_schema_extra={'example': 'USD'})
    toCurrency: str = Field(..., validation_alias='to_currency', pattern='^[A-Z]{3}$', json_schema_extra={'example': 'EUR'})
    locale: str = Field(default='en-US', json_schema_extra={'example': 'it-IT'})


class ConvertedCurrencyResponse(BaseModel):
    """Response model for currency conversion."""

    model_config = ConfigDict(populate_by_name=True)

    fromCurrency: str = Field(..., serialization_alias='fromCurrency', validation_alias='from_currency', json_schema_extra={'example': 'USD'})
    toCurrency: str = Field(..., serialization_alias='toCurrency', validation_alias='to_currency', json_schema_extra={'example': 'EUR'})
    amount: float = Field(..., json_schema_extra={'example': 29.99})
    convertedAmount: float = Field(..., serialization_alias='convertedAmount', validation_alias='to_amount', json_schema_extra={'example': 27.50})
    formatted: str = Field(..., json_schema_extra={'example': '27,50 €'})
    rate: float = Field(..., serialization_alias='rate', validation_alias='exchange_rate', json_schema_extra={'example': 0.917})
    timestamp: str = Field(..., json_schema_extra={'example': '2025-10-09T12:00:00Z'})
