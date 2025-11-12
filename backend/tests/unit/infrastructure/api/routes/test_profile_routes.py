# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for profile route handlers.

Tests cover exception handling and error cases in profile routes.
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, Mock
from uuid import UUID, uuid4

import pytest
from fastapi import HTTPException, status
from pydantic import SecretStr

from affilibuster_backend.domain.entities.generated.models import (
    AuthProfileChangePasswordPostRequest,
    AuthProfileChangePasswordPostResponse,
    AuthProfilePatchRequest,
)
from affilibuster_backend.domain.entities.user import (
    Email,
    HashedPassword,
    UserEntity,
    UserStatus,
)
from affilibuster_backend.infrastructure.api.routes.profile import (
    change_password,
    get_profile,
    update_profile,
)


def create_test_user(user_id: UUID | None = None, email: str = "test@example.com") -> UserEntity:
    """Create a test user entity with all required fields."""
    return UserEntity(
        id=uuid4() if user_id is None else user_id,
        email=Email(email),
        hashed_password=HashedPassword("$2b$12$hashedpasswordhash"),  # Valid bcrypt hash format
        display_name="Test User",
        email_verified=False,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        last_login_at=None,
        status=UserStatus.ACTIVE,
        deleted_at=None,
    )


@pytest.mark.asyncio
class TestGetProfileUnit:
    """Unit tests for get_profile route handler."""

    async def test_get_profile_success(self):
        """Test get_profile returns profile data."""
        # Arrange
        user_id = uuid4()
        current_user = create_test_user(user_id=user_id)

        # Mock repository
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = current_user

        # Act
        result = await get_profile(current_user, user_repo)

        # Assert
        assert result.id == user_id
        assert result.email == "test@example.com"
        assert result.display_name == "Test User"

    async def test_get_profile_user_not_found_raises_404(self):
        """Test get_profile raises 404 when user not found."""
        # Arrange
        current_user = create_test_user()

        # Mock repository that returns None
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_profile(current_user, user_repo)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "User not found" in str(exc_info.value.detail)


@pytest.mark.asyncio
class TestUpdateProfileUnit:
    """Unit tests for update_profile route handler."""

    async def test_update_profile_success(self):
        """Test update_profile returns updated profile."""
        # Arrange
        user_id = uuid4()
        current_user = create_test_user(user_id=user_id)
        updated_user = create_test_user(user_id=user_id)
        updated_user.display_name = "New Name"
        body = AuthProfilePatchRequest(display_name="New Name")

        # Mock repository
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = current_user
        user_repo.update.return_value = updated_user

        # Act
        result = await update_profile(body, current_user, user_repo)

        # Assert
        assert result.id == user_id
        assert result.display_name == "New Name"

    async def test_update_profile_user_not_found_raises_400(self):
        """Test update_profile raises 400 when user not found."""
        # Arrange
        current_user = create_test_user()
        body = AuthProfilePatchRequest(display_name="New Name")

        # Mock repository that returns None
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await update_profile(body, current_user, user_repo)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "User not found" in str(exc_info.value.detail)


@pytest.mark.asyncio
class TestChangePasswordUnit:
    """Unit tests for change_password route handler."""

    async def test_change_password_user_not_found_raises_400(self):
        """Test change_password raises 400 when user not found."""
        # Arrange
        current_user = create_test_user()
        body = AuthProfileChangePasswordPostRequest(
            current_password=SecretStr("OldPassword123!"),
            new_password=SecretStr("NewPassword123!"),
        )

        # Mock repositories
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = None

        session_repo = AsyncMock()
        password_hasher = Mock()

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await change_password(body, current_user, user_repo, session_repo, password_hasher)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "User not found" in str(exc_info.value.detail)

    async def test_change_password_wrong_current_password_raises_400(self):
        """Test change_password raises 400 when current password is wrong."""
        # Arrange
        current_user = create_test_user()

        body = AuthProfileChangePasswordPostRequest(
            current_password=SecretStr("WrongPassword123!"),
            new_password=SecretStr("NewPassword123!"),
        )

        # Mock repositories
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = current_user

        session_repo = AsyncMock()

        # Mock password hasher to return False for wrong password
        password_hasher = Mock()
        password_hasher.verify_password.return_value = False

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await change_password(body, current_user, user_repo, session_repo, password_hasher)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "Current password is incorrect" in str(exc_info.value.detail)

    async def test_change_password_success_returns_message(self):
        """Test change_password returns success message."""
        # Arrange
        user_id = uuid4()
        current_user = create_test_user(user_id=user_id)
        body = AuthProfileChangePasswordPostRequest(
            current_password=SecretStr("OldPassword123!"),
            new_password=SecretStr("NewPassword123!"),
        )

        # Mock repositories
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = current_user
        user_repo.update.return_value = current_user

        session_repo = AsyncMock()
        session_repo.delete_all_by_user_id.return_value = None

        # Mock password hasher
        password_hasher = Mock()
        password_hasher.verify_password.return_value = True
        password_hasher.hash_password.return_value = "$2b$12$new_hashed_password"

        # Act
        result = await change_password(body, current_user, user_repo, session_repo, password_hasher)

        # Assert
        assert isinstance(result, AuthProfileChangePasswordPostResponse)
        assert result.message == "Password changed successfully. Please log in again."
        user_repo.update.assert_called_once()
        session_repo.delete_all_by_user_id.assert_called_once_with(user_id)
