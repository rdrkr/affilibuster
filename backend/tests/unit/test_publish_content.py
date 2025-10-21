# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for PublishContent and ArchiveContent use cases.

Covers:
- Publishing draft content
- Archive content flow
- Error handling (not found, already published)
- Timestamp validation
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from domain.entities.content_version import ContentVersion
from domain.use_cases.publish_content import ArchiveContent, PublishContent


@pytest.fixture
def mock_content_repository():
    """Create a mock content repository."""
    repository = MagicMock()
    repository.get_by_id = AsyncMock()
    repository.update_version = AsyncMock()
    repository.archive_content = AsyncMock()
    return repository


@pytest.fixture
def mock_url_route_repository():
    """Create a mock URL route repository."""
    repository = MagicMock()
    return repository


@pytest.fixture
def publish_use_case(mock_content_repository, mock_url_route_repository):
    """Create PublishContent use case with mock repositories."""
    return PublishContent(mock_content_repository, mock_url_route_repository)


@pytest.fixture
def archive_use_case(mock_content_repository, mock_url_route_repository):
    """Create ArchiveContent use case with mock repositories."""
    return ArchiveContent(mock_content_repository, mock_url_route_repository)


@pytest.fixture
def content_id():
    """Create a test content ID."""
    return uuid4()


@pytest.fixture
def draft_version(content_id):
    """Create a draft content version for testing."""
    return ContentVersion(
        id=uuid4(),
        content_id=content_id,
        language_code="en",
        slug="eco-water-bottle",
        title="Eco Water Bottle",
        excerpt="Sustainable water bottle",
        body="<p>Eco-friendly water bottle made from recycled materials.</p>",
        meta_title="Eco Water Bottle - Sustainable",
        meta_description="Best eco-friendly bottle",
        is_published=False,
        published_at=None,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )


@pytest.fixture
def published_version(content_id):
    """Create a published content version for testing."""
    return ContentVersion(
        id=uuid4(),
        content_id=content_id,
        language_code="en",
        slug="eco-water-bottle",
        title="Eco Water Bottle",
        excerpt="Sustainable water bottle",
        body="<p>Eco-friendly water bottle made from recycled materials.</p>",
        meta_title="Eco Water Bottle - Sustainable",
        meta_description="Best eco-friendly bottle",
        is_published=True,
        published_at=datetime.now(UTC),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )


class TestPublishContentSuccess:
    """Test successful content publishing operations."""

    @pytest.mark.asyncio
    async def test_publish_draft_content(self, publish_use_case, mock_content_repository, content_id, draft_version):
        """Test publishing a draft content version."""
        # Arrange
        mock_content_repository.get_by_id.return_value = draft_version

        published = ContentVersion(
            id=draft_version.id,
            content_id=content_id,
            language_code="en",
            slug="eco-water-bottle",
            title="Eco Water Bottle",
            excerpt="Sustainable water bottle",
            body="<p>Eco-friendly water bottle made from recycled materials.</p>",
            meta_title="Eco Water Bottle - Sustainable",
            meta_description="Best eco-friendly bottle",
            is_published=True,
            published_at=datetime.now(UTC),
            created_at=draft_version.created_at,
            updated_at=datetime.now(UTC),
        )
        mock_content_repository.update_version.return_value = published

        # Act
        result = await publish_use_case.execute(content_id=content_id, language_code="en", published_by="user-123")

        # Assert
        assert result.is_published is True
        assert result.published_at is not None
        mock_content_repository.get_by_id.assert_called_once_with(content_id, "en")
        mock_content_repository.update_version.assert_called_once()

    @pytest.mark.asyncio
    async def test_publish_sets_is_published_true(
        self, publish_use_case, mock_content_repository, content_id, draft_version
    ):
        """Test that publishing sets is_published to True."""
        # Arrange
        mock_content_repository.get_by_id.return_value = draft_version
        mock_content_repository.update_version.return_value = draft_version

        # Act
        await publish_use_case.execute(content_id=content_id, language_code="en", published_by="user-123")

        # Assert
        updated_version = mock_content_repository.update_version.call_args[0][0]
        assert updated_version.is_published is True

    @pytest.mark.asyncio
    async def test_publish_sets_published_at_timestamp(
        self, publish_use_case, mock_content_repository, content_id, draft_version
    ):
        """Test that publishing sets published_at timestamp."""
        # Arrange
        before = datetime.now(UTC)
        mock_content_repository.get_by_id.return_value = draft_version
        mock_content_repository.update_version.return_value = draft_version

        # Act
        await publish_use_case.execute(content_id=content_id, language_code="en", published_by="user-123")

        after = datetime.now(UTC)

        # Assert
        updated_version = mock_content_repository.update_version.call_args[0][0]
        assert updated_version.published_at is not None
        assert before <= updated_version.published_at <= after

    @pytest.mark.asyncio
    async def test_publish_updates_updated_at_timestamp(
        self, publish_use_case, mock_content_repository, content_id, draft_version
    ):
        """Test that publishing updates updated_at timestamp."""
        # Arrange
        before = datetime.now(UTC)
        mock_content_repository.get_by_id.return_value = draft_version
        mock_content_repository.update_version.return_value = draft_version

        # Act
        await publish_use_case.execute(content_id=content_id, language_code="en", published_by="user-123")

        after = datetime.now(UTC)

        # Assert
        updated_version = mock_content_repository.update_version.call_args[0][0]
        assert before <= updated_version.updated_at <= after

    @pytest.mark.asyncio
    async def test_publish_returns_updated_version(
        self, publish_use_case, mock_content_repository, content_id, draft_version
    ):
        """Test that publish returns the updated version from repository."""
        # Arrange
        mock_content_repository.get_by_id.return_value = draft_version

        expected_version = ContentVersion(
            id=draft_version.id,
            content_id=content_id,
            language_code="en",
            slug="eco-water-bottle",
            title="Eco Water Bottle",
            excerpt="Sustainable water bottle",
            body="<p>Eco-friendly water bottle made from recycled materials.</p>",
            meta_title="Eco Water Bottle - Sustainable",
            meta_description="Best eco-friendly bottle",
            is_published=True,
            published_at=datetime.now(UTC),
            created_at=draft_version.created_at,
            updated_at=datetime.now(UTC),
        )
        mock_content_repository.update_version.return_value = expected_version

        # Act
        result = await publish_use_case.execute(content_id=content_id, language_code="en", published_by="user-123")

        # Assert
        assert result == expected_version
        assert result.is_published is True


class TestPublishContentErrorHandling:
    """Test error handling in content publishing."""

    @pytest.mark.asyncio
    async def test_error_when_content_version_not_found(self, publish_use_case, mock_content_repository, content_id):
        """Test error when content version doesn't exist."""
        # Arrange
        mock_content_repository.get_by_id.return_value = None

        # Act & Assert
        with pytest.raises(ValueError, match="Content version not found"):
            await publish_use_case.execute(content_id=content_id, language_code="en", published_by="user-123")

        # Repository update should not be called
        mock_content_repository.update_version.assert_not_called()

    @pytest.mark.asyncio
    async def test_error_when_already_published(
        self, publish_use_case, mock_content_repository, content_id, published_version
    ):
        """Test error when trying to publish already published content."""
        # Arrange
        mock_content_repository.get_by_id.return_value = published_version

        # Act & Assert
        with pytest.raises(ValueError, match="Content version is already published"):
            await publish_use_case.execute(content_id=content_id, language_code="en", published_by="user-123")

        # Repository update should not be called
        mock_content_repository.update_version.assert_not_called()

    @pytest.mark.asyncio
    async def test_error_message_includes_content_id_and_language(
        self, publish_use_case, mock_content_repository, content_id
    ):
        """Test that error message includes content ID and language code."""
        # Arrange
        mock_content_repository.get_by_id.return_value = None

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            await publish_use_case.execute(content_id=content_id, language_code="it", published_by="user-123")

        error_message = str(exc_info.value)
        assert str(content_id) in error_message
        assert "it" in error_message


class TestArchiveContentSuccess:
    """Test successful content archiving operations."""

    @pytest.mark.asyncio
    async def test_archive_content(self, archive_use_case, mock_content_repository, content_id):
        """Test archiving content."""
        # Act
        await archive_use_case.execute(content_id=content_id, archived_by="admin-user")

        # Assert
        mock_content_repository.archive_content.assert_called_once_with(content_id)

    @pytest.mark.asyncio
    async def test_archive_calls_repository_archive_method(self, archive_use_case, mock_content_repository, content_id):
        """Test that archive calls content repository archive method."""
        # Act
        await archive_use_case.execute(content_id=content_id, archived_by="admin-123")

        # Assert
        mock_content_repository.archive_content.assert_called_once()
        call_args = mock_content_repository.archive_content.call_args[0]
        assert call_args[0] == content_id

    @pytest.mark.asyncio
    async def test_archive_with_different_content_ids(self, archive_use_case, mock_content_repository):
        """Test archiving different content items."""
        content_id_1 = uuid4()
        content_id_2 = uuid4()

        # Act
        await archive_use_case.execute(content_id=content_id_1, archived_by="admin-123")

        await archive_use_case.execute(content_id=content_id_2, archived_by="admin-123")

        # Assert
        assert mock_content_repository.archive_content.call_count == 2
        first_call = mock_content_repository.archive_content.call_args_list[0][0][0]
        second_call = mock_content_repository.archive_content.call_args_list[1][0][0]

        assert first_call == content_id_1
        assert second_call == content_id_2


class TestPublishContentInitialization:
    """Test PublishContent initialization."""

    def test_initialization_with_repositories(self, mock_content_repository, mock_url_route_repository):
        """Test use case initialization with repositories."""
        use_case = PublishContent(mock_content_repository, mock_url_route_repository)

        assert use_case.content_repository is mock_content_repository
        assert use_case.url_route_repository is mock_url_route_repository

    def test_repositories_are_stored(self, mock_content_repository, mock_url_route_repository):
        """Test that repository references are stored correctly."""
        use_case = PublishContent(mock_content_repository, mock_url_route_repository)

        assert hasattr(use_case, "content_repository")
        assert hasattr(use_case, "url_route_repository")
        assert use_case.content_repository == mock_content_repository
        assert use_case.url_route_repository == mock_url_route_repository


class TestArchiveContentInitialization:
    """Test ArchiveContent initialization."""

    def test_initialization_with_repositories(self, mock_content_repository, mock_url_route_repository):
        """Test use case initialization with repositories."""
        use_case = ArchiveContent(mock_content_repository, mock_url_route_repository)

        assert use_case.content_repository is mock_content_repository
        assert use_case.url_route_repository is mock_url_route_repository

    def test_repositories_are_stored(self, mock_content_repository, mock_url_route_repository):
        """Test that repository references are stored correctly."""
        use_case = ArchiveContent(mock_content_repository, mock_url_route_repository)

        assert hasattr(use_case, "content_repository")
        assert hasattr(use_case, "url_route_repository")
        assert use_case.content_repository == mock_content_repository
        assert use_case.url_route_repository == mock_url_route_repository


class TestPublishContentEdgeCases:
    """Test edge cases and boundary conditions."""

    @pytest.mark.asyncio
    async def test_publish_with_different_language_codes(
        self, publish_use_case, mock_content_repository, content_id, draft_version
    ):
        """Test publishing content in different languages."""
        mock_content_repository.get_by_id.return_value = draft_version
        mock_content_repository.update_version.return_value = draft_version

        # Test with Italian language
        await publish_use_case.execute(content_id=content_id, language_code="it", published_by="user-123")

        # Assert
        mock_content_repository.get_by_id.assert_called_with(content_id, "it")

    @pytest.mark.asyncio
    async def test_publish_timestamps_are_consistent(
        self, publish_use_case, mock_content_repository, content_id, draft_version
    ):
        """Test that published_at and updated_at are set to similar times."""
        # Arrange
        mock_content_repository.get_by_id.return_value = draft_version
        mock_content_repository.update_version.return_value = draft_version

        # Act
        await publish_use_case.execute(content_id=content_id, language_code="en", published_by="user-123")

        # Assert
        updated_version = mock_content_repository.update_version.call_args[0][0]
        time_diff = abs((updated_version.published_at - updated_version.updated_at).total_seconds())

        # Timestamps should be within 1 second of each other
        assert time_diff < 1.0

    @pytest.mark.asyncio
    async def test_publish_does_not_modify_original_version_attributes(
        self, publish_use_case, mock_content_repository, content_id, draft_version
    ):
        """Test that publish preserves original version attributes."""
        # Arrange
        original_slug = draft_version.slug
        original_title = draft_version.title
        original_created_at = draft_version.created_at

        mock_content_repository.get_by_id.return_value = draft_version
        mock_content_repository.update_version.return_value = draft_version

        # Act
        await publish_use_case.execute(content_id=content_id, language_code="en", published_by="user-123")

        # Assert
        updated_version = mock_content_repository.update_version.call_args[0][0]
        assert updated_version.slug == original_slug
        assert updated_version.title == original_title
        assert updated_version.created_at == original_created_at
