# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for HandleSlugChange use case.

Covers:
- Successful slug change flow
- Redirect creation
- Old route deactivation
- Error handling
"""

import pytest
from datetime import UTC, datetime
from uuid import uuid4, UUID
from unittest.mock import AsyncMock, MagicMock, Mock

from src.domain.use_cases.handle_slug_change import HandleSlugChange
from src.domain.entities.url_route import URLRoute, URLRedirect


@pytest.fixture
def mock_url_route_repository():
    """Create a mock URL route repository."""
    repository = MagicMock()
    repository.get_primary_for_content = AsyncMock()
    repository.create = AsyncMock()
    repository.update = AsyncMock()
    repository.create_redirect = AsyncMock()
    return repository


@pytest.fixture
def use_case(mock_url_route_repository):
    """Create HandleSlugChange use case with mock repository."""
    return HandleSlugChange(mock_url_route_repository)


@pytest.fixture
def content_version_id():
    """Create a test content version ID."""
    return uuid4()


@pytest.fixture
def old_route(content_version_id):
    """Create an old primary URL route for testing."""
    return URLRoute(
        id=uuid4(),
        content_version_id=content_version_id,
        language_code='en',
        path='/products/old-eco-bottle',
        slug='old-eco-bottle',
        is_active=True,
        is_primary=True,
        canonical_url='/products/old-eco-bottle',
        alternate_urls={'it': '/it/prodotti/old-eco-bottle'},
        redirects=[],
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )


class TestHandleSlugChangeSuccess:
    """Test successful slug change operations."""

    @pytest.mark.asyncio
    async def test_handle_slug_change_creates_new_route(
        self, use_case, mock_url_route_repository, content_version_id, old_route
    ):
        """Test that slug change creates a new primary route."""
        # Arrange
        mock_url_route_repository.get_primary_for_content.return_value = old_route

        new_route_id = uuid4()
        mock_url_route_repository.create.return_value = URLRoute(
            id=new_route_id,
            content_version_id=content_version_id,
            language_code='en',
            path='/products/eco-water-bottle',
            slug='eco-water-bottle',
            is_active=True,
            is_primary=True,
            canonical_url='/products/eco-water-bottle',
            alternate_urls={'it': '/it/prodotti/old-eco-bottle'},
            redirects=[],
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC)
        )

        # Act
        result = await use_case.execute(
            content_version_id=content_version_id,
            old_slug='old-eco-bottle',
            new_slug='eco-water-bottle',
            language_code='en',
            created_by='user-123'
        )

        # Assert
        assert result.slug == 'eco-water-bottle'
        assert result.is_primary is True
        assert result.is_active is True
        assert '/products/eco-water-bottle' in result.path

    @pytest.mark.asyncio
    async def test_handle_slug_change_deactivates_old_route(
        self, use_case, mock_url_route_repository, content_version_id, old_route
    ):
        """Test that old route is marked inactive and non-primary."""
        # Arrange
        mock_url_route_repository.get_primary_for_content.return_value = old_route
        mock_url_route_repository.create.return_value = Mock(id=uuid4())

        # Act
        await use_case.execute(
            content_version_id=content_version_id,
            old_slug='old-eco-bottle',
            new_slug='new-eco-bottle',
            language_code='en',
            created_by='user-123'
        )

        # Assert
        mock_url_route_repository.update.assert_called_once()
        updated_route = mock_url_route_repository.update.call_args[0][0]

        assert updated_route.is_active is False
        assert updated_route.is_primary is False
        assert updated_route.slug == 'old-eco-bottle'  # Original slug unchanged

    @pytest.mark.asyncio
    async def test_handle_slug_change_creates_301_redirect(
        self, use_case, mock_url_route_repository, content_version_id, old_route
    ):
        """Test that 301 redirect is created from old to new path."""
        # Arrange
        mock_url_route_repository.get_primary_for_content.return_value = old_route
        new_route_id = uuid4()
        mock_url_route_repository.create.return_value = Mock(id=new_route_id)

        # Act
        await use_case.execute(
            content_version_id=content_version_id,
            old_slug='old-eco-bottle',
            new_slug='new-eco-bottle',
            language_code='en',
            created_by='user-456'
        )

        # Assert
        mock_url_route_repository.create_redirect.assert_called_once()
        redirect = mock_url_route_repository.create_redirect.call_args[0][0]

        assert isinstance(redirect, URLRedirect)
        assert redirect.from_path == '/products/old-eco-bottle'
        assert redirect.to_primary_url_id == str(new_route_id)
        assert redirect.status_code == 301
        assert redirect.created_by == 'user-456'
        assert redirect.reason == 'slug_changed'

    @pytest.mark.asyncio
    async def test_handle_slug_change_preserves_alternate_urls(
        self, use_case, mock_url_route_repository, content_version_id, old_route
    ):
        """Test that alternate URLs are preserved in new route."""
        # Arrange
        mock_url_route_repository.get_primary_for_content.return_value = old_route

        # Act
        await use_case.execute(
            content_version_id=content_version_id,
            old_slug='old-eco-bottle',
            new_slug='new-eco-bottle',
            language_code='en',
            created_by='user-123'
        )

        # Assert
        mock_url_route_repository.create.assert_called_once()
        new_route = mock_url_route_repository.create.call_args[0][0]

        assert new_route.alternate_urls == old_route.alternate_urls

    @pytest.mark.asyncio
    async def test_handle_slug_change_path_replacement(
        self, use_case, mock_url_route_repository, content_version_id, old_route
    ):
        """Test that path is correctly updated with new slug."""
        # Arrange
        mock_url_route_repository.get_primary_for_content.return_value = old_route

        # Act
        await use_case.execute(
            content_version_id=content_version_id,
            old_slug='old-eco-bottle',
            new_slug='super-eco-bottle',
            language_code='en',
            created_by='user-123'
        )

        # Assert
        new_route = mock_url_route_repository.create.call_args[0][0]
        assert new_route.path == '/products/super-eco-bottle'
        assert new_route.slug == 'super-eco-bottle'


class TestHandleSlugChangeErrorHandling:
    """Test error handling in slug change operations."""

    @pytest.mark.asyncio
    async def test_error_when_no_primary_route_found(
        self, use_case, mock_url_route_repository, content_version_id
    ):
        """Test error when no primary route exists for content."""
        # Arrange
        mock_url_route_repository.get_primary_for_content.return_value = None

        # Act & Assert
        with pytest.raises(ValueError, match="No primary route found"):
            await use_case.execute(
                content_version_id=content_version_id,
                old_slug='some-slug',
                new_slug='new-slug',
                language_code='en',
                created_by='user-123'
            )

    @pytest.mark.asyncio
    async def test_error_when_old_slug_mismatch(
        self, use_case, mock_url_route_repository, content_version_id, old_route
    ):
        """Test error when provided old slug doesn't match current slug."""
        # Arrange
        mock_url_route_repository.get_primary_for_content.return_value = old_route

        # Act & Assert
        with pytest.raises(ValueError, match="Old slug mismatch"):
            await use_case.execute(
                content_version_id=content_version_id,
                old_slug='wrong-slug',  # Doesn't match old_route.slug
                new_slug='new-slug',
                language_code='en',
                created_by='user-123'
            )

    @pytest.mark.asyncio
    async def test_error_message_includes_expected_and_found_slugs(
        self, use_case, mock_url_route_repository, content_version_id, old_route
    ):
        """Test that error message shows both expected and found slugs."""
        # Arrange
        mock_url_route_repository.get_primary_for_content.return_value = old_route

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(
                content_version_id=content_version_id,
                old_slug='incorrect-slug',
                new_slug='new-slug',
                language_code='en',
                created_by='user-123'
            )

        error_message = str(exc_info.value)
        assert 'incorrect-slug' in error_message
        assert 'old-eco-bottle' in error_message


class TestHandleSlugChangeOperationOrder:
    """Test that operations happen in correct order."""

    @pytest.mark.asyncio
    async def test_operations_executed_in_correct_order(
        self, use_case, mock_url_route_repository, content_version_id, old_route
    ):
        """Test that repository operations happen in correct sequence."""
        # Arrange
        call_order = []

        async def track_get_primary(*args, **kwargs):
            call_order.append('get_primary')
            return old_route

        async def track_create(*args, **kwargs):
            call_order.append('create')
            return Mock(id=uuid4())

        async def track_update(*args, **kwargs):
            call_order.append('update')

        async def track_create_redirect(*args, **kwargs):
            call_order.append('create_redirect')

        mock_url_route_repository.get_primary_for_content.side_effect = track_get_primary
        mock_url_route_repository.create.side_effect = track_create
        mock_url_route_repository.update.side_effect = track_update
        mock_url_route_repository.create_redirect.side_effect = track_create_redirect

        # Act
        await use_case.execute(
            content_version_id=content_version_id,
            old_slug='old-eco-bottle',
            new_slug='new-eco-bottle',
            language_code='en',
            created_by='user-123'
        )

        # Assert
        assert call_order == ['get_primary', 'create', 'update', 'create_redirect']


class TestHandleSlugChangeInitialization:
    """Test HandleSlugChange initialization."""

    def test_initialization_with_repository(self, mock_url_route_repository):
        """Test use case initialization with repository."""
        use_case = HandleSlugChange(mock_url_route_repository)

        assert use_case.url_route_repository is mock_url_route_repository

    def test_repository_is_stored(self, mock_url_route_repository):
        """Test that repository reference is stored correctly."""
        use_case = HandleSlugChange(mock_url_route_repository)

        assert hasattr(use_case, 'url_route_repository')
        assert use_case.url_route_repository == mock_url_route_repository


class TestHandleSlugChangeEdgeCases:
    """Test edge cases and boundary conditions."""

    @pytest.mark.asyncio
    async def test_handle_slug_change_with_nested_paths(
        self, use_case, mock_url_route_repository, content_version_id
    ):
        """Test slug change with deeply nested paths."""
        old_route = URLRoute(
            id=uuid4(),
            content_version_id=content_version_id,
            language_code='en',
            path='/category/subcategory/products/my-product',
            slug='my-product',
            is_active=True,
            is_primary=True,
            canonical_url='/category/subcategory/products/my-product',
            alternate_urls={},
            redirects=[]
        )

        mock_url_route_repository.get_primary_for_content.return_value = old_route
        mock_url_route_repository.create.return_value = Mock(id=uuid4())

        # Act
        await use_case.execute(
            content_version_id=content_version_id,
            old_slug='my-product',
            new_slug='awesome-product',
            language_code='en',
            created_by='user-123'
        )

        # Assert
        new_route = mock_url_route_repository.create.call_args[0][0]
        assert new_route.path == '/category/subcategory/products/awesome-product'

    @pytest.mark.asyncio
    async def test_handle_slug_change_with_special_characters(
        self, use_case, mock_url_route_repository, content_version_id, old_route
    ):
        """Test slug change with hyphens and numbers."""
        mock_url_route_repository.get_primary_for_content.return_value = old_route
        mock_url_route_repository.create.return_value = Mock(id=uuid4())

        # Act
        await use_case.execute(
            content_version_id=content_version_id,
            old_slug='old-eco-bottle',
            new_slug='eco-bottle-2024-v2',
            language_code='en',
            created_by='user-123'
        )

        # Assert
        new_route = mock_url_route_repository.create.call_args[0][0]
        assert new_route.slug == 'eco-bottle-2024-v2'
        assert '2024' in new_route.path
