# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Export user data use case.

Implements GDPR Data Subject Access Request (DSAR) per Articles 15/20.
Exports all user data including profile, consent records, preferences, and sessions.
"""

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from affilibuster_backend.domain.entities.generated.models import (
    ConsentRecordExport,
    SessionInfo,
    UserDataExport,
    UserProfile,
)
from affilibuster_backend.domain.repositories.consent_repository import IConsentRepository
from affilibuster_backend.domain.repositories.preferences_repository import IUserPreferencesRepository
from affilibuster_backend.domain.repositories.session_repository import ISessionRepository
from affilibuster_backend.domain.repositories.user_repository import IUserRepository


class ExportUserDataUseCase:
    """
    Use case for exporting all user data (GDPR DSAR).

    Collects profile, consent records, preferences, and active session metadata.
    Sensitive data (token hashes) is excluded from the export.
    """

    def __init__(
        self,
        user_repo: IUserRepository,
        session_repo: ISessionRepository,
        consent_repo: IConsentRepository,
        preferences_repo: IUserPreferencesRepository,
    ) -> None:
        """
        Initialize use case.

        Args:
            user_repo: User repository for profile data.
            session_repo: Session repository for active session metadata.
            consent_repo: Consent repository for consent history.
            preferences_repo: Preferences repository for user preferences.
        """
        self.user_repo = user_repo
        self.session_repo = session_repo
        self.consent_repo = consent_repo
        self.preferences_repo = preferences_repo

    async def execute(self, user_id: UUID) -> UserDataExport:
        """
        Execute the data export use case.

        Args:
            user_id: ID of the user whose data to export.

        Returns:
            Complete user data export.

        Raises:
            ValueError: If user not found.
        """
        # Get user
        user = await self.user_repo.get_by_id(user_id)

        if user is None:
            raise ValueError("User not found")

        # Build profile
        profile = UserProfile(
            id=user.id,
            email=user.email.value,
            display_name=user.display_name,
            email_verified=user.email_verified,
            created_at=user.created_at,
            last_login_at=user.last_login_at,
        )

        # Get consent records
        consent_dicts = await self.consent_repo.get_all_by_user_id(user_id)
        consent_records = [self._map_consent_record(record) for record in consent_dicts]

        # Get preferences
        prefs = await self.preferences_repo.get_by_user(str(user_id))
        preferences: dict[str, Any] | None = None
        if prefs is not None:
            preferences = prefs.model_dump(exclude_none=True)

        # Get active sessions (metadata only, no token_hash)
        sessions = await self.session_repo.get_active_sessions_by_user_id(user_id)
        active_sessions = [
            SessionInfo(
                id=session.id,
                created_at=session.created_at,
                expires_at=session.expires_at,
                remember_me=session.remember_me,
            )
            for session in sessions
        ]

        return UserDataExport(
            profile=profile,
            consent_records=consent_records,
            preferences=preferences,
            active_sessions=active_sessions,
            exported_at=datetime.now(UTC),
        )

    @staticmethod
    def _map_consent_record(record: dict[str, Any]) -> ConsentRecordExport:
        """
        Map a consent record dict to a ConsentRecordExport model.

        Args:
            record: Consent record dictionary from the repository.

        Returns:
            ConsentRecordExport model instance.
        """
        return ConsentRecordExport(
            id=record["id"],
            consent_type=record["consent_type"],
            categories=record["categories"],
            action=record["action"],
            consent_version=record.get("consent_version"),
            created_at=record["created_at"],
        )
