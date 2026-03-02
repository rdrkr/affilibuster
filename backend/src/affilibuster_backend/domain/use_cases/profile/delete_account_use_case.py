# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Delete account use case.

Allows authenticated users to permanently delete their account (soft delete).
Requires password verification for security.
"""

import asyncio
import logging
from uuid import UUID

from affilibuster_backend.domain.repositories.consent_repository import IConsentRepository
from affilibuster_backend.domain.repositories.preferences_repository import IUserPreferencesRepository
from affilibuster_backend.domain.repositories.session_repository import ISessionRepository
from affilibuster_backend.domain.repositories.user_repository import IUserRepository
from affilibuster_backend.domain.services.newsletter_service import (
    INewsletterService,
    NewsletterUnsubscribeError,
)
from affilibuster_backend.domain.services.password_hasher import PasswordHasher

logger = logging.getLogger(__name__)


class DeleteAccountUseCase:
    """
    Use case for deleting a user account.

    Performs soft deletion of the user, invalidates all sessions,
    anonymizes consent records (preserving audit trail), deletes preferences,
    and removes the user from newsletter mailing lists (GDPR Art. 17).
    """

    def __init__(  # noqa: PLR0913 - All dependencies required for account deletion cleanup chain
        self,
        user_repo: IUserRepository,
        session_repo: ISessionRepository,
        consent_repo: IConsentRepository,
        preferences_repo: IUserPreferencesRepository,
        password_hasher: PasswordHasher,
        newsletter_service: INewsletterService | None = None,
    ) -> None:
        """
        Initialize use case.

        Args:
            user_repo: User repository for data access.
            session_repo: Session repository for invalidating sessions.
            consent_repo: Consent repository for anonymizing records.
            preferences_repo: Preferences repository for deleting user preferences.
            password_hasher: Password hashing service for verification.
            newsletter_service: Optional newsletter service for removing from mailing lists.
        """
        self.user_repo = user_repo
        self.session_repo = session_repo
        self.consent_repo = consent_repo
        self.preferences_repo = preferences_repo
        self.password_hasher = password_hasher
        self.newsletter_service = newsletter_service

    async def execute(self, user_id: UUID, password: str) -> None:
        """
        Execute the account deletion use case.

        Args:
            user_id: ID of the user to delete.
            password: User's password for verification.

        Raises:
            ValueError: If user not found, password is incorrect, or user is already deleted.
        """
        # Get user
        user = await self.user_repo.get_by_id(user_id)

        if user is None:
            raise ValueError("User not found")

        # Verify password
        if not self.password_hasher.verify_password(password, user.hashed_password.value):
            raise ValueError("Password is incorrect")

        # Soft delete user (raises ValueError if already deleted)
        user.soft_delete()

        # Save user changes
        await self.user_repo.update(user)

        # Invalidate all sessions
        await self.session_repo.delete_all_by_user_id(user_id)

        # Anonymize consent records (preserve audit trail, remove PII)
        await self.consent_repo.anonymize_by_user_id(user_id)

        # Delete user preferences
        await self.preferences_repo.delete_by_user_id(str(user_id))

        # Remove from newsletter mailing list (GDPR Art. 17 - Right to erasure)
        # Best-effort with retry: don't fail account deletion if Brevo call fails
        if self.newsletter_service:
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    await self.newsletter_service.unsubscribe(user.email.value)
                    break
                except NewsletterUnsubscribeError:
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2**attempt)  # 1s, 2s
                    else:
                        logger.warning(
                            "Failed to remove user from newsletter after %s attempts",
                            max_retries,
                        )
