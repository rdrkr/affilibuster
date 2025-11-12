# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
UserEntity login use case.

Handles user authentication including credential verification,
session creation, and "remember me" functionality.
"""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from affilibuster_backend.domain.entities.generated.models import AuthLoginPostRequest
from affilibuster_backend.domain.entities.user import Email, UserEntity, UserStatus
from affilibuster_backend.domain.entities.user_session import UserSession
from affilibuster_backend.domain.repositories.session_repository import ISessionRepository
from affilibuster_backend.domain.repositories.user_repository import IUserRepository
from affilibuster_backend.domain.services.password_hasher import PasswordHasher
from affilibuster_backend.domain.services.token_generator import TokenGenerator


@dataclass
class LoginUserResponse:
    """
    Response data for user login.

    This is an INTERNAL USE CASE RESPONSE (NOT part of OpenAPI contract).
    Used to pass data from use case to route handler.

    Why not in OpenAPI:
    - Contains domain entity (UserEntity) not exposed via API
    - Route handler transforms this → API LoginResponse (from OpenAPI)
    - Includes internal error details for route-level error handling
    - Separates business logic response from API contract
    - Clean Architecture: use cases return domain-level data

    Attributes:
        success: Whether login was successful.
        user: The authenticated user entity (None if failed).
        session_token: The plaintext session token (None if failed).
        error: Error message if login failed (None if successful).
    """

    success: bool
    user: UserEntity | None
    session_token: str | None = None
    error: str | None = None


class LoginUserUseCase:
    """
    Use case for authenticating a user and creating a session.

    This use case handles the complete login flow including credential
    verification, user status checks, session creation, and last login
    timestamp updates.

    Business Rules:
        - Email and password must be correct
        - UserEntity must be ACTIVE (not LOCKED or DELETED)
        - Session duration: 7 days normal, 30 days with remember_me
        - Session tokens are hashed before storage
        - Generic error messages (don't reveal if email exists)
        - Updates last_login_at timestamp on success
    """

    def __init__(
        self,
        user_repository: IUserRepository,
        session_repository: ISessionRepository,
        password_hasher: PasswordHasher,
        token_generator: TokenGenerator,
    ) -> None:
        """
        Initialize the use case with required dependencies.

        Args:
            user_repository: Repository for user persistence.
            session_repository: Repository for session persistence.
            password_hasher: Service for password verification.
            token_generator: Service for session token generation.
        """
        self.user_repository = user_repository
        self.session_repository = session_repository
        self.password_hasher = password_hasher
        self.token_generator = token_generator

    async def execute(self, request: AuthLoginPostRequest) -> LoginUserResponse:
        """
        Execute the user login use case.

        Args:
            request: The login request with email, password, and remember_me flag.

        Returns:
            LoginUserResponse with success status, user, and session token.
        """
        # Validate email format
        try:
            email = Email(request.email)
        except ValueError:
            # Generic error - don't reveal if email is invalid
            return LoginUserResponse(
                success=False,
                user=None,
                error="Invalid email or password",
            )

        # Get user by email
        user = await self.user_repository.get_by_email(email)

        # UserEntity not found - generic error (don't reveal email doesn't exist)
        if user is None:
            return LoginUserResponse(
                success=False,
                user=None,
                error="Invalid email or password",
            )

        # Check if user account is active
        if user.status == UserStatus.LOCKED:
            return LoginUserResponse(
                success=False,
                user=None,
                error="Account is locked",
            )

        if user.status == UserStatus.DELETED:
            # Generic error - don't reveal account is deleted
            return LoginUserResponse(
                success=False,
                user=None,
                error="Invalid email or password",
            )

        # Verify password
        password_valid = self.password_hasher.verify_password(
            request.password.get_secret_value(), user.hashed_password.value
        )

        if not password_valid:
            # Generic error - don't reveal password is wrong
            return LoginUserResponse(
                success=False,
                user=None,
                error="Invalid email or password",
            )

        # Generate session token
        plaintext_token = self.token_generator.generate_token(nbytes=32)
        hashed_token = self.token_generator.hash_token(plaintext_token)

        # Determine session expiration based on remember_me flag
        now = datetime.now(UTC)
        expires_at = now + timedelta(days=30) if request.remember_me else now + timedelta(days=7)

        # Create session entity
        session = UserSession(
            id=uuid4(),
            user_id=user.id,
            token_hash=hashed_token,
            expires_at=expires_at,
            remember_me=request.remember_me or False,  # Default to False if None
            created_at=now,
        )

        # Save session to repository
        await self.session_repository.create(session)

        # Update user's last login timestamp
        user.last_login_at = now
        await self.user_repository.update(user)

        return LoginUserResponse(
            success=True,
            user=user,
            session_token=plaintext_token,
        )
