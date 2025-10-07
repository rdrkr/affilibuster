# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Content repository implementation using SQLAlchemy.

Reference: T073 (IContentRepository interface), T066-T068 (Content models)
"""

from typing import Optional
from uuid import UUID
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.repositories.content_repository import IContentRepository, PaginatedResult
from src.domain.entities.content import Content, ContentType, ContentStatus
from src.domain.entities.content_version import ContentVersion
from src.domain.entities.url_route import URLRedirect
from src.infrastructure.database.models.content import ContentModel
from src.infrastructure.database.models.content_version import ContentVersionModel
from src.infrastructure.database.models.url_route import URLRedirectModel


class ContentRepository(IContentRepository):
    """
    PostgreSQL implementation of IContentRepository.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_slug(self, language_code: str, slug: str) -> Optional[ContentVersion]:
        """Get content version by language and slug."""
        stmt = (
            select(ContentVersionModel)
            .where(
                ContentVersionModel.language_code == language_code,
                ContentVersionModel.slug == slug,
                ContentVersionModel.is_published == True,
            )
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_content_version_entity(model) if model else None

    async def get_by_id(self, content_id: UUID, language_code: str) -> Optional[ContentVersion]:
        """Get content version by content ID and language."""
        stmt = select(ContentVersionModel).where(
            ContentVersionModel.content_id == content_id,
            ContentVersionModel.language_code == language_code,
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_content_version_entity(model) if model else None

    async def list_by_language(
        self, language_code: str, page: int = 1, limit: int = 20
    ) -> PaginatedResult:
        """List published content versions for a language with pagination."""
        # Count total
        count_stmt = select(func.count()).select_from(ContentVersionModel).where(
            ContentVersionModel.language_code == language_code,
            ContentVersionModel.is_published == True,
        )
        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar()

        # Get page
        offset = (page - 1) * limit
        stmt = (
            select(ContentVersionModel)
            .where(
                ContentVersionModel.language_code == language_code,
                ContentVersionModel.is_published == True,
            )
            .order_by(ContentVersionModel.published_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()

        items = [self._to_content_version_entity(model) for model in models]
        return PaginatedResult(items=items, total=total, page=page, page_size=limit)

    async def create(self, content: Content, version: ContentVersion) -> ContentVersion:
        """Create new content with its first version."""
        # Create content
        content_model = ContentModel(
            id=content.id,
            type=content.type.value,
            status=content.status.value,
            created_by=content.created_by,
            updated_by=content.updated_by,
        )
        self.session.add(content_model)

        # Create version
        version_model = self._to_content_version_model(version)
        version_model.content_id = content.id
        self.session.add(version_model)

        await self.session.flush()
        return self._to_content_version_entity(version_model)

    async def update_version(self, version: ContentVersion) -> ContentVersion:
        """Update an existing content version."""
        stmt = select(ContentVersionModel).where(ContentVersionModel.id == version.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one()

        # Update fields
        model.title = version.title
        model.slug = version.slug
        model.body = version.body
        model.excerpt = version.excerpt
        model.meta_title = version.meta_title
        model.meta_description = version.meta_description
        model.meta_keywords = version.meta_keywords
        model.custom_schema = version.custom_schema
        model.is_published = version.is_published
        model.published_at = version.published_at
        model.translations = version.translations
        model.updated_at = version.updated_at

        await self.session.flush()
        return self._to_content_version_entity(model)

    async def create_redirect(self, redirect: URLRedirect) -> None:
        """Create a URL redirect entry."""
        redirect_model = URLRedirectModel(
            from_path=redirect.from_path,
            to_primary_url_id=UUID(redirect.to_primary_url_id),
            status_code=redirect.status_code,
            created_by=redirect.created_by,
            reason=redirect.reason,
        )
        self.session.add(redirect_model)
        await self.session.flush()

    async def archive_content(self, content_id: UUID) -> None:
        """Archive content and set all versions to unpublished."""
        # Update content status
        content_stmt = (
            update(ContentModel)
            .where(ContentModel.id == content_id)
            .values(status=ContentStatus.ARCHIVED.value)
        )
        await self.session.execute(content_stmt)

        # Unpublish all versions
        version_stmt = (
            update(ContentVersionModel)
            .where(ContentVersionModel.content_id == content_id)
            .values(is_published=False)
        )
        await self.session.execute(version_stmt)
        await self.session.flush()

    def _to_content_version_entity(self, model: ContentVersionModel) -> ContentVersion:
        """Convert SQLAlchemy model to domain entity."""
        return ContentVersion(
            id=model.id,
            content_id=model.content_id,
            language_code=model.language_code,
            title=model.title,
            slug=model.slug,
            body=model.body,
            excerpt=model.excerpt,
            meta_title=model.meta_title,
            meta_description=model.meta_description,
            meta_keywords=model.meta_keywords or [],
            custom_schema=model.custom_schema or {},
            is_published=model.is_published,
            published_at=model.published_at,
            translations=model.translations or {},
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_content_version_model(self, entity: ContentVersion) -> ContentVersionModel:
        """Convert domain entity to SQLAlchemy model."""
        return ContentVersionModel(
            id=entity.id,
            content_id=entity.content_id,
            language_code=entity.language_code,
            title=entity.title,
            slug=entity.slug,
            body=entity.body,
            excerpt=entity.excerpt,
            meta_title=entity.meta_title,
            meta_description=entity.meta_description,
            meta_keywords=entity.meta_keywords,
            custom_schema=entity.custom_schema,
            is_published=entity.is_published,
            published_at=entity.published_at,
            translations=entity.translations,
        )
