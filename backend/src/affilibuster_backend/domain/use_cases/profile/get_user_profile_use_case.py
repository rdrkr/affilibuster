# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Get user profile use case.

Retrieves the authenticated user's profile information.
"""

from dataclasses import dataclass
from uuid import UUID

from affilibuster_backend.domain.entities.user import UserEntity
from affilibuster_backend.domain.repositories.user_repository import IUserRepository


@dataclass
class GetUserProfileRequest:
    """Request to get user profile.

    This is an INTERNAL USE CASE REQUEST (NOT part of OpenAPI contract).
    Used to pass parameters from route handler to use case.

    Why not in OpenAPI:
    - Simple internal DTO for use case parameters
    - user_id comes from authentication middleware, not API request body
    - Route handler extracts user_id from session/token before calling use case
    - Clean Architecture: use cases define their own input contracts
    """

    user_id: UUID


class GetUserProfileUseCase:
    """
    Use case for retrieving user profile.

    Returns the user's profile information without sensitive data (password).
    """

    def __init__(self, user_repo: IUserRepository) -> None:
        """
        Initialize use case.

        Args:
            user_repo: User repository for data access.
        """
        self.user_repo = user_repo

    async def execute(self, request: GetUserProfileRequest) -> UserEntity:
        """
        Execute the use case.

        Args:
            request: Request containing user ID.

        Returns:
            User entity with profile information.

        Raises:
            ValueError: If user not found.
        """
        user = await self.user_repo.get_by_id(request.user_id)

        if user is None:
            raise ValueError("User not found")

        return user
