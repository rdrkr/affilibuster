# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
CMS repository interface.

Reference: plan.md:121
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Any


class ICMSRepository(ABC):
    """
    CMS-agnostic repository interface.

    This interface abstracts the CMS implementation (Strapi, Contentful, etc.)
    and provides a clean interface for content retrieval.
    """

    @abstractmethod
    async def get_content(self, content_id: str, locale: str) -> Optional[dict]:
        """
        Get content by ID and locale.

        Args:
            content_id: Content identifier in CMS
            locale: Locale code (e.g., 'en', 'it-IT')

        Returns:
            Optional[dict]: Content data if found, None otherwise
        """
        pass

    @abstractmethod
    async def list_content(
        self, locale: str, content_type: str, page: int = 1, page_size: int = 20
    ) -> dict:
        """
        List content by type and locale with pagination.

        Args:
            locale: Locale code
            content_type: Content type (e.g., 'page', 'product', 'article')
            page: Page number (1-indexed)
            page_size: Items per page

        Returns:
            dict: Paginated content list with metadata
        """
        pass

    @abstractmethod
    async def sync_content(self, webhook_payload: dict) -> None:
        """
        Process CMS webhook to sync content.

        Args:
            webhook_payload: Webhook data from CMS
        """
        pass

    @abstractmethod
    async def get_content_by_slug(self, slug: str, locale: str, content_type: str) -> Optional[dict]:
        """
        Get content by slug, locale, and type.

        Args:
            slug: Content slug
            locale: Locale code
            content_type: Content type

        Returns:
            Optional[dict]: Content data if found, None otherwise
        """
        pass

    @abstractmethod
    async def validate_webhook_signature(self, payload: dict, signature: str) -> bool:
        """
        Validate webhook signature from CMS.

        Args:
            payload: Webhook payload
            signature: Signature header from CMS

        Returns:
            bool: True if signature is valid, False otherwise
        """
        pass
