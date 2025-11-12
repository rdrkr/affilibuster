# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Migrate anonymous preferences to authenticated user.

When a user logs in for the first time or when they have anonymous session preferences,
this use case migrates those preferences to their user account.
"""

from dataclasses import dataclass
from uuid import UUID

from affilibuster_backend.domain.entities.generated.models import UserPreferences
from affilibuster_backend.domain.repositories.preferences_repository import IUserPreferencesRepository


@dataclass
class MigratePreferencesRequest:
    """Request to migrate preferences from session to user.

    This is an INTERNAL USE CASE REQUEST (NOT part of OpenAPI contract).
    Used to pass parameters from route handler to use case.

    Why not in OpenAPI:
    - Internal operation triggered after login/registration
    - Not exposed as a standalone API endpoint
    - Parameters come from session/authentication context, not request body
    - Clean Architecture: use cases define their own input contracts
    """

    user_id: UUID
    session_id: str


class MigratePreferencesToUserUseCase:
    """
    Use case for migrating anonymous session preferences to authenticated user account.

    Business Rules:
        - If user has existing preferences, keep them (don't overwrite)
        - If user has no preferences but session has preferences, migrate them
        - After migration, session preferences can be deleted (optional)
        - Preferences with user_id take precedence over session preferences
    """

    def __init__(self, preferences_repo: IUserPreferencesRepository) -> None:
        """
        Initialize use case.

        Args:
            preferences_repo: Preferences repository for data access.
        """
        self.preferences_repo = preferences_repo

    async def execute(self, request: MigratePreferencesRequest) -> UserPreferences | None:
        """
        Execute the migration.

        Args:
            request: Request with user_id and session_id.

        Returns:
            Updated user preferences if migration occurred, None if no migration needed.
        """
        user_id_str = str(request.user_id)

        # Check if user already has preferences
        existing_user_prefs = await self.preferences_repo.get_by_user(user_id_str)

        # If user already has preferences, no migration needed
        if existing_user_prefs is not None:
            return None

        # Get anonymous session preferences
        session_prefs = await self.preferences_repo.get_by_session(request.session_id)

        # If no session preferences, nothing to migrate
        if session_prefs is None:
            return None

        # Migrate: update session preferences to include user_id
        session_prefs.user_id = user_id_str

        # Save updated preferences with user_id
        return await self.preferences_repo.upsert(session_prefs)
