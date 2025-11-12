# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Request password reset use case.

Handles password reset request by generating a reset token.
"""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from affilibuster_backend.domain.entities.generated.models import AuthForgotPasswordPostRequest
from affilibuster_backend.domain.entities.password_reset_token import PasswordResetToken
from affilibuster_backend.domain.entities.user import Email, UserStatus
from affilibuster_backend.domain.repositories.password_reset_token_repository import (
    IPasswordResetTokenRepository,
)
from affilibuster_backend.domain.repositories.user_repository import IUserRepository
from affilibuster_backend.domain.services.token_generator import TokenGenerator


@dataclass
class RequestPasswordResetResponse:
    """
    Response data for password reset request.

    This is an INTERNAL USE CASE RESPONSE (NOT part of OpenAPI contract).
    Used to pass data from use case to route handler.

    Why not in OpenAPI:
    - Contains reset_token for email sending and testing (internal detail)
    - Route handler transforms this → API AuthForgotPasswordPostResponse (from OpenAPI)
    - Includes internal error details for route-level error handling
    - Separates business logic response from API contract
    - Clean Architecture: use cases return domain-level data

    Attributes:
        success: Whether request was successful (always True for security).
        reset_token: The plaintext reset token (for testing only, not exposed via API).
        error: Error message if request failed (None if successful).
    """

    success: bool
    reset_token: str | None = None
    error: str | None = None


class RequestPasswordResetUseCase:
    """
    Use case for requesting a password reset.

    This use case handles the flow of requesting a password reset link.
    It verifies if the email exists, generates a reset token, and
    (conceptually) sends an email.

    Business Rules:
        - Email must be valid format
        - If email exists, generate token and send email
        - If email doesn't exist, do nothing but return success (prevent enumeration)
        - Token expires in 1 hour
    """

    def __init__(
        self,
        user_repository: IUserRepository,
        token_repository: IPasswordResetTokenRepository,
        token_generator: TokenGenerator,
    ) -> None:
        """
        Initialize the use case with required dependencies.

        Args:
            user_repository: Repository for user persistence.
            token_repository: Repository for token persistence.
            token_generator: Service for token generation.
        """
        self.user_repository = user_repository
        self.token_repository = token_repository
        self.token_generator = token_generator

    async def execute(self, request: AuthForgotPasswordPostRequest) -> RequestPasswordResetResponse:
        """
        Execute the password reset request use case.

        Args:
            request: The password reset request with email.

        Returns:
            RequestPasswordResetResponse with success status.
        """
        # Validate email format
        try:
            email = Email(request.email)
        except ValueError:
            return RequestPasswordResetResponse(
                success=False,
                error="Invalid email format",
            )

        # Get user by email
        user = await self.user_repository.get_by_email(email)

        # Return success for non-existent users (prevent user enumeration)
        if user is None:
            return RequestPasswordResetResponse(
                success=True,
                reset_token=None,
            )

        # Return success for deleted/locked users (prevent user enumeration)
        if user.status in (UserStatus.DELETED, UserStatus.LOCKED):
            return RequestPasswordResetResponse(
                success=True,
                reset_token=None,
            )

        # Invalidate all existing password reset tokens for this user
        await self.token_repository.delete_all_by_user_id(user.id)

        # Generate new reset token
        plaintext_token = self.token_generator.generate_token(nbytes=32)
        hashed_token = self.token_generator.hash_token(plaintext_token)

        # Create token entity (expires in 1 hour)
        now = datetime.now(UTC)
        reset_token = PasswordResetToken(
            id=uuid4(),
            user_id=user.id,
            token_hash=hashed_token,
            expires_at=now + timedelta(hours=1),
            used_at=None,
            created_at=now,
        )

        # Save token to repository
        await self.token_repository.create(reset_token)

        # NOTE: For testing purposes, the plaintext_token is returned here
        # In production, this would be sent via email, not returned in API response
        return RequestPasswordResetResponse(
            success=True,
            reset_token=plaintext_token,
        )
