# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
UserEntity registration use case.

Handles user registration including validation, password hashing,
and email verification token generation.
"""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from affilibuster_backend.domain.entities.email_verification_token import EmailVerificationToken
from affilibuster_backend.domain.entities.generated.models import AuthRegisterPostRequest
from affilibuster_backend.domain.entities.user import Email, HashedPassword, UserEntity, UserStatus
from affilibuster_backend.domain.repositories.email_verification_token_repository import (
    IEmailVerificationTokenRepository,
)
from affilibuster_backend.domain.repositories.user_repository import IUserRepository
from affilibuster_backend.domain.services.password_hasher import PasswordHasher
from affilibuster_backend.domain.services.token_generator import TokenGenerator

# Validation constants
MIN_PASSWORD_LENGTH = 8
MAX_DISPLAY_NAME_LENGTH = 100


@dataclass
class RegisterUserResponse:
    """
    Response data for user registration.

    This is an INTERNAL USE CASE RESPONSE (NOT part of OpenAPI contract).
    Used to pass data from use case to route handler.

    Why not in OpenAPI:
    - Contains domain entity (UserEntity) not exposed via API
    - Route handler transforms this → API RegisterResponse (from OpenAPI)
    - Includes verification_token for email sending (internal detail)
    - Includes internal error details for route-level error handling
    - Separates business logic response from API contract
    - Clean Architecture: use cases return domain-level data

    Attributes:
        success: Whether registration was successful.
        user: The created user entity (None if failed).
        verification_token: The plaintext verification token to send via email.
        error: Error message if registration failed (None if successful).
    """

    success: bool
    user: UserEntity | None
    verification_token: str | None = None
    error: str | None = None


class RegisterUserUseCase:
    """
    Use case for registering a new user.

    This use case handles the complete user registration flow including
    input validation, duplicate email checking, password hashing, user
    creation, and email verification token generation.

    Business Rules:
        - Email must be valid format and unique
        - Password must be at least 8 characters
        - Display name must be 1-100 characters
        - New users start with email_verified=False
        - Verification token expires in 24 hours
    """

    def __init__(
        self,
        user_repository: IUserRepository,
        token_repository: IEmailVerificationTokenRepository,
        password_hasher: PasswordHasher,
        token_generator: TokenGenerator,
    ) -> None:
        """
        Initialize the use case with required dependencies.

        Args:
            user_repository: Repository for user persistence.
            token_repository: Repository for verification token persistence.
            password_hasher: Service for password hashing.
            token_generator: Service for token generation.
        """
        self.user_repository = user_repository
        self.token_repository = token_repository
        self.password_hasher = password_hasher
        self.token_generator = token_generator

    async def execute(self, request: AuthRegisterPostRequest) -> RegisterUserResponse:
        """
        Execute the user registration use case.

        Args:
            request: The registration request with email, password, display name.

        Returns:
            RegisterUserResponse with success status, user, and verification token.
        """
        # Validate email
        try:
            email = Email(request.email)
        except ValueError as e:
            return RegisterUserResponse(
                success=False,
                user=None,
                error=str(e),
            )

        # Validate password
        password_error = self._validate_password(request.password.get_secret_value())
        if password_error:
            return RegisterUserResponse(
                success=False,
                user=None,
                error=password_error,
            )

        # Validate display name
        display_name_error = self._validate_display_name(request.display_name)
        if display_name_error:
            return RegisterUserResponse(
                success=False,
                user=None,
                error=display_name_error,
            )

        # Check if email already exists
        if await self.user_repository.exists_by_email(email):
            return RegisterUserResponse(
                success=False,
                user=None,
                error="Email already registered",
            )

        # Hash password
        hashed_password = HashedPassword(self.password_hasher.hash_password(request.password.get_secret_value()))

        # Create user entity
        now = datetime.now(UTC)
        user = UserEntity(
            id=uuid4(),
            email=email,
            hashed_password=hashed_password,
            display_name=request.display_name,
            email_verified=False,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        # Save user to repository
        created_user = await self.user_repository.create(user)

        # Generate email verification token
        plaintext_token = self.token_generator.generate_token(nbytes=32)
        hashed_token = self.token_generator.hash_token(plaintext_token)

        # Create verification token entity
        verification_token = EmailVerificationToken(
            id=uuid4(),
            user_id=created_user.id,
            token_hash=hashed_token,
            expires_at=now + timedelta(hours=24),
            used_at=None,
            created_at=now,
        )

        # Save verification token to repository
        await self.token_repository.create(verification_token)

        return RegisterUserResponse(
            success=True,
            user=created_user,
            verification_token=plaintext_token,
        )

    def _validate_password(self, password: str) -> str | None:
        """
        Validate password meets requirements.

        Args:
            password: The plaintext password to validate.

        Returns:
            Error message if invalid, None if valid.
        """
        if not password or not password.strip():
            return "Password cannot be empty"

        if len(password) < MIN_PASSWORD_LENGTH:
            return f"Password must be at least {MIN_PASSWORD_LENGTH} characters"

        return None

    def _validate_display_name(self, display_name: str) -> str | None:
        """
        Validate display name meets requirements.

        Args:
            display_name: The display name to validate.

        Returns:
            Error message if invalid, None if valid.
        """
        if not display_name or not display_name.strip():
            return "Display name cannot be empty"

        if len(display_name) > MAX_DISPLAY_NAME_LENGTH:
            return f"Display name must be {MAX_DISPLAY_NAME_LENGTH} characters or less"

        return None
