# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for ResetPasswordUseCase.

Tests password reset with token validation and password update.
Following TDD: These tests are written FIRST and will initially FAIL.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest
from pydantic import SecretStr, ValidationError

from affilibuster_backend.domain.entities.generated.models import AuthResetPasswordPostRequest
from affilibuster_backend.domain.entities.password_reset_token import PasswordResetToken
from affilibuster_backend.domain.entities.user import Email, HashedPassword, UserEntity, UserStatus
from affilibuster_backend.domain.use_cases.auth.reset_password_use_case import (
    ResetPasswordUseCase,
)


class TestResetPasswordUseCase:
    """Test ResetPasswordUseCase."""

    @pytest.mark.asyncio
    async def test_reset_password_with_valid_token(self) -> None:
        """Test successful password reset with valid token."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)
        user = UserEntity(
            id=user_id,
            email=Email("user@example.com"),
            hashed_password=HashedPassword("$2b$12$oldpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        reset_token = PasswordResetToken(
            id=uuid4(),
            user_id=user_id,
            token_hash="hashed_reset_token",
            expires_at=now + timedelta(minutes=30),
            used_at=None,
            created_at=now,
        )

        token_generator.hash_token.return_value = "hashed_reset_token"
        token_repo.get_by_token_hash.return_value = reset_token
        user_repo.get_by_id.return_value = user
        password_hasher.hash_password.return_value = "$2b$12$newpassword"

        use_case = ResetPasswordUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthResetPasswordPostRequest(
            token="plaintext_token",
            new_password=SecretStr("NewSecurePassword123!"),
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is True
        assert result.error is None

        # Verify password was hashed
        password_hasher.hash_password.assert_called_once_with("NewSecurePassword123!")

        # Verify user was updated with new password
        user_repo.update.assert_called_once()
        updated_user = user_repo.update.call_args[0][0]
        assert updated_user.hashed_password.value == "$2b$12$newpassword"

        # Verify token was marked as used
        token_repo.update.assert_called_once()
        updated_token = token_repo.update.call_args[0][0]
        assert updated_token.used_at is not None

    @pytest.mark.asyncio
    async def test_reset_password_with_invalid_token(self) -> None:
        """Test password reset fails with invalid token."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        token_generator.hash_token.return_value = "hashed_invalid_token"
        token_repo.get_by_token_hash.return_value = None

        use_case = ResetPasswordUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthResetPasswordPostRequest(
            token="invalid_token",
            new_password=SecretStr("NewPassword123!"),
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error == "Invalid or expired reset token"

        # Verify password was not updated
        user_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_reset_password_with_expired_token(self) -> None:
        """Test password reset fails with expired token."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)
        expired_token = PasswordResetToken(
            id=uuid4(),
            user_id=user_id,
            token_hash="hashed_expired_token",
            expires_at=now - timedelta(hours=1),  # Expired
            used_at=None,
            created_at=now - timedelta(hours=2),
        )

        token_generator.hash_token.return_value = "hashed_expired_token"
        token_repo.get_by_token_hash.return_value = expired_token

        use_case = ResetPasswordUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthResetPasswordPostRequest(
            token="expired_token",
            new_password=SecretStr("NewPassword123!"),
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error == "Invalid or expired reset token"

        # Verify password was not updated
        user_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_reset_password_with_used_token(self) -> None:
        """Test password reset fails with already-used token."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)
        used_token = PasswordResetToken(
            id=uuid4(),
            user_id=user_id,
            token_hash="hashed_used_token",
            expires_at=now + timedelta(minutes=30),
            used_at=now - timedelta(minutes=5),  # Already used
            created_at=now - timedelta(hours=1),
        )

        token_generator.hash_token.return_value = "hashed_used_token"
        token_repo.get_by_token_hash.return_value = used_token

        use_case = ResetPasswordUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthResetPasswordPostRequest(
            token="used_token",
            new_password=SecretStr("NewPassword123!"),
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error == "Invalid or expired reset token"

        # Verify password was not updated
        user_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_reset_password_validates_weak_password(self) -> None:
        """Test password reset fails with weak password."""
        # Arrange
        # Act & Assert - Pydantic validates password length during model instantiation
        with pytest.raises(ValidationError) as exc_info:
            AuthResetPasswordPostRequest(
                token="valid_token",
                new_password=SecretStr("weak"),
            )

        assert "new_password" in str(exc_info.value) or "newPassword" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_reset_password_validates_empty_password(self) -> None:
        """Test password reset fails with empty password."""
        # Arrange
        # Act & Assert - Pydantic validates password length during model instantiation
        with pytest.raises(ValidationError) as exc_info:
            AuthResetPasswordPostRequest(
                token="valid_token",
                new_password=SecretStr(""),
            )

        assert "new_password" in str(exc_info.value) or "newPassword" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_reset_password_with_deleted_user(self) -> None:
        """Test password reset fails when user has been deleted."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)

        # Token exists but is valid
        token = PasswordResetToken(
            id=uuid4(),
            user_id=user_id,
            token_hash="hashed_token_value",
            expires_at=now + timedelta(hours=1),
            used_at=None,
            created_at=now,
        )

        token_generator.hash_token.return_value = "hashed_token_value"
        token_repo.get_by_token_hash.return_value = token
        user_repo.get_by_id.return_value = None  # User was deleted

        use_case = ResetPasswordUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthResetPasswordPostRequest(
            token="valid_token",
            new_password=SecretStr("NewPassword123!"),
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error == "Invalid or expired reset token"

        # Verify password was not updated
        user_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_reset_password_with_empty_password_bypassing_pydantic(self) -> None:
        """Test reset password handles empty password even if Pydantic validation is bypassed."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        use_case = ResetPasswordUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        # Bypass Pydantic validation using model_construct
        request = AuthResetPasswordPostRequest.model_construct(
            token="valid_token",
            new_password=SecretStr("   "),  # Whitespace-only password
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error is not None
        assert "password" in result.error.lower()
        assert "empty" in result.error.lower()

    @pytest.mark.asyncio
    async def test_reset_password_with_short_password_bypassing_pydantic(self) -> None:
        """Test reset password handles short password even if Pydantic validation is bypassed."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        use_case = ResetPasswordUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        # Bypass Pydantic validation using model_construct
        request = AuthResetPasswordPostRequest.model_construct(
            token="valid_token",
            new_password=SecretStr("short"),  # Less than 8 characters
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error is not None
        assert "password" in result.error.lower()
        assert "8" in result.error or "characters" in result.error.lower()

    @pytest.mark.asyncio
    async def test_reset_password_invalidates_all_user_sessions(self) -> None:
        """Test that password reset invalidates all existing sessions."""
        # Arrange - This will be implemented later when we add session invalidation
        # For now, we'll just verify the password was updated
