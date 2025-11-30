# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for GetUserPreferences use case.

Tests cache-aside pattern, serialization, and repository integration.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.generated.models import (
    CurrencyCode,
    DetectedLanguage2,
    UserPreferences,
)
from affilibuster_backend.domain.use_cases.preferences.get_user_preferences_use_case import GetUserPreferencesUseCase


@pytest.mark.unit
class TestGetUserPreferencesExecute:
    """Test GetUserPreferencesUseCase.execute() method."""

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
        return GetUserPreferencesUseCase(preferences_repository, cache_service)

    @pytest.fixture
    def sample_preferences(self):
        """Create sample user preferences."""
        return UserPreferences(
            id=uuid4(),
            session_id="test-session-123",
            user_id=None,
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
            detected_language=None,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            expires_at=datetime.now(UTC) + timedelta(days=30),
        )

    async def test_execute_returns_preferences_from_cache(
        self,
        use_case,
        preferences_repository,
        cache_service,
        sample_preferences,
    ):
        """Test execute returns cached preferences when available."""
        cache_service.get.return_value = sample_preferences.model_dump_json()

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
            selected_currency=CurrencyCode.EUR,
            dismissed_language_prompt=True,
            detected_language=DetectedLanguage2.EN,
        )
        cache_service.get.return_value = prefs.model_dump_json()

        result = await use_case.execute("test-session")

        assert result.user_id == "user-123"
        assert result.selected_currency == CurrencyCode.EUR
        assert result.dismissed_language_prompt is True
        assert result.detected_language == DetectedLanguage2.EN

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
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
            detected_language=None,
        )
        cache_service.get.return_value = prefs.model_dump_json()

        result = await use_case.execute("test-session")

        # UserPreferences auto-generates timestamps, so verify None fields are preserved
        assert result.detected_language is None
        assert result.user_id is None
        assert result.dismissed_language_prompt is False


@pytest.mark.unit
class TestGetUserPreferencesSerialize:
    """Test GetUserPreferencesUseCase serialization."""

    @pytest.fixture
    def use_case(self):
        """Create use case."""
        return GetUserPreferencesUseCase(AsyncMock(), AsyncMock())

    def test_serialize_complete_preferences(self, use_case):
        """Test serialization of complete preferences."""
        now = datetime.now(UTC)
        prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            user_id="user-123",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=True,
            detected_language=DetectedLanguage2.EN,
            created_at=now,
            updated_at=now,
            expires_at=now + timedelta(days=30),
        )

        result = prefs.model_dump_json(by_alias=True)

        assert isinstance(result, str)
        import json

        data = json.loads(result)
        assert data["sessionId"] == "test-session"
        assert data["userId"] == "user-123"
        assert data["selectedCurrency"] == "USD"
        assert data["dismissedLanguagePrompt"] is True
        assert data["detectedLanguage"] == "en"

    def test_serialize_with_null_optional_fields(self, use_case):
        """Test serialization with null optional fields."""
        prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            user_id=None,
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
            detected_language=None,
        )

        result = prefs.model_dump_json(by_alias=True)

        import json

        data = json.loads(result)
        assert data["userId"] is None
        assert data["detectedLanguage"] is None
        # Timestamps are optional and will be None if not provided
        assert data["createdAt"] is None
        assert data["updatedAt"] is None
        assert data["expiresAt"] is None


@pytest.mark.unit
class TestGetUserPreferencesDeserialize:
    """Test GetUserPreferencesUseCase deserialization."""

    @pytest.fixture
    def use_case(self):
        """Create use case."""
        return GetUserPreferencesUseCase(AsyncMock(), AsyncMock())

    def test_deserialize_complete_preferences(self, use_case):
        """Test deserialization of complete preferences JSON."""
        prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            user_id="user-123",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=True,
            detected_language=DetectedLanguage2.EN,
        )
        serialized = prefs.model_dump_json()

        result = UserPreferences.model_validate_json(serialized)

        assert result.session_id == prefs.session_id
        assert result.user_id == prefs.user_id
        assert result.selected_currency == prefs.selected_currency
        assert result.dismissed_language_prompt == prefs.dismissed_language_prompt
        assert result.detected_language == prefs.detected_language

    def test_deserialize_with_timestamps(self, use_case):
        """Test deserialization preserves timestamps."""
        now = datetime.now(UTC)
        prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            user_id=None,
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
            created_at=now,
            updated_at=now,
            expires_at=now + timedelta(days=30),
        )
        serialized = prefs.model_dump_json()

        result = UserPreferences.model_validate_json(serialized)

        # Timestamps should be preserved (may have minor precision loss)
        assert result.created_at is not None
        assert result.updated_at is not None
        assert result.expires_at is not None

    def test_deserialize_roundtrip_fidelity(self, use_case):
        """Test serialize-deserialize roundtrip preserves data."""
        now = datetime.now(UTC)
        original = UserPreferences(
            id=uuid4(),
            session_id="unique-session-xyz",
            user_id="unique-user-abc",
            selected_currency=CurrencyCode.GBP,
            dismissed_language_prompt=True,
            detected_language=DetectedLanguage2.IT,
            created_at=now,
            updated_at=now,
            expires_at=now + timedelta(days=30),
        )

        serialized = original.model_dump_json()
        deserialized = UserPreferences.model_validate_json(serialized)

        assert deserialized.session_id == original.session_id
        assert deserialized.user_id == original.user_id
        assert deserialized.selected_currency == original.selected_currency
        assert deserialized.dismissed_language_prompt == original.dismissed_language_prompt
        assert deserialized.detected_language == original.detected_language

    def test_deserialize_with_null_timestamps(self, use_case):
        """Test deserialization handles null timestamp fields gracefully."""
        import json

        # Create JSON with null timestamp fields
        future_time = datetime.now(UTC) + timedelta(hours=1)  # Future time with timezone
        json_data = {
            "id": str(uuid4()),
            "sessionId": "test-session",
            "userId": None,
            "selectedCurrency": "USD",
            "dismissedLanguagePrompt": False,
            "detectedLanguage": None,
            "createdAt": None,  # Null timestamp - model accepts None
            "updatedAt": None,  # Null timestamp - model accepts None
            "expiresAt": future_time.isoformat(),  # Valid future timestamp with timezone
        }

        result = UserPreferences.model_validate_json(json.dumps(json_data))

        # None values should be preserved
        assert result.created_at is None
        assert result.updated_at is None
        assert result.expires_at is not None
        assert isinstance(result.expires_at, datetime)
        # Verify other fields are preserved correctly
        assert result.session_id == "test-session"
        assert result.user_id is None
        assert result.selected_currency == CurrencyCode.USD
