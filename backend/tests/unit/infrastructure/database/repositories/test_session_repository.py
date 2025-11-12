# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for SessionRepository.

Tests database operations for session management using mocked sessions.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.user_session import UserSession
from affilibuster_backend.infrastructure.database.models.user_session import UserSessionModel
from affilibuster_backend.infrastructure.database.repositories.session_repository import SessionRepository


@pytest.mark.unit
class TestSessionRepositoryCreate:
    """Test SessionRepository.create() method."""

    async def test_create_new_session(self) -> None:
        """Test creating a new session."""
        mock_session = AsyncMock()

        repo = SessionRepository(mock_session)

        now = datetime.now(UTC)
        session_id = uuid4()
        user_id = uuid4()
        user_session = UserSession(
            id=session_id,
            user_id=user_id,
            token_hash="hashed_token_123",
            expires_at=now + timedelta(days=7),
            remember_me=False,
            created_at=now,
        )

        result = await repo.create(user_session)

        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once()
        assert result.id == session_id
        assert result.user_id == user_id
        assert result.token_hash == "hashed_token_123"
        assert result.remember_me is False

    async def test_create_session_with_remember_me(self) -> None:
        """Test creating a session with remember_me enabled."""
        mock_session = AsyncMock()

        repo = SessionRepository(mock_session)

        now = datetime.now(UTC)
        user_session = UserSession(
            id=uuid4(),
            user_id=uuid4(),
            token_hash="remember_token_456",
            expires_at=now + timedelta(days=30),
            remember_me=True,
            created_at=now,
        )

        result = await repo.create(user_session)

        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        assert result.remember_me is True


@pytest.mark.unit
class TestSessionRepositoryGetById:
    """Test SessionRepository.get_by_id() method."""

    async def test_get_by_id_returns_session(self) -> None:
        """Test retrieving session by ID."""
        mock_session = AsyncMock()

        session_id = uuid4()
        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model
        mock_model = MagicMock(spec=UserSessionModel)
        mock_model.id = session_id
        mock_model.user_id = user_id
        mock_model.token_hash = "hashed_token_456"
        mock_model.expires_at = now + timedelta(days=7)
        mock_model.remember_me = True
        mock_model.created_at = now

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)
        result = await repo.get_by_id(session_id)

        assert result is not None
        assert result.id == session_id
        assert result.token_hash == "hashed_token_456"
        assert result.remember_me is True

    async def test_get_by_id_returns_none_for_missing(self) -> None:
        """Test get_by_id returns None for non-existent session."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)
        result = await repo.get_by_id(uuid4())

        assert result is None


@pytest.mark.unit
class TestSessionRepositoryGetByTokenHash:
    """Test SessionRepository.get_by_token_hash() method."""

    async def test_get_by_token_hash_returns_session(self) -> None:
        """Test retrieving session by token hash."""
        mock_session = AsyncMock()

        session_id = uuid4()
        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model
        mock_model = MagicMock(spec=UserSessionModel)
        mock_model.id = session_id
        mock_model.user_id = user_id
        mock_model.token_hash = "unique_token_hash_789"
        mock_model.expires_at = now + timedelta(days=7)
        mock_model.remember_me = False
        mock_model.created_at = now

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)
        result = await repo.get_by_token_hash("unique_token_hash_789")

        assert result is not None
        assert result.token_hash == "unique_token_hash_789"

    async def test_get_by_token_hash_returns_none_for_missing(self) -> None:
        """Test get_by_token_hash returns None for non-existent token."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)
        result = await repo.get_by_token_hash("nonexistent_token")

        assert result is None


@pytest.mark.unit
class TestSessionRepositoryGetActiveSessionsByUserId:
    """Test SessionRepository.get_active_sessions_by_user_id() method."""

    async def test_get_active_sessions_returns_active_sessions(self) -> None:
        """Test retrieving only active (non-expired) sessions for a user."""
        mock_session = AsyncMock()

        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock models for active sessions
        mock_model1 = MagicMock(spec=UserSessionModel)
        mock_model1.id = uuid4()
        mock_model1.user_id = user_id
        mock_model1.token_hash = "active_token_1"
        mock_model1.expires_at = now + timedelta(days=7)
        mock_model1.remember_me = False
        mock_model1.created_at = now

        mock_model2 = MagicMock(spec=UserSessionModel)
        mock_model2.id = uuid4()
        mock_model2.user_id = user_id
        mock_model2.token_hash = "active_token_2"
        mock_model2.expires_at = now + timedelta(days=14)
        mock_model2.remember_me = True
        mock_model2.created_at = now

        # Mock the execute result
        mock_result = MagicMock()
        mock_scalars = MagicMock()
        mock_scalars.all.return_value = [mock_model1, mock_model2]
        mock_result.scalars.return_value = mock_scalars
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)
        results = await repo.get_active_sessions_by_user_id(user_id)

        assert len(results) == 2
        token_hashes = {r.token_hash for r in results}
        assert "active_token_1" in token_hashes
        assert "active_token_2" in token_hashes

    async def test_get_active_sessions_returns_empty_for_no_active(self) -> None:
        """Test get_active_sessions returns empty list when no active sessions."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_scalars = MagicMock()
        mock_scalars.all.return_value = []
        mock_result.scalars.return_value = mock_scalars
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)
        results = await repo.get_active_sessions_by_user_id(uuid4())

        assert results == []


@pytest.mark.unit
class TestSessionRepositoryUpdate:
    """Test SessionRepository.update() method."""

    async def test_update_existing_session(self) -> None:
        """Test updating an existing session."""
        mock_session = AsyncMock()

        session_id = uuid4()
        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model for the existing session
        mock_model = MagicMock(spec=UserSessionModel)
        mock_model.id = session_id
        mock_model.user_id = user_id
        mock_model.token_hash = "original_token"
        mock_model.expires_at = now + timedelta(days=30)
        mock_model.remember_me = True
        mock_model.created_at = now

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)

        # Create updated session entity
        updated_session = UserSession(
            id=session_id,
            user_id=user_id,
            token_hash="original_token",
            expires_at=now + timedelta(days=30),
            remember_me=True,
            created_at=now,
        )

        result = await repo.update(updated_session)

        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once()
        assert result.remember_me is True

    async def test_update_nonexistent_session_raises_error(self) -> None:
        """Test updating non-existent session raises ValueError."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)

        now = datetime.now(UTC)
        user_session = UserSession(
            id=uuid4(),
            user_id=uuid4(),
            token_hash="nonexistent_token",
            expires_at=now + timedelta(days=7),
            remember_me=False,
            created_at=now,
        )

        with pytest.raises(ValueError, match="does not exist"):
            await repo.update(user_session)


@pytest.mark.unit
class TestSessionRepositoryDelete:
    """Test SessionRepository.delete() method."""

    async def test_delete_existing_session(self) -> None:
        """Test deleting an existing session."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 1
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)

        session_id = uuid4()
        await repo.delete(session_id)

        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()

    async def test_delete_nonexistent_session_raises_error(self) -> None:
        """Test deleting non-existent session raises ValueError."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)

        with pytest.raises(ValueError, match="does not exist"):
            await repo.delete(uuid4())


@pytest.mark.unit
class TestSessionRepositoryDeleteAllByUserId:
    """Test SessionRepository.delete_all_by_user_id() method."""

    async def test_delete_all_by_user_id_removes_all_user_sessions(self) -> None:
        """Test deleting all sessions for a specific user."""
        mock_session = AsyncMock()

        repo = SessionRepository(mock_session)

        user_id = uuid4()
        await repo.delete_all_by_user_id(user_id)

        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()


@pytest.mark.unit
class TestSessionRepositoryDeleteExpiredSessions:
    """Test SessionRepository.delete_expired_sessions() method."""

    async def test_delete_expired_sessions_returns_count(self) -> None:
        """Test delete_expired_sessions returns correct count."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 5
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)
        count = await repo.delete_expired_sessions()

        assert count == 5
        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()

    async def test_delete_expired_sessions_returns_zero_when_none_expired(self) -> None:
        """Test delete_expired_sessions returns 0 when no sessions expired."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)
        count = await repo.delete_expired_sessions()

        assert count == 0
        assert isinstance(count, int)

    async def test_delete_expired_sessions_handles_none_rowcount(self) -> None:
        """Test delete_expired_sessions handles None rowcount gracefully."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = None
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)
        count = await repo.delete_expired_sessions()

        assert count == 0


@pytest.mark.unit
class TestSessionRepositoryToEntity:
    """Test SessionRepository._to_entity() method."""

    async def test_to_entity_converts_model_to_entity(self) -> None:
        """Test _to_entity correctly converts database model to entity."""
        mock_session = AsyncMock()

        repo = SessionRepository(mock_session)

        session_id = uuid4()
        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model with naive datetimes (as stored in DB)
        mock_model = MagicMock(spec=UserSessionModel)
        mock_model.id = session_id
        mock_model.user_id = user_id
        mock_model.token_hash = "convert_token"
        mock_model.expires_at = (now + timedelta(days=30)).replace(tzinfo=None)
        mock_model.remember_me = True
        mock_model.created_at = now.replace(tzinfo=None)

        # Call _to_entity directly
        result = repo._to_entity(mock_model)

        assert result.id == session_id
        assert result.user_id == user_id
        assert result.token_hash == "convert_token"
        assert result.remember_me is True
        assert result.created_at is not None
        assert result.expires_at is not None
        # Verify datetimes are timezone-aware
        assert result.created_at.tzinfo is not None
        assert result.expires_at.tzinfo is not None

    async def test_to_entity_handles_timezone_aware_datetimes(self) -> None:
        """Test _to_entity handles already timezone-aware datetimes."""
        mock_session = AsyncMock()

        repo = SessionRepository(mock_session)

        session_id = uuid4()
        user_id = uuid4()
        now = datetime.now(UTC)

        # Create mock model with timezone-aware datetimes
        mock_model = MagicMock(spec=UserSessionModel)
        mock_model.id = session_id
        mock_model.user_id = user_id
        mock_model.token_hash = "tz_aware_token"
        mock_model.expires_at = now + timedelta(days=30)
        mock_model.remember_me = False
        mock_model.created_at = now

        result = repo._to_entity(mock_model)

        assert result.expires_at.tzinfo is not None
        assert result.created_at.tzinfo is not None


@pytest.mark.unit
class TestSessionRepositoryEdgeCases:
    """Test SessionRepository edge cases and error handling."""

    async def test_get_by_id_verifies_execute_called(self) -> None:
        """Test that get_by_id calls execute on the session."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)
        await repo.get_by_id(uuid4())

        mock_session.execute.assert_called_once()

    async def test_get_by_token_hash_verifies_execute_called(self) -> None:
        """Test that get_by_token_hash calls execute on the session."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)
        await repo.get_by_token_hash("test_token")

        mock_session.execute.assert_called_once()

    async def test_get_active_sessions_verifies_execute_called(self) -> None:
        """Test that get_active_sessions_by_user_id calls execute on the session."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_scalars = MagicMock()
        mock_scalars.all.return_value = []
        mock_result.scalars.return_value = mock_scalars
        mock_session.execute.return_value = mock_result

        repo = SessionRepository(mock_session)
        await repo.get_active_sessions_by_user_id(uuid4())

        mock_session.execute.assert_called_once()
