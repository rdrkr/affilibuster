# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
UpdateUserPreferences use case.

Reference: research.md:274-282
"""

import json
from datetime import datetime, timedelta
from src.domain.entities.user_preferences import UserPreferences
from src.domain.repositories.preferences_repository import IUserPreferencesRepository
from src.domain.repositories.cache_service import ICacheService


class UpdateUserPreferences:
    """
    Use case for updating user preferences.

    Updates both database and cache, refreshing TTL.
    """

    def __init__(
        self,
        preferences_repository: IUserPreferencesRepository,
        cache_service: ICacheService,
    ):
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
        now = datetime.utcnow()
        preferences.updated_at = now
        preferences.expires_at = now + timedelta(days=30)

        # Upsert to database
        updated = await self.preferences_repository.upsert(preferences)

        # Update cache
        cache_key = f"session:{preferences.session_id}:preferences"
        await self.cache_service.set(
            cache_key,
            self._serialize(updated),
            ttl_seconds=30 * 24 * 60 * 60,  # 30 days
        )

        return updated

    def _serialize(self, preferences: UserPreferences) -> str:
        """Serialize preferences to JSON for caching."""
        return json.dumps({
            'id': str(preferences.id),
            'session_id': preferences.session_id,
            'user_id': preferences.user_id,
            'selected_currency': preferences.selected_currency,
            'dismissed_language_prompt': preferences.dismissed_language_prompt,
            'detected_language': preferences.detected_language,
            'created_at': preferences.created_at.isoformat() if preferences.created_at else None,
            'updated_at': preferences.updated_at.isoformat() if preferences.updated_at else None,
            'expires_at': preferences.expires_at.isoformat() if preferences.expires_at else None,
        })
