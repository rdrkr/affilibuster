# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
UpdateUserPreferencesUseCase use case.

Reference: research.md:274-282
"""

from datetime import UTC, datetime, timedelta

from affilibuster_backend.domain.entities.generated.models import UserPreferences
from affilibuster_backend.domain.repositories.cache_service import ICacheService
from affilibuster_backend.domain.repositories.preferences_repository import IUserPreferencesRepository


class UpdateUserPreferencesUseCase:
    """
    Use case for updating user preferences.

    Updates both database and cache, refreshing TTL.
    """

    def __init__(
        self,
        preferences_repository: IUserPreferencesRepository,
        cache_service: ICacheService,
    ) -> None:
        """
        Initialize use case with repositories.

        Args:
            preferences_repository: User preferences repository implementation
            cache_service: Cache service implementation

        """
        self.preferences_repository = preferences_repository
        self.cache_service = cache_service

    async def execute(self, preferences: UserPreferences) -> UserPreferences:
        """
        Update user preferences and cache.

        Args:
            preferences: UserPreferences to update

        Returns:
            UserPreferences: Updated preferences

        """
        # Refresh timestamps and TTL
        now = datetime.now(UTC)
        preferences.updated_at = now
        preferences.expires_at = now + timedelta(days=30)

        # Upsert to database
        updated = await self.preferences_repository.upsert(preferences)

        # Update cache
        cache_key = f"session:{preferences.session_id}:preferences"
        await self.cache_service.set(
            cache_key,
            updated.model_dump_json(by_alias=True),
            ttl_seconds=30 * 24 * 60 * 60,  # 30 days
        )

        return updated
