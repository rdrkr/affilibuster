# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
HandleSlugChange use case.

Reference: data-model.md:540-563
"""

from datetime import UTC, datetime
from uuid import UUID
from src.domain.entities.url_route import URLRoute, URLRedirect
from src.domain.repositories.url_route_repository import IURLRouteRepository


class HandleSlugChange:
    """
    Use case for handling slug changes with proper redirects.

    Implements the URL Slug Change Flow:
    1. Create new URLRoute with new slug, isPrimary=true
    2. Mark old URLRoute isPrimary=false, isActive=false
    3. Create URLRedirect 301 from old path to new URLRoute
    4. Return new URLRoute
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
        content_version_id: UUID,
        old_slug: str,
        new_slug: str,
        language_code: str,
        created_by: str,
    ) -> URLRoute:
        """
        Handle slug change with redirect creation.

        Args:
            content_version_id: Content version UUID
            old_slug: Old slug value
            new_slug: New slug value
            language_code: Language code
            created_by: User ID who triggered the change

        Returns:
            URLRoute: New primary URL route

        Raises:
            ValueError: If old route not found or not primary
        """
        # Get current primary route
        old_route = await self.url_route_repository.get_primary_for_content(
            content_version_id
        )

        if not old_route:
            raise ValueError(f"No primary route found for content {content_version_id}")

        if old_route.slug != old_slug:
            raise ValueError(
                f"Old slug mismatch: expected '{old_slug}', found '{old_route.slug}'"
            )

        # Create new URLRoute with new slug
        new_path = old_route.path.replace(old_slug, new_slug)
        new_route = URLRoute(
            content_version_id=content_version_id,
            language_code=language_code,
            path=new_path,
            slug=new_slug,
            is_active=True,
            is_primary=True,
            canonical_url=new_path,  # Will be updated with full domain later
            alternate_urls=old_route.alternate_urls,
        )

        new_route = await self.url_route_repository.create(new_route)

        # Mark old route as inactive and non-primary
        old_route.is_active = False
        old_route.is_primary = False
        old_route.updated_at = datetime.now(UTC)
        await self.url_route_repository.update(old_route)

        # Create 301 redirect from old path to new route
        redirect = URLRedirect(
            from_path=old_route.path,
            to_primary_url_id=str(new_route.id),
            status_code=301,
            created_at=datetime.now(UTC),
            created_by=created_by,
            reason="slug_changed",
        )
        await self.url_route_repository.create_redirect(redirect)

        return new_route
