# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for RefreshSessionUseCase.

Tests session refresh/extension logic.
Following TDD: These tests are written FIRST and will initially FAIL.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.generated.models import AuthRefreshPostRequest
from affilibuster_backend.domain.entities.user import Email, HashedPassword, UserEntity, UserStatus
from affilibuster_backend.domain.entities.user_session import UserSession
from affilibuster_backend.domain.use_cases.auth.refresh_session_use_case import (
    RefreshSessionUseCase,
)


class TestRefreshSessionUseCase:
    """Test RefreshSessionUseCase."""

    @pytest.mark.asyncio
    async def test_refresh_valid_session(self) -> None:
        """Test refreshing a valid session extends expiration."""
        # Arrange
        session_repo = AsyncMock()
        user_repo = AsyncMock()
        token_generator = Mock()

        session_id = uuid4()
        user_id = uuid4()
        now = datetime.now(UTC)
        original_expires_at = now + timedelta(days=3)

        session = UserSession(
            id=session_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=original_expires_at,
            remember_me=False,
            created_at=now - timedelta(days=4),
        )

        user_entity = UserEntity(
            id=user_id,
            email=Email("test@example.com"),
            hashed_password=HashedPassword("hashed_password_123"),
            display_name="Test User",
            email_verified=True,
            created_at=now - timedelta(days=10),
            updated_at=now,
            last_login_at=now,
            status=UserStatus.ACTIVE,
            deleted_at=None,
        )

        token_generator.hash_token.return_value = "hashed_token"
        session_repo.get_by_token_hash.return_value = session
        user_repo.get_by_id.return_value = user_entity

        use_case = RefreshSessionUseCase(
            session_repository=session_repo,
            user_repository=user_repo,
            token_generator=token_generator,
        )

        request = AuthRefreshPostRequest(session_token="plaintext_token")

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is True
        # Verify session was updated
        session_repo.update.assert_called_once()
        updated_session = session_repo.update.call_args[0][0]

        # Expiration should be extended by 7 days from now
        expected_expires_at = now + timedelta(days=7)
        assert abs((updated_session.expires_at - expected_expires_at).total_seconds()) < 2

    @pytest.mark.asyncio
    async def test_refresh_remember_me_session(self) -> None:
        """Test refreshing remember_me session extends by 30 days."""
        # Arrange
        session_repo = AsyncMock()
        user_repo = AsyncMock()
        token_generator = Mock()

        session_id = uuid4()
        user_id = uuid4()
        now = datetime.now(UTC)
        original_expires_at = now + timedelta(days=10)

        session = UserSession(
            id=session_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=original_expires_at,
            remember_me=True,  # Remember me session
            created_at=now - timedelta(days=20),
        )

        user_entity = UserEntity(
            id=user_id,
            email=Email("test@example.com"),
            hashed_password=HashedPassword("hashed_password_123"),
            display_name="Test User",
            email_verified=True,
            created_at=now - timedelta(days=30),
            updated_at=now,
            last_login_at=now,
            status=UserStatus.ACTIVE,
            deleted_at=None,
        )

        token_generator.hash_token.return_value = "hashed_token"
        session_repo.get_by_token_hash.return_value = session
        user_repo.get_by_id.return_value = user_entity

        use_case = RefreshSessionUseCase(
            session_repository=session_repo,
            user_repository=user_repo,
            token_generator=token_generator,
        )

        request = AuthRefreshPostRequest(session_token="plaintext_token")

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is True

        # Verify expiration extended by 30 days
        updated_session = session_repo.update.call_args[0][0]
        expected_expires_at = now + timedelta(days=30)
        assert abs((updated_session.expires_at - expected_expires_at).total_seconds()) < 2

    @pytest.mark.asyncio
    async def test_refresh_expired_session_fails(self) -> None:
        """Test that expired sessions cannot be refreshed."""
        # Arrange
        session_repo = AsyncMock()
        user_repo = AsyncMock()
        token_generator = Mock()

        session_id = uuid4()
        user_id = uuid4()
        now = datetime.now(UTC)
        expired_session = UserSession(
            id=session_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=now - timedelta(days=1),  # Expired
            remember_me=False,
            created_at=now - timedelta(days=8),
        )

        token_generator.hash_token.return_value = "hashed_token"
        session_repo.get_by_token_hash.return_value = expired_session

        use_case = RefreshSessionUseCase(
            session_repository=session_repo,
            user_repository=user_repo,
            token_generator=token_generator,
        )

        request = AuthRefreshPostRequest(session_token="expired_token")

        # Act & Assert - Use case raises ValueError for expired session
        with pytest.raises(ValueError, match="Session has expired"):
            await use_case.execute(request)

        # Verify session was not updated
        session_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_refresh_invalid_token(self) -> None:
        """Test that invalid tokens cannot be refreshed."""
        # Arrange
        session_repo = AsyncMock()
        user_repo = AsyncMock()
        token_generator = Mock()

        token_generator.hash_token.return_value = "hashed_invalid_token"
        session_repo.get_by_token_hash.return_value = None

        use_case = RefreshSessionUseCase(
            session_repository=session_repo,
            user_repository=user_repo,
            token_generator=token_generator,
        )

        request = AuthRefreshPostRequest(session_token="invalid_token")

        # Act & Assert - Use case raises ValueError for invalid token
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(request)

        assert "Invalid session" in str(exc_info.value)
        # Verify session was not updated
        session_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_refresh_empty_token(self) -> None:
        """Test that empty tokens are rejected."""
        # Arrange
        session_repo = AsyncMock()
        user_repo = AsyncMock()
        token_generator = Mock()

        use_case = RefreshSessionUseCase(
            session_repository=session_repo,
            user_repository=user_repo,
            token_generator=token_generator,
        )

        request = AuthRefreshPostRequest(session_token="")

        # Act & Assert - Use case raises ValueError for empty token
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(request)

        assert "Session token is required" in str(exc_info.value)
        # Verify nothing was called
        token_generator.hash_token.assert_not_called()

    @pytest.mark.asyncio
    async def test_refresh_whitespace_token(self) -> None:
        """Test that whitespace-only tokens are rejected."""
        # Arrange
        session_repo = AsyncMock()
        user_repo = AsyncMock()
        token_generator = Mock()

        use_case = RefreshSessionUseCase(
            session_repository=session_repo,
            user_repository=user_repo,
            token_generator=token_generator,
        )

        request = AuthRefreshPostRequest(session_token="   ")

        # Act & Assert - Use case raises ValueError for whitespace token
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(request)

        assert "Session token is required" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_refresh_fails_when_user_not_found(self) -> None:
        """Test that refresh fails when user no longer exists."""
        # Arrange
        session_repo = AsyncMock()
        user_repo = AsyncMock()
        token_generator = Mock()

        session_id = uuid4()
        user_id = uuid4()
        now = datetime.now(UTC)

        session = UserSession(
            id=session_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=now + timedelta(days=7),
            remember_me=False,
            created_at=now - timedelta(days=1),
        )

        token_generator.hash_token.return_value = "hashed_token"
        session_repo.get_by_token_hash.return_value = session
        user_repo.get_by_id.return_value = None  # User not found (deleted)

        use_case = RefreshSessionUseCase(
            session_repository=session_repo,
            user_repository=user_repo,
            token_generator=token_generator,
        )

        request = AuthRefreshPostRequest(session_token="valid_token")

        # Act & Assert - Use case raises ValueError when user not found
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(request)

        assert "User not found for session" in str(exc_info.value)
        # Verify session was updated before user lookup failed
        session_repo.update.assert_called_once()
