# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
User logout use case.

Handles user logout by invalidating the current session.
"""

from dataclasses import dataclass

from affilibuster_backend.domain.entities.generated.models import AuthLogoutPostRequest
from affilibuster_backend.domain.repositories.session_repository import ISessionRepository
from affilibuster_backend.domain.services.token_generator import TokenGenerator


@dataclass
class LogoutUserResponse:
    """
    Response data for user logout.

    This is an INTERNAL USE CASE RESPONSE (NOT part of OpenAPI contract).
    Used to pass data from use case to route handler.

    Why not in OpenAPI:
    - Route handler transforms this → API AuthLogoutPostResponse (from OpenAPI)
    - Allows for internal success/error handling logic
    - Separates business logic response from API contract
    - Clean Architecture: use cases return domain-level data

    Attributes:
        success: Whether logout was successful.
        message: Success message.
    """

    success: bool
    message: str


class LogoutUserUseCase:
    """
    Use case for logging out a user by invalidating their session.

    This use case handles session invalidation by deleting the session
    from the database. This prevents the token from being used again.

    Business Rules:
        - Session token must not be empty
        - Session is deleted regardless of expiration status
        - Invalid tokens result in error (not silent failure)
    """

    def __init__(
        self,
        session_repository: ISessionRepository,
        token_generator: TokenGenerator,
    ) -> None:
        """
        Initialize the use case with required dependencies.

        Args:
            session_repository: Repository for session persistence.
            token_generator: Service for token hashing.
        """
        self.session_repository = session_repository
        self.token_generator = token_generator

    async def execute(self, request: AuthLogoutPostRequest) -> LogoutUserResponse:
        """
        Execute the user logout use case.

        Args:
            request: The logout request with session token.

        Returns:
            LogoutUserResponse with success status.

        Raises:
            ValueError: If the session token is invalid.
        """
        # Validate token is not empty
        if not request.session_token or not request.session_token.strip():
            raise ValueError("Session token is required")

        # Hash the token to find it in database
        hashed_token = self.token_generator.hash_token(request.session_token)

        # Get session by token hash
        session = await self.session_repository.get_by_token_hash(hashed_token)

        if session is None:
            raise ValueError("Invalid session")

        # Delete the session (invalidate token)
        await self.session_repository.delete(session.id)

        return LogoutUserResponse(success=True, message="Logged out successfully")
