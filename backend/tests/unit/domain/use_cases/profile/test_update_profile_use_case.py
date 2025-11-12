# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for update profile use case.

Tests cover updating user profile display name.
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock
from uuid import UUID, uuid4

import pytest
from pydantic import ValidationError

from affilibuster_backend.domain.entities.generated.models import AuthProfilePatchRequest
from affilibuster_backend.domain.entities.user import (
    Email,
    HashedPassword,
    UserEntity,
    UserStatus,
)
from affilibuster_backend.domain.use_cases.profile.update_profile_use_case import (
    UpdateProfileUseCase,
)


def create_test_user(user_id: UUID | None = None) -> UserEntity:
    """Create a test user entity."""
    return UserEntity(
        id=uuid4() if user_id is None else user_id,
        email=Email("test@example.com"),
        hashed_password=HashedPassword("$2b$12$hashedpasswordhash"),
        display_name="Old Name",
        email_verified=False,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        last_login_at=None,
        status=UserStatus.ACTIVE,
        deleted_at=None,
    )


class TestUpdateProfileUseCaseConstructor:
    """Test suite for UpdateProfileUseCase constructor."""

    def test_constructor_initializes_dependencies(self):
        """Test that constructor properly initializes all dependencies."""
        # Arrange
        user_repo = AsyncMock()

        # Act
        use_case = UpdateProfileUseCase(user_repo)

        # Assert
        assert use_case.user_repo is user_repo


@pytest.mark.asyncio
class TestUpdateProfileUseCase:
    """Test suite for UpdateProfileUseCase."""

    async def test_update_profile_success(self):
        """Test successfully updating user profile."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id)

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user
        user_repo.update.return_value = user

        use_case = UpdateProfileUseCase(user_repo)
        request = AuthProfilePatchRequest(display_name="New Name")

        # Act
        result = await use_case.execute(user_id, request)

        # Assert
        assert result.display_name == "New Name"
        user_repo.get_by_id.assert_called_once_with(user_id)
        user_repo.update.assert_called_once()

    async def test_update_profile_user_not_found(self):
        """Test updating profile when user doesn't exist."""
        # Arrange
        user_id = uuid4()

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = None

        use_case = UpdateProfileUseCase(user_repo)
        request = AuthProfilePatchRequest(display_name="New Name")

        # Act & Assert
        with pytest.raises(ValueError, match="User not found"):
            await use_case.execute(user_id, request)

    async def test_update_profile_empty_display_name(self):
        """Test updating profile with empty display name."""
        # Act & Assert - Pydantic validates displayName minLength during model instantiation
        with pytest.raises(ValidationError, match=r"display_name|displayName"):
            AuthProfilePatchRequest(display_name="")

    async def test_update_profile_whitespace_only_display_name(self):
        """Test updating profile with whitespace-only display name."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id)

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user

        use_case = UpdateProfileUseCase(user_repo)
        request = AuthProfilePatchRequest(display_name="   ")

        # Act & Assert
        with pytest.raises(ValueError, match="Display name cannot be empty"):
            await use_case.execute(user_id, request)

    async def test_update_profile_too_long_display_name(self):
        """Test updating profile with display name exceeding max length."""
        # Act & Assert - Pydantic validates displayName maxLength during model instantiation
        with pytest.raises(ValidationError, match=r"display_name|displayName"):
            AuthProfilePatchRequest(display_name="a" * 101)  # Over 100 chars

    async def test_update_profile_too_long_display_name_bypassing_pydantic(self):
        """Test updating profile with display name exceeding max length when Pydantic validation is bypassed."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id)

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user

        use_case = UpdateProfileUseCase(user_repo)

        # Bypass Pydantic validation using model_construct
        request = AuthProfilePatchRequest.model_construct(
            display_name="a" * 101  # Over 100 chars
        )

        # Act & Assert
        with pytest.raises(ValueError, match=r"Display name must be 100 characters or less|100"):
            await use_case.execute(user_id, request)
