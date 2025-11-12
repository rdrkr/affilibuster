# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Update user profile use case.

Allows users to update their display name.
"""

from uuid import UUID

from affilibuster_backend.domain.entities.generated.models import AuthProfilePatchRequest
from affilibuster_backend.domain.entities.user import UserEntity
from affilibuster_backend.domain.repositories.user_repository import IUserRepository

# Display name validation constants
MAX_DISPLAY_NAME_LENGTH = 100


class UpdateProfileUseCase:
    """
    Use case for updating user profile.

    Allows users to change their display name.
    """

    def __init__(self, user_repo: IUserRepository) -> None:
        """
        Initialize use case.

        Args:
            user_repo: User repository for data access.
        """
        self.user_repo = user_repo

    async def execute(self, user_id: UUID, request: AuthProfilePatchRequest) -> UserEntity:
        """
        Execute the use case.

        Args:
            user_id: ID of the user to update.
            request: Request with new display name.

        Returns:
            Updated user entity.

        Raises:
            ValueError: If user not found or validation fails.
        """
        # Get user
        user = await self.user_repo.get_by_id(user_id)

        if user is None:
            raise ValueError("User not found")

        # Validate display name
        if not request.display_name or not request.display_name.strip():
            raise ValueError("Display name cannot be empty")

        if len(request.display_name) > MAX_DISPLAY_NAME_LENGTH:
            raise ValueError(f"Display name must be {MAX_DISPLAY_NAME_LENGTH} characters or less")

        # Update display name
        user.display_name = request.display_name.strip()

        # Save changes
        return await self.user_repo.update(user)
