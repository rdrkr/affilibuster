# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
GetAllLanguages use case.

Reference: plan.md:110, T072 (ILanguageRepository)
"""

from typing import List
from src.domain.entities.language import Language
from src.domain.repositories.language_repository import ILanguageRepository


class GetAllLanguages:
    """
    Use case for retrieving all active languages.

    Returns languages sorted by sort_order.
    """

    def __init__(self, language_repository: ILanguageRepository):
        """
        Initialize use case with repository.

        Args:
            language_repository: Language repository implementation
        """
        self.language_repository = language_repository

    async def execute(self) -> List[Language]:
        """
        Get all active languages.

        Returns:
            List[Language]: Active languages sorted by sort_order
        """
        return await self.language_repository.get_active()
