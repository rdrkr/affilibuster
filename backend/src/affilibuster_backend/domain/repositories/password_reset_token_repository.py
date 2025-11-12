# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Password reset token repository interface.

Defines abstract interface for password reset token persistence operations.
Implementations are provided in the infrastructure layer.
"""

from abc import ABC, abstractmethod
from uuid import UUID

from affilibuster_backend.domain.entities.password_reset_token import (
    PasswordResetToken,
)


class IPasswordResetTokenRepository(ABC):
    """
    Abstract repository interface for PasswordResetToken entity persistence.

    This interface defines data access operations for password reset tokens
    without coupling to any specific database or ORM implementation. Follows
    Clean Architecture by keeping domain logic independent of infrastructure.
    """

    @abstractmethod
    async def create(self, token: PasswordResetToken) -> PasswordResetToken:
        """
        Create a new password reset token in the repository.

        Args:
            token: The token entity to persist.

        Returns:
            The created token with any generated fields populated.
        """
        ...

    @abstractmethod
    async def get_by_id(self, token_id: UUID) -> PasswordResetToken | None:
        """
        Retrieve a password reset token by its unique identifier.

        Args:
            token_id: The unique identifier of the token.

        Returns:
            The token if found, None otherwise.
        """
        ...

    @abstractmethod
    async def get_by_token_hash(self, token_hash: str) -> PasswordResetToken | None:
        """
        Retrieve a password reset token by its token hash.

        Args:
            token_hash: The hashed token to search for.

        Returns:
            The token if found, None otherwise.
        """
        ...

    @abstractmethod
    async def get_valid_token_by_user_id(self, user_id: UUID) -> PasswordResetToken | None:
        """
        Retrieve the most recent valid (unused, unexpired) token for a user.

        Args:
            user_id: The unique identifier of the user.

        Returns:
            The most recent valid token if found, None otherwise.
        """
        ...

    @abstractmethod
    async def update(self, token: PasswordResetToken) -> PasswordResetToken:
        """
        Update an existing password reset token in the repository.

        Args:
            token: The token entity with updated fields.

        Returns:
            The updated token.

        Raises:
            ValueError: If the token does not exist.
        """
        ...

    @abstractmethod
    async def delete(self, token_id: UUID) -> None:
        """
        Delete a password reset token from the repository.

        Args:
            token_id: The unique identifier of the token to delete.

        Raises:
            ValueError: If the token does not exist.
        """
        ...

    @abstractmethod
    async def delete_all_by_user_id(self, user_id: UUID) -> None:
        """
        Delete all password reset tokens for a specific user.

        Useful for invalidating all outstanding reset tokens after
        a successful password reset.

        Args:
            user_id: The unique identifier of the user.
        """
        ...

    @abstractmethod
    async def delete_expired_tokens(self) -> int:
        """
        Delete all expired tokens from the repository.

        This is typically called by a cleanup job.

        Returns:
            The number of expired tokens deleted.
        """
        ...
