# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Language repository interface.

Reference: plan.md:106-107, T058 (Language entity)
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.language import Language


class ILanguageRepository(ABC):
    """
    Repository interface for Language entities.

    Provides methods for retrieving language configuration.
    """

    @abstractmethod
    async def get_all(self) -> List[Language]:
        """
        Get all languages.

        Returns:
            List[Language]: All language configurations
        """
        pass

    @abstractmethod
    async def get_by_code(self, code: str) -> Optional[Language]:
        """
        Get a language by its code.

        Args:
            code: Language code (e.g., 'en', 'it', 'he')

        Returns:
            Optional[Language]: Language if found, None otherwise
        """
        pass

    @abstractmethod
    async def get_default(self) -> Language:
        """
        Get the default language (English).

        Returns:
            Language: The default language configuration
        """
        pass

    @abstractmethod
    async def get_active(self) -> List[Language]:
        """
        Get all active languages.

        Returns:
            List[Language]: All active language configurations
        """
        pass
