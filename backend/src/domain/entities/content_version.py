# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
ContentVersion domain entity.

Reference: data-model.md:108-167
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, List
from uuid import UUID, uuid4


@dataclass
class ContentVersion:
    """
    Language-specific version of content.

    Business Rules:
    - slug must be unique per (contentId, languageCode) combination
    - If isPublished = true, publishedAt must be set
    - translations must not include self-reference
    - When content is archived, all ContentVersion records set isPublished = false
    """

    content_id: UUID
    language_code: str  # LanguageCode
    title: str
    slug: str
    body: str
    excerpt: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    custom_schema: Optional[Dict] = None
    is_published: bool = False
    published_at: Optional[datetime] = None
    translations: Dict[str, str] = field(default_factory=dict)
    id: UUID = None  # type: ignore
    created_at: datetime = None  # type: ignore
    updated_at: datetime = None  # type: ignore

    def __post_init__(self):
        """Initialize defaults and run validation."""
        if self.id is None:
            self.id = uuid4()
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()
        if self.meta_keywords is None:
            self.meta_keywords = []
        if self.custom_schema is None:
            self.custom_schema = {}
        if self.translations is None:
            self.translations = {}

        self.validate()

    def validate(self) -> None:
        """
        Validate business rules.

        Raises:
            ValueError: If any business rule is violated
        """
        # Rule: If published, publishedAt must be set
        if self.is_published and self.published_at is None:
            raise ValueError(
                "publishedAt must be set when isPublished=true"
            )

        # Rule: translations must not include self-reference
        if self.language_code in self.translations:
            raise ValueError(
                f"translations cannot contain self-reference to '{self.language_code}'"
            )

    def publish(self) -> None:
        """Publish this content version."""
        if self.is_published:
            raise ValueError("Content version is already published")

        self.is_published = True
        self.published_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def unpublish(self) -> None:
        """Unpublish this content version (when content is archived)."""
        self.is_published = False
        self.updated_at = datetime.utcnow()

    def add_translation(self, language_code: str, content_version_id: str) -> None:
        """
        Add a translation link to another language version.

        Args:
            language_code: Language code for the translation
            content_version_id: ID of the translated content version

        Raises:
            ValueError: If trying to link to self
        """
        if language_code == self.language_code:
            raise ValueError(
                f"Cannot add self-reference translation for '{language_code}'"
            )

        self.translations[language_code] = content_version_id
        self.updated_at = datetime.utcnow()
