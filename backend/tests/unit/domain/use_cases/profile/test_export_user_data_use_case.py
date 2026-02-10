# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for export user data use case.

Tests cover GDPR DSAR data export including profile, consent records,
preferences, and active session metadata.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.generated.models import (
    CurrencyCode,
    UserPreferences,
)
from affilibuster_backend.domain.entities.user import (
    Email,
    HashedPassword,
    UserEntity,
    UserStatus,
)
from affilibuster_backend.domain.entities.user_session import UserSession
from affilibuster_backend.domain.use_cases.profile.export_user_data_use_case import (
    ExportUserDataUseCase,
)


def create_test_user(user_id=None) -> UserEntity:
    """Create a test user entity."""
    return UserEntity(
        id=uuid4() if user_id is None else user_id,
        email=Email("test@example.com"),
        hashed_password=HashedPassword("$2b$12$hashedpasswordhash"),
        display_name="Test User",
        email_verified=True,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        last_login_at=datetime.now(UTC),
        status=UserStatus.ACTIVE,
        deleted_at=None,
    )


class TestExportUserDataUseCaseConstructor:
    """Test suite for ExportUserDataUseCase constructor."""

    def test_constructor_initializes_dependencies(self) -> None:
        """Test that constructor properly initializes all dependencies."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        consent_repo = AsyncMock()
        preferences_repo = AsyncMock()

        # Act
        use_case = ExportUserDataUseCase(user_repo, session_repo, consent_repo, preferences_repo)

        # Assert
        assert use_case.user_repo is user_repo
        assert use_case.session_repo is session_repo
        assert use_case.consent_repo is consent_repo
        assert use_case.preferences_repo is preferences_repo


@pytest.mark.asyncio
class TestExportUserDataUseCase:
    """Test suite for ExportUserDataUseCase execution."""

    async def test_export_success_with_all_data(self) -> None:
        """Test successful export with profile, consent records, preferences, and sessions."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id)

        consent_record = {
            "id": uuid4(),
            "consent_type": "cookie",
            "categories": {"necessary": True, "analytics": True},
            "action": "accept_all",
            "consent_version": "1.0",
            "created_at": datetime.now(UTC),
        }

        prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            user_id=str(user_id),
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
        )

        now = datetime.now(UTC)
        session = UserSession(
            id=uuid4(),
            user_id=user_id,
            token_hash="hashed_token_value",
            expires_at=now + timedelta(days=7),
            remember_me=True,
            created_at=now,
        )

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user

        session_repo = AsyncMock()
        session_repo.get_active_sessions_by_user_id.return_value = [session]

        consent_repo = AsyncMock()
        consent_repo.get_all_by_user_id.return_value = [consent_record]

        preferences_repo = AsyncMock()
        preferences_repo.get_by_user.return_value = prefs

        use_case = ExportUserDataUseCase(user_repo, session_repo, consent_repo, preferences_repo)

        # Act
        result = await use_case.execute(user_id)

        # Assert
        assert result.profile.id == user_id
        assert result.profile.email == "test@example.com"
        assert result.profile.display_name == "Test User"
        assert result.profile.email_verified is True

        assert len(result.consent_records) == 1
        assert result.consent_records[0].consent_type == "cookie"
        assert result.consent_records[0].action == "accept_all"
        assert result.consent_records[0].consent_version == "1.0"

        assert result.preferences is not None

        assert len(result.active_sessions) == 1
        assert result.active_sessions[0].id == session.id
        assert result.active_sessions[0].remember_me is True

        assert result.exported_at is not None

        # Verify repo calls
        user_repo.get_by_id.assert_called_once_with(user_id)
        consent_repo.get_all_by_user_id.assert_called_once_with(user_id)
        preferences_repo.get_by_user.assert_called_once_with(str(user_id))
        session_repo.get_active_sessions_by_user_id.assert_called_once_with(user_id)

    async def test_export_success_empty_collections(self) -> None:
        """Test successful export when user has no consent records, preferences, or sessions."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id)

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user

        session_repo = AsyncMock()
        session_repo.get_active_sessions_by_user_id.return_value = []

        consent_repo = AsyncMock()
        consent_repo.get_all_by_user_id.return_value = []

        preferences_repo = AsyncMock()
        preferences_repo.get_by_user.return_value = None

        use_case = ExportUserDataUseCase(user_repo, session_repo, consent_repo, preferences_repo)

        # Act
        result = await use_case.execute(user_id)

        # Assert
        assert result.profile.id == user_id
        assert result.consent_records == []
        assert result.preferences is None
        assert result.active_sessions == []
        assert result.exported_at is not None

    async def test_export_user_not_found(self) -> None:
        """Test that ValueError is raised when user not found."""
        # Arrange
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = None

        session_repo = AsyncMock()
        consent_repo = AsyncMock()
        preferences_repo = AsyncMock()

        use_case = ExportUserDataUseCase(user_repo, session_repo, consent_repo, preferences_repo)

        # Act & Assert
        with pytest.raises(ValueError, match="User not found"):
            await use_case.execute(uuid4())

        # Verify no other repo calls were made
        consent_repo.get_all_by_user_id.assert_not_called()
        preferences_repo.get_by_user.assert_not_called()
        session_repo.get_active_sessions_by_user_id.assert_not_called()
