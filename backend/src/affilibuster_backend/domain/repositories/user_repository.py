# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
UserEntity repository interface.

Defines abstract interface for user persistence operations.
Implementations are provided in the infrastructure layer.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from uuid import UUID

from affilibuster_backend.domain.entities.user import Email, UserEntity


class IUserRepository(ABC):
    """
    Abstract repository interface for UserEntity entity persistence.

    This interface defines data access operations for users without
    coupling to any specific database or ORM implementation. Follows
    Clean Architecture by keeping domain logic independent of infrastructure.
    """

    @abstractmethod
    async def create(self, user: UserEntity) -> UserEntity:
        """
        Create a new user in the repository.

        Args:
            user: The user entity to persist.

        Returns:
            The created user with any generated fields populated.

        Raises:
            ValueError: If a user with the same email already exists.
        """
        ...

    @abstractmethod
    async def get_by_id(self, user_id: UUID) -> UserEntity | None:
        """
        Retrieve a user by their unique identifier.

        Args:
            user_id: The unique identifier of the user.

        Returns:
            The user if found, None otherwise.
        """
        ...

    @abstractmethod
    async def get_by_email(self, email: Email) -> UserEntity | None:
        """
        Retrieve a user by their email address.

        Args:
            email: The email address to search for.

        Returns:
            The user if found, None otherwise.
        """
        ...

    @abstractmethod
    async def update(self, user: UserEntity) -> UserEntity:
        """
        Update an existing user in the repository.

        Args:
            user: The user entity with updated fields.

        Returns:
            The updated user.

        Raises:
            ValueError: If the user does not exist.
        """
        ...

    @abstractmethod
    async def delete(self, user_id: UUID) -> None:
        """
        Delete a user from the repository (hard delete).

        This is a hard delete. For soft deletes, use UserEntity.soft_delete()
        and then update the user.

        Args:
            user_id: The unique identifier of the user to delete.

        Raises:
            ValueError: If the user does not exist.
        """
        ...

    @abstractmethod
    async def get_soft_deleted_before(self, cutoff: datetime) -> list[UUID]:
        """
        Get IDs of soft-deleted users whose deletion date is before the cutoff.

        Used by data retention cleanup to find users eligible for hard deletion.

        Args:
            cutoff: Users soft-deleted before this datetime are returned.

        Returns:
            List of user IDs eligible for hard deletion.
        """
        ...

    @abstractmethod
    async def exists_by_email(self, email: Email) -> bool:
        """
        Check if a user with the given email exists.

        Args:
            email: The email address to check.

        Returns:
            True if a user with the email exists, False otherwise.
        """
        ...
