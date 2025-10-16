# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
CreateURLRedirect use case.

Reference: data-model.md:199-206
"""

from datetime import UTC, datetime
from src.domain.entities.url_route import URLRedirect
from src.domain.repositories.url_route_repository import IURLRouteRepository


class CreateURLRedirect:
    """
    Use case for creating URL redirects.

    Redirects are immutable (append-only) audit trail.
    """

    def __init__(self, url_route_repository: IURLRouteRepository):
        """
        Initialize use case with repository.

        Args:
            url_route_repository: URL route repository implementation
        """
        self.url_route_repository = url_route_repository

    async def execute(
        self,
        from_path: str,
        to_primary_url_id: str,
        status_code: int,
        created_by: str,
        reason: str = None,
    ) -> None:
        """
        Create a URL redirect entry.

        Args:
            from_path: Source path to redirect from
            to_primary_url_id: Target URL route ID
            status_code: HTTP status code (301 or 410)
            created_by: User ID who created the redirect
            reason: Optional reason (e.g., 'slug_changed', 'content_deleted')

        Raises:
            ValueError: If status_code is not 301 or 410
        """
        if status_code not in (301, 410):
            raise ValueError("Status code must be 301 or 410")

        redirect = URLRedirect(
            from_path=from_path,
            to_primary_url_id=to_primary_url_id,
            status_code=status_code,
            created_at=datetime.now(UTC),
            created_by=created_by,
            reason=reason,
        )

        await self.url_route_repository.create_redirect(redirect)
