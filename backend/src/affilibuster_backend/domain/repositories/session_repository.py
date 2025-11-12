# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Session repository interface.

Defines abstract interface for user session persistence operations.
Implementations are provided in the infrastructure layer.
"""

from abc import ABC, abstractmethod
from uuid import UUID

from affilibuster_backend.domain.entities.user_session import UserSession


class ISessionRepository(ABC):
    """
    Abstract repository interface for UserSession entity persistence.

    This interface defines data access operations for user sessions without
    coupling to any specific database or ORM implementation. Follows
    Clean Architecture by keeping domain logic independent of infrastructure.
    """

    @abstractmethod
    async def create(self, session: UserSession) -> UserSession:
        """
        Create a new session in the repository.

        Args:
            session: The session entity to persist.

        Returns:
            The created session with any generated fields populated.
        """
        ...

    @abstractmethod
    async def get_by_id(self, session_id: UUID) -> UserSession | None:
        """
        Retrieve a session by its unique identifier.

        Args:
            session_id: The unique identifier of the session.

        Returns:
            The session if found, None otherwise.
        """
        ...

    @abstractmethod
    async def get_by_token_hash(self, token_hash: str) -> UserSession | None:
        """
        Retrieve a session by its token hash.

        Args:
            token_hash: The hashed session token to search for.

        Returns:
            The session if found, None otherwise.
        """
        ...

    @abstractmethod
    async def get_active_sessions_by_user_id(self, user_id: UUID) -> list[UserSession]:
        """
        Retrieve all active (non-expired) sessions for a user.

        Args:
            user_id: The unique identifier of the user.

        Returns:
            List of active sessions for the user, empty list if none found.
        """
        ...

    @abstractmethod
    async def update(self, session: UserSession) -> UserSession:
        """
        Update an existing session in the repository.

        Args:
            session: The session entity with updated fields.

        Returns:
            The updated session.

        Raises:
            ValueError: If the session does not exist.
        """
        ...

    @abstractmethod
    async def delete(self, session_id: UUID) -> None:
        """
        Delete a session from the repository.

        Args:
            session_id: The unique identifier of the session to delete.

        Raises:
            ValueError: If the session does not exist.
        """
        ...

    @abstractmethod
    async def delete_all_by_user_id(self, user_id: UUID) -> None:
        """
        Delete all sessions for a specific user.

        Useful for logout-all-devices functionality.

        Args:
            user_id: The unique identifier of the user.
        """
        ...

    @abstractmethod
    async def delete_expired_sessions(self) -> int:
        """
        Delete all expired sessions from the repository.

        This is typically called by a cleanup job.

        Returns:
            The number of expired sessions deleted.
        """
        ...
