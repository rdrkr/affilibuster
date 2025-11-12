# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
URL redirect repository implementation using SQLAlchemy.

Reference: T145 (URL redirect handling)
"""

import uuid
from datetime import UTC, datetime
from typing import Literal, cast

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from affilibuster_backend.domain.entities.url_redirect import URLRedirect
from affilibuster_backend.domain.repositories.url_redirect_repository import IURLRedirectRepository
from affilibuster_backend.infrastructure.database.models.url_redirect import URLRedirectModel


class URLRedirectRepository(IURLRedirectRepository):
    """PostgreSQL implementation of IURLRedirectRepository."""

    def __init__(self, session: AsyncSession) -> None:
        """Initialize repository with SQLAlchemy session."""
        self.session = session

    async def get_by_path(self, from_path: str) -> URLRedirect | None:
        """Get redirect by source path."""
        # Normalize path (remove trailing slash, ensure leading slash)
        normalized_path = self._normalize_path(from_path)

        stmt = select(URLRedirectModel).where(URLRedirectModel.from_path == normalized_path)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def create(self, redirect: URLRedirect) -> URLRedirect:
        """Create a new URL redirect."""
        now = datetime.now(UTC).replace(tzinfo=None)

        model = URLRedirectModel(
            id=redirect.id or uuid.uuid4(),
            from_path=self._normalize_path(redirect.from_path),
            to_path=self._normalize_path(redirect.to_path) if redirect.to_path else None,
            status_code=redirect.status_code,
            reason=redirect.reason,
            created_by=redirect.created_by,
            created_at=redirect.created_at.replace(tzinfo=None) if redirect.created_at else now,
        )

        self.session.add(model)
        await self.session.commit()
        return self._to_entity(model)

    async def delete_by_path(self, from_path: str) -> bool:
        """Delete redirect by source path."""
        normalized_path = self._normalize_path(from_path)
        stmt = delete(URLRedirectModel).where(URLRedirectModel.from_path == normalized_path)
        result = await self.session.execute(stmt)
        await self.session.commit()
        return (result.rowcount or 0) > 0  # type: ignore[attr-defined]

    async def list_all(self) -> list[URLRedirect]:
        """List all redirects."""
        stmt = select(URLRedirectModel).order_by(URLRedirectModel.created_at.desc())
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    def _normalize_path(self, path: str) -> str:
        """
        Normalize URL path for consistent storage and lookup.

        - Ensure leading slash
        - Remove trailing slash (except for root)
        - Lowercase for case-insensitive matching
        """
        if not path:
            return "/"

        # Ensure leading slash
        if not path.startswith("/"):
            path = "/" + path

        # Remove trailing slash (except for root)
        if path != "/" and path.endswith("/"):
            path = path.rstrip("/")

        return path.lower()

    def _to_entity(self, model: URLRedirectModel) -> URLRedirect:
        """Convert SQLAlchemy model to domain entity."""
        created_at = model.created_at
        if created_at and not created_at.tzinfo:
            created_at = created_at.replace(tzinfo=UTC)

        return URLRedirect(
            id=model.id,
            from_path=model.from_path,
            to_path=model.to_path,
            status_code=cast("Literal[301, 410]", model.status_code),
            reason=model.reason,
            created_by=model.created_by,
            created_at=created_at,
        )
