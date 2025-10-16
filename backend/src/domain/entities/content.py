# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Content domain entity (abstract base).

Reference: data-model.md:81-104
"""

from dataclasses import dataclass
from datetime import UTC, datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class ContentType(str, Enum):
    """Content type enumeration."""

    PAGE = 'page'
    PRODUCT = 'product'
    ARTICLE = 'article'


class ContentStatus(str, Enum):
    """Content status enumeration."""

    DRAFT = 'draft'
    PUBLISHED = 'published'
    ARCHIVED = 'archived'


@dataclass
class Content:
    """
    Base entity for all content types (pages, products, articles).

    Business Rules:
    - Cannot delete content with status 'published' (must archive first)
    - createdAt and createdBy are immutable
    - updatedAt and updatedBy update automatically on any change
    """

    type: ContentType
    status: ContentStatus
    created_by: str
    updated_by: str
    id: UUID = None  # type: ignore
    created_at: datetime = None  # type: ignore
    updated_at: datetime = None  # type: ignore

    def __post_init__(self):
        """Initialize defaults and run validation."""
        if self.id is None:
            self.id = uuid4()
        if self.created_at is None:
            self.created_at = datetime.now(UTC)
        if self.updated_at is None:
            self.updated_at = datetime.now(UTC)

    def can_delete(self) -> bool:
        """
        Check if content can be deleted.

        Returns:
            bool: True if content can be deleted (not published)
        """
        return self.status != ContentStatus.PUBLISHED

    def archive(self, archived_by: str) -> None:
        """
        Archive the content.

        Args:
            archived_by: User ID who is archiving the content

        Raises:
            ValueError: If content is not published
        """
        if self.status != ContentStatus.PUBLISHED:
            raise ValueError("Can only archive published content")

        self.status = ContentStatus.ARCHIVED
        self.updated_by = archived_by
        self.updated_at = datetime.now(UTC)

    def publish(self, published_by: str) -> None:
        """
        Publish the content.

        Args:
            published_by: User ID who is publishing the content

        Raises:
            ValueError: If content is already published or archived
        """
        if self.status == ContentStatus.PUBLISHED:
            raise ValueError("Content is already published")
        if self.status == ContentStatus.ARCHIVED:
            raise ValueError("Cannot publish archived content")

        self.status = ContentStatus.PUBLISHED
        self.updated_by = published_by
        self.updated_at = datetime.now(UTC)
