# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Currency repository interface.

Reference: T062 (Currency entity)
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.currency import Currency


class ICurrencyRepository(ABC):
    """
    Repository interface for Currency entities.

    Provides methods for retrieving currency configuration.
    """

    @abstractmethod
    async def get_all(self) -> List[Currency]:
        """
        Get all currencies.

        Returns:
            List[Currency]: All currency configurations
        """
        pass

    @abstractmethod
    async def get_by_code(self, code: str) -> Optional[Currency]:
        """
        Get a currency by its code.

        Args:
            code: Currency code (e.g., 'USD', 'EUR', 'ILS')

        Returns:
            Optional[Currency]: Currency if found, None otherwise
        """
        pass

    @abstractmethod
    async def get_active(self) -> List[Currency]:
        """
        Get all active currencies.

        Returns:
            List[Currency]: All active currency configurations
        """
        pass
