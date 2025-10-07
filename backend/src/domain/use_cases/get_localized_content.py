# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
GetLocalizedContent use case.

Reference: plan.md:110, contracts/api-v1.yaml:32-33
"""

from dataclasses import dataclass
from typing import Optional
from src.domain.entities.content_version import ContentVersion
from src.domain.repositories.content_repository import IContentRepository
from src.domain.repositories.language_repository import ILanguageRepository


@dataclass
class LocalizedContentResult:
    """Result of localized content retrieval."""
    content: ContentVersion
    requested_language: str
    actual_language: str
    fallback_used: bool


class GetLocalizedContent:
    """
    Use case for retrieving localized content with fallback to English.

    If content is not available in the requested language, falls back to English.
    """

    def __init__(
        self,
        content_repository: IContentRepository,
        language_repository: ILanguageRepository,
    ):
        """
        Initialize use case with repositories.

        Args:
            content_repository: Content repository implementation
            language_repository: Language repository implementation
        """
        self.content_repository = content_repository
        self.language_repository = language_repository

    async def execute(
        self, language_code: str, slug: str
    ) -> Optional[LocalizedContentResult]:
        """
        Get content by slug in requested language, fallback to English.

        Args:
            language_code: Requested language code (e.g., 'it', 'he')
            slug: Content slug

        Returns:
            Optional[LocalizedContentResult]: Content with metadata, None if not found
        """
        # Try requested language first
        content = await self.content_repository.get_by_slug(language_code, slug)

        if content:
            return LocalizedContentResult(
                content=content,
                requested_language=language_code,
                actual_language=language_code,
                fallback_used=False,
            )

        # Fallback to English
        default_lang = await self.language_repository.get_default()
        content = await self.content_repository.get_by_slug(default_lang.code, slug)

        if content:
            return LocalizedContentResult(
                content=content,
                requested_language=language_code,
                actual_language=default_lang.code,
                fallback_used=True,
            )

        # Not found in any language
        return None
