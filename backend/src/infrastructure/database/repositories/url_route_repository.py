# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
URL route repository implementation using SQLAlchemy.

Reference: T078 (IURLRouteRepository interface), T068 (URLRoute model)
"""

from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.repositories.url_route_repository import IURLRouteRepository
from src.domain.entities.url_route import URLRoute, URLRedirect
from src.infrastructure.database.models.url_route import URLRouteModel, URLRedirectModel


class URLRouteRepository(IURLRouteRepository):
    """
    PostgreSQL implementation of IURLRouteRepository.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_path(self, path: str) -> Optional[URLRoute]:
        """Get URL route by path."""
        stmt = select(URLRouteModel).where(URLRouteModel.path == path)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return await self._to_entity(model) if model else None

    async def get_by_id(self, route_id: UUID) -> Optional[URLRoute]:
        """Get URL route by ID."""
        stmt = select(URLRouteModel).where(URLRouteModel.id == route_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return await self._to_entity(model) if model else None

    async def get_primary_for_content(self, content_version_id: UUID) -> Optional[URLRoute]:
        """Get the primary URL route for a content version."""
        stmt = select(URLRouteModel).where(
            URLRouteModel.content_version_id == content_version_id,
            URLRouteModel.is_primary == True,
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return await self._to_entity(model) if model else None

    async def list_for_content(self, content_version_id: UUID) -> List[URLRoute]:
        """List all URL routes for a content version."""
        stmt = select(URLRouteModel).where(
            URLRouteModel.content_version_id == content_version_id
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [await self._to_entity(model) for model in models]

    async def create(self, url_route: URLRoute) -> URLRoute:
        """Create a new URL route."""
        model = self._to_model(url_route)
        self.session.add(model)
        await self.session.flush()
        return await self._to_entity(model)

    async def update(self, url_route: URLRoute) -> URLRoute:
        """Update an existing URL route."""
        stmt = select(URLRouteModel).where(URLRouteModel.id == url_route.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one()

        # Update fields
        model.path = url_route.path
        model.slug = url_route.slug
        model.is_active = url_route.is_active
        model.is_primary = url_route.is_primary
        model.canonical_url = url_route.canonical_url
        model.alternate_urls = url_route.alternate_urls
        model.updated_at = url_route.updated_at

        await self.session.flush()
        return await self._to_entity(model)

    async def create_redirect(self, redirect: URLRedirect) -> None:
        """Create a URL redirect entry."""
        model = URLRedirectModel(
            from_path=redirect.from_path,
            to_primary_url_id=UUID(redirect.to_primary_url_id),
            status_code=redirect.status_code,
            created_by=redirect.created_by,
            reason=redirect.reason,
            created_at=redirect.created_at,
        )
        self.session.add(model)
        await self.session.flush()

    async def mark_inactive(self, url_route_id: UUID) -> None:
        """Mark a URL route as inactive."""
        stmt = (
            update(URLRouteModel)
            .where(URLRouteModel.id == url_route_id)
            .values(is_active=False, is_primary=False)
        )
        await self.session.execute(stmt)
        await self.session.flush()

    async def get_redirect_by_path(self, from_path: str) -> Optional[URLRedirect]:
        """Get redirect by source path."""
        stmt = select(URLRedirectModel).where(URLRedirectModel.from_path == from_path)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._redirect_to_entity(model) if model else None

    async def _to_entity(self, model: URLRouteModel) -> URLRoute:
        """Convert SQLAlchemy model to domain entity."""
        # Fetch redirects for this route
        redirects_stmt = select(URLRedirectModel).where(
            URLRedirectModel.to_primary_url_id == model.id
        )
        redirects_result = await self.session.execute(redirects_stmt)
        redirect_models = redirects_result.scalars().all()

        redirects = [self._redirect_to_entity(r) for r in redirect_models]

        return URLRoute(
            id=model.id,
            content_version_id=model.content_version_id,
            language_code=model.language_code,
            path=model.path,
            slug=model.slug,
            is_active=model.is_active,
            is_primary=model.is_primary,
            redirects=redirects,
            canonical_url=model.canonical_url,
            alternate_urls=model.alternate_urls or {},
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: URLRoute) -> URLRouteModel:
        """Convert domain entity to SQLAlchemy model."""
        return URLRouteModel(
            id=entity.id,
            content_version_id=entity.content_version_id,
            language_code=entity.language_code,
            path=entity.path,
            slug=entity.slug,
            is_active=entity.is_active,
            is_primary=entity.is_primary,
            canonical_url=entity.canonical_url,
            alternate_urls=entity.alternate_urls,
        )

    def _redirect_to_entity(self, model: URLRedirectModel) -> URLRedirect:
        """Convert URLRedirect model to entity."""
        return URLRedirect(
            from_path=model.from_path,
            to_primary_url_id=str(model.to_primary_url_id),
            status_code=model.status_code,
            created_at=model.created_at,
            created_by=model.created_by,
            reason=model.reason,
        )
