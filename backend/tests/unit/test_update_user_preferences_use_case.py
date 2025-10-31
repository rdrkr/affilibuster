# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for UpdateUserPreferences use case.

Tests cache update, database synchronization, and timestamp management.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from domain.entities.user_preferences import UserPreferences
from domain.use_cases.update_user_preferences import UpdateUserPreferences


class TestUpdateUserPreferencesExecute:
    """Test UpdateUserPreferences.execute() method."""

    @pytest.fixture
    def preferences_repository(self):
        """Create mock preferences' repository."""
        return AsyncMock()

    @pytest.fixture
    def cache_service(self):
        """Create mock cache service."""
        return AsyncMock()

    @pytest.fixture
    def use_case(self, preferences_repository, cache_service):
        """Create use case with mocked dependencies."""
        return UpdateUserPreferences(preferences_repository, cache_service)

    @pytest.fixture
    def sample_preferences(self):
        """Create sample user preferences."""
        return UserPreferences(
            id=uuid4(),
            session_id="test-session-123",
            user_id=None,
            selected_currency="USD",
            dismissed_language_prompt=False,
            detected_language=None,
        )

    async def test_execute_updates_database(self, use_case, preferences_repository, cache_service, sample_preferences):
        """Test execute calls repository.upsert()."""
        preferences_repository.upsert.return_value = sample_preferences

        await use_case.execute(sample_preferences)

        preferences_repository.upsert.assert_called_once()
        call_args = preferences_repository.upsert.call_args[0][0]
        assert call_args.session_id == sample_preferences.session_id

    async def test_execute_updates_cache(self, use_case, preferences_repository, cache_service, sample_preferences):
        """Test execute updates cache with 30-day TTL."""
        preferences_repository.upsert.return_value = sample_preferences

        await use_case.execute(sample_preferences)

        cache_service.set.assert_called_once()
        call_args = cache_service.set.call_args
        assert call_args[0][0] == "session:test-session-123:preferences"
        assert call_args[1]["ttl_seconds"] == 30 * 24 * 60 * 60

    async def test_execute_refreshes_updated_at_timestamp(
        self,
        use_case,
        preferences_repository,
        cache_service,
        sample_preferences,
    ):
        """Test execute updates the updated_at timestamp."""
        before_execute = datetime.now(UTC).replace(tzinfo=None)
        preferences_repository.upsert.return_value = sample_preferences

        await use_case.execute(sample_preferences)

        # The preferences passed to upsert should have updated_at set
        call_args = preferences_repository.upsert.call_args[0][0]
        assert call_args.updated_at is not None
        assert call_args.updated_at >= before_execute

    async def test_execute_refreshes_expires_at_timestamp(
        self,
        use_case,
        preferences_repository,
        cache_service,
        sample_preferences,
    ):
        """Test execute sets expires_at to 30 days from now."""
        before_execute = datetime.now(UTC).replace(tzinfo=None)
        preferences_repository.upsert.return_value = sample_preferences

        await use_case.execute(sample_preferences)

        call_args = preferences_repository.upsert.call_args[0][0]
        expected_expires = before_execute + timedelta(days=30)

        # Allow 1 second tolerance for timing
        assert call_args.expires_at is not None
        assert abs((call_args.expires_at - expected_expires).total_seconds()) < 1

    async def test_execute_returns_updated_preferences(
        self,
        use_case,
        preferences_repository,
        cache_service,
        sample_preferences,
    ):
        """Test execute returns updated preferences from repository."""
        updated_prefs = UserPreferences(
            id=sample_preferences.id,
            session_id=sample_preferences.session_id,
            user_id="user-123",
            selected_currency="EUR",
            dismissed_language_prompt=True,
            detected_language="en",
        )
        preferences_repository.upsert.return_value = updated_prefs

        result = await use_case.execute(sample_preferences)

        assert result.user_id == "user-123"
        assert result.selected_currency == "EUR"
        assert result.dismissed_language_prompt is True

    async def test_execute_preserves_session_id(
        self,
        use_case,
        preferences_repository,
        cache_service,
        sample_preferences,
    ):
        """Test execute preserves session_id in cache key."""
        preferences_repository.upsert.return_value = sample_preferences

        await use_case.execute(sample_preferences)

        call_args = cache_service.set.call_args
        assert call_args[0][0] == "session:test-session-123:preferences"

    async def test_execute_with_user_id_set(self, use_case, preferences_repository, cache_service):
        """Test execute handles preferences with user_id."""
        prefs = UserPreferences(
            id=uuid4(),
            session_id="logged-in-session",
            user_id="user-456",
            selected_currency="JPY",
            dismissed_language_prompt=False,
            detected_language="ja",
        )
        preferences_repository.upsert.return_value = prefs

        result = await use_case.execute(prefs)

        assert result.user_id == "user-456"
        assert result.selected_currency == "JPY"
        call_args = cache_service.set.call_args
        assert call_args[0][0] == "session:logged-in-session:preferences"

    async def test_execute_serializes_for_cache(
        self,
        use_case,
        preferences_repository,
        cache_service,
        sample_preferences,
    ):
        """Test execute serializes preferences for cache storage."""
        preferences_repository.upsert.return_value = sample_preferences

        await use_case.execute(sample_preferences)

        cache_service.set.assert_called_once()
        call_args = cache_service.set.call_args
        serialized = call_args[0][1]
        assert isinstance(serialized, str)

        # Should be valid JSON
        import json

        data = json.loads(serialized)
        assert "session_id" in data
        assert "selected_currency" in data


class TestUpdateUserPreferencesSerialize:
    """Test UpdateUserPreferences._serialize() method."""

    @pytest.fixture
    def use_case(self):
        """Create use case."""
        return UpdateUserPreferences(AsyncMock(), AsyncMock())

    def test_serialize_complete_preferences(self, use_case):
        """Test serialization of complete preferences."""
        now = datetime.now(UTC).replace(tzinfo=None)
        prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            user_id="user-123",
            selected_currency="USD",
            dismissed_language_prompt=True,
            detected_language="en",
            created_at=now,
            updated_at=now,
            expires_at=now + timedelta(days=30),
        )

        result = use_case._serialize(prefs)

        assert isinstance(result, str)
        import json

        data = json.loads(result)
        assert data["session_id"] == "test-session"
        assert data["user_id"] == "user-123"
        assert data["selected_currency"] == "USD"
        assert data["dismissed_language_prompt"] is True
        assert data["detected_language"] == "en"

    def test_serialize_minimal_preferences(self, use_case):
        """Test serialization with minimal required fields."""
        prefs = UserPreferences(
            id=uuid4(),
            session_id="min-session",
            user_id=None,
            selected_currency="USD",
            dismissed_language_prompt=False,
        )

        result = use_case._serialize(prefs)

        import json

        data = json.loads(result)
        assert data["session_id"] == "min-session"
        assert data["user_id"] is None
        assert data["selected_currency"] == "USD"
        assert data["dismissed_language_prompt"] is False

    def test_serialize_includes_all_required_fields(self, use_case):
        """Test serialization includes all required JSON fields."""
        prefs = UserPreferences(
            id=uuid4(),
            session_id="test",
            user_id=None,
            selected_currency="EUR",
            dismissed_language_prompt=False,
        )

        result = use_case._serialize(prefs)

        import json

        data = json.loads(result)
        required_fields = [
            "id",
            "session_id",
            "user_id",
            "selected_currency",
            "dismissed_language_prompt",
            "detected_language",
        ]
        for field in required_fields:
            assert field in data


class TestUpdateUserPreferencesIntegration:
    """Integration tests for UpdateUserPreferences workflow."""

    @pytest.fixture
    def preferences_repository(self):
        """Create mock preferences repository."""
        return AsyncMock()

    @pytest.fixture
    def cache_service(self):
        """Create mock cache service."""
        return AsyncMock()

    @pytest.fixture
    def use_case(self, preferences_repository, cache_service):
        """Create use case with mocked dependencies."""
        return UpdateUserPreferences(preferences_repository, cache_service)

    async def test_currency_change_updates_ttl(self, use_case, preferences_repository, cache_service):
        """Test changing currency updates cache with full TTL."""
        original = UserPreferences(
            id=uuid4(),
            session_id="user-session",
            user_id=None,
            selected_currency="USD",
            dismissed_language_prompt=False,
        )
        updated_prefs = UserPreferences(
            id=original.id,
            session_id=original.session_id,
            user_id=original.user_id,
            selected_currency="EUR",  # Changed
            dismissed_language_prompt=original.dismissed_language_prompt,
        )
        preferences_repository.upsert.return_value = updated_prefs

        result = await use_case.execute(original)

        assert result.selected_currency == "EUR"
        call_args = cache_service.set.call_args
        assert call_args[1]["ttl_seconds"] == 30 * 24 * 60 * 60

    async def test_prompt_dismissal_updates_ttl(self, use_case, preferences_repository, cache_service):
        """Test dismissing language prompt updates cache with full TTL."""
        original = UserPreferences(
            id=uuid4(),
            session_id="user-session",
            user_id=None,
            selected_currency="USD",
            dismissed_language_prompt=False,
        )
        updated_prefs = UserPreferences(
            id=original.id,
            session_id=original.session_id,
            user_id=original.user_id,
            selected_currency=original.selected_currency,
            dismissed_language_prompt=True,  # Changed
        )
        preferences_repository.upsert.return_value = updated_prefs

        result = await use_case.execute(original)

        assert result.dismissed_language_prompt is True
        call_args = cache_service.set.call_args
        assert call_args[1]["ttl_seconds"] == 30 * 24 * 60 * 60
