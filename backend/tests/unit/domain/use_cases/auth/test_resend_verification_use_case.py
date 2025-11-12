# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for ResendVerificationUseCase.

Tests resending email verification with token generation.
Following TDD: These tests are written FIRST and will initially FAIL.
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.generated.models import (
    AuthResendVerificationPostRequest,
)
from affilibuster_backend.domain.entities.user import Email, HashedPassword, UserEntity, UserStatus
from affilibuster_backend.domain.use_cases.auth.resend_verification_use_case import (
    ResendVerificationUseCase,
)


class TestResendVerificationUseCase:
    """Test ResendVerificationUseCase."""

    @pytest.mark.asyncio
    async def test_resend_verification_success(self) -> None:
        """Test successful resend of verification email."""
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
            email_verified=False,  # Not verified yet
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_id.return_value = user
        token_generator.generate_token.return_value = "new_plaintext_token"
        token_generator.hash_token.return_value = "new_hashed_token"

        use_case = ResendVerificationUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthResendVerificationPostRequest(user_id=user_id)

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is True
        assert result.verification_token == "new_plaintext_token"

        # Verify old tokens were deleted
        token_repo.delete_all_by_user_id.assert_called_once_with(user_id)

        # Verify new token was created
        token_repo.create.assert_called_once()
        created_token = token_repo.create.call_args[0][0]
        assert created_token.user_id == user_id
        assert created_token.token_hash == "new_hashed_token"
        assert created_token.used_at is None

    @pytest.mark.asyncio
    async def test_resend_verification_user_not_found(self) -> None:
        """Test resend verification fails when user not found."""
        # Arrange
        user_id = uuid4()
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        user_repo.get_by_id.return_value = None

        use_case = ResendVerificationUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthResendVerificationPostRequest(user_id=user_id)

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(request)

        assert str(exc_info.value) == "User not found"

        # Verify no tokens were created or deleted
        token_repo.delete_all_by_user_id.assert_not_called()
        token_repo.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_resend_verification_already_verified(self) -> None:
        """Test resend verification fails when email already verified."""
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
            email_verified=True,  # Already verified
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_id.return_value = user

        use_case = ResendVerificationUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthResendVerificationPostRequest(user_id=user_id)

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(request)

        assert str(exc_info.value) == "Email is already verified"

        # Verify no tokens were created or deleted
        token_repo.delete_all_by_user_id.assert_not_called()
        token_repo.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_resend_verification_token_expiration(self) -> None:
        """Test that new verification token has 24-hour expiration."""
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
            email_verified=False,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_id.return_value = user
        token_generator.generate_token.return_value = "token"
        token_generator.hash_token.return_value = "hashed"

        use_case = ResendVerificationUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthResendVerificationPostRequest(user_id=user_id)

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is True

        # Verify token has appropriate expiration (approximately 24 hours from now)
        created_token = token_repo.create.call_args[0][0]
        time_until_expiration = created_token.expires_at - created_token.created_at
        assert time_until_expiration.total_seconds() == 24 * 60 * 60  # 24 hours in seconds
