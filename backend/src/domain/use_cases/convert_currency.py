# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
ConvertCurrency use case.

Reference: research.md:221-231
"""

from dataclasses import dataclass
from typing import Optional
from src.domain.entities.currency import Currency
from src.domain.repositories.currency_repository import ICurrencyRepository


@dataclass
class ConversionResult:
    """Result of currency conversion."""
    from_currency: str
    to_currency: str
    from_amount: float
    to_amount: float
    formatted: str
    exchange_rate: float


class ConvertCurrency:
    """
    Use case for converting currency amounts.

    Uses mock exchange rates for now. In production, would integrate
    with external API (e.g., exchangerate-api.com).
    """

    # Mock exchange rates (base: USD)
    MOCK_RATES = {
        'USD': 1.0,
        'EUR': 0.92,
        'GBP': 0.79,
        'ILS': 3.65,
        'CAD': 1.36,
        'AUD': 1.52,
        'JPY': 149.50,
        'CNY': 7.24,
    }

    def __init__(self, currency_repository: ICurrencyRepository):
        """
        Initialize use case with repository.

        Args:
            currency_repository: Currency repository implementation
        """
        self.currency_repository = currency_repository

    async def execute(
        self, amount: float, from_currency: str, to_currency: str
    ) -> Optional[ConversionResult]:
        """
        Convert amount from one currency to another.

        Args:
            amount: Amount to convert
            from_currency: Source currency code (e.g., 'USD')
            to_currency: Target currency code (e.g., 'EUR')

        Returns:
            Optional[ConversionResult]: Conversion result with formatted output
        """
        # Get currency entities for formatting
        from_curr = await self.currency_repository.get_by_code(from_currency)
        to_curr = await self.currency_repository.get_by_code(to_currency)

        if not from_curr or not to_curr:
            return None

        # Calculate conversion
        from_rate = self.MOCK_RATES.get(from_currency, 1.0)
        to_rate = self.MOCK_RATES.get(to_currency, 1.0)
        exchange_rate = to_rate / from_rate
        converted_amount = amount * exchange_rate

        # Format result
        formatted = to_curr.format_amount(converted_amount)

        return ConversionResult(
            from_currency=from_currency,
            to_currency=to_currency,
            from_amount=amount,
            to_amount=converted_amount,
            formatted=formatted,
            exchange_rate=exchange_rate,
        )
