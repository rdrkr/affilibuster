# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for migrate preferences to user use case.

Tests cover migrating anonymous preferences to authenticated user.
"""

from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.generated.models import CurrencyCode, DetectedLanguage2, UserPreferences
from affilibuster_backend.domain.use_cases.preferences.migrate_preferences_to_user_use_case import (
    MigratePreferencesRequest,
    MigratePreferencesToUserUseCase,
)


@pytest.mark.asyncio
class TestMigratePreferencesToUserUseCase:
    """Test suite for MigratePreferencesToUserUseCase."""

    async def test_migrate_preferences_session_not_found_returns_none(self):
        """Test migrating preferences when session doesn't exist returns None."""
        # Arrange
        user_id = uuid4()
        preferences_repo = AsyncMock()
        preferences_repo.get_by_user.return_value = None
        preferences_repo.get_by_session.return_value = None

        use_case = MigratePreferencesToUserUseCase(preferences_repo)
        request = MigratePreferencesRequest(
            session_id="session123",
            user_id=user_id,
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result is None
        preferences_repo.upsert.assert_not_called()

    async def test_migrate_preferences_updates_session_prefs_with_user_id(self):
        """Test migrating preferences updates session preferences to include user_id."""
        # Arrange
        user_id = uuid4()
        session_id = "session123"

        # No existing user preferences
        preferences_repo = AsyncMock()
        preferences_repo.get_by_user.return_value = None

        # Session preferences exist
        session_prefs = UserPreferences(
            id=uuid4(),
            session_id=session_id,
            selected_currency=CurrencyCode.EUR,
            dismissed_language_prompt=False,
            detected_language=DetectedLanguage2.IT,
        )

        preferences_repo.get_by_session.return_value = session_prefs

        # Mock upsert to return the migrated preferences
        migrated_prefs = UserPreferences(
            id=uuid4(),
            session_id=session_id,
            user_id=str(user_id),
            selected_currency=CurrencyCode.EUR,
            dismissed_language_prompt=False,
            detected_language=DetectedLanguage2.IT,
        )
        preferences_repo.upsert.return_value = migrated_prefs

        use_case = MigratePreferencesToUserUseCase(preferences_repo)
        request = MigratePreferencesRequest(
            session_id=session_id,
            user_id=user_id,
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result is not None
        assert result.selected_currency == CurrencyCode.EUR
        preferences_repo.upsert.assert_called_once()
        # Verify the session_prefs was modified to include user_id
        assert session_prefs.user_id == str(user_id)

    async def test_migrate_preferences_user_has_existing_prefs_returns_none(self):
        """Test migrating preferences when user already has preferences returns None."""
        # Arrange
        user_id = uuid4()
        session_id = "session123"

        # User preferences already exist
        existing_user_prefs = UserPreferences(
            id=uuid4(),
            session_id=session_id,
            user_id=str(user_id),
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=True,
            detected_language=DetectedLanguage2.EN,
        )

        preferences_repo = AsyncMock()
        preferences_repo.get_by_user.return_value = existing_user_prefs

        use_case = MigratePreferencesToUserUseCase(preferences_repo)
        request = MigratePreferencesRequest(
            session_id=session_id,
            user_id=user_id,
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result is None
        # Should not check for session prefs if user already has prefs
        preferences_repo.get_by_session.assert_not_called()
        preferences_repo.upsert.assert_not_called()
