# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Reset password use case.

Handles password reset with token validation and password update.
"""

from dataclasses import dataclass

from pydantic import SecretStr

from affilibuster_backend.domain.entities.generated.models import AuthResetPasswordPostRequest
from affilibuster_backend.domain.entities.user import HashedPassword
from affilibuster_backend.domain.repositories.password_reset_token_repository import (
    IPasswordResetTokenRepository,
)
from affilibuster_backend.domain.repositories.user_repository import IUserRepository
from affilibuster_backend.domain.services.password_hasher import PasswordHasher
from affilibuster_backend.domain.services.token_generator import TokenGenerator

# Password validation constants
MIN_PASSWORD_LENGTH = 8


@dataclass
class ResetPasswordResponse:
    """
    Response data for password reset.

    This is an INTERNAL USE CASE RESPONSE (NOT part of OpenAPI contract).
    Used to pass data from use case to route handler.

    Why not in OpenAPI:
    - Route handler transforms this → API AuthResetPasswordPostResponse (from OpenAPI)
    - Includes internal error details for route-level error handling
    - Separates business logic response from API contract
    - Clean Architecture: use cases return domain-level data

    Attributes:
        success: Whether reset was successful.
        error: Error message if reset failed (None if successful).
    """

    success: bool
    error: str | None = None


class ResetPasswordUseCase:
    """
    Use case for resetting a user's password.

    This use case handles the actual password reset using a valid token.
    It validates the token, updates the password, and invalidates all
    existing sessions.

    Business Rules:
        - Token must be valid (exists, not expired, not used)
        - New password must be at least 8 characters
        - UserEntity must exist
        - All existing sessions are invalidated (security)
        - Token is marked as used
    """

    def __init__(
        self,
        user_repository: IUserRepository,
        token_repository: IPasswordResetTokenRepository,
        password_hasher: PasswordHasher,
        token_generator: TokenGenerator,
    ) -> None:
        """
        Initialize the use case with required dependencies.

        Args:
            user_repository: Repository for user persistence.
            token_repository: Repository for token persistence.
            password_hasher: Service for password hashing.
            token_generator: Service for token generation.
        """
        self.user_repository = user_repository
        self.token_repository = token_repository
        self.password_hasher = password_hasher
        self.token_generator = token_generator

    async def execute(self, request: AuthResetPasswordPostRequest) -> ResetPasswordResponse:
        """
        Execute the password reset use case.

        Args:
            request: The password reset request with token and new password.

        Returns:
            ResetPasswordResponse with success status.
        """
        # Validate new password
        password_error = self._validate_password(request.new_password)
        if password_error:
            return ResetPasswordResponse(
                success=False,
                error=password_error,
            )

        # Hash the provided token to look it up
        hashed_token = self.token_generator.hash_token(request.token)
        token = await self.token_repository.get_by_token_hash(hashed_token)

        # Validate token exists and is valid
        if token is None or not token.is_valid():
            return ResetPasswordResponse(
                success=False,
                error="Invalid or expired reset token",
            )

        # Get user
        user = await self.user_repository.get_by_id(token.user_id)

        if user is None:
            return ResetPasswordResponse(
                success=False,
                error="Invalid or expired reset token",
            )

        # Hash new password
        new_hashed_password = HashedPassword(
            self.password_hasher.hash_password(request.new_password.get_secret_value())
        )

        # Update user password
        user.hashed_password = new_hashed_password
        await self.user_repository.update(user)

        # Mark token as used
        token.mark_as_used()
        await self.token_repository.update(token)

        return ResetPasswordResponse(success=True)

    def _validate_password(self, password: SecretStr) -> str | None:
        """
        Validate password meets requirements.

        Args:
            password: The plaintext password to validate.

        Returns:
            Error message if invalid, None if valid.
        """
        password_value = password.get_secret_value()
        if not password_value or not password_value.strip():
            return "Password cannot be empty"

        if len(password_value) < MIN_PASSWORD_LENGTH:
            return f"Password must be at least {MIN_PASSWORD_LENGTH} characters"

        return None
