# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
GetUserPreferences use case.

Reference: T075 (IUserPreferencesRepository), T076 (ICacheService)
"""

import json
from datetime import UTC, datetime
from uuid import UUID

from affilibuster_backend.domain.entities.user_preferences import UserPreferences
from affilibuster_backend.domain.repositories.cache_service import ICacheService
from affilibuster_backend.domain.repositories.preferences_repository import IUserPreferencesRepository


class GetUserPreferences:
    """
    Use case for retrieving user preferences with cache.

    Implements cache-aside pattern: try cache first, fallback to DB, then update cache.
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

    async def execute(self, session_id: str) -> UserPreferences | None:
        """
        Get user preferences by session ID with caching.

        Args:
            session_id: Session identifier

        Returns:
            Optional[UserPreferences]: User preferences if found and not expired

        """
        # Try cache first
        cache_key = f"session:{session_id}:preferences"
        cached = await self.cache_service.get(cache_key)

        if cached:
            # Cache hit - deserialize and return
            return self._deserialize(cached)

        # Cache miss - query database
        preferences = await self.preferences_repository.get_by_session(session_id)

        if preferences:
            # Update cache for next time (30 day TTL)
            await self.cache_service.set(
                cache_key,
                self._serialize(preferences),
                ttl_seconds=30 * 24 * 60 * 60,  # 30 days
            )

        return preferences

    def _serialize(self, preferences: UserPreferences) -> str:
        """Serialize preferences to JSON for caching."""
        return json.dumps(
            {
                "id": str(preferences.id),
                "session_id": preferences.session_id,
                "user_id": preferences.user_id,
                "selected_currency": preferences.selected_currency,
                "dismissed_language_prompt": preferences.dismissed_language_prompt,
                "detected_language": preferences.detected_language,
                "created_at": (preferences.created_at.isoformat() if preferences.created_at else None),
                "updated_at": (preferences.updated_at.isoformat() if preferences.updated_at else None),
                "expires_at": (preferences.expires_at.isoformat() if preferences.expires_at else None),
            },
        )

    def _deserialize(self, data: str) -> UserPreferences:
        """Deserialize preferences from JSON."""
        obj = json.loads(data)

        # Helper to ensure timezone-aware datetimes
        def parse_datetime(dt_str: str | None) -> datetime:
            if not dt_str:
                # Return current UTC time as default for missing datetime fields
                return datetime.now(UTC).replace(tzinfo=None)
            dt = datetime.fromisoformat(dt_str)
            # Ensure timezone-aware (assume UTC if naive)
            return dt if dt.tzinfo else dt.replace(tzinfo=UTC)

        return UserPreferences(
            id=UUID(obj["id"]),
            session_id=obj["session_id"],
            user_id=obj.get("user_id"),
            selected_currency=obj["selected_currency"],
            dismissed_language_prompt=obj["dismissed_language_prompt"],
            detected_language=obj.get("detected_language"),
            created_at=parse_datetime(obj.get("created_at")),
            updated_at=parse_datetime(obj.get("updated_at")),
            expires_at=parse_datetime(obj.get("expires_at")),
        )
