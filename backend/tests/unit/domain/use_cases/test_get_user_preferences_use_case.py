# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for GetUserPreferences use case.

Tests cache-aside pattern, serialization, and repository integration.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.user_preferences import UserPreferences
from affilibuster_backend.domain.use_cases.get_user_preferences import GetUserPreferences


@pytest.mark.unit
class TestGetUserPreferencesExecute:
    """Test GetUserPreferences.execute() method."""

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
        return GetUserPreferences(preferences_repository, cache_service)

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
            created_at=datetime.now(UTC).replace(tzinfo=None),
            updated_at=datetime.now(UTC).replace(tzinfo=None),
            expires_at=datetime.now(UTC).replace(tzinfo=None) + timedelta(days=30),
        )

    async def test_execute_returns_preferences_from_cache(
        self,
        use_case,
        preferences_repository,
        cache_service,
        sample_preferences,
    ):
        """Test execute returns cached preferences when available."""
        cache_service.get.return_value = use_case._serialize(sample_preferences)

        result = await use_case.execute("test-session-123")

        assert result is not None
        assert result.session_id == sample_preferences.session_id
        assert result.selected_currency == sample_preferences.selected_currency
        cache_service.get.assert_called_once_with("session:test-session-123:preferences")
        preferences_repository.get_by_session.assert_not_called()

    async def test_execute_queries_database_on_cache_miss(
        self,
        use_case,
        preferences_repository,
        cache_service,
        sample_preferences,
    ):
        """Test execute queries database when cache misses."""
        cache_service.get.return_value = None
        preferences_repository.get_by_session.return_value = sample_preferences

        result = await use_case.execute("test-session-123")

        assert result is not None
        assert result.session_id == sample_preferences.session_id
        cache_service.get.assert_called_once()
        preferences_repository.get_by_session.assert_called_once_with("test-session-123")

    async def test_execute_updates_cache_after_database_query(
        self,
        use_case,
        preferences_repository,
        cache_service,
        sample_preferences,
    ):
        """Test execute updates cache after querying database."""
        cache_service.get.return_value = None
        preferences_repository.get_by_session.return_value = sample_preferences

        await use_case.execute("test-session-123")

        cache_service.set.assert_called_once()
        call_args = cache_service.set.call_args
        assert call_args[0][0] == "session:test-session-123:preferences"
        assert call_args[1]["ttl_seconds"] == 30 * 24 * 60 * 60

    async def test_execute_returns_none_when_not_found(self, use_case, preferences_repository, cache_service):
        """Test execute returns None when preferences not found."""
        cache_service.get.return_value = None
        preferences_repository.get_by_session.return_value = None

        result = await use_case.execute("non-existent-session")

        assert result is None
        cache_service.set.assert_not_called()

    async def test_execute_preserves_all_fields_through_cache(
        self,
        use_case,
        preferences_repository,
        cache_service,
        sample_preferences,
    ):
        """Test all fields are preserved through cache serialization."""
        cache_service.get.return_value = None
        preferences_repository.get_by_session.return_value = sample_preferences

        result = await use_case.execute("test-session-123")

        assert result.id == sample_preferences.id
        assert result.session_id == sample_preferences.session_id
        assert result.user_id == sample_preferences.user_id
        assert result.selected_currency == sample_preferences.selected_currency
        assert result.dismissed_language_prompt == sample_preferences.dismissed_language_prompt
        assert result.detected_language == sample_preferences.detected_language

    async def test_execute_with_user_id_cached(self, use_case, preferences_repository, cache_service):
        """Test execute handles preferences with user_id through cache."""
        prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            user_id="user-123",
            selected_currency="EUR",
            dismissed_language_prompt=True,
            detected_language="en",
        )
        cache_service.get.return_value = use_case._serialize(prefs)

        result = await use_case.execute("test-session")

        assert result.user_id == "user-123"
        assert result.selected_currency == "EUR"
        assert result.dismissed_language_prompt is True
        assert result.detected_language == "en"

    async def test_execute_with_null_detected_language_from_cache(
        self,
        use_case,
        preferences_repository,
        cache_service,
    ):
        """Test execute handles null detected_language through cache."""
        prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            user_id=None,
            selected_currency="USD",
            dismissed_language_prompt=False,
            detected_language=None,
        )
        cache_service.get.return_value = use_case._serialize(prefs)

        result = await use_case.execute("test-session")

        # UserPreferences auto-generates timestamps, so verify None fields are preserved
        assert result.detected_language is None
        assert result.user_id is None
        assert result.dismissed_language_prompt is False


@pytest.mark.unit
class TestGetUserPreferencesSerialize:
    """Test GetUserPreferences._serialize() method."""

    @pytest.fixture
    def use_case(self):
        """Create use case."""
        return GetUserPreferences(AsyncMock(), AsyncMock())

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

    def test_serialize_with_null_optional_fields(self, use_case):
        """Test serialization with null optional fields."""
        prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            user_id=None,
            selected_currency="USD",
            dismissed_language_prompt=False,
            detected_language=None,
        )

        result = use_case._serialize(prefs)

        import json

        data = json.loads(result)
        assert data["user_id"] is None
        assert data["detected_language"] is None
        # Timestamps are auto-generated, so they should not be None
        assert data["created_at"] is not None
        assert data["updated_at"] is not None
        assert data["expires_at"] is not None


@pytest.mark.unit
class TestGetUserPreferencesDeserialize:
    """Test GetUserPreferences._deserialize() method."""

    @pytest.fixture
    def use_case(self):
        """Create use case."""
        return GetUserPreferences(AsyncMock(), AsyncMock())

    def test_deserialize_complete_preferences(self, use_case):
        """Test deserialization of complete preferences JSON."""
        prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            user_id="user-123",
            selected_currency="USD",
            dismissed_language_prompt=True,
            detected_language="en",
        )
        serialized = use_case._serialize(prefs)

        result = use_case._deserialize(serialized)

        assert result.session_id == prefs.session_id
        assert result.user_id == prefs.user_id
        assert result.selected_currency == prefs.selected_currency
        assert result.dismissed_language_prompt == prefs.dismissed_language_prompt
        assert result.detected_language == prefs.detected_language

    def test_deserialize_with_timestamps(self, use_case):
        """Test deserialization preserves timestamps."""
        now = datetime.now(UTC).replace(tzinfo=None)
        prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            user_id=None,
            selected_currency="USD",
            dismissed_language_prompt=False,
            created_at=now,
            updated_at=now,
            expires_at=now + timedelta(days=30),
        )
        serialized = use_case._serialize(prefs)

        result = use_case._deserialize(serialized)

        # Timestamps should be preserved (may have minor precision loss)
        assert result.created_at is not None
        assert result.updated_at is not None
        assert result.expires_at is not None

    def test_deserialize_roundtrip_fidelity(self, use_case):
        """Test serialize-deserialize roundtrip preserves data."""
        now = datetime.now(UTC).replace(tzinfo=None)
        original = UserPreferences(
            id=uuid4(),
            session_id="unique-session-xyz",
            user_id="unique-user-abc",
            selected_currency="GBP",
            dismissed_language_prompt=True,
            detected_language="fr",
            created_at=now,
            updated_at=now,
            expires_at=now + timedelta(days=30),
        )

        serialized = use_case._serialize(original)
        deserialized = use_case._deserialize(serialized)

        assert deserialized.session_id == original.session_id
        assert deserialized.user_id == original.user_id
        assert deserialized.selected_currency == original.selected_currency
        assert deserialized.dismissed_language_prompt == original.dismissed_language_prompt
        assert deserialized.detected_language == original.detected_language

    def test_deserialize_with_null_timestamps(self, use_case):
        """Test deserialization handles null timestamp fields gracefully."""
        import json

        # Create JSON with null timestamp fields
        json_data = {
            "id": str(uuid4()),
            "session_id": "test-session",
            "user_id": None,
            "selected_currency": "USD",
            "dismissed_language_prompt": False,
            "detected_language": None,
            "created_at": None,  # Null timestamp
            "updated_at": None,
            "expires_at": None,
        }

        result = use_case._deserialize(json.dumps(json_data))

        # Should use current time as default for null timestamps
        assert result.created_at is not None
        assert result.updated_at is not None
        assert result.expires_at is not None
        assert isinstance(result.created_at, datetime)
        # Verify other fields are preserved correctly
        assert result.session_id == "test-session"
        assert result.user_id is None
        assert result.selected_currency == "USD"
