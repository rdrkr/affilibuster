# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for PasswordResetTokenRepository.

Tests database operations for password reset tokens using mocked sessions.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.password_reset_token import PasswordResetToken
from affilibuster_backend.infrastructure.database.models.password_reset_token import (
    PasswordResetTokenModel,
)
from affilibuster_backend.infrastructure.database.repositories.password_reset_token_repository import (
    PasswordResetTokenRepository,
)


@pytest.mark.unit
class TestPasswordResetTokenRepositoryCreate:
    """Test PasswordResetTokenRepository.create() method."""

    async def test_create_new_token(self) -> None:
        """Test creating a new password reset token."""
        mock_session = AsyncMock()

        repo = PasswordResetTokenRepository(mock_session)

        now = datetime.now(UTC)
        token = PasswordResetToken(
            id=uuid4(),
            user_id=uuid4(),
            token_hash="hashed_reset_token_123",
            expires_at=now + timedelta(hours=1),
            used_at=None,
            created_at=now,
        )

        result = await repo.create(token)

        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        assert result.id == token.id
        assert result.user_id == token.user_id
        assert result.token_hash == "hashed_reset_token_123"
        assert result.used_at is None

    async def test_create_token_with_used_at(self) -> None:
        """Test creating a token that has already been used."""
        mock_session = AsyncMock()

        repo = PasswordResetTokenRepository(mock_session)

        now = datetime.now(UTC)
        used_time = now - timedelta(minutes=30)
        token = PasswordResetToken(
            id=uuid4(),
            user_id=uuid4(),
            token_hash="used_token_hash",
            expires_at=now + timedelta(hours=1),
            used_at=used_time,
            created_at=now - timedelta(hours=1),
        )

        result = await repo.create(token)

        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        assert result.used_at == used_time


@pytest.mark.unit
class TestPasswordResetTokenRepositoryGetById:
    """Test PasswordResetTokenRepository.get_by_id() method."""

    async def test_get_by_id_returns_token(self) -> None:
        """Test retrieving token by ID."""
        mock_session = AsyncMock()

        token_id = uuid4()
        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model
        mock_model = MagicMock(spec=PasswordResetTokenModel)
        mock_model.id = token_id
        mock_model.user_id = user_id
        mock_model.token_hash = "hashed_token_456"
        mock_model.expires_at = now + timedelta(hours=1)
        mock_model.used_at = None
        mock_model.created_at = now

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)
        result = await repo.get_by_id(token_id)

        assert result is not None
        assert result.id == token_id
        assert result.token_hash == "hashed_token_456"

    async def test_get_by_id_returns_none_for_missing(self) -> None:
        """Test get_by_id returns None for non-existent token."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)
        result = await repo.get_by_id(uuid4())

        assert result is None


@pytest.mark.unit
class TestPasswordResetTokenRepositoryGetByTokenHash:
    """Test PasswordResetTokenRepository.get_by_token_hash() method."""

    async def test_get_by_token_hash_returns_token(self) -> None:
        """Test retrieving token by token hash."""
        mock_session = AsyncMock()

        now = datetime.now(UTC)

        # Create mock model
        mock_model = MagicMock(spec=PasswordResetTokenModel)
        mock_model.id = uuid4()
        mock_model.user_id = uuid4()
        mock_model.token_hash = "unique_hash_789"
        mock_model.expires_at = now + timedelta(hours=1)
        mock_model.used_at = None
        mock_model.created_at = now

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)
        result = await repo.get_by_token_hash("unique_hash_789")

        assert result is not None
        assert result.token_hash == "unique_hash_789"

    async def test_get_by_token_hash_returns_none_for_missing(self) -> None:
        """Test get_by_token_hash returns None for non-existent token."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)
        result = await repo.get_by_token_hash("nonexistent_hash")

        assert result is None


@pytest.mark.unit
class TestPasswordResetTokenRepositoryGetValidTokenByUserId:
    """Test PasswordResetTokenRepository.get_valid_token_by_user_id() method."""

    async def test_get_valid_token_returns_valid_token(self) -> None:
        """Test retrieving valid (unused, unexpired) token for a user."""
        mock_session = AsyncMock()

        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model for valid token
        mock_model = MagicMock(spec=PasswordResetTokenModel)
        mock_model.id = uuid4()
        mock_model.user_id = user_id
        mock_model.token_hash = "valid_token"
        mock_model.expires_at = now + timedelta(hours=1)
        mock_model.used_at = None
        mock_model.created_at = now - timedelta(hours=1)

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)
        result = await repo.get_valid_token_by_user_id(user_id)

        # Should return the valid token
        assert result is not None
        assert result.token_hash == "valid_token"
        mock_session.execute.assert_called_once()

    async def test_get_valid_token_returns_none_for_no_valid(self) -> None:
        """Test get_valid_token returns None when no valid tokens exist."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)
        result = await repo.get_valid_token_by_user_id(uuid4())

        assert result is None


@pytest.mark.unit
class TestPasswordResetTokenRepositoryUpdate:
    """Test PasswordResetTokenRepository.update() method."""

    async def test_update_existing_token(self) -> None:
        """Test updating an existing token."""
        mock_session = AsyncMock()

        token_id = uuid4()
        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model that will be found
        mock_model = MagicMock(spec=PasswordResetTokenModel)
        mock_model.id = token_id
        mock_model.user_id = user_id
        mock_model.token_hash = "update_token"
        mock_model.expires_at = now + timedelta(hours=1)
        mock_model.used_at = now
        mock_model.created_at = now

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)

        # Create token entity to update
        token = PasswordResetToken(
            id=token_id,
            user_id=user_id,
            token_hash="update_token",
            expires_at=now + timedelta(hours=1),
            used_at=now,
            created_at=now,
        )

        result = await repo.update(token)

        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once_with(mock_model)
        assert result.used_at is not None

    async def test_update_nonexistent_token_raises_error(self) -> None:
        """Test updating non-existent token raises ValueError."""
        mock_session = AsyncMock()

        # Mock execute to return None (token not found)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)

        now = datetime.now(UTC)
        token = PasswordResetToken(
            id=uuid4(),
            user_id=uuid4(),
            token_hash="nonexistent_token",
            expires_at=now + timedelta(hours=1),
            used_at=None,
            created_at=now,
        )

        with pytest.raises(ValueError, match="does not exist"):
            await repo.update(token)


@pytest.mark.unit
class TestPasswordResetTokenRepositoryDelete:
    """Test PasswordResetTokenRepository.delete() method."""

    async def test_delete_existing_token(self) -> None:
        """Test deleting an existing token."""
        mock_session = AsyncMock()

        # Mock execute result with rowcount = 1 (successful delete)
        mock_result = MagicMock()
        mock_result.rowcount = 1
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)

        token_id = uuid4()
        await repo.delete(token_id)

        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()

    async def test_delete_nonexistent_token_raises_error(self) -> None:
        """Test deleting non-existent token raises ValueError."""
        mock_session = AsyncMock()

        # Mock execute result with rowcount = 0 (nothing deleted)
        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)

        with pytest.raises(ValueError, match="does not exist"):
            await repo.delete(uuid4())


@pytest.mark.unit
class TestPasswordResetTokenRepositoryDeleteAllByUserId:
    """Test PasswordResetTokenRepository.delete_all_by_user_id() method."""

    async def test_delete_all_by_user_id_executes_delete(self) -> None:
        """Test deleting all tokens for a specific user."""
        mock_session = AsyncMock()

        # Mock execute result
        mock_result = MagicMock()
        mock_result.rowcount = 2
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)

        user_id = uuid4()
        await repo.delete_all_by_user_id(user_id)

        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()

    async def test_delete_all_by_user_id_no_tokens(self) -> None:
        """Test delete_all_by_user_id when user has no tokens."""
        mock_session = AsyncMock()

        # Mock execute result with rowcount = 0
        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)

        # Should not raise error even if no tokens exist
        await repo.delete_all_by_user_id(uuid4())

        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()


@pytest.mark.unit
class TestPasswordResetTokenRepositoryDeleteExpiredTokens:
    """Test PasswordResetTokenRepository.delete_expired_tokens() method."""

    async def test_delete_expired_tokens_returns_count(self) -> None:
        """Test delete_expired_tokens returns correct count."""
        mock_session = AsyncMock()

        # Mock execute result with rowcount
        mock_result = MagicMock()
        mock_result.rowcount = 5
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)

        count = await repo.delete_expired_tokens()

        assert count == 5
        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()

    async def test_delete_expired_tokens_returns_zero_when_none_expired(self) -> None:
        """Test delete_expired_tokens returns 0 when no tokens are expired."""
        mock_session = AsyncMock()

        # Mock execute result with rowcount = 0
        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)

        count = await repo.delete_expired_tokens()

        assert count == 0
        assert isinstance(count, int)

    async def test_delete_expired_tokens_handles_none_rowcount(self) -> None:
        """Test delete_expired_tokens handles None rowcount gracefully."""
        mock_session = AsyncMock()

        # Mock execute result with rowcount = None
        mock_result = MagicMock()
        mock_result.rowcount = None
        mock_session.execute.return_value = mock_result

        repo = PasswordResetTokenRepository(mock_session)

        count = await repo.delete_expired_tokens()

        # Should return 0 when rowcount is None
        assert count == 0


@pytest.mark.unit
class TestPasswordResetTokenRepositoryToEntity:
    """Test PasswordResetTokenRepository._to_entity() method."""

    async def test_to_entity_converts_model_to_entity(self) -> None:
        """Test _to_entity correctly converts database model to entity."""
        mock_session = AsyncMock()

        repo = PasswordResetTokenRepository(mock_session)

        token_id = uuid4()
        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model with naive datetimes (as stored in DB)
        mock_model = MagicMock(spec=PasswordResetTokenModel)
        mock_model.id = token_id
        mock_model.user_id = user_id
        mock_model.token_hash = "convert_token"
        mock_model.expires_at = (now + timedelta(hours=1)).replace(tzinfo=None)
        mock_model.used_at = None
        mock_model.created_at = now.replace(tzinfo=None)

        # Call _to_entity directly
        result = repo._to_entity(mock_model)

        # Verify all fields converted correctly
        assert result.id == token_id
        assert result.user_id == user_id
        assert result.token_hash == "convert_token"
        assert result.used_at is None
        assert result.created_at is not None
        # _to_entity adds UTC timezone to naive datetimes
        assert result.expires_at.tzinfo is not None
        assert result.expires_at > now

    async def test_to_entity_converts_used_at(self) -> None:
        """Test _to_entity correctly converts used_at timestamp."""
        mock_session = AsyncMock()

        repo = PasswordResetTokenRepository(mock_session)

        now = datetime.now(UTC)
        used_time = now - timedelta(minutes=30)

        # Create mock model with used_at set
        mock_model = MagicMock(spec=PasswordResetTokenModel)
        mock_model.id = uuid4()
        mock_model.user_id = uuid4()
        mock_model.token_hash = "used_token"
        mock_model.expires_at = (now + timedelta(hours=1)).replace(tzinfo=None)
        mock_model.used_at = used_time.replace(tzinfo=None)
        mock_model.created_at = now.replace(tzinfo=None)

        result = repo._to_entity(mock_model)

        assert result.used_at is not None

    async def test_to_entity_handles_timezone_aware_datetimes(self) -> None:
        """Test _to_entity handles timezone-aware datetimes from model."""
        mock_session = AsyncMock()

        repo = PasswordResetTokenRepository(mock_session)

        now = datetime.now(UTC)

        # Create mock model with timezone-aware datetimes
        mock_model = MagicMock(spec=PasswordResetTokenModel)
        mock_model.id = uuid4()
        mock_model.user_id = uuid4()
        mock_model.token_hash = "tz_aware_token"
        mock_model.expires_at = now + timedelta(hours=1)
        mock_model.used_at = None
        mock_model.created_at = now

        result = repo._to_entity(mock_model)

        # Should handle without error
        assert result.token_hash == "tz_aware_token"
        assert result.expires_at.tzinfo is not None
        assert result.created_at.tzinfo is not None
