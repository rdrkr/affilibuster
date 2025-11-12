# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for LogoutUserUseCase.

Tests user logout business logic including session invalidation.
Following TDD: These tests are written FIRST and will initially FAIL.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.generated.models import AuthLogoutPostRequest
from affilibuster_backend.domain.entities.user_session import UserSession
from affilibuster_backend.domain.use_cases.auth.logout_user_use_case import (
    LogoutUserUseCase,
)


class TestLogoutUserUseCase:
    """Test LogoutUserUseCase."""

    @pytest.mark.asyncio
    async def test_logout_with_valid_session(self) -> None:
        """Test successful logout with valid session token."""
        # Arrange
        session_repo = AsyncMock()
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
            created_at=now,
        )

        token_generator.hash_token.return_value = "hashed_token"
        session_repo.get_by_token_hash.return_value = session

        use_case = LogoutUserUseCase(
            session_repository=session_repo,
            token_generator=token_generator,
        )

        request = AuthLogoutPostRequest(session_token="plaintext_token")

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is True
        # Verify token was hashed
        token_generator.hash_token.assert_called_once_with("plaintext_token")

        # Verify session was deleted
        session_repo.delete.assert_called_once_with(session_id)

    @pytest.mark.asyncio
    async def test_logout_with_invalid_session_token(self) -> None:
        """Test logout fails with invalid session token."""
        # Arrange
        session_repo = AsyncMock()
        token_generator = Mock()

        token_generator.hash_token.return_value = "hashed_invalid_token"
        session_repo.get_by_token_hash.return_value = None

        use_case = LogoutUserUseCase(
            session_repository=session_repo,
            token_generator=token_generator,
        )

        request = AuthLogoutPostRequest(session_token="invalid_token")

        # Act & Assert - Use case raises ValueError for invalid token
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(request)

        assert "Invalid session" in str(exc_info.value)
        # Verify no session was deleted
        session_repo.delete.assert_not_called()

    @pytest.mark.asyncio
    async def test_logout_with_expired_session(self) -> None:
        """Test logout with expired session still deletes it."""
        # Arrange
        session_repo = AsyncMock()
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

        use_case = LogoutUserUseCase(
            session_repository=session_repo,
            token_generator=token_generator,
        )

        request = AuthLogoutPostRequest(session_token="expired_token")

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is True
        # Verify expired session was still deleted
        session_repo.delete.assert_called_once_with(session_id)

    @pytest.mark.asyncio
    async def test_logout_with_empty_token(self) -> None:
        """Test logout fails with empty session token."""
        # Arrange
        session_repo = AsyncMock()
        token_generator = Mock()

        use_case = LogoutUserUseCase(
            session_repository=session_repo,
            token_generator=token_generator,
        )

        request = AuthLogoutPostRequest(session_token="")

        # Act & Assert - Use case raises ValueError for empty token
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(request)

        assert "Session token is required" in str(exc_info.value)
        # Verify nothing was called
        token_generator.hash_token.assert_not_called()
        session_repo.get_by_token_hash.assert_not_called()

    @pytest.mark.asyncio
    async def test_logout_with_whitespace_token(self) -> None:
        """Test logout fails with whitespace-only token."""
        # Arrange
        session_repo = AsyncMock()
        token_generator = Mock()

        use_case = LogoutUserUseCase(
            session_repository=session_repo,
            token_generator=token_generator,
        )

        request = AuthLogoutPostRequest(session_token="   ")

        # Act & Assert - Use case raises ValueError for whitespace token
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(request)

        assert "Session token is required" in str(exc_info.value)
