# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Content API routes.

Reference: contracts/api-v1.yaml:30-73
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.config import get_db
from src.infrastructure.database.repositories.content_repository import ContentRepository
from src.infrastructure.database.repositories.language_repository import LanguageRepository
from src.infrastructure.api.models.content import (
    ContentResponse,
    ContentListResponse,
    ContentSummary,
    Pagination,
    SEOMetadata,
    URLData,
)
from src.infrastructure.api.models.errors import ErrorResponse
from src.domain.use_cases.get_localized_content import GetLocalizedContent
from src.domain.use_cases.list_content_by_language import ListContentByLanguage


router = APIRouter(prefix='/v1/content', tags=['content'])


@router.get('/{lang}/{slug}', response_model=ContentResponse, responses={404: {'model': ErrorResponse}})
async def get_content(
    lang: str,
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get content by language and slug.

    Falls back to English if translation is not available.
    """
    # Create repositories and use case
    content_repo = ContentRepository(db)
    language_repo = LanguageRepository(db)
    use_case = GetLocalizedContent(content_repo, language_repo)

    # Execute use case
    result = await use_case.execute(lang, slug)

    if not result:
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                error='Not Found',
                message=f"Content with slug '{slug}' not found for language '{lang}'",
                code='CONTENT_NOT_FOUND',
            ).model_dump(mode='json'),
        )

    # Get language for URL prefix
    language = await language_repo.get_by_code(lang)
    language_prefix = language.url_prefix if language else ''

    # Convert to response model
    content = result.content
    return ContentResponse(
        id=content.id,
        type='product',  # TODO: Join with Content table to get actual type
        language_code=content.language_code,
        title=content.title,
        slug=content.slug,
        body=content.body,
        excerpt=content.excerpt,
        seo=SEOMetadata(
            meta_title=content.meta_title,
            meta_description=content.meta_description,
            meta_keywords=content.meta_keywords or [],
            canonical_url=f'https://affilibuster.com{language_prefix}/{slug}',
        ),
        url=URLData(
            path=f'{language_prefix}/{slug}',
            language_prefix=language_prefix,
            current=f'https://affilibuster.com{language_prefix}/{slug}',
            canonical=f'https://affilibuster.com{language_prefix}/{slug}',
            alternates=content.translations or {},
        ),
        status='published',  # TODO: Get from Content model
        fallback_used=result.fallback_used,
        created_at=content.created_at,
        updated_at=content.updated_at,
        published_at=content.published_at,
        translations=content.translations or {},
    )


@router.get('/{lang}', response_model=ContentListResponse)
async def list_content(
    lang: str,
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100, alias='pageSize'),
    db: AsyncSession = Depends(get_db),
):
    """
    List published content for a language with pagination.
    """
    # Create repository and use case
    repo = ContentRepository(db)
    use_case = ListContentByLanguage(repo)

    # Execute use case
    result = await use_case.execute(lang, page, pageSize)

    # Convert to response model
    items = [
        ContentSummary(
            id=item.id,
            type='product',  # TODO: Join with Content table to get actual type
            language_code=item.language_code,
            title=item.title,
            slug=item.slug,
            excerpt=item.excerpt,
            url=f'https://affilibuster.com/{lang}/{item.slug}',
            status='published',  # TODO: Get from Content model
            updated_at=item.updated_at,
            published_at=item.published_at,
        )
        for item in result.items
    ]

    pagination = Pagination(
        page=result.page,
        limit=result.page_size,
        total=result.total,
        total_pages=result.total_pages,
        has_next=result.page < result.total_pages,
        has_previous=result.page > 1,
    )

    return ContentListResponse(data=items, pagination=pagination)
