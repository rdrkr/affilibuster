# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for UserRepository.

Tests database operations for user management using mocked sessions: create, read, update, delete.
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.user import Email, HashedPassword, UserEntity, UserStatus
from affilibuster_backend.infrastructure.database.models.user import UserModel
from affilibuster_backend.infrastructure.database.repositories.user_repository import UserRepository


@pytest.mark.unit
class TestUserRepositoryCreate:
    """Test UserRepository.create() method."""

    async def test_create_new_user(self) -> None:
        """Test creating a new user."""
        mock_session = AsyncMock()

        # Mock exists_by_email to return False (email doesn't exist)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)

        now = datetime.now(UTC)
        user_id = uuid4()
        user = UserEntity(
            id=user_id,
            email=Email("test@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=False,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        result = await repo.create(user)

        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once()
        assert result.id == user.id
        assert result.email.value == "test@example.com"
        assert result.display_name == "Test User"
        assert result.email_verified is False
        assert result.status == UserStatus.ACTIVE

    async def test_create_user_with_duplicate_email_raises_error(self) -> None:
        """Test creating user with existing email raises ValueError."""
        mock_session = AsyncMock()

        # Mock exists_by_email to return True (email already exists)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = uuid4()  # Return a user ID to indicate exists
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)

        now = datetime.now(UTC)
        user = UserEntity(
            id=uuid4(),
            email=Email("duplicate@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="User One",
            email_verified=False,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        with pytest.raises(ValueError, match="already exists"):
            await repo.create(user)


@pytest.mark.unit
class TestUserRepositoryGetById:
    """Test UserRepository.get_by_id() method."""

    async def test_get_by_id_returns_user(self) -> None:
        """Test retrieving user by ID."""
        mock_session = AsyncMock()

        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model
        mock_model = MagicMock(spec=UserModel)
        mock_model.id = user_id
        mock_model.email = "getbyid@example.com"
        mock_model.hashed_password = "$2b$12$hashedpassword"
        mock_model.display_name = "Get By ID User"
        mock_model.email_verified = True
        mock_model.status = UserStatus.ACTIVE
        mock_model.created_at = now.replace(tzinfo=None)
        mock_model.updated_at = now.replace(tzinfo=None)
        mock_model.last_login_at = None
        mock_model.deleted_at = None

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)
        result = await repo.get_by_id(user_id)

        assert result is not None
        assert result.id == user_id
        assert result.email.value == "getbyid@example.com"
        assert result.display_name == "Get By ID User"

    async def test_get_by_id_returns_none_for_missing(self) -> None:
        """Test get_by_id returns None for non-existent user."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)
        result = await repo.get_by_id(uuid4())

        assert result is None


@pytest.mark.unit
class TestUserRepositoryGetByEmail:
    """Test UserRepository.get_by_email() method."""

    async def test_get_by_email_returns_user(self) -> None:
        """Test retrieving user by email."""
        mock_session = AsyncMock()

        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model
        mock_model = MagicMock(spec=UserModel)
        mock_model.id = user_id
        mock_model.email = "getbyemail@example.com"
        mock_model.hashed_password = "$2b$12$hashedpassword"
        mock_model.display_name = "Get By Email User"
        mock_model.email_verified = False
        mock_model.status = UserStatus.ACTIVE
        mock_model.created_at = now.replace(tzinfo=None)
        mock_model.updated_at = now.replace(tzinfo=None)
        mock_model.last_login_at = None
        mock_model.deleted_at = None

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)
        result = await repo.get_by_email(Email("getbyemail@example.com"))

        assert result is not None
        assert result.email.value == "getbyemail@example.com"
        assert result.display_name == "Get By Email User"

    async def test_get_by_email_returns_none_for_missing(self) -> None:
        """Test get_by_email returns None for non-existent email."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)
        result = await repo.get_by_email(Email("nonexistent@example.com"))

        assert result is None


@pytest.mark.unit
class TestUserRepositoryUpdate:
    """Test UserRepository.update() method."""

    async def test_update_existing_user(self) -> None:
        """Test updating an existing user."""
        mock_session = AsyncMock()

        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model that will be returned by the query
        mock_model = MagicMock(spec=UserModel)
        mock_model.id = user_id
        mock_model.email = "update@example.com"
        mock_model.hashed_password = "$2b$12$hashedpassword"
        mock_model.display_name = "Original Name"
        mock_model.email_verified = False
        mock_model.status = UserStatus.ACTIVE
        mock_model.created_at = now.replace(tzinfo=None)
        mock_model.updated_at = now.replace(tzinfo=None)
        mock_model.last_login_at = None
        mock_model.deleted_at = None

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)

        # Create updated user entity
        updated_user = UserEntity(
            id=user_id,
            email=Email("update@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Updated Name",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=datetime.now(UTC),
            last_login_at=None,
            deleted_at=None,
        )

        await repo.update(updated_user)

        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once()
        # Verify the model was updated
        assert mock_model.display_name == "Updated Name"
        assert mock_model.email_verified is True

    async def test_update_nonexistent_user_raises_error(self) -> None:
        """Test updating non-existent user raises ValueError."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)

        now = datetime.now(UTC)
        user = UserEntity(
            id=uuid4(),
            email=Email("nonexistent@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Non Existent",
            email_verified=False,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        with pytest.raises(ValueError, match="does not exist"):
            await repo.update(user)


@pytest.mark.unit
class TestUserRepositoryDelete:
    """Test UserRepository.delete() method."""

    async def test_delete_existing_user(self) -> None:
        """Test deleting an existing user."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 1
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)

        user_id = uuid4()
        await repo.delete(user_id)

        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()

    async def test_delete_nonexistent_user_raises_error(self) -> None:
        """Test deleting non-existent user raises ValueError."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)

        with pytest.raises(ValueError, match="does not exist"):
            await repo.delete(uuid4())


@pytest.mark.unit
class TestUserRepositoryExistsByEmail:
    """Test UserRepository.exists_by_email() method."""

    async def test_exists_by_email_returns_true_for_existing(self) -> None:
        """Test exists_by_email returns True for existing email."""
        mock_session = AsyncMock()

        # Return a user ID to indicate email exists
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = uuid4()
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)
        result = await repo.exists_by_email(Email("exists@example.com"))

        assert result is True

    async def test_exists_by_email_returns_false_for_missing(self) -> None:
        """Test exists_by_email returns False for non-existent email."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)
        result = await repo.exists_by_email(Email("notfound@example.com"))

        assert result is False


@pytest.mark.unit
class TestUserRepositoryToEntity:
    """Test UserRepository._to_entity() method."""

    async def test_to_entity_converts_model_to_entity(self) -> None:
        """Test _to_entity correctly converts database model to entity."""
        mock_session = AsyncMock()

        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model
        mock_model = MagicMock(spec=UserModel)
        mock_model.id = user_id
        mock_model.email = "convert@example.com"
        mock_model.hashed_password = "$2b$12$hashedpassword"
        mock_model.display_name = "Convert User"
        mock_model.email_verified = True
        mock_model.status = UserStatus.ACTIVE
        mock_model.created_at = now.replace(tzinfo=None)
        mock_model.updated_at = now.replace(tzinfo=None)
        mock_model.last_login_at = now.replace(tzinfo=None)
        mock_model.deleted_at = None

        repo = UserRepository(mock_session)
        result = repo._to_entity(mock_model)

        # Verify all fields converted correctly
        assert result.id == user_id
        assert result.email.value == "convert@example.com"
        assert result.hashed_password.value == "$2b$12$hashedpassword"
        assert result.display_name == "Convert User"
        assert result.email_verified is True
        assert result.status == UserStatus.ACTIVE
        assert result.last_login_at is not None
        assert result.deleted_at is None

    async def test_to_entity_converts_deleted_user(self) -> None:
        """Test _to_entity correctly handles deleted_at timestamp."""
        mock_session = AsyncMock()

        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model with deleted status
        mock_model = MagicMock(spec=UserModel)
        mock_model.id = user_id
        mock_model.email = "deleted@example.com"
        mock_model.hashed_password = "$2b$12$hashedpassword"
        mock_model.display_name = "Deleted User"
        mock_model.email_verified = True
        mock_model.status = UserStatus.DELETED
        mock_model.created_at = now.replace(tzinfo=None)
        mock_model.updated_at = now.replace(tzinfo=None)
        mock_model.last_login_at = None
        mock_model.deleted_at = now.replace(tzinfo=None)

        repo = UserRepository(mock_session)
        result = repo._to_entity(mock_model)

        # Verify deleted_at is converted correctly
        assert result.id == user_id
        assert result.deleted_at is not None
        assert result.status == UserStatus.DELETED

    async def test_to_entity_handles_timezone_aware_datetimes(self) -> None:
        """Test _to_entity correctly handles timezone-aware datetimes from model."""
        mock_session = AsyncMock()

        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model with timezone-aware datetimes
        mock_model = MagicMock(spec=UserModel)
        mock_model.id = user_id
        mock_model.email = "tzaware@example.com"
        mock_model.hashed_password = "$2b$12$hashedpassword"
        mock_model.display_name = "TZ Aware User"
        mock_model.email_verified = False
        mock_model.status = UserStatus.ACTIVE
        mock_model.created_at = now  # Keep timezone-aware
        mock_model.updated_at = now  # Keep timezone-aware
        mock_model.last_login_at = None
        mock_model.deleted_at = None

        repo = UserRepository(mock_session)
        result = repo._to_entity(mock_model)

        # Verify datetimes are timezone-aware
        assert result.created_at.tzinfo is not None
        assert result.updated_at.tzinfo is not None


@pytest.mark.unit
class TestUserRepositoryEdgeCases:
    """Test UserRepository edge cases and error handling."""

    async def test_create_user_with_last_login_at(self) -> None:
        """Test creating a user with last_login_at set."""
        mock_session = AsyncMock()

        # Mock exists_by_email to return False
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)

        now = datetime.now(UTC)
        user = UserEntity(
            id=uuid4(),
            email=Email("withlogin@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="With Login User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=now,
            deleted_at=None,
        )

        result = await repo.create(user)

        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        assert result.last_login_at is not None

    async def test_update_user_with_all_fields(self) -> None:
        """Test updating a user with all fields changed."""
        mock_session = AsyncMock()

        user_id = uuid4()
        now = datetime.now(UTC)
        new_time = datetime.now(UTC)

        # Create mock model
        mock_model = MagicMock(spec=UserModel)
        mock_model.id = user_id
        mock_model.email = "allfieldupdate@example.com"
        mock_model.hashed_password = "$2b$12$oldpassword"
        mock_model.display_name = "Old Name"
        mock_model.email_verified = False
        mock_model.status = UserStatus.ACTIVE
        mock_model.created_at = now.replace(tzinfo=None)
        mock_model.updated_at = now.replace(tzinfo=None)
        mock_model.last_login_at = None
        mock_model.deleted_at = None

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)

        # Update with new values
        updated_user = UserEntity(
            id=user_id,
            email=Email("newemail@example.com"),
            hashed_password=HashedPassword("$2b$12$newpassword"),
            display_name="New Name",
            email_verified=True,
            status=UserStatus.LOCKED,
            created_at=now,
            updated_at=new_time,
            last_login_at=new_time,
            deleted_at=None,
        )

        await repo.update(updated_user)

        # Verify all fields were updated on the model
        assert mock_model.email == "newemail@example.com"
        assert mock_model.hashed_password == "$2b$12$newpassword"
        assert mock_model.display_name == "New Name"
        assert mock_model.email_verified is True
        assert mock_model.status == UserStatus.LOCKED
        mock_session.commit.assert_called_once()

    async def test_to_entity_with_all_nullable_fields_none(self) -> None:
        """Test _to_entity when all nullable fields are None."""
        mock_session = AsyncMock()

        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model with all nullable fields as None
        mock_model = MagicMock(spec=UserModel)
        mock_model.id = user_id
        mock_model.email = "minimal@example.com"
        mock_model.hashed_password = "$2b$12$hashedpassword"
        mock_model.display_name = "Minimal User"
        mock_model.email_verified = False
        mock_model.status = UserStatus.ACTIVE
        mock_model.created_at = now.replace(tzinfo=None)
        mock_model.updated_at = now.replace(tzinfo=None)
        mock_model.last_login_at = None
        mock_model.deleted_at = None

        repo = UserRepository(mock_session)
        result = repo._to_entity(mock_model)

        assert result.last_login_at is None
        assert result.deleted_at is None

    async def test_create_preserves_user_id(self) -> None:
        """Test that create preserves the provided user ID."""
        mock_session = AsyncMock()

        # Mock exists_by_email to return False
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = UserRepository(mock_session)

        now = datetime.now(UTC)
        specific_id = uuid4()
        user = UserEntity(
            id=specific_id,
            email=Email("preserveid@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="ID Preserved User",
            email_verified=False,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        result = await repo.create(user)

        assert result.id == specific_id
