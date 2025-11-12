# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for EmailVerificationTokenRepository.

Tests database operations for email verification tokens using mocked sessions.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.email_verification_token import EmailVerificationToken
from affilibuster_backend.infrastructure.database.models.email_verification_token import (
    EmailVerificationTokenModel,
)
from affilibuster_backend.infrastructure.database.repositories.email_verification_token_repository import (
    EmailVerificationTokenRepository,
)


@pytest.mark.unit
class TestEmailVerificationTokenRepositoryCreate:
    """Test EmailVerificationTokenRepository.create() method."""

    async def test_create_new_token(self) -> None:
        """Test creating a new email verification token."""
        mock_session = AsyncMock()

        repo = EmailVerificationTokenRepository(mock_session)

        now = datetime.now(UTC)
        token = EmailVerificationToken(
            id=uuid4(),
            user_id=uuid4(),
            token_hash="hashed_verification_token_123",
            expires_at=now + timedelta(hours=24),
            used_at=None,
            created_at=now,
        )

        result = await repo.create(token)

        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once()
        assert result.id == token.id
        assert result.user_id == token.user_id
        assert result.token_hash == "hashed_verification_token_123"
        assert result.used_at is None

    async def test_create_token_with_used_at(self) -> None:
        """Test creating a token with used_at set."""
        mock_session = AsyncMock()

        repo = EmailVerificationTokenRepository(mock_session)

        now = datetime.now(UTC)
        token = EmailVerificationToken(
            id=uuid4(),
            user_id=uuid4(),
            token_hash="used_token_hash",
            expires_at=now + timedelta(hours=24),
            used_at=now - timedelta(hours=1),
            created_at=now - timedelta(hours=2),
        )

        result = await repo.create(token)

        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        assert result.id == token.id
        assert result.used_at is not None


@pytest.mark.unit
class TestEmailVerificationTokenRepositoryGetById:
    """Test EmailVerificationTokenRepository.get_by_id() method."""

    async def test_get_by_id_returns_token(self) -> None:
        """Test retrieving token by ID."""
        mock_session = AsyncMock()

        token_id = uuid4()
        user_id = uuid4()
        now = datetime.now(UTC).replace(tzinfo=None)

        # Create mock model
        mock_model = MagicMock(spec=EmailVerificationTokenModel)
        mock_model.id = token_id
        mock_model.user_id = user_id
        mock_model.token_hash = "hashed_token_456"
        mock_model.expires_at = now + timedelta(hours=24)
        mock_model.used_at = None
        mock_model.created_at = now

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = EmailVerificationTokenRepository(mock_session)
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

        repo = EmailVerificationTokenRepository(mock_session)
        result = await repo.get_by_id(uuid4())

        assert result is None


@pytest.mark.unit
class TestEmailVerificationTokenRepositoryGetByTokenHash:
    """Test EmailVerificationTokenRepository.get_by_token_hash() method."""

    async def test_get_by_token_hash_returns_token(self) -> None:
        """Test retrieving token by token hash."""
        mock_session = AsyncMock()

        now = datetime.now(UTC).replace(tzinfo=None)

        # Create mock model
        mock_model = MagicMock(spec=EmailVerificationTokenModel)
        mock_model.id = uuid4()
        mock_model.user_id = uuid4()
        mock_model.token_hash = "unique_hash_789"
        mock_model.expires_at = now + timedelta(hours=24)
        mock_model.used_at = None
        mock_model.created_at = now

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = EmailVerificationTokenRepository(mock_session)
        result = await repo.get_by_token_hash("unique_hash_789")

        assert result is not None
        assert result.token_hash == "unique_hash_789"
        mock_session.execute.assert_called_once()

    async def test_get_by_token_hash_returns_none_for_missing(self) -> None:
        """Test get_by_token_hash returns None for non-existent token."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = EmailVerificationTokenRepository(mock_session)
        result = await repo.get_by_token_hash("nonexistent_hash")

        assert result is None


@pytest.mark.unit
class TestEmailVerificationTokenRepositoryGetValidTokenByUserId:
    """Test EmailVerificationTokenRepository.get_valid_token_by_user_id() method."""

    async def test_get_valid_token_returns_token(self) -> None:
        """Test retrieving valid (unused, unexpired) token for a user."""
        mock_session = AsyncMock()

        user_id = uuid4()
        now = datetime.now(UTC).replace(tzinfo=None)

        # Create mock model for valid token
        mock_model = MagicMock(spec=EmailVerificationTokenModel)
        mock_model.id = uuid4()
        mock_model.user_id = user_id
        mock_model.token_hash = "valid_token"
        mock_model.expires_at = now + timedelta(hours=24)
        mock_model.used_at = None
        mock_model.created_at = now

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = EmailVerificationTokenRepository(mock_session)
        result = await repo.get_valid_token_by_user_id(user_id)

        assert result is not None
        assert result.token_hash == "valid_token"
        mock_session.execute.assert_called_once()

    async def test_get_valid_token_returns_none_for_no_valid(self) -> None:
        """Test get_valid_token returns None when no valid tokens exist."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = EmailVerificationTokenRepository(mock_session)
        result = await repo.get_valid_token_by_user_id(uuid4())

        assert result is None


@pytest.mark.unit
class TestEmailVerificationTokenRepositoryUpdate:
    """Test EmailVerificationTokenRepository.update() method."""

    async def test_update_existing_token(self) -> None:
        """Test updating an existing token."""
        mock_session = AsyncMock()

        token_id = uuid4()
        user_id = uuid4()
        now = datetime.now(UTC)
        now_naive = now.replace(tzinfo=None)

        # Create mock model that will be returned by execute
        mock_model = MagicMock(spec=EmailVerificationTokenModel)
        mock_model.id = token_id
        mock_model.user_id = user_id
        mock_model.token_hash = "update_token"
        mock_model.expires_at = now_naive + timedelta(hours=24)
        mock_model.used_at = now_naive
        mock_model.created_at = now_naive

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = EmailVerificationTokenRepository(mock_session)

        # Create entity with used_at set
        token = EmailVerificationToken(
            id=token_id,
            user_id=user_id,
            token_hash="update_token",
            expires_at=now + timedelta(hours=24),
            used_at=now,
            created_at=now,
        )

        result = await repo.update(token)

        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once()
        assert result.used_at is not None

    async def test_update_nonexistent_token_raises_error(self) -> None:
        """Test updating non-existent token raises ValueError."""
        mock_session = AsyncMock()

        # Mock execute to return None (token not found)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = EmailVerificationTokenRepository(mock_session)

        now = datetime.now(UTC)
        token = EmailVerificationToken(
            id=uuid4(),
            user_id=uuid4(),
            token_hash="nonexistent_token",
            expires_at=now + timedelta(hours=24),
            used_at=None,
            created_at=now,
        )

        with pytest.raises(ValueError, match="does not exist"):
            await repo.update(token)


@pytest.mark.unit
class TestEmailVerificationTokenRepositoryDelete:
    """Test EmailVerificationTokenRepository.delete() method."""

    async def test_delete_existing_token(self) -> None:
        """Test deleting an existing token."""
        mock_session = AsyncMock()

        # Mock execute to return rowcount of 1 (one row deleted)
        mock_result = MagicMock()
        mock_result.rowcount = 1
        mock_session.execute.return_value = mock_result

        repo = EmailVerificationTokenRepository(mock_session)

        # Delete token - should not raise
        await repo.delete(uuid4())

        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()

    async def test_delete_nonexistent_token_raises_error(self) -> None:
        """Test deleting non-existent token raises ValueError."""
        mock_session = AsyncMock()

        # Mock execute to return rowcount of 0 (no rows deleted)
        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        repo = EmailVerificationTokenRepository(mock_session)

        with pytest.raises(ValueError, match="does not exist"):
            await repo.delete(uuid4())


@pytest.mark.unit
class TestEmailVerificationTokenRepositoryDeleteAllByUserId:
    """Test EmailVerificationTokenRepository.delete_all_by_user_id() method."""

    async def test_delete_all_by_user_id_executes_delete(self) -> None:
        """Test deleting all tokens for a specific user."""
        mock_session = AsyncMock()

        # Mock execute result
        mock_result = MagicMock()
        mock_result.rowcount = 2
        mock_session.execute.return_value = mock_result

        repo = EmailVerificationTokenRepository(mock_session)

        # Delete all tokens for user
        await repo.delete_all_by_user_id(uuid4())

        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()

    async def test_delete_all_by_user_id_handles_no_tokens(self) -> None:
        """Test delete_all_by_user_id works when user has no tokens."""
        mock_session = AsyncMock()

        # Mock execute result with 0 rows affected
        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        repo = EmailVerificationTokenRepository(mock_session)

        # Should not raise even if no tokens exist
        await repo.delete_all_by_user_id(uuid4())

        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()


@pytest.mark.unit
class TestEmailVerificationTokenRepositoryDeleteExpiredTokens:
    """Test EmailVerificationTokenRepository.delete_expired_tokens() method."""

    async def test_delete_expired_tokens_returns_count(self) -> None:
        """Test delete_expired_tokens returns correct count."""
        mock_session = AsyncMock()

        # Mock execute result with 3 rows affected
        mock_result = MagicMock()
        mock_result.rowcount = 3
        mock_session.execute.return_value = mock_result

        repo = EmailVerificationTokenRepository(mock_session)

        count = await repo.delete_expired_tokens()

        assert count == 3
        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()

    async def test_delete_expired_tokens_returns_zero_when_none_expired(self) -> None:
        """Test delete_expired_tokens returns 0 when no tokens are expired."""
        mock_session = AsyncMock()

        # Mock execute result with 0 rows affected
        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        repo = EmailVerificationTokenRepository(mock_session)

        count = await repo.delete_expired_tokens()

        assert count == 0
        assert isinstance(count, int)

    async def test_delete_expired_tokens_handles_none_rowcount(self) -> None:
        """Test delete_expired_tokens handles None rowcount gracefully."""
        mock_session = AsyncMock()

        # Mock execute result with None rowcount
        mock_result = MagicMock()
        mock_result.rowcount = None
        mock_session.execute.return_value = mock_result

        repo = EmailVerificationTokenRepository(mock_session)

        count = await repo.delete_expired_tokens()

        assert count == 0


@pytest.mark.unit
class TestEmailVerificationTokenRepositoryToEntity:
    """Test EmailVerificationTokenRepository._to_entity() method."""

    async def test_to_entity_converts_model_to_entity(self) -> None:
        """Test _to_entity correctly converts database model to entity."""
        mock_session = AsyncMock()

        repo = EmailVerificationTokenRepository(mock_session)

        token_id = uuid4()
        user_id = uuid4()
        now_naive = datetime.now(UTC).replace(tzinfo=None)

        # Create mock model
        mock_model = MagicMock(spec=EmailVerificationTokenModel)
        mock_model.id = token_id
        mock_model.user_id = user_id
        mock_model.token_hash = "convert_token"
        mock_model.expires_at = now_naive + timedelta(hours=24)
        mock_model.used_at = None
        mock_model.created_at = now_naive

        # Call _to_entity directly
        result = repo._to_entity(mock_model)

        # Verify all fields converted correctly
        assert result.id == token_id
        assert result.user_id == user_id
        assert result.token_hash == "convert_token"
        assert result.used_at is None
        assert result.created_at is not None
        assert result.expires_at > datetime.now(UTC)

    async def test_to_entity_handles_used_at(self) -> None:
        """Test _to_entity correctly converts model with used_at set."""
        mock_session = AsyncMock()

        repo = EmailVerificationTokenRepository(mock_session)

        token_id = uuid4()
        user_id = uuid4()
        now_naive = datetime.now(UTC).replace(tzinfo=None)

        # Create mock model with used_at
        mock_model = MagicMock(spec=EmailVerificationTokenModel)
        mock_model.id = token_id
        mock_model.user_id = user_id
        mock_model.token_hash = "used_token"
        mock_model.expires_at = now_naive + timedelta(hours=24)
        mock_model.used_at = now_naive - timedelta(hours=1)
        mock_model.created_at = now_naive - timedelta(hours=2)

        # Call _to_entity directly
        result = repo._to_entity(mock_model)

        # Verify used_at is converted
        assert result.used_at is not None

    async def test_to_entity_handles_timezone_aware_datetimes(self) -> None:
        """Test _to_entity handles datetimes with tzinfo already set."""
        mock_session = AsyncMock()

        repo = EmailVerificationTokenRepository(mock_session)

        token_id = uuid4()
        user_id = uuid4()
        now_aware = datetime.now(UTC)

        # Create mock model with timezone-aware datetimes
        mock_model = MagicMock(spec=EmailVerificationTokenModel)
        mock_model.id = token_id
        mock_model.user_id = user_id
        mock_model.token_hash = "aware_token"
        mock_model.expires_at = now_aware + timedelta(hours=24)
        mock_model.used_at = None
        mock_model.created_at = now_aware

        # Call _to_entity directly
        result = repo._to_entity(mock_model)

        # Verify datetimes are timezone-aware
        assert result.created_at.tzinfo is not None
        assert result.expires_at.tzinfo is not None
