# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for Content domain entity.

Covers:
- Valid content creation with all types and statuses
- can_delete() method
- archive() method
- publish() method
- Business rules validation
"""

import pytest
from datetime import UTC, datetime
from uuid import UUID, uuid4

from src.domain.entities.content import Content, ContentType, ContentStatus


class TestContentCreation:
    """Test valid Content entity creation."""

    def test_create_page_content(self):
        """Test creating page content."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.DRAFT,
            created_by='user-123',
            updated_by='user-123'
        )

        assert content.type == ContentType.PAGE
        assert content.status == ContentStatus.DRAFT
        assert content.created_by == 'user-123'
        assert content.updated_by == 'user-123'

    def test_create_product_content(self):
        """Test creating product content."""
        content = Content(
            type=ContentType.PRODUCT,
            status=ContentStatus.DRAFT,
            created_by='user-456',
            updated_by='user-456'
        )

        assert content.type == ContentType.PRODUCT

    def test_create_article_content(self):
        """Test creating article content."""
        content = Content(
            type=ContentType.ARTICLE,
            status=ContentStatus.DRAFT,
            created_by='user-789',
            updated_by='user-789'
        )

        assert content.type == ContentType.ARTICLE

    def test_create_draft_content(self):
        """Test creating content with draft status."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.DRAFT,
            created_by='user-123',
            updated_by='user-123'
        )

        assert content.status == ContentStatus.DRAFT

    def test_create_published_content(self):
        """Test creating content with published status."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.PUBLISHED,
            created_by='user-123',
            updated_by='user-123'
        )

        assert content.status == ContentStatus.PUBLISHED

    def test_create_archived_content(self):
        """Test creating content with archived status."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.ARCHIVED,
            created_by='user-123',
            updated_by='user-123'
        )

        assert content.status == ContentStatus.ARCHIVED

    def test_auto_generated_id(self):
        """Test that ID is auto-generated if not provided."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.DRAFT,
            created_by='user-123',
            updated_by='user-123'
        )

        assert content.id is not None
        assert isinstance(content.id, UUID)

    def test_auto_generated_timestamps(self):
        """Test that timestamps are auto-generated if not provided."""
        before = datetime.now(UTC)

        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.DRAFT,
            created_by='user-123',
            updated_by='user-123'
        )

        after = datetime.now(UTC)

        assert content.created_at is not None
        assert content.updated_at is not None
        assert before <= content.created_at <= after
        assert before <= content.updated_at <= after

    def test_create_content_with_custom_id(self):
        """Test creating content with custom ID."""
        custom_id = uuid4()

        content = Content(
            id=custom_id,
            type=ContentType.PAGE,
            status=ContentStatus.DRAFT,
            created_by='user-123',
            updated_by='user-123'
        )

        assert content.id == custom_id

    def test_create_content_with_custom_timestamps(self):
        """Test creating content with custom timestamps."""
        custom_created = datetime(2024, 1, 1, 12, 0, 0)
        custom_updated = datetime(2024, 1, 2, 12, 0, 0)

        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.DRAFT,
            created_by='user-123',
            updated_by='user-123',
            created_at=custom_created,
            updated_at=custom_updated
        )

        assert content.created_at == custom_created
        assert content.updated_at == custom_updated


class TestContentCanDelete:
    """Test Content can_delete() method."""

    def test_can_delete_draft_content(self):
        """Test that draft content can be deleted."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.DRAFT,
            created_by='user-123',
            updated_by='user-123'
        )

        assert content.can_delete() is True

    def test_cannot_delete_published_content(self):
        """Test that published content cannot be deleted."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.PUBLISHED,
            created_by='user-123',
            updated_by='user-123'
        )

        assert content.can_delete() is False

    def test_can_delete_archived_content(self):
        """Test that archived content can be deleted."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.ARCHIVED,
            created_by='user-123',
            updated_by='user-123'
        )

        assert content.can_delete() is True


class TestContentArchive:
    """Test Content archive() method."""

    def test_archive_published_content(self):
        """Test archiving published content."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.PUBLISHED,
            created_by='user-123',
            updated_by='user-123'
        )

        content.archive(archived_by='admin-456')

        assert content.status == ContentStatus.ARCHIVED
        assert content.updated_by == 'admin-456'

    def test_archive_updates_updated_at(self):
        """Test that archive() updates updated_at timestamp."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.PUBLISHED,
            created_by='user-123',
            updated_by='user-123'
        )

        old_updated_at = content.updated_at
        content.archive(archived_by='admin-456')

        assert content.updated_at > old_updated_at

    def test_archive_updates_updated_by(self):
        """Test that archive() updates updated_by field."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.PUBLISHED,
            created_by='user-123',
            updated_by='user-123'
        )

        content.archive(archived_by='admin-789')

        assert content.updated_by == 'admin-789'

    def test_error_when_archiving_draft_content(self):
        """Test error when trying to archive draft content."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.DRAFT,
            created_by='user-123',
            updated_by='user-123'
        )

        with pytest.raises(ValueError, match="Can only archive published content"):
            content.archive(archived_by='admin-456')

    def test_error_when_archiving_already_archived_content(self):
        """Test error when trying to archive already archived content."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.ARCHIVED,
            created_by='user-123',
            updated_by='user-123'
        )

        with pytest.raises(ValueError, match="Can only archive published content"):
            content.archive(archived_by='admin-456')


class TestContentPublish:
    """Test Content publish() method."""

    def test_publish_draft_content(self):
        """Test publishing draft content."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.DRAFT,
            created_by='user-123',
            updated_by='user-123'
        )

        content.publish(published_by='editor-456')

        assert content.status == ContentStatus.PUBLISHED
        assert content.updated_by == 'editor-456'

    def test_publish_updates_updated_at(self):
        """Test that publish() updates updated_at timestamp."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.DRAFT,
            created_by='user-123',
            updated_by='user-123'
        )

        old_updated_at = content.updated_at
        content.publish(published_by='editor-456')

        assert content.updated_at > old_updated_at

    def test_publish_updates_updated_by(self):
        """Test that publish() updates updated_by field."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.DRAFT,
            created_by='user-123',
            updated_by='user-123'
        )

        content.publish(published_by='editor-789')

        assert content.updated_by == 'editor-789'

    def test_error_when_publishing_already_published_content(self):
        """Test error when trying to publish already published content."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.PUBLISHED,
            created_by='user-123',
            updated_by='user-123'
        )

        with pytest.raises(ValueError, match="Content is already published"):
            content.publish(published_by='editor-456')

    def test_error_when_publishing_archived_content(self):
        """Test error when trying to publish archived content."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.ARCHIVED,
            created_by='user-123',
            updated_by='user-123'
        )

        with pytest.raises(ValueError, match="Cannot publish archived content"):
            content.publish(published_by='editor-456')


class TestContentEnums:
    """Test Content enums."""

    def test_content_type_enum_values(self):
        """Test ContentType enum values."""
        assert ContentType.PAGE.value == 'page'
        assert ContentType.PRODUCT.value == 'product'
        assert ContentType.ARTICLE.value == 'article'

    def test_content_status_enum_values(self):
        """Test ContentStatus enum values."""
        assert ContentStatus.DRAFT.value == 'draft'
        assert ContentStatus.PUBLISHED.value == 'published'
        assert ContentStatus.ARCHIVED.value == 'archived'

    def test_content_type_enum_string_comparison(self):
        """Test that ContentType can be compared with strings."""
        content_type = ContentType.PAGE
        assert content_type == 'page'

    def test_content_status_enum_string_comparison(self):
        """Test that ContentStatus can be compared with strings."""
        content_status = ContentStatus.DRAFT
        assert content_status == 'draft'


class TestContentEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_publish_then_archive_workflow(self):
        """Test publishing then archiving content."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.DRAFT,
            created_by='user-123',
            updated_by='user-123'
        )

        # Publish
        content.publish(published_by='editor-456')
        assert content.status == ContentStatus.PUBLISHED

        # Archive
        content.archive(archived_by='admin-789')
        assert content.status == ContentStatus.ARCHIVED

    def test_can_delete_changes_with_status(self):
        """Test that can_delete() changes as status changes."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.DRAFT,
            created_by='user-123',
            updated_by='user-123'
        )

        # Draft: can delete
        assert content.can_delete() is True

        # Publish: cannot delete
        content.publish(published_by='editor-456')
        assert content.can_delete() is False

        # Archive: can delete again
        content.archive(archived_by='admin-789')
        assert content.can_delete() is True

    def test_different_user_roles_in_workflow(self):
        """Test content workflow with different users."""
        content = Content(
            type=ContentType.PRODUCT,
            status=ContentStatus.DRAFT,
            created_by='author-123',
            updated_by='author-123'
        )

        assert content.created_by == 'author-123'
        assert content.updated_by == 'author-123'

        # Editor publishes
        content.publish(published_by='editor-456')
        assert content.created_by == 'author-123'  # Unchanged
        assert content.updated_by == 'editor-456'  # Changed

        # Admin archives
        content.archive(archived_by='admin-789')
        assert content.created_by == 'author-123'  # Still unchanged
        assert content.updated_by == 'admin-789'  # Changed

    def test_timestamps_change_on_state_transitions(self):
        """Test that timestamps update on status changes."""
        content = Content(
            type=ContentType.PAGE,
            status=ContentStatus.DRAFT,
            created_by='user-123',
            updated_by='user-123'
        )

        created_at = content.created_at
        updated_at_1 = content.updated_at

        # Publish
        content.publish(published_by='editor-456')
        updated_at_2 = content.updated_at

        assert content.created_at == created_at  # Never changes
        assert updated_at_2 > updated_at_1

        # Archive
        content.archive(archived_by='admin-789')
        updated_at_3 = content.updated_at

        assert content.created_at == created_at  # Still unchanged
        assert updated_at_3 > updated_at_2

    def test_all_content_types_with_all_statuses(self):
        """Test creating content with all type/status combinations."""
        types = [ContentType.PAGE, ContentType.PRODUCT, ContentType.ARTICLE]
        statuses = [ContentStatus.DRAFT, ContentStatus.PUBLISHED, ContentStatus.ARCHIVED]

        for content_type in types:
            for status in statuses:
                content = Content(
                    type=content_type,
                    status=status,
                    created_by='user-123',
                    updated_by='user-123'
                )

                assert content.type == content_type
                assert content.status == status
