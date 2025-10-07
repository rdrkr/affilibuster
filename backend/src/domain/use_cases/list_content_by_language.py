# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
ListContentByLanguage use case.

Reference: contracts/api-v1.yaml:52-73
"""

from src.domain.repositories.content_repository import IContentRepository, PaginatedResult


class ListContentByLanguage:
    """
    Use case for listing content by language with pagination.

    Returns published content versions for a specific language.
    """

    def __init__(self, content_repository: IContentRepository):
        """
        Initialize use case with repository.

        Args:
            content_repository: Content repository implementation
        """
        self.content_repository = content_repository

    async def execute(
        self, language_code: str, page: int = 1, page_size: int = 20
    ) -> PaginatedResult:
        """
        List published content for a language with pagination.

        Args:
            language_code: Language code (e.g., 'en', 'it', 'he')
            page: Page number (1-indexed)
            page_size: Items per page

        Returns:
            PaginatedResult: Paginated list of content versions
        """
        return await self.content_repository.list_by_language(
            language_code, page, page_size
        )
