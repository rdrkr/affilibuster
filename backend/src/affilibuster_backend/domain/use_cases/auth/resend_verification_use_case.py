# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Resend email verification use case.

Handles generating and sending a new email verification token.
"""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from affilibuster_backend.domain.entities.email_verification_token import EmailVerificationToken
from affilibuster_backend.domain.entities.generated.models import AuthResendVerificationPostRequest
from affilibuster_backend.domain.repositories.email_verification_token_repository import (
    IEmailVerificationTokenRepository,
)
from affilibuster_backend.domain.repositories.user_repository import IUserRepository
from affilibuster_backend.domain.services.token_generator import TokenGenerator


@dataclass
class ResendVerificationResponse:
    """
    Response data for resending email verification.

    This is an INTERNAL USE CASE RESPONSE (NOT part of OpenAPI contract).
    Used to pass data from use case to route handler.

    Why not in OpenAPI:
    - Contains verification_token for email sending (internal detail)
    - Route handler transforms this → API AuthResendVerificationPostResponse (from OpenAPI)
    - Separates business logic response from API contract
    - Clean Architecture: use cases return domain-level data

    Attributes:
        success: Whether the verification email was resent successfully.
        verification_token: The plaintext verification token to send via email.
    """

    success: bool
    verification_token: str | None = None


class ResendVerificationUseCase:
    """
    Use case for resending email verification to a user.

    This use case invalidates any existing verification tokens and generates
    a new one to be sent to the user's email address.

    Business Rules:
        - User must exist
        - User must not already be verified
        - Existing verification tokens are invalidated
        - New token expires in 24 hours
    """

    def __init__(
        self,
        user_repository: IUserRepository,
        token_repository: IEmailVerificationTokenRepository,
        token_generator: TokenGenerator,
    ) -> None:
        """
        Initialize the use case with required dependencies.

        Args:
            user_repository: Repository for user lookup.
            token_repository: Repository for token persistence.
            token_generator: Service for token generation.
        """
        self.user_repository = user_repository
        self.token_repository = token_repository
        self.token_generator = token_generator

    async def execute(self, request: AuthResendVerificationPostRequest) -> ResendVerificationResponse:
        """
        Execute the resend verification use case.

        Args:
            request: The request with user ID.

        Returns:
            ResendVerificationResponse with success status and verification token.

        Raises:
            ValueError: If user not found or already verified.
        """
        # Get user
        user = await self.user_repository.get_by_id(request.user_id)

        if user is None:
            raise ValueError("User not found")

        # Check if already verified
        if user.email_verified:
            raise ValueError("Email is already verified")

        # Delete any existing verification tokens for this user
        await self.token_repository.delete_all_by_user_id(request.user_id)

        # Generate new email verification token
        now = datetime.now(UTC)
        plaintext_token = self.token_generator.generate_token(nbytes=32)
        hashed_token = self.token_generator.hash_token(plaintext_token)

        # Create verification token entity
        verification_token = EmailVerificationToken(
            id=uuid4(),
            user_id=user.id,
            token_hash=hashed_token,
            expires_at=now + timedelta(hours=24),
            used_at=None,
            created_at=now,
        )

        # Save verification token to repository
        await self.token_repository.create(verification_token)

        return ResendVerificationResponse(
            success=True,
            verification_token=plaintext_token,
        )
