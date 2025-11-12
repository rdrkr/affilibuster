# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Verify email use case.

Handles email verification with token validation.
"""

from dataclasses import dataclass

from affilibuster_backend.domain.entities.generated.models import AuthVerifyEmailPostRequest
from affilibuster_backend.domain.repositories.email_verification_token_repository import (
    IEmailVerificationTokenRepository,
)
from affilibuster_backend.domain.repositories.user_repository import IUserRepository
from affilibuster_backend.domain.services.token_generator import TokenGenerator


@dataclass
class VerifyEmailResponse:
    """
    Response data for email verification.

    This is an INTERNAL USE CASE RESPONSE (NOT part of OpenAPI contract).
    Used to pass data from use case to route handler.

    Why not in OpenAPI:
    - Route handler transforms this → API AuthVerifyEmailPostResponse (from OpenAPI)
    - Allows for internal success/error handling logic
    - Separates business logic response from API contract
    - Clean Architecture: use cases return domain-level data

    Attributes:
        success: Whether email was verified successfully.
        message: Success message.
    """

    success: bool
    message: str


class VerifyEmailUseCase:
    """
    Use case for verifying a user's email with a verification token.

    This use case validates the verification token and marks the user's
    email as verified. The token is marked as used to prevent reuse.

    Business Rules:
        - Token must be valid (not expired, not used)
        - User's email_verified flag is set to True
        - Token is marked as used after successful verification
        - Idempotent (succeeds if already verified)
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
            user_repository: Repository for user updates.
            token_repository: Repository for token validation.
            token_generator: Service for token hashing.
        """
        self.user_repository = user_repository
        self.token_repository = token_repository
        self.token_generator = token_generator

    async def execute(self, request: AuthVerifyEmailPostRequest) -> VerifyEmailResponse:
        """
        Execute the email verification use case.

        Args:
            request: The request with verification token.

        Returns:
            VerifyEmailResponse with success status.

        Raises:
            ValueError: If token is invalid or expired.
        """
        # Hash the token to find it in database
        hashed_token = self.token_generator.hash_token(request.token)

        # Get token by hash
        token = await self.token_repository.get_by_token_hash(hashed_token)

        # Validate token exists and is valid
        if token is None or not token.is_valid():
            raise ValueError("Invalid or expired verification token")

        # Get user
        user = await self.user_repository.get_by_id(token.user_id)

        if user is None:
            raise ValueError("Invalid or expired verification token")

        # Mark email as verified (idempotent - doesn't fail if already verified)
        if not user.email_verified:
            user.email_verified = True
            await self.user_repository.update(user)

        # Mark token as used
        token.mark_as_used()
        await self.token_repository.update(token)

        return VerifyEmailResponse(success=True, message="Email verified successfully")
