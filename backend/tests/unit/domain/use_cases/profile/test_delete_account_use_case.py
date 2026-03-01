# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for delete account use case.

Tests cover account deletion logic including password verification,
soft deletion, session invalidation, consent anonymization, preference deletion,
and newsletter mailing list removal (GDPR Art. 17).
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, Mock
from uuid import UUID, uuid4

import pytest

from affilibuster_backend.domain.entities.user import (
    Email,
    HashedPassword,
    UserEntity,
    UserStatus,
)
from affilibuster_backend.domain.services.newsletter_service import (
    NewsletterUnsubscribeError,
)
from affilibuster_backend.domain.use_cases.profile.delete_account_use_case import (
    DeleteAccountUseCase,
)


def create_test_user(
    user_id: UUID | None = None,
    user_status: UserStatus = UserStatus.ACTIVE,
) -> UserEntity:
    """Create a test user entity."""
    return UserEntity(
        id=uuid4() if user_id is None else user_id,
        email=Email("test@example.com"),
        hashed_password=HashedPassword("$2b$12$hashedpasswordhash"),
        display_name="Test User",
        email_verified=False,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        last_login_at=None,
        status=user_status,
        deleted_at=None,
    )


class TestDeleteAccountUseCaseConstructor:
    """Test suite for DeleteAccountUseCase constructor."""

    def test_constructor_initializes_dependencies(self) -> None:
        """Test that constructor properly initializes all dependencies."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        consent_repo = AsyncMock()
        preferences_repo = AsyncMock()
        password_hasher = Mock()

        # Act
        use_case = DeleteAccountUseCase(user_repo, session_repo, consent_repo, preferences_repo, password_hasher)

        # Assert
        assert use_case.user_repo is user_repo
        assert use_case.session_repo is session_repo
        assert use_case.consent_repo is consent_repo
        assert use_case.preferences_repo is preferences_repo
        assert use_case.password_hasher is password_hasher
        assert use_case.newsletter_service is None

    def test_constructor_initializes_with_newsletter_service(self) -> None:
        """Test that constructor accepts optional newsletter service."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        consent_repo = AsyncMock()
        preferences_repo = AsyncMock()
        password_hasher = Mock()
        newsletter_service = AsyncMock()

        # Act
        use_case = DeleteAccountUseCase(
            user_repo, session_repo, consent_repo, preferences_repo, password_hasher, newsletter_service
        )

        # Assert
        assert use_case.newsletter_service is newsletter_service


@pytest.mark.asyncio
class TestDeleteAccountUseCase:
    """Test suite for DeleteAccountUseCase execution."""

    async def test_delete_account_success(self) -> None:
        """Test successful account deletion with all cleanup steps."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id)

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user
        user_repo.update.return_value = user

        session_repo = AsyncMock()
        consent_repo = AsyncMock()
        consent_repo.anonymize_by_user_id.return_value = 3

        preferences_repo = AsyncMock()
        preferences_repo.delete_by_user_id.return_value = 1

        password_hasher = Mock()
        password_hasher.verify_password.return_value = True

        use_case = DeleteAccountUseCase(user_repo, session_repo, consent_repo, preferences_repo, password_hasher)

        # Act
        await use_case.execute(user_id, "CorrectPassword123!")

        # Assert - verify all cleanup steps
        user_repo.get_by_id.assert_called_once_with(user_id)
        password_hasher.verify_password.assert_called_once_with("CorrectPassword123!", "$2b$12$hashedpasswordhash")
        user_repo.update.assert_called_once()
        session_repo.delete_all_by_user_id.assert_called_once_with(user_id)
        consent_repo.anonymize_by_user_id.assert_called_once_with(user_id)
        preferences_repo.delete_by_user_id.assert_called_once_with(str(user_id))

        # Verify user was soft deleted
        updated_user = user_repo.update.call_args[0][0]
        assert updated_user.status == UserStatus.DELETED
        assert updated_user.deleted_at is not None

    async def test_delete_account_user_not_found(self) -> None:
        """Test that ValueError is raised when user not found."""
        # Arrange
        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = None

        session_repo = AsyncMock()
        consent_repo = AsyncMock()
        preferences_repo = AsyncMock()
        password_hasher = Mock()

        use_case = DeleteAccountUseCase(user_repo, session_repo, consent_repo, preferences_repo, password_hasher)

        # Act & Assert
        with pytest.raises(ValueError, match="User not found"):
            await use_case.execute(uuid4(), "AnyPassword123!")

        # Verify no cleanup was performed
        session_repo.delete_all_by_user_id.assert_not_called()
        consent_repo.anonymize_by_user_id.assert_not_called()
        preferences_repo.delete_by_user_id.assert_not_called()

    async def test_delete_account_wrong_password(self) -> None:
        """Test that ValueError is raised when password is incorrect."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id)

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user

        session_repo = AsyncMock()
        consent_repo = AsyncMock()
        preferences_repo = AsyncMock()

        password_hasher = Mock()
        password_hasher.verify_password.return_value = False

        use_case = DeleteAccountUseCase(user_repo, session_repo, consent_repo, preferences_repo, password_hasher)

        # Act & Assert
        with pytest.raises(ValueError, match="Password is incorrect"):
            await use_case.execute(user_id, "WrongPassword123!")

        # Verify no cleanup was performed
        user_repo.update.assert_not_called()
        session_repo.delete_all_by_user_id.assert_not_called()

    async def test_delete_account_already_deleted(self) -> None:
        """Test that ValueError is raised when user is already deleted."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id, user_status=UserStatus.DELETED)
        user.deleted_at = datetime.now(UTC)

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user

        session_repo = AsyncMock()
        consent_repo = AsyncMock()
        preferences_repo = AsyncMock()

        password_hasher = Mock()
        password_hasher.verify_password.return_value = True

        use_case = DeleteAccountUseCase(user_repo, session_repo, consent_repo, preferences_repo, password_hasher)

        # Act & Assert
        with pytest.raises(ValueError, match="User is already deleted"):
            await use_case.execute(user_id, "CorrectPassword123!")

        # Verify no further cleanup was performed
        user_repo.update.assert_not_called()
        session_repo.delete_all_by_user_id.assert_not_called()

    async def test_delete_account_unsubscribes_from_newsletter(self) -> None:
        """Test that account deletion removes user from newsletter mailing list (GDPR Art. 17)."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id)

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user
        user_repo.update.return_value = user

        session_repo = AsyncMock()
        consent_repo = AsyncMock()
        consent_repo.anonymize_by_user_id.return_value = 1
        preferences_repo = AsyncMock()
        preferences_repo.delete_by_user_id.return_value = 1
        password_hasher = Mock()
        password_hasher.verify_password.return_value = True

        newsletter_service = AsyncMock()

        use_case = DeleteAccountUseCase(
            user_repo, session_repo, consent_repo, preferences_repo, password_hasher, newsletter_service
        )

        # Act
        await use_case.execute(user_id, "CorrectPassword123!")

        # Assert - newsletter unsubscribe was called with user's email
        newsletter_service.unsubscribe.assert_called_once_with("test@example.com")

    async def test_delete_account_succeeds_when_newsletter_unsubscribe_fails(self) -> None:
        """Test that account deletion succeeds even if newsletter unsubscribe fails (best-effort)."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id)

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user
        user_repo.update.return_value = user

        session_repo = AsyncMock()
        consent_repo = AsyncMock()
        consent_repo.anonymize_by_user_id.return_value = 1
        preferences_repo = AsyncMock()
        preferences_repo.delete_by_user_id.return_value = 1
        password_hasher = Mock()
        password_hasher.verify_password.return_value = True

        newsletter_service = AsyncMock()
        newsletter_service.unsubscribe.side_effect = NewsletterUnsubscribeError("Brevo error")

        use_case = DeleteAccountUseCase(
            user_repo, session_repo, consent_repo, preferences_repo, password_hasher, newsletter_service
        )

        # Act - should not raise
        await use_case.execute(user_id, "CorrectPassword123!")

        # Assert - all other cleanup still happened
        user_repo.update.assert_called_once()
        session_repo.delete_all_by_user_id.assert_called_once_with(user_id)
        consent_repo.anonymize_by_user_id.assert_called_once_with(user_id)
        preferences_repo.delete_by_user_id.assert_called_once_with(str(user_id))

    async def test_delete_account_without_newsletter_service(self) -> None:
        """Test that account deletion works when no newsletter service is provided."""
        # Arrange
        user_id = uuid4()
        user = create_test_user(user_id=user_id)

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user
        user_repo.update.return_value = user

        session_repo = AsyncMock()
        consent_repo = AsyncMock()
        consent_repo.anonymize_by_user_id.return_value = 1
        preferences_repo = AsyncMock()
        preferences_repo.delete_by_user_id.return_value = 1
        password_hasher = Mock()
        password_hasher.verify_password.return_value = True

        # No newsletter service provided (None)
        use_case = DeleteAccountUseCase(user_repo, session_repo, consent_repo, preferences_repo, password_hasher)

        # Act - should not raise
        await use_case.execute(user_id, "CorrectPassword123!")

        # Assert - all other cleanup happened normally
        user_repo.update.assert_called_once()
        session_repo.delete_all_by_user_id.assert_called_once_with(user_id)
