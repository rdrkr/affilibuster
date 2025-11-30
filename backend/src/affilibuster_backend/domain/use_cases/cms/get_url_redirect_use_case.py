# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Use case for retrieving URL redirects.

Reference: T145 (URL redirect handling)
"""

from affilibuster_backend.domain.entities.url_redirect import URLRedirect
from affilibuster_backend.domain.repositories.url_redirect_repository import IURLRedirectRepository


class GetURLRedirectUseCase:
    """
    Use case for retrieving a URL redirect by path.

    Used by the frontend middleware/proxy to check if a URL should be
    redirected (301) or return a gone status (410).
    """

    def __init__(self, repository: IURLRedirectRepository) -> None:
        """
        Initialize use case with repository.

        Args:
            repository: URL redirect repository implementation

        """
        self.repository = repository

    async def execute(self, path: str) -> URLRedirect | None:
        """
        Get redirect for a given path.

        Args:
            path: The URL path to check for redirects

        Returns:
            URLRedirect if found, None if no redirect exists

        """
        return await self.repository.get_by_path(path)
