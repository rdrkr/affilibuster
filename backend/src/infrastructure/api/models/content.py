# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Pydantic models for content endpoints.

Reference: contracts/api-v1.yaml:399-561
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Optional, Dict, List
from datetime import datetime
from uuid import UUID


class SEOMetadata(BaseModel):
    """SEO metadata model."""

    model_config = ConfigDict(populate_by_name=True)

    title: Optional[str] = Field(None, serialization_alias='title', validation_alias='meta_title', json_schema_extra={'example': 'Eco Bottle | Affilibuster'})
    description: Optional[str] = Field(None, serialization_alias='description', validation_alias='meta_description', json_schema_extra={'example': 'Buy sustainable reusable bottles'})
    keywords: Optional[List[str]] = Field(None, serialization_alias='keywords', validation_alias='meta_keywords', json_schema_extra={'example': ['bottle', 'eco', 'sustainable']})
    canonicalUrl: Optional[str] = Field(None, serialization_alias='canonicalUrl', validation_alias='canonical_url', json_schema_extra={'example': 'https://affilibuster.com/products/eco-bottle'})


class URLData(BaseModel):
    """URL data model with canonical and alternates."""

    path: str = Field(..., json_schema_extra={'example': '/products/eco-bottle'})
    languagePrefix: str = Field(..., serialization_alias='languagePrefix', validation_alias='language_prefix', json_schema_extra={'example': ''})
    current: str = Field(..., json_schema_extra={'example': 'https://affilibuster.com/products/eco-bottle'})
    canonical: str = Field(..., json_schema_extra={'example': 'https://affilibuster.com/products/eco-bottle'})
    alternates: Dict[str, str] = Field(..., json_schema_extra={'example': {
        'x-default': 'https://affilibuster.com/products/eco-bottle',
        'it': 'https://affilibuster.com/it/prodotti/bottiglia-ecologica',
        'he': 'https://affilibuster.com/il/products/eco-bottle'
    }})


class ContentResponse(BaseModel):
    """Full content response model."""

    model_config = ConfigDict(populate_by_name=True)

    id: UUID = Field(..., json_schema_extra={'example': 'c-456'})
    type: Literal['page', 'product', 'article'] = Field(..., json_schema_extra={'example': 'product'})
    language: str = Field(..., serialization_alias='language', validation_alias='language_code', json_schema_extra={'example': 'en'})
    title: str = Field(..., json_schema_extra={'example': 'Eco Bottle'})
    slug: str = Field(..., json_schema_extra={'example': 'eco-bottle'})
    content: str = Field(..., serialization_alias='content', validation_alias='body', json_schema_extra={'example': '<p>Reusable water bottle...</p>'})
    excerpt: Optional[str] = Field(None, json_schema_extra={'example': 'Sustainable stainless steel bottle'})
    seo: SEOMetadata
    urls: URLData = Field(..., serialization_alias='urls', validation_alias='url')
    status: str = Field(..., json_schema_extra={'example': 'published'})
    fallbackUsed: Optional[bool] = Field(None, serialization_alias='fallbackUsed', validation_alias='fallback_used', json_schema_extra={'example': False})
    createdAt: datetime = Field(..., serialization_alias='createdAt', validation_alias='created_at')
    updatedAt: datetime = Field(..., serialization_alias='updatedAt', validation_alias='updated_at')
    publishedAt: Optional[datetime] = Field(None, serialization_alias='publishedAt', validation_alias='published_at', json_schema_extra={'example': '2025-10-01T00:00:00Z'})
    translations: Dict[str, str] = Field(default_factory=dict, json_schema_extra={'example': {
        'it': 'https://affilibuster.com/it/prodotti/bottiglia-ecologica',
        'he': 'https://affilibuster.com/il/products/eco-bottle'
    }})


class ContentSummary(BaseModel):
    """Content summary for list view."""

    model_config = ConfigDict(populate_by_name=True)

    id: UUID
    type: Literal['page', 'product', 'article']
    language: str = Field(..., serialization_alias='language', validation_alias='language_code')
    title: str
    slug: str
    excerpt: Optional[str] = None
    url: str
    status: str
    updatedAt: datetime = Field(..., serialization_alias='updatedAt', validation_alias='updated_at')
    publishedAt: Optional[datetime] = Field(None, serialization_alias='publishedAt', validation_alias='published_at')


class Pagination(BaseModel):
    """Pagination metadata."""

    model_config = ConfigDict(populate_by_name=True)

    page: int = Field(..., json_schema_extra={'example': 1})
    pageSize: int = Field(..., serialization_alias='pageSize', validation_alias='limit', json_schema_extra={'example': 20})
    totalItems: int = Field(..., serialization_alias='totalItems', validation_alias='total', json_schema_extra={'example': 150})
    totalPages: int = Field(..., serialization_alias='totalPages', validation_alias='total_pages', json_schema_extra={'example': 8})
    hasNext: bool = Field(..., serialization_alias='hasNext', validation_alias='has_next', json_schema_extra={'example': True})
    hasPrevious: bool = Field(..., serialization_alias='hasPrevious', validation_alias='has_previous', json_schema_extra={'example': False})


class ContentListResponse(BaseModel):
    """Paginated content list response."""

    data: List[ContentSummary]
    pagination: Pagination
