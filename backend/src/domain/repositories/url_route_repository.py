# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
URL route repository interface.

Reference: data-model.md:540-563 (URL Slug Change Flow)
"""

from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID
from ..entities.url_route import URLRoute, URLRedirect


class IURLRouteRepository(ABC):
    """
    Repository interface for URLRoute entities.

    Supports URL routing, redirects, and slug change workflows.
    """

    @abstractmethod
    async def get_by_path(self, path: str) -> Optional[URLRoute]:
        """
        Get URL route by path.

        Args:
            path: Full URL path (e.g., '/products/eco-bottle')

        Returns:
            Optional[URLRoute]: URL route if found, None otherwise
        """
        pass

    @abstractmethod
    async def get_by_id(self, route_id: UUID) -> Optional[URLRoute]:
        """
        Get URL route by ID.

        Args:
            route_id: URL route UUID

        Returns:
            Optional[URLRoute]: URL route if found, None otherwise
        """
        pass

    @abstractmethod
    async def get_primary_for_content(self, content_version_id: UUID) -> Optional[URLRoute]:
        """
        Get the primary URL route for a content version.

        Args:
            content_version_id: Content version UUID

        Returns:
            Optional[URLRoute]: Primary URL route if exists, None otherwise
        """
        pass

    @abstractmethod
    async def list_for_content(self, content_version_id: UUID) -> List[URLRoute]:
        """
        List all URL routes for a content version.

        Args:
            content_version_id: Content version UUID

        Returns:
            List[URLRoute]: All URL routes for the content version
        """
        pass

    @abstractmethod
    async def create(self, url_route: URLRoute) -> URLRoute:
        """
        Create a new URL route.

        Args:
            url_route: URLRoute entity to create

        Returns:
            URLRoute: Created URL route
        """
        pass

    @abstractmethod
    async def update(self, url_route: URLRoute) -> URLRoute:
        """
        Update an existing URL route.

        Args:
            url_route: URLRoute entity to update

        Returns:
            URLRoute: Updated URL route
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
    async def mark_inactive(self, url_route_id: UUID) -> None:
        """
        Mark a URL route as inactive.

        Args:
            url_route_id: URL route UUID to deactivate
        """
        pass

    @abstractmethod
    async def get_redirect_by_path(self, from_path: str) -> Optional[URLRedirect]:
        """
        Get redirect by source path.

        Args:
            from_path: Source path to look up

        Returns:
            Optional[URLRedirect]: Redirect if found, None otherwise
        """
        pass
