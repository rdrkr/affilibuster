# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for change password use case.

Tests cover password validation and change logic.
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, Mock
from uuid import UUID, uuid4

import pytest
from pydantic import SecretStr, ValidationError

from affilibuster_backend.domain.entities.generated.models import (
    AuthProfileChangePasswordPostRequest,
)
from affilibuster_backend.domain.entities.user import (
    Email,
    HashedPassword,
    UserEntity,
    UserStatus,
)
from affilibuster_backend.domain.use_cases.profile.change_password_use_case import (
    ChangePasswordUseCase,
)


def create_test_user(user_id: UUID | None = None) -> UserEntity:
    """Create a test user entity."""
    return UserEntity(
        id=uuid4() if user_id is None else user_id,
        email=Email("test@example.com"),
        hashed_password=HashedPassword("$2b$12$hashedpasswordhash"),
        display_name="Test User",
        email_verified=False,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        last_login_at=None,
        status=UserStatus.ACTIVE,
        deleted_at=None,
    )


class TestChangePasswordUseCaseConstructor:
    """Test suite for ChangePasswordUseCase constructor."""

    def test_constructor_initializes_dependencies(self):
        """Test that constructor properly initializes all dependencies."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        password_hasher = Mock()

        # Act
        use_case = ChangePasswordUseCase(user_repo, session_repo, password_hasher)

        # Assert
        assert use_case.user_repo is user_repo
        assert use_case.session_repo is session_repo
        assert use_case.password_hasher is password_hasher


@pytest.mark.asyncio
class TestChangePasswordUseCase:
    """Test suite for ChangePasswordUseCase."""

    async def test_change_password_too_short_raises_error(self):
        """Test changing to a password that is too short raises error."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id)

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user

        password_hasher = Mock()
        password_hasher.verify_password.return_value = True  # Current password correct

        # Act & Assert - Pydantic validates password length during model instantiation
        with pytest.raises(ValidationError, match=r"new_password|newPassword"):
            AuthProfileChangePasswordPostRequest(
                current_password=SecretStr("OldPassword123!"),
                new_password=SecretStr("short"),  # Too short (<8 characters)
            )

    async def test_change_password_success(self):
        """Test successful password change."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id)

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user
        user_repo.update.return_value = user

        session_repo = AsyncMock()

        password_hasher = Mock()
        password_hasher.verify_password.return_value = True  # Current password correct
        password_hasher.hash_password.return_value = "$2b$12$newhash"

        use_case = ChangePasswordUseCase(user_repo, session_repo, password_hasher)
        request = AuthProfileChangePasswordPostRequest(
            current_password=SecretStr("OldPassword123!"),
            new_password=SecretStr("NewPassword456!"),
        )

        # Act
        await use_case.execute(user_id, request)

        # Assert
        user_repo.update.assert_called_once()
        session_repo.delete_all_by_user_id.assert_called_once_with(user_id)

    async def test_change_password_short_password_bypassing_pydantic(self):
        """Test changing to a short password when Pydantic validation is bypassed."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id)

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user

        session_repo = AsyncMock()

        password_hasher = Mock()
        password_hasher.verify_password.return_value = True  # Current password correct

        use_case = ChangePasswordUseCase(user_repo, session_repo, password_hasher)

        # Bypass Pydantic validation using model_construct
        request = AuthProfileChangePasswordPostRequest.model_construct(
            current_password=SecretStr("OldPassword123!"),
            new_password=SecretStr("short"),  # Less than 8 characters
        )

        # Act & Assert
        with pytest.raises(ValueError, match=r"Password must be at least 8 characters|8"):
            await use_case.execute(user_id, request)
