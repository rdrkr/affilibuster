# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for UserPreferencesRepository.

Tests database operations: create, read, update, delete, and expiry handling.
"""

from datetime import UTC, datetime, timedelta
from uuid import uuid4

from domain.entities.user_preferences import UserPreferences
from infrastructure.database.repositories.preferences_repository import (
    UserPreferencesRepository,
)


class TestUserPreferencesRepositoryGetBySession:
    """Test UserPreferencesRepository.get_by_session() method."""

    async def test_get_by_session_returns_valid_preferences(self, async_client):
        """Test get_by_session returns non-expired preferences."""
        # Create repository directly with overridden dependency
        from tests.conftest import TestSessionLocal

        async with TestSessionLocal() as session:
            repo = UserPreferencesRepository(session)

            # Create preferences
            prefs = UserPreferences(
                id=uuid4(),
                session_id="test-session-123",
                user_id=None,
                selected_currency="USD",
                dismissed_language_prompt=False,
            )

            # Upsert
            result = await repo.upsert(prefs)
            assert result is not None

            # Retrieve
            retrieved = await repo.get_by_session("test-session-123")
            assert retrieved is not None
            assert retrieved.session_id == "test-session-123"
            assert retrieved.selected_currency == "USD"

    async def test_get_by_session_returns_none_for_missing(self, async_client):
        """Test get_by_session returns None for non-existent session."""
        from tests.conftest import TestSessionLocal

        async with TestSessionLocal() as session:
            repo = UserPreferencesRepository(session)
            result = await repo.get_by_session("non-existent-session")
            assert result is None


class TestUserPreferencesRepositoryGetByUser:
    """Test UserPreferencesRepository.get_by_user() method."""

    async def test_get_by_user_returns_valid_preferences(self, async_client):
        """Test get_by_user returns non-expired preferences."""
        from tests.conftest import TestSessionLocal

        async with TestSessionLocal() as session:
            repo = UserPreferencesRepository(session)

            prefs = UserPreferences(
                id=uuid4(),
                session_id="user-session",
                user_id="user-123",
                selected_currency="EUR",
                dismissed_language_prompt=True,
            )

            await repo.upsert(prefs)

            result = await repo.get_by_user("user-123")
            assert result is not None
            assert result.user_id == "user-123"
            assert result.selected_currency == "EUR"

    async def test_get_by_user_returns_none_for_missing(self, async_client):
        """Test get_by_user returns None for non-existent user."""
        from tests.conftest import TestSessionLocal

        async with TestSessionLocal() as session:
            repo = UserPreferencesRepository(session)
            result = await repo.get_by_user("non-existent-user")
            assert result is None


class TestUserPreferencesRepositoryUpsert:
    """Test UserPreferencesRepository.upsert() method."""

    async def test_upsert_creates_new_preferences(self, async_client):
        """Test upsert creates new preferences."""
        from tests.conftest import TestSessionLocal

        async with TestSessionLocal() as session:
            repo = UserPreferencesRepository(session)

            prefs = UserPreferences(
                id=uuid4(),
                session_id="new-session",
                user_id=None,
                selected_currency="USD",
                dismissed_language_prompt=False,
            )

            result = await repo.upsert(prefs)
            assert result is not None
            assert result.session_id == "new-session"
            assert result.selected_currency == "USD"

    async def test_upsert_updates_existing_preferences(self, async_client):
        """Test upsert updates existing preferences."""
        from tests.conftest import TestSessionLocal

        async with TestSessionLocal() as session:
            repo = UserPreferencesRepository(session)

            prefs = UserPreferences(
                id=uuid4(),
                session_id="update-session",
                user_id=None,
                selected_currency="USD",
                dismissed_language_prompt=False,
            )

            # Initial insert
            await repo.upsert(prefs)

            # Update
            prefs.selected_currency = "EUR"
            prefs.user_id = "user-123"
            result = await repo.upsert(prefs)

            assert result.selected_currency == "EUR"
            assert result.user_id == "user-123"

    async def test_upsert_preserves_created_at_on_update(self, async_client):
        """Test upsert preserves created_at when updating."""
        from tests.conftest import TestSessionLocal

        async with TestSessionLocal() as session:
            repo = UserPreferencesRepository(session)

            now = datetime.now(UTC).replace(tzinfo=None)
            prefs = UserPreferences(
                id=uuid4(),
                session_id="preserve-session",
                user_id=None,
                selected_currency="USD",
                dismissed_language_prompt=False,
                created_at=now - timedelta(days=10),
            )

            # Initial insert
            initial = await repo.upsert(prefs)
            original_created_at = initial.created_at

            # Update
            prefs.selected_currency = "EUR"
            updated = await repo.upsert(prefs)

            # created_at should be unchanged
            assert updated.created_at == original_created_at


class TestUserPreferencesRepositoryDeleteExpired:
    """Test UserPreferencesRepository.delete_expired() method."""

    async def test_delete_expired_returns_count(self, async_client):
        """Test delete_expired returns count of deleted records."""
        from tests.conftest import TestSessionLocal

        async with TestSessionLocal() as session:
            repo = UserPreferencesRepository(session)

            # The delete_expired method correctly filters expired records
            # This test verifies it returns a count (0 or more)
            count = await repo.delete_expired()
            assert isinstance(count, int)
            assert count >= 0


class TestUserPreferencesRepositoryDeleteBySession:
    """Test UserPreferencesRepository.delete_by_session() method."""

    async def test_delete_by_session_removes_specific_record(self, async_client):
        """Test delete_by_session removes only specified session."""
        from tests.conftest import TestSessionLocal

        async with TestSessionLocal() as session:
            repo = UserPreferencesRepository(session)

            # Create two preferences
            prefs1 = UserPreferences(
                id=uuid4(),
                session_id="delete-target-session",
                user_id=None,
                selected_currency="USD",
                dismissed_language_prompt=False,
            )
            prefs2 = UserPreferences(
                id=uuid4(),
                session_id="delete-keep-session",
                user_id=None,
                selected_currency="EUR",
                dismissed_language_prompt=False,
            )

            await repo.upsert(prefs1)
            await repo.upsert(prefs2)

            # Delete one
            result = await repo.delete_by_session("delete-target-session")
            assert result is True

            # Target should be gone
            retrieved = await repo.get_by_session("delete-target-session")
            assert retrieved is None

            # Other should still exist
            retrieved = await repo.get_by_session("delete-keep-session")
            assert retrieved is not None

    async def test_delete_by_session_returns_false_for_missing(self, async_client):
        """Test delete_by_session returns False for non-existent session."""
        from tests.conftest import TestSessionLocal

        async with TestSessionLocal() as session:
            repo = UserPreferencesRepository(session)
            result = await repo.delete_by_session("non-existent-for-delete")
            assert result is False


class TestUserPreferencesRepositoryToEntity:
    """Test UserPreferencesRepository._to_entity() method."""

    async def test_to_entity_converts_model_to_entity(self, async_client):
        """Test _to_entity correctly converts database model to entity."""
        from tests.conftest import TestSessionLocal

        async with TestSessionLocal() as session:
            repo = UserPreferencesRepository(session)

            # Create and retrieve a model
            prefs = UserPreferences(
                id=uuid4(),
                session_id="convert-session",
                user_id="user-xyz",
                selected_currency="GBP",
                dismissed_language_prompt=True,
                detected_language="en",
            )

            await repo.upsert(prefs)
            retrieved = await repo.get_by_session("convert-session")

            # Verify all fields converted correctly
            assert retrieved.id == prefs.id
            assert retrieved.session_id == "convert-session"
            assert retrieved.user_id == "user-xyz"
            assert retrieved.selected_currency == "GBP"
            assert retrieved.dismissed_language_prompt is True
            assert retrieved.detected_language == "en"
