# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for RequestPasswordResetUseCase.

Tests password reset request logic including token generation.
Following TDD: These tests are written FIRST and will initially FAIL.
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest
from pydantic import ValidationError

from affilibuster_backend.domain.entities.generated.models import AuthForgotPasswordPostRequest
from affilibuster_backend.domain.entities.user import Email, HashedPassword, UserEntity, UserStatus
from affilibuster_backend.domain.use_cases.auth.request_password_reset_use_case import (
    RequestPasswordResetUseCase,
)


class TestRequestPasswordResetUseCase:
    """Test RequestPasswordResetUseCase."""

    @pytest.mark.asyncio
    async def test_request_password_reset_with_valid_email(self) -> None:
        """Test successful password reset request with valid email."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)
        user = UserEntity(
            id=user_id,
            email=Email("user@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_email.return_value = user
        token_generator.generate_token.return_value = "reset_token_123"
        token_generator.hash_token.return_value = "hashed_reset_token"

        use_case = RequestPasswordResetUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthForgotPasswordPostRequest(email="user@example.com")

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is True
        assert result.reset_token == "reset_token_123"
        assert result.error is None

        # Verify token was generated and stored
        token_generator.generate_token.assert_called_once()
        token_generator.hash_token.assert_called_once_with("reset_token_123")
        token_repo.create.assert_called_once()

        # Verify token has correct properties
        call_args = token_repo.create.call_args
        created_token = call_args[0][0]
        assert created_token.user_id == user_id
        assert created_token.token_hash == "hashed_reset_token"
        assert created_token.used_at is None

    @pytest.mark.asyncio
    async def test_request_password_reset_with_nonexistent_email(self) -> None:
        """Test password reset request with non-existent email returns success (security)."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        user_repo.get_by_email.return_value = None

        use_case = RequestPasswordResetUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthForgotPasswordPostRequest(email="nonexistent@example.com")

        # Act
        result = await use_case.execute(request)

        # Assert - Return success to prevent user enumeration
        assert result.success is True
        assert result.reset_token is None
        assert result.error is None

        # Verify no token was created
        token_repo.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_request_password_reset_with_invalid_email(self) -> None:
        """Test password reset request with invalid email format."""
        # Act & Assert - Pydantic validates email format during model instantiation
        with pytest.raises(ValidationError, match=r"email"):
            AuthForgotPasswordPostRequest(email="not-an-email")

    @pytest.mark.asyncio
    async def test_request_password_reset_invalidates_old_tokens(self) -> None:
        """Test that requesting password reset invalidates previous tokens."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)
        user = UserEntity(
            id=user_id,
            email=Email("user@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_email.return_value = user
        token_generator.generate_token.return_value = "new_token"
        token_generator.hash_token.return_value = "hashed_new_token"

        use_case = RequestPasswordResetUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthForgotPasswordPostRequest(email="user@example.com")

        # Act
        await use_case.execute(request)

        # Assert - Old tokens should be deleted
        token_repo.delete_all_by_user_id.assert_called_once_with(user_id)

    @pytest.mark.asyncio
    async def test_request_password_reset_with_deleted_user(self) -> None:
        """Test password reset for deleted user returns success (security)."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        now = datetime.now(UTC)
        deleted_user = UserEntity(
            id=uuid4(),
            email=Email("deleted@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Deleted User",
            email_verified=True,
            status=UserStatus.DELETED,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=now,
        )

        user_repo.get_by_email.return_value = deleted_user

        use_case = RequestPasswordResetUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthForgotPasswordPostRequest(email="deleted@example.com")

        # Act
        result = await use_case.execute(request)

        # Assert - Return success to prevent user enumeration
        assert result.success is True
        assert result.reset_token is None

        # Verify no token was created
        token_repo.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_request_password_reset_with_locked_user(self) -> None:
        """Test password reset for locked user returns success (security)."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        now = datetime.now(UTC)
        locked_user = UserEntity(
            id=uuid4(),
            email=Email("locked@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Locked User",
            email_verified=True,
            status=UserStatus.LOCKED,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_email.return_value = locked_user

        use_case = RequestPasswordResetUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthForgotPasswordPostRequest(email="locked@example.com")

        # Act
        result = await use_case.execute(request)

        # Assert - Return success to prevent user enumeration
        assert result.success is True
        assert result.reset_token is None

        # Verify no token was created
        token_repo.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_request_password_reset_token_expires_in_1_hour(self) -> None:
        """Test that password reset token expires in 1 hour."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)
        user = UserEntity(
            id=user_id,
            email=Email("user@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_email.return_value = user
        token_generator.generate_token.return_value = "token"
        token_generator.hash_token.return_value = "hashed_token"

        use_case = RequestPasswordResetUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthForgotPasswordPostRequest(email="user@example.com")

        # Act
        await use_case.execute(request)

        # Assert - Token should expire in ~1 hour
        call_args = token_repo.create.call_args
        created_token = call_args[0][0]

        from datetime import timedelta

        expected_expiry = now + timedelta(hours=1)
        actual_expiry = created_token.expires_at
        assert abs((actual_expiry - expected_expiry).total_seconds()) < 2

    @pytest.mark.asyncio
    async def test_request_password_reset_invalid_email_bypassing_pydantic(self) -> None:
        """Test password reset request handles invalid email even if Pydantic validation is bypassed."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        use_case = RequestPasswordResetUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        # Bypass Pydantic validation using model_construct
        request = AuthForgotPasswordPostRequest.model_construct(
            email="invalid-email-format"  # Invalid email
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error is not None
        assert "email" in result.error.lower() or "invalid" in result.error.lower()
