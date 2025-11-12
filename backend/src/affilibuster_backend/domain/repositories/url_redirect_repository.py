# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
URL redirect repository interface.

Reference: T145 (URL redirect handling)
"""

from abc import ABC, abstractmethod

from affilibuster_backend.domain.entities.url_redirect import URLRedirect


class IURLRedirectRepository(ABC):
    """
    Repository interface for URLRedirect entities.

    Provides methods for managing URL redirects (301 permanent redirects
    and 410 Gone status codes).
    """

    @abstractmethod
    async def get_by_path(self, from_path: str) -> URLRedirect | None:
        """
        Get redirect by source path.

        Args:
            from_path: The URL path to look up

        Returns:
            URLRedirect if found, None otherwise

        """

    @abstractmethod
    async def create(self, redirect: URLRedirect) -> URLRedirect:
        """
        Create a new URL redirect.

        Args:
            redirect: URLRedirect to create

        Returns:
            Created URLRedirect with generated ID

        """

    @abstractmethod
    async def delete_by_path(self, from_path: str) -> bool:
        """
        Delete redirect by source path.

        Args:
            from_path: The URL path to delete

        Returns:
            True if deleted, False if not found

        """

    @abstractmethod
    async def list_all(self) -> list[URLRedirect]:
        """
        List all redirects.

        Returns:
            List of all URLRedirect entities

        """
