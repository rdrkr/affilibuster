# Copyright (c) 2025 Affilibuster by Ronen Druker.
# ruff: noqa: A005 - Module name "profile" shadows stdlib but is appropriate for API routes

"""
User Profile API routes.

Handles authenticated user profile operations:
- Get current user profile
- Update display name
- Change password
- Delete account (GDPR Right to Deletion)
- Export user data (GDPR DSAR)
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from affilibuster_backend.domain.entities.generated.models import (
    AuthProfileChangePasswordPostRequest,
    AuthProfileChangePasswordPostResponse,
    AuthProfileDeleteRequest,
    AuthProfileDeleteResponse,
    AuthProfilePatchRequest,
    UserDataExport,
    UserProfile,
)
from affilibuster_backend.domain.entities.user import UserEntity
from affilibuster_backend.domain.use_cases.profile.change_password_use_case import (
    ChangePasswordUseCase,
)
from affilibuster_backend.domain.use_cases.profile.delete_account_use_case import (
    DeleteAccountUseCase,
)
from affilibuster_backend.domain.use_cases.profile.export_user_data_use_case import (
    ExportUserDataUseCase,
)
from affilibuster_backend.domain.use_cases.profile.get_user_profile_use_case import (
    GetUserProfileRequest,
    GetUserProfileUseCase,
)
from affilibuster_backend.domain.use_cases.profile.update_profile_use_case import (
    UpdateProfileUseCase,
)
from affilibuster_backend.infrastructure.api.dependencies.auth_dependencies import (
    PasswordHasherDep,
    SessionRepoDep,
    UserRepoDep,
    get_current_user,
)
from affilibuster_backend.infrastructure.dependencies import (
    ConsentRepoDep,
    PreferencesRepoDep,
    _get_newsletter_service,
)

router = APIRouter(prefix="/auth/profile", tags=["profile"])


# ============================================================================
# Endpoints
# ============================================================================


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Retrieve the authenticated user's profile information.",
)
async def get_profile(
    current_user: Annotated[UserEntity, Depends(get_current_user)],
    user_repo: UserRepoDep,
) -> UserProfile:
    """
    Get current user profile.

    Returns the authenticated user's profile information without sensitive data.

    Args:
        current_user: Currently authenticated user (from JWT).
        user_repo: User repository dependency.

    Returns:
        User profile data.

    Raises:
        HTTPException: 401 if not authenticated, 404 if user not found.
    """
    try:
        use_case = GetUserProfileUseCase(user_repo)
        request = GetUserProfileRequest(user_id=current_user.id)
        user = await use_case.execute(request)

        return UserProfile(
            id=user.id,
            email=user.email.value,
            display_name=user.display_name,
            email_verified=user.email_verified,
            created_at=user.created_at,
            last_login_at=user.last_login_at,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e


@router.patch(
    "",
    status_code=status.HTTP_200_OK,
    summary="Update user profile",
    description="Update the authenticated user's display name.",
)
async def update_profile(
    body: AuthProfilePatchRequest,
    current_user: Annotated[UserEntity, Depends(get_current_user)],
    user_repo: UserRepoDep,
) -> UserProfile:
    """
    Update user profile.

    Allows updating the user's display name.

    Args:
        body: Request body with new display name.
        current_user: Currently authenticated user (from JWT).
        user_repo: User repository dependency.

    Returns:
        Updated user profile data.

    Raises:
        HTTPException: 401 if not authenticated, 400 if validation fails.
    """
    try:
        use_case = UpdateProfileUseCase(user_repo)
        updated_user = await use_case.execute(current_user.id, body)

        return UserProfile(
            id=updated_user.id,
            email=updated_user.email.value,
            display_name=updated_user.display_name,
            email_verified=updated_user.email_verified,
            created_at=updated_user.created_at,
            last_login_at=updated_user.last_login_at,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.delete(
    "",
    status_code=status.HTTP_200_OK,
    summary="Delete user account",
    description="Permanently deletes the authenticated user's account (soft delete). Requires password confirmation.",
)
async def delete_account(  # noqa: PLR0913 - All dependencies required for FastAPI dependency injection
    body: AuthProfileDeleteRequest,
    current_user: Annotated[UserEntity, Depends(get_current_user)],
    user_repo: UserRepoDep,
    session_repo: SessionRepoDep,
    consent_repo: ConsentRepoDep,
    preferences_repo: PreferencesRepoDep,
    password_hasher: PasswordHasherDep,
) -> AuthProfileDeleteResponse:
    """
    Delete user account.

    Soft-deletes the user, invalidates all sessions, anonymizes consent records,
    and deletes preferences. Requires password verification.

    Args:
        body: Request body with password for verification.
        current_user: Currently authenticated user (from JWT).
        user_repo: User repository dependency.
        session_repo: Session repository dependency.
        consent_repo: Consent repository dependency.
        preferences_repo: Preferences repository dependency.
        password_hasher: Password hasher dependency.

    Returns:
        Success message.

    Raises:
        HTTPException: 401 if not authenticated, 400 if password incorrect or user already deleted.
    """
    try:
        newsletter_service = _get_newsletter_service()
        use_case = DeleteAccountUseCase(
            user_repo, session_repo, consent_repo, preferences_repo, password_hasher, newsletter_service
        )
        await use_case.execute(current_user.id, body.password.get_secret_value())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    else:
        return AuthProfileDeleteResponse(success=True, message="Account deleted successfully")


@router.get(
    "/export",
    status_code=status.HTTP_200_OK,
    summary="Export user data (DSAR)",
    description="Exports all user data for GDPR Data Subject Access Request (Articles 15/20).",
    responses={429: {"description": "Rate limit exceeded"}},
)
async def export_user_data(
    current_user: Annotated[UserEntity, Depends(get_current_user)],
    user_repo: UserRepoDep,
    session_repo: SessionRepoDep,
    consent_repo: ConsentRepoDep,
    preferences_repo: PreferencesRepoDep,
) -> UserDataExport:
    """
    Export all user data (GDPR DSAR).

    Returns profile, consent records, preferences, and active session metadata.
    Sensitive data (token hashes) is excluded.

    Args:
        current_user: Currently authenticated user (from JWT).
        user_repo: User repository dependency.
        session_repo: Session repository dependency.
        consent_repo: Consent repository dependency.
        preferences_repo: Preferences repository dependency.

    Returns:
        Complete user data export.

    Raises:
        HTTPException: 401 if not authenticated, 404 if user not found.
    """
    try:
        use_case = ExportUserDataUseCase(user_repo, session_repo, consent_repo, preferences_repo)
        return await use_case.execute(current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e


@router.post(
    "/change-password",
    status_code=status.HTTP_200_OK,
    summary="Change password",
    description=(
        "Change the authenticated user's password. Requires current password verification. Invalidates all sessions."
    ),
)
async def change_password(
    body: AuthProfileChangePasswordPostRequest,
    current_user: Annotated[UserEntity, Depends(get_current_user)],
    user_repo: UserRepoDep,
    session_repo: SessionRepoDep,
    password_hasher: PasswordHasherDep,
) -> AuthProfileChangePasswordPostResponse:
    """
    Change user password.

    Verifies current password and updates to new password.
    Invalidates all existing sessions (user must re-login).

    Args:
        body: Request body with current and new passwords.
        current_user: Currently authenticated user (from JWT).
        user_repo: User repository dependency.
        session_repo: Session repository dependency.
        password_hasher: Password hasher dependency.

    Returns:
        Success message.

    Raises:
        HTTPException: 401 if not authenticated, 400 if validation fails or current password incorrect.
    """
    try:
        use_case = ChangePasswordUseCase(user_repo, session_repo, password_hasher)
        await use_case.execute(current_user.id, body)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    else:
        return AuthProfileChangePasswordPostResponse(message="Password changed successfully. Please log in again.")
