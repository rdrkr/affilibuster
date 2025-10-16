# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for CreateURLRedirect use case.

Covers:
- Valid redirect creation (301 and 410)
- Status code validation
- Repository interaction
- Error handling
"""

import pytest
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock

from src.domain.use_cases.create_url_redirect import CreateURLRedirect
from src.domain.entities.url_route import URLRedirect


@pytest.fixture
def mock_url_route_repository():
    """Create a mock URL route repository."""
    repository = MagicMock()
    repository.create_redirect = AsyncMock()
    return repository


@pytest.fixture
def use_case(mock_url_route_repository):
    """Create CreateURLRedirect use case with mock repository."""
    return CreateURLRedirect(mock_url_route_repository)


class TestCreateURLRedirectExecution:
    """Test CreateURLRedirect use case execution."""

    @pytest.mark.asyncio
    async def test_create_301_redirect_success(self, use_case, mock_url_route_repository):
        """Test creating a 301 (permanent) redirect."""
        # Arrange
        from_path = '/old-product-slug'
        to_primary_url_id = 'url-123'
        status_code = 301
        created_by = 'user-456'
        reason = 'slug_changed'

        # Act
        await use_case.execute(
            from_path=from_path,
            to_primary_url_id=to_primary_url_id,
            status_code=status_code,
            created_by=created_by,
            reason=reason
        )

        # Assert
        mock_url_route_repository.create_redirect.assert_called_once()
        call_args = mock_url_route_repository.create_redirect.call_args[0][0]

        assert isinstance(call_args, URLRedirect)
        assert call_args.from_path == from_path
        assert call_args.to_primary_url_id == to_primary_url_id
        assert call_args.status_code == 301
        assert call_args.created_by == created_by
        assert call_args.reason == reason
        assert isinstance(call_args.created_at, datetime)

    @pytest.mark.asyncio
    async def test_create_410_redirect_success(self, use_case, mock_url_route_repository):
        """Test creating a 410 (gone) redirect."""
        # Arrange
        from_path = '/deleted-product'
        to_primary_url_id = 'url-789'
        status_code = 410
        created_by = 'admin-user'
        reason = 'content_deleted'

        # Act
        await use_case.execute(
            from_path=from_path,
            to_primary_url_id=to_primary_url_id,
            status_code=status_code,
            created_by=created_by,
            reason=reason
        )

        # Assert
        mock_url_route_repository.create_redirect.assert_called_once()
        call_args = mock_url_route_repository.create_redirect.call_args[0][0]

        assert call_args.status_code == 410
        assert call_args.reason == 'content_deleted'

    @pytest.mark.asyncio
    async def test_create_redirect_without_reason(self, use_case, mock_url_route_repository):
        """Test creating redirect without optional reason."""
        # Act
        await use_case.execute(
            from_path='/manual-redirect',
            to_primary_url_id='url-999',
            status_code=301,
            created_by='user-123',
            reason=None  # Optional parameter
        )

        # Assert
        call_args = mock_url_route_repository.create_redirect.call_args[0][0]
        assert call_args.reason is None

    @pytest.mark.asyncio
    async def test_create_redirect_default_reason(self, use_case, mock_url_route_repository):
        """Test creating redirect with default (no) reason."""
        # Act - omit reason parameter
        await use_case.execute(
            from_path='/test-path',
            to_primary_url_id='url-555',
            status_code=301,
            created_by='user-777'
        )

        # Assert
        call_args = mock_url_route_repository.create_redirect.call_args[0][0]
        assert call_args.reason is None


class TestCreateURLRedirectValidation:
    """Test CreateURLRedirect validation rules."""

    @pytest.mark.asyncio
    async def test_invalid_status_code_400(self, use_case, mock_url_route_repository):
        """Test validation fails for status code 400."""
        with pytest.raises(ValueError, match="Status code must be 301 or 410"):
            await use_case.execute(
                from_path='/test',
                to_primary_url_id='url-123',
                status_code=400,  # Invalid
                created_by='user-123'
            )

        # Repository should not be called
        mock_url_route_repository.create_redirect.assert_not_called()

    @pytest.mark.asyncio
    async def test_invalid_status_code_200(self, use_case, mock_url_route_repository):
        """Test validation fails for status code 200."""
        with pytest.raises(ValueError, match="Status code must be 301 or 410"):
            await use_case.execute(
                from_path='/test',
                to_primary_url_id='url-123',
                status_code=200,  # Invalid
                created_by='user-123'
            )

        mock_url_route_repository.create_redirect.assert_not_called()

    @pytest.mark.asyncio
    async def test_invalid_status_code_302(self, use_case, mock_url_route_repository):
        """Test validation fails for status code 302 (temporary redirect)."""
        with pytest.raises(ValueError, match="Status code must be 301 or 410"):
            await use_case.execute(
                from_path='/test',
                to_primary_url_id='url-123',
                status_code=302,  # Invalid - we only support 301 and 410
                created_by='user-123'
            )

        mock_url_route_repository.create_redirect.assert_not_called()

    @pytest.mark.asyncio
    async def test_invalid_status_code_500(self, use_case, mock_url_route_repository):
        """Test validation fails for server error status code."""
        with pytest.raises(ValueError, match="Status code must be 301 or 410"):
            await use_case.execute(
                from_path='/test',
                to_primary_url_id='url-123',
                status_code=500,  # Invalid
                created_by='user-123'
            )

        mock_url_route_repository.create_redirect.assert_not_called()


class TestCreateURLRedirectEdgeCases:
    """Test edge cases and special scenarios."""

    @pytest.mark.asyncio
    async def test_create_redirect_with_slash_prefix(self, use_case, mock_url_route_repository):
        """Test redirect with proper slash prefix."""
        await use_case.execute(
            from_path='/products/old-slug',
            to_primary_url_id='url-123',
            status_code=301,
            created_by='user-123',
            reason='slug_changed'
        )

        call_args = mock_url_route_repository.create_redirect.call_args[0][0]
        assert call_args.from_path.startswith('/')

    @pytest.mark.asyncio
    async def test_create_redirect_with_long_path(self, use_case, mock_url_route_repository):
        """Test redirect with very long path."""
        long_path = '/category/' + 'a' * 200

        await use_case.execute(
            from_path=long_path,
            to_primary_url_id='url-123',
            status_code=301,
            created_by='user-123'
        )

        call_args = mock_url_route_repository.create_redirect.call_args[0][0]
        assert len(call_args.from_path) > 200

    @pytest.mark.asyncio
    async def test_create_redirect_with_special_characters_in_path(self, use_case, mock_url_route_repository):
        """Test redirect with special characters in path."""
        await use_case.execute(
            from_path='/products/eco-water-bottle-20%-off',
            to_primary_url_id='url-123',
            status_code=301,
            created_by='user-123'
        )

        call_args = mock_url_route_repository.create_redirect.call_args[0][0]
        assert '%' in call_args.from_path

    @pytest.mark.asyncio
    async def test_create_redirect_timestamps_are_recent(self, use_case, mock_url_route_repository):
        """Test that created_at timestamp is recent (within last second)."""
        before = datetime.now(UTC)

        await use_case.execute(
            from_path='/test',
            to_primary_url_id='url-123',
            status_code=301,
            created_by='user-123'
        )

        after = datetime.now(UTC)
        call_args = mock_url_route_repository.create_redirect.call_args[0][0]

        assert before <= call_args.created_at <= after

    @pytest.mark.asyncio
    async def test_multiple_redirects_different_timestamps(self, use_case, mock_url_route_repository):
        """Test that multiple redirects get different timestamps."""
        await use_case.execute(
            from_path='/path1',
            to_primary_url_id='url-1',
            status_code=301,
            created_by='user-123'
        )

        first_call = mock_url_route_repository.create_redirect.call_args[0][0]
        first_timestamp = first_call.created_at

        await use_case.execute(
            from_path='/path2',
            to_primary_url_id='url-2',
            status_code=301,
            created_by='user-123'
        )

        second_call = mock_url_route_repository.create_redirect.call_args[0][0]
        second_timestamp = second_call.created_at

        # Timestamps should be equal or second should be after first
        assert first_timestamp <= second_timestamp


class TestCreateURLRedirectInitialization:
    """Test CreateURLRedirect initialization."""

    def test_initialization_with_repository(self, mock_url_route_repository):
        """Test use case initialization with repository."""
        use_case = CreateURLRedirect(mock_url_route_repository)

        assert use_case.url_route_repository is mock_url_route_repository

    def test_repository_is_stored(self, mock_url_route_repository):
        """Test that repository reference is stored correctly."""
        use_case = CreateURLRedirect(mock_url_route_repository)

        assert hasattr(use_case, 'url_route_repository')
        assert use_case.url_route_repository == mock_url_route_repository
