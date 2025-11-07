# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for UserPreferences generated Pydantic model.

Covers:
- Valid user preferences creation with required fields
- Optional field handling
- Enum validation (CurrencyCode, DetectedLanguage2)
- Field aliases (camelCase vs snake_case)
"""

from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from pydantic import ValidationError

from affilibuster_backend.domain.entities.generated.models import CurrencyCode, DetectedLanguage2, UserPreferences


@pytest.mark.unit
class TestUserPreferencesCreation:
    """Test valid UserPreferences entity creation."""

    def test_create_user_preferences_with_required_fields(self):
        """Test creating user preferences with all required fields."""
        prefs_id = uuid4()
        prefs = UserPreferences(
            id=prefs_id,
            session_id="session-abc-123",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
        )

        assert prefs.id == prefs_id
        assert prefs.session_id == "session-abc-123"
        assert prefs.selected_currency == CurrencyCode.USD
        assert prefs.dismissed_language_prompt is False
        assert prefs.detected_language is None
        assert prefs.user_id is None
        assert prefs.created_at is None
        assert prefs.updated_at is None
        assert prefs.expires_at is None

    def test_create_user_preferences_with_all_fields(self):
        """Test creating user preferences with all fields."""
        prefs_id = uuid4()
        created = datetime.now(UTC)
        updated = datetime.now(UTC)
        expires = updated + timedelta(days=30)

        prefs = UserPreferences(
            id=prefs_id,
            session_id="session-xyz-789",
            user_id="user-456",
            selected_currency=CurrencyCode.EUR,
            detected_language=DetectedLanguage2.IT,
            dismissed_language_prompt=True,
            created_at=created,
            updated_at=updated,
            expires_at=expires,
        )

        assert prefs.id == prefs_id
        assert prefs.session_id == "session-xyz-789"
        assert prefs.user_id == "user-456"
        assert prefs.selected_currency == CurrencyCode.EUR
        assert prefs.detected_language == DetectedLanguage2.IT
        assert prefs.dismissed_language_prompt is True
        assert prefs.created_at == created
        assert prefs.updated_at == updated
        assert prefs.expires_at == expires

    def test_different_currencies(self):
        """Test creating preferences with different currencies."""
        currencies = [CurrencyCode.USD, CurrencyCode.EUR, CurrencyCode.GBP, CurrencyCode.ILS]

        for currency in currencies:
            prefs = UserPreferences(
                id=uuid4(),
                session_id="session-123",
                selected_currency=currency,
                dismissed_language_prompt=False,
            )
            assert prefs.selected_currency == currency

    def test_different_detected_languages(self):
        """Test creating preferences with different detected languages."""
        languages = [DetectedLanguage2.EN, DetectedLanguage2.IT, DetectedLanguage2.HE]

        for lang in languages:
            prefs = UserPreferences(
                id=uuid4(),
                session_id="session-123",
                selected_currency=CurrencyCode.USD,
                dismissed_language_prompt=False,
                detected_language=lang,
            )
            assert prefs.detected_language == lang


@pytest.mark.unit
class TestUserPreferencesOptionalFields:
    """Test optional field handling."""

    def test_user_id_optional(self):
        """Test that user_id is optional."""
        prefs = UserPreferences(
            id=uuid4(),
            session_id="session-123",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
            user_id=None,
        )
        assert prefs.user_id is None

        prefs_with_user = UserPreferences(
            id=uuid4(),
            session_id="session-123",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
            user_id="user-456",
        )
        assert prefs_with_user.user_id == "user-456"

    def test_detected_language_optional(self):
        """Test that detected_language is optional."""
        prefs = UserPreferences(
            id=uuid4(),
            session_id="session-123",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
            detected_language=None,
        )
        assert prefs.detected_language is None

        prefs_with_lang = UserPreferences(
            id=uuid4(),
            session_id="session-123",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
            detected_language=DetectedLanguage2.EN,
        )
        assert prefs_with_lang.detected_language == DetectedLanguage2.EN

    def test_timestamps_optional(self):
        """Test that timestamp fields are optional."""
        prefs = UserPreferences(
            id=uuid4(),
            session_id="session-123",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
        )
        assert prefs.created_at is None
        assert prefs.updated_at is None
        assert prefs.expires_at is None


@pytest.mark.unit
class TestUserPreferencesFieldAliases:
    """Test field aliases work correctly."""

    def test_can_construct_with_snake_case(self):
        """Test that model accepts snake_case field names."""
        prefs = UserPreferences(
            id=uuid4(),
            session_id="session-123",
            user_id="user-456",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=True,
            detected_language=DetectedLanguage2.EN,
        )
        assert prefs.session_id == "session-123"
        assert prefs.user_id == "user-456"
        assert prefs.selected_currency == CurrencyCode.USD
        assert prefs.dismissed_language_prompt is True
        assert prefs.detected_language == DetectedLanguage2.EN

    def test_serialization_uses_camel_case(self):
        """Test that model serializes to camelCase."""
        import json

        prefs = UserPreferences(
            id=uuid4(),
            session_id="session-123",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
        )
        serialized = prefs.model_dump_json(by_alias=True)
        data = json.loads(serialized)

        assert "sessionId" in data
        assert "selectedCurrency" in data
        assert "dismissedLanguagePrompt" in data


@pytest.mark.unit
class TestUserPreferencesValidation:
    """Test Pydantic validation."""

    def test_requires_id(self):
        """Test that id is required."""
        with pytest.raises(ValidationError):
            UserPreferences(
                session_id="session-123",
                selected_currency=CurrencyCode.USD,
                dismissed_language_prompt=False,
            )

    def test_requires_session_id(self):
        """Test that session_id is required."""
        with pytest.raises(ValidationError):
            UserPreferences(
                id=uuid4(),
                selected_currency=CurrencyCode.USD,
                dismissed_language_prompt=False,
            )

    def test_requires_selected_currency(self):
        """Test that selected_currency is required."""
        with pytest.raises(ValidationError):
            UserPreferences(
                id=uuid4(),
                session_id="session-123",
                dismissed_language_prompt=False,
            )

    def test_requires_dismissed_language_prompt(self):
        """Test that dismissed_language_prompt is required."""
        with pytest.raises(ValidationError):
            UserPreferences(
                id=uuid4(),
                session_id="session-123",
                selected_currency=CurrencyCode.USD,
            )

    def test_datetime_fields_require_timezone(self):
        """Test that datetime fields require timezone awareness."""
        naive_dt = datetime.now(tz=UTC).replace(tzinfo=None)  # Naive datetime

        with pytest.raises(ValidationError):
            UserPreferences(
                id=uuid4(),
                session_id="session-123",
                selected_currency=CurrencyCode.USD,
                dismissed_language_prompt=False,
                created_at=naive_dt,
            )
