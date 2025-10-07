# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
GetAllCurrencies use case.

Reference: T074 (ICurrencyRepository)
"""

from typing import List
from src.domain.entities.currency import Currency
from src.domain.repositories.currency_repository import ICurrencyRepository


class GetAllCurrencies:
    """
    Use case for retrieving all active currencies.

    Returns currencies sorted by sort_order.
    """

    def __init__(self, currency_repository: ICurrencyRepository):
        """
        Initialize use case with repository.

        Args:
            currency_repository: Currency repository implementation
        """
        self.currency_repository = currency_repository

    async def execute(self) -> List[Currency]:
        """
        Get all active currencies.

        Returns:
            List[Currency]: Active currencies sorted by sort_order
        """
        return await self.currency_repository.get_active()
