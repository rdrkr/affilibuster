# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Change password use case.

Allows authenticated users to change their password.
Requires current password verification.
"""

from uuid import UUID

from affilibuster_backend.domain.entities.generated.models import (
    AuthProfileChangePasswordPostRequest,
)
from affilibuster_backend.domain.entities.user import HashedPassword, UserEntity
from affilibuster_backend.domain.repositories.session_repository import ISessionRepository
from affilibuster_backend.domain.repositories.user_repository import IUserRepository
from affilibuster_backend.domain.services.password_hasher import PasswordHasher

# Password validation constants
MIN_PASSWORD_LENGTH = 8


class ChangePasswordUseCase:
    """
    Use case for changing user password.

    Verifies current password, updates to new password,
    and invalidates all existing sessions (forces re-login).
    """

    def __init__(
        self,
        user_repo: IUserRepository,
        session_repo: ISessionRepository,
        password_hasher: PasswordHasher,
    ) -> None:
        """
        Initialize use case.

        Args:
            user_repo: User repository for data access.
            session_repo: Session repository for invalidating sessions.
            password_hasher: Password hashing service.
        """
        self.user_repo = user_repo
        self.session_repo = session_repo
        self.password_hasher = password_hasher

    async def execute(self, user_id: UUID, request: AuthProfileChangePasswordPostRequest) -> UserEntity:
        """
        Execute the use case.

        Args:
            user_id: ID of the user changing password.
            request: Request with current and new passwords.

        Returns:
            Updated user entity.

        Raises:
            ValueError: If user not found, current password is incorrect,
                       or new password validation fails.
        """
        # Get user
        user = await self.user_repo.get_by_id(user_id)

        if user is None:
            raise ValueError("User not found")

        # Verify current password
        if not self.password_hasher.verify_password(
            request.current_password.get_secret_value(), user.hashed_password.value
        ):
            raise ValueError("Current password is incorrect")

        # Validate new password
        if len(request.new_password.get_secret_value()) < MIN_PASSWORD_LENGTH:
            raise ValueError(f"New password must be at least {MIN_PASSWORD_LENGTH} characters")

        # Hash new password
        hashed_password = self.password_hasher.hash_password(request.new_password.get_secret_value())
        user.hashed_password = HashedPassword(hashed_password)

        # Save changes
        updated_user = await self.user_repo.update(user)

        # Invalidate all existing sessions (force re-login)
        await self.session_repo.delete_all_by_user_id(user.id)

        return updated_user
