# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for UserPreferencesRepository.

Tests database operations: create, read, update, delete, and expiry handling using mocked sessions.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.generated.models import (
    CurrencyCode,
    LanguageCode,
    UserPreferences,
)
from affilibuster_backend.infrastructure.database.models.user_preferences import UserPreferencesModel
from affilibuster_backend.infrastructure.database.repositories.preferences_repository import (
    UserPreferencesRepository,
)


@pytest.mark.unit
class TestUserPreferencesRepositoryGetBySession:
    """Test UserPreferencesRepository.get_by_session() method."""

    async def test_get_by_session_returns_valid_preferences(self) -> None:
        """Test get_by_session returns non-expired preferences."""
        mock_session = AsyncMock()

        # Create mock model
        mock_model = MagicMock(spec=UserPreferencesModel)
        mock_model.id = uuid4()
        mock_model.session_id = "test-session-123"
        mock_model.user_id = None
        mock_model.selected_currency = CurrencyCode.USD
        mock_model.dismissed_language_prompt = False
        mock_model.detected_language = None
        mock_model.created_at = datetime.now(UTC).replace(tzinfo=None)
        mock_model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        mock_model.expires_at = datetime.now(UTC).replace(tzinfo=None) + timedelta(days=30)

        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)
        retrieved = await repo.get_by_session("test-session-123")

        assert retrieved is not None
        assert retrieved.session_id == "test-session-123"
        assert retrieved.selected_currency == CurrencyCode.USD
        mock_session.execute.assert_called_once()

    async def test_get_by_session_returns_none_for_missing(self) -> None:
        """Test get_by_session returns None for non-existent session."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)
        result = await repo.get_by_session("non-existent-session")

        assert result is None
        mock_session.execute.assert_called_once()


@pytest.mark.unit
class TestUserPreferencesRepositoryGetByUser:
    """Test UserPreferencesRepository.get_by_user() method."""

    async def test_get_by_user_returns_valid_preferences(self) -> None:
        """Test get_by_user returns non-expired preferences."""
        mock_session = AsyncMock()

        # Create mock model
        mock_model = MagicMock(spec=UserPreferencesModel)
        mock_model.id = uuid4()
        mock_model.session_id = "user-session"
        mock_model.user_id = "user-123"
        mock_model.selected_currency = CurrencyCode.EUR
        mock_model.dismissed_language_prompt = True
        mock_model.detected_language = None
        mock_model.created_at = datetime.now(UTC).replace(tzinfo=None)
        mock_model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        mock_model.expires_at = datetime.now(UTC).replace(tzinfo=None) + timedelta(days=30)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)
        result = await repo.get_by_user("user-123")

        assert result is not None
        assert result.user_id == "user-123"
        assert result.selected_currency == CurrencyCode.EUR
        mock_session.execute.assert_called_once()

    async def test_get_by_user_returns_none_for_missing(self) -> None:
        """Test get_by_user returns None for non-existent user."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)
        result = await repo.get_by_user("non-existent-user")

        assert result is None
        mock_session.execute.assert_called_once()


@pytest.mark.unit
class TestUserPreferencesRepositoryUpsert:
    """Test UserPreferencesRepository.upsert() method."""

    async def test_upsert_creates_new_preferences(self) -> None:
        """Test upsert creates new preferences when none exists."""
        mock_session = AsyncMock()

        # First call returns None (no existing record)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)

        prefs = UserPreferences(
            id=uuid4(),
            session_id="new-session",
            user_id=None,
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
        )

        result = await repo.upsert(prefs)

        assert result.session_id == "new-session"
        assert result.selected_currency == CurrencyCode.USD
        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()

    async def test_upsert_updates_existing_preferences(self) -> None:
        """Test upsert updates existing preferences."""
        mock_session = AsyncMock()

        # Create mock existing model
        existing_model = MagicMock(spec=UserPreferencesModel)
        existing_model.id = uuid4()
        existing_model.session_id = "update-session"
        existing_model.user_id = None
        existing_model.selected_currency = CurrencyCode.USD
        existing_model.dismissed_language_prompt = False
        existing_model.detected_language = None
        existing_model.created_at = datetime.now(UTC).replace(tzinfo=None) - timedelta(days=1)
        existing_model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        existing_model.expires_at = datetime.now(UTC).replace(tzinfo=None) + timedelta(days=29)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = existing_model
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)

        prefs = UserPreferences(
            id=uuid4(),
            session_id="update-session",
            user_id="user-123",
            selected_currency=CurrencyCode.EUR,
            dismissed_language_prompt=True,
        )

        await repo.upsert(prefs)

        # Verify the existing model was updated
        assert existing_model.selected_currency == CurrencyCode.EUR
        assert existing_model.user_id == "user-123"
        assert existing_model.dismissed_language_prompt is True
        mock_session.commit.assert_called_once()
        # add should NOT be called when updating
        mock_session.add.assert_not_called()

    async def test_upsert_preserves_created_at_on_update(self) -> None:
        """Test upsert preserves created_at when updating."""
        mock_session = AsyncMock()

        # Create mock existing model with old created_at
        original_created_at = datetime.now(UTC).replace(tzinfo=None) - timedelta(days=10)
        existing_model = MagicMock(spec=UserPreferencesModel)
        existing_model.id = uuid4()
        existing_model.session_id = "preserve-session"
        existing_model.user_id = None
        existing_model.selected_currency = CurrencyCode.USD
        existing_model.dismissed_language_prompt = False
        existing_model.detected_language = None
        existing_model.created_at = original_created_at
        existing_model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        existing_model.expires_at = datetime.now(UTC).replace(tzinfo=None) + timedelta(days=20)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = existing_model
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)

        prefs = UserPreferences(
            id=uuid4(),
            session_id="preserve-session",
            user_id=None,
            selected_currency=CurrencyCode.EUR,
            dismissed_language_prompt=False,
        )

        await repo.upsert(prefs)

        # created_at should be unchanged on the existing model
        assert existing_model.created_at == original_created_at
        mock_session.commit.assert_called_once()


@pytest.mark.unit
class TestUserPreferencesRepositoryDeleteExpired:
    """Test UserPreferencesRepository.delete_expired() method."""

    async def test_delete_expired_returns_count(self) -> None:
        """Test delete_expired returns count of deleted records."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 3
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)
        count = await repo.delete_expired()

        assert isinstance(count, int)
        assert count == 3
        mock_session.execute.assert_called_once()
        mock_session.flush.assert_called_once()

    async def test_delete_expired_returns_zero_when_none_expired(self) -> None:
        """Test delete_expired returns 0 when no records are expired."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)
        count = await repo.delete_expired()

        assert count == 0
        mock_session.execute.assert_called_once()


@pytest.mark.unit
class TestUserPreferencesRepositoryDeleteBySession:
    """Test UserPreferencesRepository.delete_by_session() method."""

    async def test_delete_by_session_returns_true_when_deleted(self) -> None:
        """Test delete_by_session returns True when record is deleted."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 1
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)
        result = await repo.delete_by_session("delete-target-session")

        assert result is True
        mock_session.execute.assert_called_once()
        mock_session.flush.assert_called_once()

    async def test_delete_by_session_returns_false_for_missing(self) -> None:
        """Test delete_by_session returns False for non-existent session."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)
        result = await repo.delete_by_session("non-existent-for-delete")

        assert result is False
        mock_session.execute.assert_called_once()


@pytest.mark.unit
class TestUserPreferencesRepositoryToEntity:
    """Test UserPreferencesRepository._to_entity() method."""

    async def test_to_entity_converts_model_to_entity(self) -> None:
        """Test _to_entity correctly converts database model to entity."""
        mock_session = AsyncMock()

        # Create mock model with all fields
        test_id = uuid4()
        mock_model = MagicMock(spec=UserPreferencesModel)
        mock_model.id = test_id
        mock_model.session_id = "convert-session"
        mock_model.user_id = "user-xyz"
        mock_model.selected_currency = CurrencyCode.GBP
        mock_model.dismissed_language_prompt = True
        mock_model.detected_language = LanguageCode.EN
        mock_model.created_at = datetime.now(UTC).replace(tzinfo=None)
        mock_model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        mock_model.expires_at = datetime.now(UTC).replace(tzinfo=None) + timedelta(days=30)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)
        retrieved = await repo.get_by_session("convert-session")

        # Verify all fields converted correctly
        assert retrieved is not None
        assert retrieved.id == test_id
        assert retrieved.session_id == "convert-session"
        assert retrieved.user_id == "user-xyz"
        assert retrieved.selected_currency == CurrencyCode.GBP
        assert retrieved.dismissed_language_prompt is True
        assert retrieved.detected_language == LanguageCode.EN


@pytest.mark.unit
class TestUserPreferencesRepositoryEdgeCases:
    """Test UserPreferencesRepository edge cases and timezone handling."""

    async def test_to_entity_handles_naive_datetime(self) -> None:
        """Test _to_entity correctly handles naive datetimes from SQLite."""
        mock_session = AsyncMock()

        # Create mock model with naive datetimes (no timezone info)
        mock_model = MagicMock(spec=UserPreferencesModel)
        mock_model.id = uuid4()
        mock_model.session_id = "naive-dt-session"
        mock_model.user_id = None
        mock_model.selected_currency = CurrencyCode.USD
        mock_model.dismissed_language_prompt = False
        mock_model.detected_language = None
        # Use naive datetimes (without timezone) to test timezone conversion in _to_entity
        # The repository's _to_entity should add UTC timezone to these naive datetimes
        naive_created = datetime.strptime("2025-01-01 12:00:00", "%Y-%m-%d %H:%M:%S")
        naive_updated = datetime.strptime("2025-01-02 12:00:00", "%Y-%m-%d %H:%M:%S")
        naive_expires = datetime.strptime("2025-02-01 12:00:00", "%Y-%m-%d %H:%M:%S")
        mock_model.created_at = naive_created
        mock_model.updated_at = naive_updated
        mock_model.expires_at = naive_expires

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_model
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)
        result = await repo.get_by_session("naive-dt-session")

        # Verify datetimes are now timezone-aware
        assert result is not None
        assert result.created_at is not None
        assert result.updated_at is not None
        assert result.expires_at is not None
        assert result.created_at.tzinfo is not None
        assert result.updated_at.tzinfo is not None
        assert result.expires_at.tzinfo is not None

    async def test_upsert_handles_none_timestamps(self) -> None:
        """Test upsert handles None timestamps by using defaults."""
        mock_session = AsyncMock()

        # No existing record
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)

        # Create preferences with no timestamps
        prefs = UserPreferences(
            id=uuid4(),
            session_id="no-timestamps",
            user_id=None,
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
            created_at=None,
            updated_at=None,
            expires_at=None,
        )

        result = await repo.upsert(prefs)

        # Should have set default timestamps
        assert result is not None
        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()

    async def test_delete_expired_handles_none_rowcount(self) -> None:
        """Test delete_expired handles None rowcount gracefully."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = None
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)
        count = await repo.delete_expired()

        # Should return 0 when rowcount is None
        assert count == 0

    async def test_upsert_with_all_optional_fields(self) -> None:
        """Test upsert with all optional fields populated."""
        mock_session = AsyncMock()

        # No existing record
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)

        now = datetime.now(UTC)
        prefs = UserPreferences(
            id=uuid4(),
            session_id="full-session",
            user_id="full-user",
            selected_currency=CurrencyCode.ILS,
            dismissed_language_prompt=True,
            detected_language=LanguageCode.HE,
            created_at=now - timedelta(days=5),
            updated_at=now,
            expires_at=now + timedelta(days=25),
        )

        result = await repo.upsert(prefs)

        assert result is not None
        assert result.session_id == "full-session"
        assert result.user_id == "full-user"
        assert result.selected_currency == CurrencyCode.ILS
        assert result.detected_language == LanguageCode.HE
        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()


@pytest.mark.unit
class TestUserPreferencesRepositoryDeleteByUserId:
    """Test UserPreferencesRepository.delete_by_user_id() method."""

    async def test_delete_by_user_id_returns_count(self) -> None:
        """Test delete_by_user_id returns count of deleted records."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 2
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)
        count = await repo.delete_by_user_id("user-123")

        assert isinstance(count, int)
        assert count == 2
        mock_session.execute.assert_called_once()
        mock_session.flush.assert_called_once()

    async def test_delete_by_user_id_returns_zero_when_none(self) -> None:
        """Test delete_by_user_id returns 0 when no records found."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)
        count = await repo.delete_by_user_id("non-existent-user")

        assert count == 0
        mock_session.execute.assert_called_once()

    async def test_delete_by_user_id_handles_none_rowcount(self) -> None:
        """Test delete_by_user_id handles None rowcount gracefully."""
        mock_session = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = None
        mock_session.execute.return_value = mock_result

        repo = UserPreferencesRepository(mock_session)
        count = await repo.delete_by_user_id("user-xyz")

        assert count == 0
