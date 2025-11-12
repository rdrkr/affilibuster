# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for VerifyEmailUseCase.

Tests email verification with token validation.
Following TDD: These tests are written FIRST and will initially FAIL.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.email_verification_token import (
    EmailVerificationToken,
)
from affilibuster_backend.domain.entities.generated.models import (
    AuthVerifyEmailPostRequest,
)
from affilibuster_backend.domain.entities.user import Email, HashedPassword, UserEntity, UserStatus
from affilibuster_backend.domain.use_cases.auth.verify_email_use_case import (
    VerifyEmailUseCase,
)


class TestVerifyEmailUseCase:
    """Test VerifyEmailUseCase."""

    @pytest.mark.asyncio
    async def test_verify_email_with_valid_token(self) -> None:
        """Test successful email verification with valid token."""
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

        verification_token = EmailVerificationToken(
            id=uuid4(),
            user_id=user_id,
            token_hash="hashed_verification_token",
            expires_at=now + timedelta(hours=12),
            used_at=None,
            created_at=now,
        )

        token_generator.hash_token.return_value = "hashed_verification_token"
        token_repo.get_by_token_hash.return_value = verification_token
        user_repo.get_by_id.return_value = user

        use_case = VerifyEmailUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthVerifyEmailPostRequest(token="plaintext_token")

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is True

        # Verify user email was marked as verified
        user_repo.update.assert_called_once()
        updated_user = user_repo.update.call_args[0][0]
        assert updated_user.email_verified is True

        # Verify token was marked as used
        token_repo.update.assert_called_once()
        updated_token = token_repo.update.call_args[0][0]
        assert updated_token.used_at is not None

    @pytest.mark.asyncio
    async def test_verify_email_with_invalid_token(self) -> None:
        """Test email verification fails with invalid token."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        token_generator.hash_token.return_value = "hashed_invalid_token"
        token_repo.get_by_token_hash.return_value = None

        use_case = VerifyEmailUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthVerifyEmailPostRequest(token="invalid_token")

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(request)

        assert str(exc_info.value) == "Invalid or expired verification token"

        # Verify user was not updated
        user_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_verify_email_with_expired_token(self) -> None:
        """Test email verification fails with expired token."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)
        expired_token = EmailVerificationToken(
            id=uuid4(),
            user_id=user_id,
            token_hash="hashed_expired_token",
            expires_at=now - timedelta(hours=1),  # Expired
            used_at=None,
            created_at=now - timedelta(hours=25),
        )

        token_generator.hash_token.return_value = "hashed_expired_token"
        token_repo.get_by_token_hash.return_value = expired_token

        use_case = VerifyEmailUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthVerifyEmailPostRequest(token="expired_token")

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(request)

        assert str(exc_info.value) == "Invalid or expired verification token"

        # Verify user was not updated
        user_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_verify_email_with_used_token(self) -> None:
        """Test email verification fails with already-used token."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)
        used_token = EmailVerificationToken(
            id=uuid4(),
            user_id=user_id,
            token_hash="hashed_used_token",
            expires_at=now + timedelta(hours=12),
            used_at=now - timedelta(hours=1),  # Already used
            created_at=now - timedelta(hours=13),
        )

        token_generator.hash_token.return_value = "hashed_used_token"
        token_repo.get_by_token_hash.return_value = used_token

        use_case = VerifyEmailUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthVerifyEmailPostRequest(token="used_token")

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(request)

        assert str(exc_info.value) == "Invalid or expired verification token"

        # Verify user was not updated
        user_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_verify_email_already_verified(self) -> None:
        """Test email verification with already-verified email returns success."""
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

        verification_token = EmailVerificationToken(
            id=uuid4(),
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=now + timedelta(hours=12),
            used_at=None,
            created_at=now,
        )

        token_generator.hash_token.return_value = "hashed_token"
        token_repo.get_by_token_hash.return_value = verification_token
        user_repo.get_by_id.return_value = user

        use_case = VerifyEmailUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthVerifyEmailPostRequest(token="token")

        # Act
        result = await use_case.execute(request)

        # Assert - Should still succeed (idempotent)
        assert result.success is True

        # Token should still be marked as used
        token_repo.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_verify_email_with_deleted_user(self) -> None:
        """Test email verification fails when user has been deleted."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)

        # Token exists and is valid
        verification_token = EmailVerificationToken(
            id=uuid4(),
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=now + timedelta(hours=12),
            used_at=None,
            created_at=now,
        )

        token_generator.hash_token.return_value = "hashed_token"
        token_repo.get_by_token_hash.return_value = verification_token
        user_repo.get_by_id.return_value = None  # User was deleted

        use_case = VerifyEmailUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            token_generator=token_generator,
        )

        request = AuthVerifyEmailPostRequest(token="token")

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(request)

        assert str(exc_info.value) == "Invalid or expired verification token"

        # Verify user was not updated
        user_repo.update.assert_not_called()
