# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Content repository interface.

Reference: plan.md:106-107, data-model.md:462-489
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from ..entities.content import Content
from ..entities.content_version import ContentVersion
from ..entities.url_route import URLRedirect


class PaginatedResult:
    """Paginated result container."""

    def __init__(self, items: List[ContentVersion], total: int, page: int, page_size: int):
        self.items = items
        self.total = total
        self.page = page
        self.page_size = page_size
        self.total_pages = (total + page_size - 1) // page_size


class IContentRepository(ABC):
    """
    Repository interface for Content and ContentVersion entities.

    Provides methods for content retrieval, creation, and redirect management.
    """

    @abstractmethod
    async def get_by_slug(self, language_code: str, slug: str) -> Optional[ContentVersion]:
        """
        Get content version by language and slug.

        Args:
            language_code: Language code (e.g., 'en', 'it', 'he')
            slug: URL slug

        Returns:
            Optional[ContentVersion]: Content version if found, None otherwise
        """
        pass

    @abstractmethod
    async def get_by_id(self, content_id: UUID, language_code: str) -> Optional[ContentVersion]:
        """
        Get content version by content ID and language.

        Args:
            content_id: Content UUID
            language_code: Language code

        Returns:
            Optional[ContentVersion]: Content version if found, None otherwise
        """
        pass

    @abstractmethod
    async def list_by_language(
        self, language_code: str, page: int = 1, limit: int = 20
    ) -> PaginatedResult:
        """
        List published content versions for a language with pagination.

        Args:
            language_code: Language code
            page: Page number (1-indexed)
            limit: Items per page

        Returns:
            PaginatedResult: Paginated list of content versions
        """
        pass

    @abstractmethod
    async def create(self, content: Content, version: ContentVersion) -> ContentVersion:
        """
        Create new content with its first version.

        Args:
            content: Content base entity
            version: Initial content version

        Returns:
            ContentVersion: Created content version
        """
        pass

    @abstractmethod
    async def update_version(self, version: ContentVersion) -> ContentVersion:
        """
        Update an existing content version.

        Args:
            version: Content version to update

        Returns:
            ContentVersion: Updated content version
        """
        pass

    @abstractmethod
    async def create_redirect(self, redirect: URLRedirect) -> None:
        """
        Create a URL redirect entry.

        Args:
            redirect: URLRedirect entity to create
        """
        pass

    @abstractmethod
    async def archive_content(self, content_id: UUID) -> None:
        """
        Archive content and set all versions to unpublished.

        Args:
            content_id: Content UUID to archive
        """
        pass
