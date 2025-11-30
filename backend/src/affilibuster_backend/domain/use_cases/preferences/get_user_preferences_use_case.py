# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
GetUserPreferencesUseCase use case.

Reference: T075 (IUserPreferencesRepository), T076 (ICacheService)
"""

from affilibuster_backend.domain.entities.generated.models import UserPreferences
from affilibuster_backend.domain.repositories.cache_service import ICacheService
from affilibuster_backend.domain.repositories.preferences_repository import IUserPreferencesRepository


class GetUserPreferencesUseCase:
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
            return UserPreferences.model_validate_json(cached)

        # Cache miss - query database
        preferences = await self.preferences_repository.get_by_session(session_id)

        if preferences:
            # Update cache for next time (30 day TTL)
            await self.cache_service.set(
                cache_key,
                preferences.model_dump_json(by_alias=True),
                ttl_seconds=30 * 24 * 60 * 60,  # 30 days
            )

        return preferences
