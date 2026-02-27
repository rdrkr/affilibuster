# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Authentication API routes.

Handles user registration, login, logout, session management,
email verification, and password reset flows.

Reference: contracts/template.openapi.yaml#/paths/auth
"""

import logging
from datetime import UTC, datetime, timedelta
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status

from affilibuster_backend.config.settings import settings
from affilibuster_backend.domain.entities.generated.models import (
    AuthForgotPasswordPostRequest,
    AuthForgotPasswordPostResponse,
    AuthLoginPostRequest,
    AuthLogoutPostRequest,
    AuthLogoutPostResponse,
    AuthRefreshPostRequest,
    AuthRegisterPostRequest,
    AuthResendVerificationPostRequest,
    AuthResendVerificationPostResponse,
    AuthResetPasswordPostRequest,
    AuthResetPasswordPostResponse,
    AuthVerifyEmailPostRequest,
    AuthVerifyEmailPostResponse,
    LoginResponse,
    RefreshResponse,
    RegisterResponse,
    Status,
    User,
)
from affilibuster_backend.domain.entities.user_session import UserSession
from affilibuster_backend.domain.repositories.email_verification_token_repository import (
    IEmailVerificationTokenRepository,
)
from affilibuster_backend.domain.repositories.password_reset_token_repository import (
    IPasswordResetTokenRepository,
)
from affilibuster_backend.domain.services.password_hasher import PasswordHasher
from affilibuster_backend.domain.use_cases.auth.login_user_use_case import (
    LoginUserUseCase,
)
from affilibuster_backend.domain.use_cases.auth.logout_user_use_case import (
    LogoutUserUseCase,
)
from affilibuster_backend.domain.use_cases.auth.refresh_session_use_case import (
    RefreshSessionUseCase,
)
from affilibuster_backend.domain.use_cases.auth.register_user_use_case import (
    RegisterUserUseCase,
)
from affilibuster_backend.domain.use_cases.auth.request_password_reset_use_case import (
    RequestPasswordResetUseCase,
)
from affilibuster_backend.domain.use_cases.auth.resend_verification_use_case import (
    ResendVerificationUseCase,
)
from affilibuster_backend.domain.use_cases.auth.reset_password_use_case import (
    ResetPasswordUseCase,
)
from affilibuster_backend.domain.use_cases.auth.verify_email_use_case import (
    VerifyEmailUseCase,
)
from affilibuster_backend.domain.use_cases.preferences.migrate_preferences_to_user_use_case import (
    MigratePreferencesRequest,
    MigratePreferencesToUserUseCase,
)
from affilibuster_backend.infrastructure.api.dependencies.auth_dependencies import (
    CurrentUser,
    SessionRepoDep,
    TokenGeneratorDep,
    UserRepoDep,
)
from affilibuster_backend.infrastructure.dependencies import (
    PreferencesRepoDep,
    get_email_verification_token_repo,
    get_password_reset_token_repo,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


# ============================================================================
# Dependency Type Aliases
# ============================================================================

EmailVerificationTokenRepoDep = Annotated[IEmailVerificationTokenRepository, Depends(get_email_verification_token_repo)]

PasswordResetTokenRepoDep = Annotated[IPasswordResetTokenRepository, Depends(get_password_reset_token_repo)]


# ============================================================================
# Route Handlers
# ============================================================================


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "User registered successfully"},
        409: {"description": "Email already exists"},
        422: {"description": "Validation error"},
        429: {"description": "Rate limit exceeded"},
    },
)
async def register_user(  # noqa: PLR0913 - All dependencies required for FastAPI dependency injection
    response: Response,
    body: AuthRegisterPostRequest,
    user_repo: UserRepoDep,
    session_repo: SessionRepoDep,
    token_repo: EmailVerificationTokenRepoDep,
    token_generator: TokenGeneratorDep,
) -> RegisterResponse:
    """
    Register a new user account.

    Creates a new user with the provided credentials and sends a verification
    email to the provided email address. Also creates a session and sets
    authentication cookie to automatically log the user in.

    Args:
        response: FastAPI response object (for setting cookies)
        body: Registration data (email, password, display_name)
        user_repo: User repository dependency
        session_repo: Session repository dependency
        token_repo: Email verification token repository dependency
        token_generator: Token generator dependency

    Returns:
        RegisterResponse with user data, verification token, and success status

    Raises:
        HTTPException: 409 if email already exists, 422 for validation errors
    """
    # Create use case
    use_case = RegisterUserUseCase(
        user_repository=user_repo,
        token_repository=token_repo,
        password_hasher=PasswordHasher(),
        token_generator=token_generator,
    )

    # Execute registration
    result = await use_case.execute(body)

    # Handle errors
    if not result.success:
        # Map error messages to appropriate HTTP status codes
        error_msg = result.error or "Unknown error"
        if "already registered" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=result.error,
            )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=result.error,
        )

    # Build response
    domain_user = result.user
    if domain_user is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User creation failed",
        )

    # Create session to automatically log the user in after registration
    # This ensures session persistence across page reloads

    # Generate session token
    plaintext_token = token_generator.generate_token(nbytes=32)
    hashed_token = token_generator.hash_token(plaintext_token)

    # Default to 7-day session (remember_me=False)
    now = datetime.now(UTC)
    expires_at = now + timedelta(days=7)

    # Create session entity
    session = UserSession(
        id=uuid4(),
        user_id=domain_user.id,
        token_hash=hashed_token,
        expires_at=expires_at,
        remember_me=False,
        created_at=now,
    )

    # Save session to repository
    await session_repo.create(session)

    # Set HTTP-only cookie with session token (same as login)
    max_age = int(timedelta(days=7).total_seconds())

    response.set_cookie(
        key="access_token",
        value=plaintext_token,
        path="/",
        httponly=True,
        secure=settings.should_use_secure_cookies,
        samesite=settings.samesite_cookie_policy,
        max_age=max_age,
    )

    return RegisterResponse(
        success=True,
        user=User(
            id=domain_user.id,
            email=domain_user.email.value,
            display_name=domain_user.display_name,
            email_verified=domain_user.email_verified,
            status=Status(domain_user.status.value),
            created_at=domain_user.created_at,
            updated_at=domain_user.updated_at,
            last_login_at=domain_user.last_login_at,
        ),
        verification_token=result.verification_token,
        message="Registration successful. Please check your email for verification.",
    )


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid credentials"},
        422: {"description": "Validation error"},
        429: {"description": "Rate limit exceeded"},
    },
)
async def login_user(  # noqa: PLR0913 - All dependencies required for FastAPI dependency injection
    response: Response,
    body: AuthLoginPostRequest,
    user_repo: UserRepoDep,
    session_repo: SessionRepoDep,
    token_generator: TokenGeneratorDep,
    preferences_repo: PreferencesRepoDep,
    session_id: Annotated[str | None, Cookie()] = None,
) -> LoginResponse:
    """
    Authenticate user and create session.

    Validates credentials and creates a new session with access token.
    Sets HTTP-only cookie with the session token.

    Args:
        response: FastAPI response object (for setting cookies)
        body: Login credentials (email, password, remember_me)
        user_repo: User repository dependency
        session_repo: Session repository dependency
        token_generator: Token generator dependency
        preferences_repo: Preferences repository dependency for migrating anonymous preferences
        session_id: Optional session ID from cookie for preferences migration

    Returns:
        LoginResponse with user data and session token

    Raises:
        HTTPException: 401 for invalid credentials, 422 for validation errors
    """
    # Create use case
    use_case = LoginUserUseCase(
        user_repository=user_repo,
        session_repository=session_repo,
        password_hasher=PasswordHasher(),
        token_generator=token_generator,
    )

    # Execute login
    result = await use_case.execute(body)

    # Handle errors
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.error,
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Ensure user and session_token are not None after successful login
    if result.user is None or result.session_token is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed: invalid response",
        )

    # Migrate anonymous preferences to user account (if session_id exists)
    if session_id:
        try:
            migration_use_case = MigratePreferencesToUserUseCase(preferences_repo)
            await migration_use_case.execute(
                MigratePreferencesRequest(
                    user_id=result.user.id,
                    session_id=session_id,
                )
            )
        except Exception:  # noqa: BLE001 - Intentionally catch all exceptions to prevent login failure
            # Don't fail login if preferences migration fails
            # This is a non-critical operation
            logger.warning("Failed to migrate preferences during login for user %s", result.user.id)

    # Set HTTP-only cookie with session token
    max_age = int(timedelta(days=30).total_seconds()) if body.remember_me else int(timedelta(days=7).total_seconds())

    response.set_cookie(
        key="access_token",
        value=result.session_token,
        path="/",
        httponly=True,
        secure=settings.should_use_secure_cookies,  # Dynamic based on HTTPS protocol
        samesite=settings.samesite_cookie_policy,  # Dynamic: strict for production, none for dev/E2E
        max_age=max_age,
    )

    # Build response
    domain_user = result.user
    return LoginResponse(
        success=True,
        user=User(
            id=domain_user.id,
            email=domain_user.email.value,
            display_name=domain_user.display_name,
            email_verified=domain_user.email_verified,
            status=Status(domain_user.status.value),
            created_at=domain_user.created_at,
            updated_at=domain_user.updated_at,
            last_login_at=domain_user.last_login_at,
        ),
        session_token=result.session_token,
    )


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Logout successful"},
        401: {"description": "Not authenticated"},
    },
)
async def logout_user(
    response: Response,
    session_repo: SessionRepoDep,
    token_generator: TokenGeneratorDep,
    access_token: Annotated[str | None, Cookie()] = None,
) -> AuthLogoutPostResponse:
    """
    Log out current user and invalidate session.

    Deletes the session from the database and clears the access token cookie.

    Args:
        response: FastAPI response object (for clearing cookies)
        session_repo: Session repository dependency
        token_generator: Token generator dependency
        access_token: Access token from cookie

    Returns:
        AuthLogoutPostResponse with success status

    Raises:
        HTTPException: 401 if not authenticated or invalid session
    """
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create use case
    use_case = LogoutUserUseCase(
        session_repository=session_repo,
        token_generator=token_generator,
    )

    # Execute logout
    try:
        await use_case.execute(AuthLogoutPostRequest(session_token=access_token))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    # Clear the cookie - must match parameters used when setting the cookie
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=settings.should_use_secure_cookies,
        httponly=True,
        samesite=settings.samesite_cookie_policy,
    )

    return AuthLogoutPostResponse(success=True, message="Logout successful")


@router.post(
    "/refresh",
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Token refreshed successfully"},
        401: {"description": "Invalid or expired session"},
    },
)
async def refresh_token(
    response: Response,
    session_repo: SessionRepoDep,
    user_repo: UserRepoDep,
    token_generator: TokenGeneratorDep,
    access_token: Annotated[str | None, Cookie()] = None,
) -> RefreshResponse:
    """
    Refresh access token for current session.

    Extends session expiration and updates the cookie expiration.
    Requires valid existing session.

    Args:
        response: FastAPI response object (for updating cookies)
        session_repo: Session repository dependency
        user_repo: User repository dependency
        token_generator: Token generator dependency
        access_token: Access token from cookie

    Returns:
        RefreshResponse with new token, expiration, and user data

    Raises:
        HTTPException: 401 for invalid/expired session
    """
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create use case
    use_case = RefreshSessionUseCase(
        session_repository=session_repo,
        user_repository=user_repo,
        token_generator=token_generator,
    )

    # Execute refresh
    try:
        refresh_result = await use_case.execute(AuthRefreshPostRequest(session_token=access_token))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    # Get the session to determine cookie expiration
    hashed_token = token_generator.hash_token(access_token)
    session = await session_repo.get_by_token_hash(hashed_token)

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update cookie expiration to match new session expiration
    max_age = int(timedelta(days=30).total_seconds()) if session.remember_me else int(timedelta(days=7).total_seconds())

    response.set_cookie(
        key="access_token",
        value=access_token,  # Keep same token
        path="/",
        httponly=True,
        secure=settings.should_use_secure_cookies,  # Dynamic based on HTTPS protocol
        samesite=settings.samesite_cookie_policy,  # Dynamic: strict for production, none for dev/E2E
        max_age=max_age,
    )

    # Return the refresh result which includes user data
    return refresh_result


@router.post(
    "/verify-email",
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Email verified successfully"},
        400: {"description": "Invalid or expired token"},
        422: {"description": "Validation error"},
    },
)
async def verify_email(
    body: AuthVerifyEmailPostRequest,
    user_repo: UserRepoDep,
    token_repo: EmailVerificationTokenRepoDep,
    token_generator: TokenGeneratorDep,
) -> AuthVerifyEmailPostResponse:
    """
    Verify user email address using token from verification email.

    Marks the user's email as verified and enables full account access.

    Args:
        body: Verification token in request body
        user_repo: User repository dependency
        token_repo: Email verification token repository dependency
        token_generator: Token generator dependency

    Returns:
        AuthVerifyEmailPostResponse with success status

    Raises:
        HTTPException: 400 for invalid/expired token, 422 for validation errors
    """
    # Create use case
    use_case = VerifyEmailUseCase(
        user_repository=user_repo,
        token_repository=token_repo,
        token_generator=token_generator,
    )

    # Execute verification
    try:
        await use_case.execute(body)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    return AuthVerifyEmailPostResponse(success=True, message="Email verified successfully")


@router.post(
    "/resend-verification",
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Verification email sent"},
        400: {"description": "Email already verified or other error"},
        401: {"description": "Not authenticated"},
    },
)
async def resend_verification_email(
    current_user: CurrentUser,
    user_repo: UserRepoDep,
    token_repo: EmailVerificationTokenRepoDep,
    token_generator: TokenGeneratorDep,
) -> AuthResendVerificationPostResponse:
    """
    Resend email verification link to current user.

    Generates a new verification token and sends it to the user's email.
    Requires authentication. Invalidates any existing verification tokens.

    Args:
        current_user: The authenticated user requesting verification resend.
        user_repo: User repository dependency.
        token_repo: Email verification token repository dependency.
        token_generator: Token generator dependency.

    Returns:
        AuthResendVerificationPostResponse with success status.

    Raises:
        HTTPException: 400 if email is already verified.
        HTTPException: 401 if not authenticated.
    """
    # Create use case
    use_case = ResendVerificationUseCase(
        user_repository=user_repo,
        token_repository=token_repo,
        token_generator=token_generator,
    )

    # Execute resend verification
    try:
        await use_case.execute(AuthResendVerificationPostRequest(user_id=current_user.id))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    # In production, send email here using result.verification_token
    # For now, just log it (email service integration would go here)
    logger.info("Verification email would be sent to %s", current_user.email.value)

    return AuthResendVerificationPostResponse(success=True)


@router.post(
    "/forgot-password",
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Password reset email sent (if account exists)"},
        422: {"description": "Validation error"},
        429: {"description": "Rate limit exceeded"},
    },
)
async def forgot_password(
    body: AuthForgotPasswordPostRequest,
    user_repo: UserRepoDep,
    token_repo: PasswordResetTokenRepoDep,
    token_generator: TokenGeneratorDep,
) -> AuthForgotPasswordPostResponse:
    """
    Initiate password reset flow.

    Sends password reset link to the provided email if an account exists.
    Always returns success to prevent user enumeration.

    Args:
        body: Password reset request with email address
        user_repo: User repository dependency
        token_repo: Password reset token repository dependency
        token_generator: Token generator dependency

    Returns:
        AuthForgotPasswordPostResponse with success status and message

    Raises:
        HTTPException: 422 for validation errors
    """
    # Create use case
    use_case = RequestPasswordResetUseCase(
        user_repository=user_repo,
        token_repository=token_repo,
        token_generator=token_generator,
    )

    # Execute password reset request
    result = await use_case.execute(body)

    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=result.error,
        )

    # Always return success message (even if user doesn't exist)
    # This prevents user enumeration attacks
    return AuthForgotPasswordPostResponse(
        success=True,
        message="If an account exists with this email, a password reset link has been sent.",
    )


@router.post(
    "/reset-password",
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Password reset successful"},
        400: {"description": "Invalid or expired token"},
        422: {"description": "Validation error"},
    },
)
async def reset_password(
    body: AuthResetPasswordPostRequest,
    user_repo: UserRepoDep,
    token_repo: PasswordResetTokenRepoDep,
    token_generator: TokenGeneratorDep,
) -> AuthResetPasswordPostResponse:
    """
    Reset user password using token from reset email.

    Validates the reset token, updates the user's password, and invalidates
    all existing sessions for security.

    Args:
        body: Password reset request with token and new password
        user_repo: User repository dependency
        token_repo: Password reset token repository dependency
        token_generator: Token generator dependency

    Returns:
        AuthResetPasswordPostResponse with success status and message

    Raises:
        HTTPException: 400 for invalid/expired token, 422 for validation errors
    """
    # Create use case
    use_case = ResetPasswordUseCase(
        user_repository=user_repo,
        token_repository=token_repo,
        password_hasher=PasswordHasher(),
        token_generator=token_generator,
    )

    # Execute password reset
    result = await use_case.execute(body)

    if not result.success:
        # Determine appropriate status code based on error message
        if result.error and "Invalid or expired" in result.error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error,
            )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=result.error,
        )

    return AuthResetPasswordPostResponse(
        success=True,
        message="Password reset successfully. You can now log in with your new password.",
    )
