# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Currency API routes.

Reference: contracts/api-v1.yaml:124-175
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from src.infrastructure.database.config import get_db
from src.infrastructure.database.repositories.currency_repository import CurrencyRepository
from src.infrastructure.api.models.currencies import (
    CurrencyResponse,
    ConvertCurrencyRequest,
    ConvertedCurrencyResponse,
)
from src.infrastructure.api.models.errors import ErrorResponse
from src.domain.use_cases.get_all_currencies import GetAllCurrencies
from src.domain.use_cases.convert_currency import ConvertCurrency


router = APIRouter(prefix='/v1/currencies', tags=['currencies'])


@router.get('', response_model=List[CurrencyResponse])
async def get_currencies(db: AsyncSession = Depends(get_db)):
    """
    Get all active currencies.

    Returns list of available currencies sorted by sort_order.
    """
    # Create repository and use case
    repo = CurrencyRepository(db)
    use_case = GetAllCurrencies(repo)

    # Execute use case
    currencies = await use_case.execute()

    # Convert to response models
    return [
        CurrencyResponse(
            code=curr.code,
            name=curr.name,
            symbol=curr.symbol,
            decimal_places=curr.decimal_places,
            symbol_position=curr.symbol_position,
            thousands_separator=curr.thousands_separator,
            decimal_separator=curr.decimal_separator,
        )
        for curr in currencies
    ]


@router.post('/convert', response_model=ConvertedCurrencyResponse, responses={400: {'model': ErrorResponse}})
async def convert_currency(
    request: ConvertCurrencyRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Convert currency amount.

    Uses mock exchange rates. In production would integrate with external API.
    """
    # Create repository and use case
    repo = CurrencyRepository(db)
    use_case = ConvertCurrency(repo)

    # Execute use case
    result = await use_case.execute(
        request.amount,
        request.fromCurrency,
        request.toCurrency,
    )

    if not result:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(
                error='Bad Request',
                message=f'Invalid currency codes: {request.fromCurrency} or {request.toCurrency}',
                code='INVALID_CURRENCY',
            ).model_dump(mode='json'),
        )

    # Convert to response model
    return ConvertedCurrencyResponse(
        from_currency=result.from_currency,
        to_currency=result.to_currency,
        amount=result.from_amount,
        to_amount=result.to_amount,
        formatted=result.formatted,
        exchange_rate=result.exchange_rate,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
