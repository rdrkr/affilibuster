# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for get user profile use case.

Tests cover retrieving user profile information.
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock
from uuid import UUID, uuid4

import pytest

from affilibuster_backend.domain.entities.user import (
    Email,
    HashedPassword,
    UserEntity,
    UserStatus,
)
from affilibuster_backend.domain.use_cases.profile.get_user_profile_use_case import (
    GetUserProfileRequest,
    GetUserProfileUseCase,
)


def create_test_user(user_id: UUID | None = None) -> UserEntity:
    """Create a test user entity."""
    return UserEntity(
        id=uuid4() if user_id is None else user_id,
        email=Email("test@example.com"),
        hashed_password=HashedPassword("$2b$12$hashedpasswordhash"),
        display_name="Test User",
        email_verified=True,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        last_login_at=datetime.now(UTC),
        status=UserStatus.ACTIVE,
        deleted_at=None,
    )


class TestGetUserProfileUseCaseConstructor:
    """Test suite for GetUserProfileUseCase constructor."""

    def test_constructor_initializes_dependencies(self):
        """Test that constructor properly initializes all dependencies."""
        # Arrange
        user_repo = AsyncMock()

        # Act
        use_case = GetUserProfileUseCase(user_repo)

        # Assert
        assert use_case.user_repo is user_repo


@pytest.mark.asyncio
class TestGetUserProfileUseCase:
    """Test suite for GetUserProfileUseCase."""

    async def test_get_user_profile_success(self):
        """Test successfully retrieving user profile."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id)

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user

        use_case = GetUserProfileUseCase(user_repo)
        request = GetUserProfileRequest(user_id=user_id)

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.id == user_id
        assert result.email.value == "test@example.com"
        assert result.display_name == "Test User"
        assert result.email_verified is True
        user_repo.get_by_id.assert_called_once_with(user_id)

    async def test_get_user_profile_user_not_found(self):
        """Test getting profile when user doesn't exist."""
        # Arrange
        user_id = uuid4()

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = None

        use_case = GetUserProfileUseCase(user_repo)
        request = GetUserProfileRequest(user_id=user_id)

        # Act & Assert
        with pytest.raises(ValueError, match="User not found"):
            await use_case.execute(request)
