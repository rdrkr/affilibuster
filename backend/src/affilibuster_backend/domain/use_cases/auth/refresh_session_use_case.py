# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Session refresh use case.

Handles session refresh by extending expiration time.
"""

from datetime import UTC, datetime, timedelta

from affilibuster_backend.domain.entities.generated.models import (
    AuthRefreshPostRequest,
    RefreshResponse,
    Status,
    User,
)
from affilibuster_backend.domain.repositories.session_repository import ISessionRepository
from affilibuster_backend.domain.repositories.user_repository import IUserRepository
from affilibuster_backend.domain.services.token_generator import TokenGenerator


class RefreshSessionUseCase:
    """
    Use case for refreshing/extending a user session.

    This use case extends the expiration time of an existing session,
    allowing users to stay logged in without re-authenticating.

    Business Rules:
        - Session token must not be empty
        - Session must not be expired
        - Session must exist
        - Normal sessions: Extended by 7 days from now
        - Remember me sessions: Extended by 30 days from now
    """

    def __init__(
        self,
        session_repository: ISessionRepository,
        user_repository: IUserRepository,
        token_generator: TokenGenerator,
    ) -> None:
        """
        Initialize the use case with required dependencies.

        Args:
            session_repository: Repository for session persistence.
            user_repository: Repository for user data retrieval.
            token_generator: Service for token hashing.
        """
        self.session_repository = session_repository
        self.user_repository = user_repository
        self.token_generator = token_generator

    async def execute(self, request: AuthRefreshPostRequest) -> RefreshResponse:
        """
        Refresh a user session.

        Args:
            request: The refresh request containing the session token.

        Returns:
            RefreshResponse: The new session token and expiration.

        Raises:
            ValueError: If the session token is invalid or expired.
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

        # Check if session is expired
        if session.is_expired():
            raise ValueError("Session has expired")

        # Extend session expiration based on remember_me flag
        now = datetime.now(UTC)
        new_expires_at = now + timedelta(days=30) if session.remember_me else now + timedelta(days=7)

        # Update session with new expiration
        session.expires_at = new_expires_at
        await self.session_repository.update(session)

        # Fetch user data for the session
        user_entity = await self.user_repository.get_by_id(session.user_id)

        if user_entity is None:
            raise ValueError("User not found for session")

        # Convert UserEntity to API User model
        user = User(
            id=user_entity.id,
            email=user_entity.email.value,
            display_name=user_entity.display_name,
            email_verified=user_entity.email_verified,
            status=Status(user_entity.status.value),
            created_at=user_entity.created_at,
            updated_at=user_entity.updated_at,
            last_login_at=user_entity.last_login_at,
        )

        return RefreshResponse(
            success=True,
            session_token=request.session_token,
            expires_at=new_expires_at,
            user=user,
        )
