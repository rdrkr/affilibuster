# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for UserPreferences domain entity.

Covers:
- Valid user preferences creation
- Validation rules (expiresAt > updatedAt, sessionId required)
- update_currency() method
- dismiss_language_prompt() method
- is_expired() method
- get_effective_identifier() method
- TTL extension logic
"""

import pytest
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from src.domain.entities.user_preferences import UserPreferences


class TestUserPreferencesCreation:
    """Test valid UserPreferences entity creation."""

    def test_create_user_preferences_minimal(self):
        """Test creating user preferences with minimal required fields."""
        prefs = UserPreferences(
            session_id='session-abc-123',
            selected_currency='USD'
        )

        assert prefs.session_id == 'session-abc-123'
        assert prefs.selected_currency == 'USD'
        assert prefs.dismissed_language_prompt is False
        assert prefs.detected_language is None
        assert prefs.user_id is None

    def test_create_user_preferences_with_all_fields(self):
        """Test creating user preferences with all fields."""
        prefs_id = uuid4()
        created = datetime.now(UTC)
        updated = datetime.now(UTC)
        expires = updated + timedelta(days=30)

        prefs = UserPreferences(
            id=prefs_id,
            session_id='session-xyz-789',
            user_id='user-456',
            selected_currency='EUR',
            detected_language='it',
            dismissed_language_prompt=True,
            created_at=created,
            updated_at=updated,
            expires_at=expires
        )

        assert prefs.id == prefs_id
        assert prefs.user_id == 'user-456'
        assert prefs.detected_language == 'it'
        assert prefs.dismissed_language_prompt is True

    def test_auto_generated_id(self):
        """Test that ID is auto-generated if not provided."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        assert prefs.id is not None
        assert isinstance(prefs.id, UUID)

    def test_auto_generated_timestamps(self):
        """Test that timestamps are auto-generated if not provided."""
        before = datetime.now(UTC).replace(tzinfo=None).replace(tzinfo=None)

        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        after = datetime.now(UTC).replace(tzinfo=None).replace(tzinfo=None)

        assert prefs.created_at is not None
        assert prefs.updated_at is not None
        assert before <= prefs.created_at <= after
        assert before <= prefs.updated_at <= after

    def test_auto_generated_expires_at_30_days(self):
        """Test that expires_at is auto-generated as 30 days from updated_at."""
        before = datetime.now(UTC).replace(tzinfo=None)

        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        after = datetime.now(UTC).replace(tzinfo=None)

        # expires_at should be 30 days after updated_at
        expected_min = before + timedelta(days=30)
        expected_max = after + timedelta(days=30)

        assert prefs.expires_at is not None
        assert expected_min <= prefs.expires_at <= expected_max

    def test_different_currencies(self):
        """Test creating preferences with different currencies."""
        currencies = ['USD', 'EUR', 'GBP', 'ILS']

        for currency in currencies:
            prefs = UserPreferences(
                session_id='session-123',
                selected_currency=currency
            )
            assert prefs.selected_currency == currency


class TestUserPreferencesValidation:
    """Test UserPreferences validation rules."""

    def test_error_when_expires_at_before_updated_at(self):
        """Test validation fails when expiresAt <= updatedAt."""
        updated = datetime.now(UTC)
        expires = updated - timedelta(days=1)  # Before updated_at

        with pytest.raises(ValueError, match="expiresAt must be greater than updatedAt"):
            UserPreferences(
                session_id='session-123',
                selected_currency='USD',
                updated_at=updated,
                expires_at=expires
            )

    def test_error_when_expires_at_equals_updated_at(self):
        """Test validation fails when expiresAt equals updatedAt."""
        timestamp = datetime.now(UTC)

        with pytest.raises(ValueError, match="expiresAt must be greater than updatedAt"):
            UserPreferences(
                session_id='session-123',
                selected_currency='USD',
                updated_at=timestamp,
                expires_at=timestamp  # Equal, not greater
            )

    def test_error_when_session_id_empty(self):
        """Test validation fails when sessionId is empty string."""
        with pytest.raises(ValueError, match="sessionId is required"):
            UserPreferences(
                session_id='',  # Empty string
                selected_currency='USD'
            )

    def test_valid_when_expires_at_after_updated_at(self):
        """Test validation passes when expiresAt > updatedAt."""
        updated = datetime.now(UTC)
        expires = updated + timedelta(days=1)

        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD',
            updated_at=updated,
            expires_at=expires
        )

        assert prefs.expires_at > prefs.updated_at


class TestUserPreferencesUpdateCurrency:
    """Test UserPreferences update_currency() method."""

    def test_update_currency(self):
        """Test updating selected currency."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        prefs.update_currency('EUR')

        assert prefs.selected_currency == 'EUR'

    def test_update_currency_updates_updated_at(self):
        """Test that update_currency() updates updated_at timestamp."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        old_updated_at = prefs.updated_at
        prefs.update_currency('GBP')

        assert prefs.updated_at > old_updated_at

    def test_update_currency_extends_ttl_by_30_days(self):
        """Test that update_currency() extends TTL by 30 days from now."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        before = datetime.now(UTC).replace(tzinfo=None)
        prefs.update_currency('EUR')
        after = datetime.now(UTC).replace(tzinfo=None)

        # expires_at should be 30 days from when update_currency was called
        expected_min = before + timedelta(days=30)
        expected_max = after + timedelta(days=30)

        assert expected_min <= prefs.expires_at <= expected_max

    def test_update_currency_multiple_times(self):
        """Test updating currency multiple times."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        prefs.update_currency('EUR')
        assert prefs.selected_currency == 'EUR'

        prefs.update_currency('GBP')
        assert prefs.selected_currency == 'GBP'

        prefs.update_currency('ILS')
        assert prefs.selected_currency == 'ILS'


class TestUserPreferencesDismissLanguagePrompt:
    """Test UserPreferences dismiss_language_prompt() method."""

    def test_dismiss_language_prompt(self):
        """Test dismissing language prompt."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        assert prefs.dismissed_language_prompt is False
        prefs.dismiss_language_prompt()
        assert prefs.dismissed_language_prompt is True

    def test_dismiss_language_prompt_updates_updated_at(self):
        """Test that dismiss_language_prompt() updates updated_at timestamp."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        old_updated_at = prefs.updated_at
        prefs.dismiss_language_prompt()

        assert prefs.updated_at > old_updated_at

    def test_dismiss_language_prompt_extends_ttl_by_30_days(self):
        """Test that dismiss_language_prompt() extends TTL by 30 days."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        before = datetime.now(UTC).replace(tzinfo=None)
        prefs.dismiss_language_prompt()
        after = datetime.now(UTC).replace(tzinfo=None)

        # expires_at should be 30 days from when dismiss_language_prompt was called
        expected_min = before + timedelta(days=30)
        expected_max = after + timedelta(days=30)

        assert expected_min <= prefs.expires_at <= expected_max

    def test_dismiss_language_prompt_multiple_times(self):
        """Test dismissing language prompt multiple times (idempotent)."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        prefs.dismiss_language_prompt()
        assert prefs.dismissed_language_prompt is True

        # Dismiss again - should remain True
        prefs.dismiss_language_prompt()
        assert prefs.dismissed_language_prompt is True


class TestUserPreferencesIsExpired:
    """Test UserPreferences is_expired() method."""

    def test_is_not_expired_when_expires_at_in_future(self):
        """Test that preferences are not expired when expiresAt is in future."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD',
            expires_at=datetime.now(UTC).replace(tzinfo=None) + timedelta(days=10)
        )

        assert prefs.is_expired() is False

    def test_is_expired_when_expires_at_in_past(self):
        """Test that preferences are expired when expiresAt is in past."""
        updated = datetime.now(UTC).replace(tzinfo=None) - timedelta(days=40)
        expires = datetime.now(UTC).replace(tzinfo=None) - timedelta(days=10)

        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD',
            updated_at=updated,
            expires_at=expires
        )

        assert prefs.is_expired() is True

    def test_is_expired_just_after_expiry(self):
        """Test that preferences are expired immediately after expiresAt."""
        # Set expires_at to 1 second ago
        updated = datetime.now(UTC).replace(tzinfo=None) - timedelta(seconds=2)
        expires = datetime.now(UTC).replace(tzinfo=None) - timedelta(seconds=1)

        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD',
            updated_at=updated,
            expires_at=expires
        )

        assert prefs.is_expired() is True

    def test_newly_created_preferences_not_expired(self):
        """Test that newly created preferences are not expired (30 day TTL)."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        # Should not be expired immediately after creation
        assert prefs.is_expired() is False


class TestUserPreferencesGetEffectiveIdentifier:
    """Test UserPreferences get_effective_identifier() method."""

    def test_get_effective_identifier_returns_session_id_when_no_user_id(self):
        """Test that effective identifier is session_id when user_id is None."""
        prefs = UserPreferences(
            session_id='session-abc-123',
            selected_currency='USD',
            user_id=None
        )

        assert prefs.get_effective_identifier() == 'session-abc-123'

    def test_get_effective_identifier_returns_user_id_when_present(self):
        """Test that effective identifier is user_id when present (logged in)."""
        prefs = UserPreferences(
            session_id='session-abc-123',
            selected_currency='USD',
            user_id='user-456'
        )

        assert prefs.get_effective_identifier() == 'user-456'

    def test_user_id_takes_precedence_over_session_id(self):
        """Test that user_id takes precedence over session_id when both exist."""
        prefs = UserPreferences(
            session_id='session-xyz-789',
            selected_currency='USD',
            user_id='user-123'
        )

        # Should return user_id, not session_id
        identifier = prefs.get_effective_identifier()
        assert identifier == 'user-123'
        assert identifier != 'session-xyz-789'


class TestUserPreferencesEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_update_currency_after_dismissing_prompt(self):
        """Test updating currency after dismissing language prompt."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        prefs.dismiss_language_prompt()
        assert prefs.dismissed_language_prompt is True

        prefs.update_currency('EUR')
        assert prefs.selected_currency == 'EUR'
        assert prefs.dismissed_language_prompt is True  # Should remain True

    def test_ttl_extension_after_multiple_operations(self):
        """Test that TTL extends correctly after multiple operations."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        # First TTL extension
        prefs.update_currency('EUR')
        first_expires = prefs.expires_at

        # Second TTL extension
        prefs.dismiss_language_prompt()
        second_expires = prefs.expires_at

        # Second expires should be after first
        assert second_expires >= first_expires

    def test_validate_called_multiple_times(self):
        """Test that validate() can be called multiple times."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD'
        )

        # Should not raise error on multiple calls
        prefs.validate()
        prefs.validate()
        prefs.validate()

    def test_detected_language_optional(self):
        """Test that detected_language is optional and can be None."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD',
            detected_language=None
        )

        assert prefs.detected_language is None

    def test_detected_language_can_be_set(self):
        """Test that detected_language can be set during creation."""
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD',
            detected_language='fr'
        )

        assert prefs.detected_language == 'fr'

    def test_session_id_with_special_characters(self):
        """Test that session_id can contain special characters."""
        special_session_id = 'session-abc_123-XYZ.456'

        prefs = UserPreferences(
            session_id=special_session_id,
            selected_currency='USD'
        )

        assert prefs.session_id == special_session_id

    def test_currency_update_workflow(self):
        """Test realistic currency update workflow."""
        # User starts with detected/default currency
        prefs = UserPreferences(
            session_id='session-123',
            selected_currency='USD',
            detected_language='en'
        )

        # User changes to EUR
        prefs.update_currency('EUR')
        assert prefs.selected_currency == 'EUR'

        # User changes to GBP
        prefs.update_currency('GBP')
        assert prefs.selected_currency == 'GBP'

        # User dismisses language prompt
        prefs.dismiss_language_prompt()
        assert prefs.dismissed_language_prompt is True

        # Currency should remain GBP
        assert prefs.selected_currency == 'GBP'

    def test_anonymous_to_logged_in_workflow(self):
        """Test workflow from anonymous to logged-in user."""
        # Start as anonymous user
        prefs = UserPreferences(
            session_id='session-abc-123',
            selected_currency='USD',
            user_id=None
        )

        assert prefs.get_effective_identifier() == 'session-abc-123'

        # User logs in - update user_id
        prefs.user_id = 'user-456'

        # Now effective identifier should be user_id
        assert prefs.get_effective_identifier() == 'user-456'
