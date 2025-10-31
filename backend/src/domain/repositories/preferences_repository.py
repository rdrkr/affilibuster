# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
User preferences repository interface.

Reference: T063 (UserPreferences entity)
"""

from abc import ABC, abstractmethod

from ..entities.user_preferences import UserPreferences


class IUserPreferencesRepository(ABC):
    """
    Repository interface for UserPreferences entities.

    Provides methods for managing user preferences with TTL support.
    """

    @abstractmethod
    async def get_by_session(self, session_id: str) -> UserPreferences | None:
        """
        Get user preferences by session ID.

        Args:
            session_id: Session identifier

        Returns:
            Optional[UserPreferences]: Preferences if found and not expired, None otherwise

        """

    @abstractmethod
    async def get_by_user(self, user_id: str) -> UserPreferences | None:
        """
        Get user preferences by user ID.

        Args:
            user_id: User identifier

        Returns:
            Optional[UserPreferences]: Preferences if found and not expired, None otherwise

        """

    @abstractmethod
    async def upsert(self, preferences: UserPreferences) -> UserPreferences:
        """
        Create or update user preferences.

        Args:
            preferences: UserPreferences to save

        Returns:
            UserPreferences: Saved preferences

        """

    @abstractmethod
    async def delete_expired(self) -> int:
        """
        Delete all expired preferences.

        Returns:
            int: Number of deleted preferences

        """

    @abstractmethod
    async def delete_by_session(self, session_id: str) -> bool:
        """
        Delete preferences by session ID.

        Args:
            session_id: Session identifier

        Returns:
            bool: True if deleted, False if not found

        """
