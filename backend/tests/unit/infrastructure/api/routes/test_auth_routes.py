# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for authentication API routes.

Tests route handlers with mocked use cases to ensure proper error handling
and response building.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, Mock, patch
from uuid import uuid4

import pytest
from fastapi import HTTPException, Response
from pydantic import SecretStr

from affilibuster_backend.domain.entities.generated.models import (
    AuthForgotPasswordPostRequest,
    AuthLoginPostRequest,
    AuthRegisterPostRequest,
    AuthResetPasswordPostRequest,
    AuthVerifyEmailPostRequest,
    RefreshResponse,
    Status,
    User,
)
from affilibuster_backend.domain.entities.user import Email, HashedPassword, UserEntity, UserStatus
from affilibuster_backend.domain.entities.user_session import UserSession
from affilibuster_backend.domain.use_cases.auth.login_user_use_case import LoginUserResponse
from affilibuster_backend.domain.use_cases.auth.logout_user_use_case import LogoutUserResponse
from affilibuster_backend.domain.use_cases.auth.register_user_use_case import RegisterUserResponse
from affilibuster_backend.domain.use_cases.auth.request_password_reset_use_case import RequestPasswordResetResponse
from affilibuster_backend.domain.use_cases.auth.resend_verification_use_case import ResendVerificationResponse
from affilibuster_backend.domain.use_cases.auth.reset_password_use_case import ResetPasswordResponse
from affilibuster_backend.domain.use_cases.auth.verify_email_use_case import VerifyEmailResponse
from affilibuster_backend.infrastructure.api.routes.auth import (
    forgot_password,
    login_user,
    logout_user,
    refresh_token,
    register_user,
    resend_verification_email,
    reset_password,
    verify_email,
)


@pytest.mark.unit
class TestRegisterRoute:
    """Test register_user route handler."""

    @pytest.mark.asyncio
    async def test_register_returns_409_on_duplicate_email(self):
        """Test that register returns 409 for duplicate email."""
        # Arrange
        body = AuthRegisterPostRequest(
            email="test@example.com",
            password=SecretStr("Password123!"),
            display_name="Test User",
        )

        response_obj = MagicMock(spec=Response)
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()
        session_repo = AsyncMock()

        # Mock RegisterUserUseCase to return conflict error
        with patch("affilibuster_backend.infrastructure.api.routes.auth.RegisterUserUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = RegisterUserResponse(
                success=False,
                error="Email already registered",
                user=None,
            )

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                await register_user(
                    response=response_obj,
                    body=body,
                    user_repo=user_repo,
                    token_repo=token_repo,
                    token_generator=token_generator,
                    session_repo=session_repo,
                )

            assert exc_info.value.status_code == 409
            assert "already registered" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_register_returns_422_on_validation_error(self):
        """Test that register returns 422 for validation errors."""
        # Arrange
        body = AuthRegisterPostRequest(
            email="test@example.com",
            password=SecretStr("ValidPassword123!"),  # Valid Pydantic, but will fail use case
            display_name="Test User",
        )

        response_obj = MagicMock(spec=Response)
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()
        session_repo = AsyncMock()

        # Mock RegisterUserUseCase to return validation error
        with patch("affilibuster_backend.infrastructure.api.routes.auth.RegisterUserUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = RegisterUserResponse(
                success=False,
                error="Password too weak",
                user=None,
            )

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                await register_user(
                    response=response_obj,
                    body=body,
                    user_repo=user_repo,
                    token_repo=token_repo,
                    token_generator=token_generator,
                    session_repo=session_repo,
                )

            assert exc_info.value.status_code == 422

    @pytest.mark.asyncio
    async def test_register_success_returns_auth_response(self):
        """Test successful registration returns proper response."""
        # Arrange
        body = AuthRegisterPostRequest(
            email="newuser@example.com",
            password=SecretStr("Password123!"),
            display_name="New User",
        )

        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        now = datetime.now(UTC)
        mock_user = UserEntity(
            id=uuid4(),
            email=Email("newuser@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="New User",
            email_verified=False,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        # Mock RegisterUserUseCase
        with patch("affilibuster_backend.infrastructure.api.routes.auth.RegisterUserUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = RegisterUserResponse(
                success=True,
                error=None,
                user=mock_user,
                verification_token="test_verification_token",
            )

            # Mock response and session repository for session creation
            response_obj = MagicMock(spec=Response)
            session_repo = AsyncMock()
            session_repo.create = AsyncMock()
            token_generator.generate_token = Mock(return_value="test_session_token")
            token_generator.hash_token = Mock(return_value="hashed_session_token")

            # Act
            response = await register_user(
                response=response_obj,
                body=body,
                user_repo=user_repo,
                session_repo=session_repo,
                token_repo=token_repo,
                token_generator=token_generator,
            )

            # Assert
            assert response.user.email == "newuser@example.com"
            assert response.user.display_name == "New User"
            assert response.user.email_verified is False
            assert "Registration successful" in response.message

    @pytest.mark.asyncio
    async def test_register_raises_500_when_user_is_none_after_success(self):
        """Test 500 error when use case returns success=True but user=None."""
        # Arrange
        body = AuthRegisterPostRequest(
            email="test@example.com",
            password=SecretStr("Password123!"),
            display_name="Test User",
        )

        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        # Mock RegisterUserUseCase to return success=True but user=None (defensive edge case)
        with patch("affilibuster_backend.infrastructure.api.routes.auth.RegisterUserUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = RegisterUserResponse(
                success=True,  # Success but...
                error=None,
                user=None,  # ...user is None (should never happen)
            )

            # Act & Assert
            response_obj = MagicMock(spec=Response)
            session_repo = AsyncMock()
            with pytest.raises(HTTPException) as exc_info:
                await register_user(
                    response=response_obj,
                    body=body,
                    user_repo=user_repo,
                    session_repo=session_repo,
                    token_repo=token_repo,
                    token_generator=token_generator,
                )

            assert exc_info.value.status_code == 500
            assert "User creation failed" in exc_info.value.detail


@pytest.mark.unit
class TestLoginRoute:
    """Test login_user route handler."""

    @pytest.mark.asyncio
    async def test_login_returns_401_on_invalid_credentials(self):
        """Test that login returns 401 for invalid credentials."""
        # Arrange
        body = AuthLoginPostRequest(
            email="test@example.com",
            password=SecretStr("WrongPassword"),
            remember_me=False,
        )

        response_obj = MagicMock(spec=Response)
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        token_generator = Mock()

        # Mock LoginUserUseCase to return error
        with patch("affilibuster_backend.infrastructure.api.routes.auth.LoginUserUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = LoginUserResponse(
                success=False,
                error="Invalid email or password",
                user=None,
                session_token=None,
            )

            # Mock preferences repository
            preferences_repo = AsyncMock()

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                await login_user(
                    response=response_obj,
                    body=body,
                    user_repo=user_repo,
                    session_repo=session_repo,
                    token_generator=token_generator,
                    preferences_repo=preferences_repo,
                    session_id=None,
                )

            assert exc_info.value.status_code == 401
            assert "Invalid" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_login_success_sets_cookie_and_returns_response(self):
        """Test successful login sets cookie and returns user data."""
        # Arrange
        body = AuthLoginPostRequest(
            email="test@example.com",
            password=SecretStr("Password123!"),
            remember_me=True,
        )

        response_obj = MagicMock(spec=Response)
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        token_generator = Mock()

        now = datetime.now(UTC)
        mock_user = UserEntity(
            id=uuid4(),
            email=Email("test@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=now,
            deleted_at=None,
        )

        # Mock LoginUserUseCase
        with patch("affilibuster_backend.infrastructure.api.routes.auth.LoginUserUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = LoginUserResponse(
                success=True,
                user=mock_user,
                session_token="test_session_token_123",
            )

            # Mock preferences repository
            preferences_repo = AsyncMock()

            # Act
            result = await login_user(
                response=response_obj,
                body=body,
                user_repo=user_repo,
                session_repo=session_repo,
                token_generator=token_generator,
                preferences_repo=preferences_repo,
                session_id=None,
            )

            # Assert
            response_obj.set_cookie.assert_called_once()
            call_kwargs = response_obj.set_cookie.call_args[1]
            assert call_kwargs["key"] == "access_token"
            assert call_kwargs["value"] == "test_session_token_123"
            assert call_kwargs["httponly"] is True
            from affilibuster_backend.config import settings

            assert call_kwargs["secure"] is settings.should_use_secure_cookies
            assert call_kwargs["samesite"] == settings.samesite_cookie_policy
            # 30 days for remember_me=True
            assert call_kwargs["max_age"] == 2592000

            assert result.user.email == "test@example.com"

    async def test_login_with_session_id_migrates_preferences_on_error(self):
        """Test login with session_id continues even if preferences migration fails."""
        # Arrange
        body = AuthLoginPostRequest(
            email="test@example.com",
            password=SecretStr("Password123!"),
            remember_me=False,
        )

        response_obj = MagicMock(spec=Response)
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        token_generator = Mock()

        now = datetime.now(UTC)
        mock_user = UserEntity(
            id=uuid4(),
            email=Email("test@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=now,
            deleted_at=None,
        )

        # Mock LoginUserUseCase
        with patch("affilibuster_backend.infrastructure.api.routes.auth.LoginUserUseCase") as mock_login_use_case_class:
            with patch(
                "affilibuster_backend.infrastructure.api.routes.auth.MigratePreferencesToUserUseCase"
            ) as mock_migrate_class:
                mock_login_use_case = AsyncMock()
                mock_login_use_case_class.return_value = mock_login_use_case
                mock_login_use_case.execute.return_value = LoginUserResponse(
                    success=True,
                    user=mock_user,
                    session_token="test_session_token_123",
                )

                # Mock preferences migration to raise exception
                mock_migrate_use_case = AsyncMock()
                mock_migrate_class.return_value = mock_migrate_use_case
                mock_migrate_use_case.execute.side_effect = Exception("Migration failed")

                # Mock preferences repository
                preferences_repo = AsyncMock()

                # Act
                result = await login_user(
                    response=response_obj,
                    body=body,
                    user_repo=user_repo,
                    session_repo=session_repo,
                    token_generator=token_generator,
                    preferences_repo=preferences_repo,
                    session_id="test_session_123",  # Trigger preferences migration
                )

                # Assert - login should succeed even if migration fails
                response_obj.set_cookie.assert_called_once()
                assert result.user.email == "test@example.com"
                # Verify migration was attempted
                mock_migrate_use_case.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_login_raises_500_when_user_or_session_token_is_none_after_success(self):
        """Test 500 error when use case returns success=True but user or session_token is None."""
        # Arrange
        body = AuthLoginPostRequest(
            email="test@example.com",
            password=SecretStr("Password123!"),
            remember_me=False,
        )

        response_obj = MagicMock(spec=Response)
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        token_generator = Mock()
        preferences_repo = AsyncMock()

        # Mock LoginUserUseCase to return success=True but user=None (defensive edge case)
        with patch("affilibuster_backend.infrastructure.api.routes.auth.LoginUserUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = LoginUserResponse(
                success=True,  # Success but...
                error=None,
                user=None,  # ...user is None (should never happen)
                session_token="valid_token",
            )

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                await login_user(
                    response=response_obj,
                    body=body,
                    user_repo=user_repo,
                    session_repo=session_repo,
                    token_generator=token_generator,
                    preferences_repo=preferences_repo,
                    session_id=None,
                )

            assert exc_info.value.status_code == 500
            assert "Login failed: invalid response" in exc_info.value.detail


@pytest.mark.unit
class TestLogoutRoute:
    """Test logout_user route handler."""

    @pytest.mark.asyncio
    async def test_logout_with_no_token_returns_401(self):
        """Test that logout without token returns 401."""
        # Arrange
        response_obj = MagicMock(spec=Response)
        session_repo = AsyncMock()
        token_generator = Mock()

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await logout_user(
                response=response_obj,
                access_token=None,
                session_repo=session_repo,
                token_generator=token_generator,
            )

        assert exc_info.value.status_code == 401
        assert "Not authenticated" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_logout_with_invalid_token_returns_401(self):
        """Test that logout with invalid token returns 401."""
        # Arrange
        response_obj = MagicMock(spec=Response)
        session_repo = AsyncMock()
        token_generator = Mock()

        # Mock LogoutUserUseCase to return error
        with patch("affilibuster_backend.infrastructure.api.routes.auth.LogoutUserUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.side_effect = ValueError("Invalid session token")

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                await logout_user(
                    response=response_obj,
                    access_token="invalid_token",
                    session_repo=session_repo,
                    token_generator=token_generator,
                )

            assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_logout_success_clears_cookie(self):
        """Test successful logout clears cookie."""
        # Arrange
        response_obj = MagicMock(spec=Response)
        session_repo = AsyncMock()
        token_generator = Mock()

        from affilibuster_backend.config import settings

        # Mock LogoutUserUseCase
        with patch("affilibuster_backend.infrastructure.api.routes.auth.LogoutUserUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = LogoutUserResponse(
                success=True,
                message="Logout successful",
            )

            # Act
            result = await logout_user(
                response=response_obj,
                access_token="valid_token",
                session_repo=session_repo,
                token_generator=token_generator,
            )

            # Assert
            response_obj.delete_cookie.assert_called_once()
            delete_call_kwargs = response_obj.delete_cookie.call_args[1]
            assert delete_call_kwargs["key"] == "access_token"
            assert delete_call_kwargs["path"] == "/"
            assert delete_call_kwargs["httponly"] is True
            assert delete_call_kwargs["secure"] is settings.should_use_secure_cookies
            assert delete_call_kwargs["samesite"] == settings.samesite_cookie_policy
            assert result.message == "Logout successful"


@pytest.mark.unit
class TestRefreshRoute:
    """Test refresh_token route handler."""

    @pytest.mark.asyncio
    async def test_refresh_with_no_token_returns_401(self):
        """Test that refresh without token returns 401."""
        # Arrange
        response_obj = MagicMock(spec=Response)
        session_repo = AsyncMock()
        user_repo = AsyncMock()
        token_generator = Mock()

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await refresh_token(
                response=response_obj,
                access_token=None,
                session_repo=session_repo,
                user_repo=user_repo,
                token_generator=token_generator,
            )

        assert exc_info.value.status_code == 401
        assert "Not authenticated" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_refresh_with_invalid_session_returns_401(self):
        """Test that refresh with invalid session returns 401."""
        # Arrange
        response_obj = MagicMock(spec=Response)
        session_repo = AsyncMock()
        user_repo = AsyncMock()
        token_generator = Mock()

        # Mock RefreshSessionUseCase to return error
        with patch("affilibuster_backend.infrastructure.api.routes.auth.RefreshSessionUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.side_effect = ValueError("Invalid or expired session")

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                await refresh_token(
                    response=response_obj,
                    access_token="expired_token",
                    session_repo=session_repo,
                    user_repo=user_repo,
                    token_generator=token_generator,
                )

            assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_refresh_success_updates_cookie(self):
        """Test successful refresh updates cookie expiration."""
        # Arrange
        response_obj = MagicMock(spec=Response)
        session_repo = AsyncMock()
        user_repo = AsyncMock()
        token_generator = Mock()
        token_generator.hash_token.return_value = "hashed_token"

        now = datetime.now(UTC)
        user_id = uuid4()
        mock_session = UserSession(
            id=uuid4(),
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=now + timedelta(days=30),  # expires_at must be after created_at
            remember_me=True,
            created_at=now,
        )
        session_repo.get_by_token_hash.return_value = mock_session

        mock_user = User(
            id=user_id,
            email="test@example.com",
            display_name="Test User",
            email_verified=True,
            status=Status.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=now,
        )

        # Mock RefreshSessionUseCase
        with patch("affilibuster_backend.infrastructure.api.routes.auth.RefreshSessionUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = RefreshResponse(
                success=True,
                session_token="valid_token",
                expires_at=now + timedelta(days=30),
                user=mock_user,
            )

            # Act
            result = await refresh_token(
                response=response_obj,
                access_token="valid_token",
                session_repo=session_repo,
                user_repo=user_repo,
                token_generator=token_generator,
            )

            # Assert
            response_obj.set_cookie.assert_called_once()
            call_kwargs = response_obj.set_cookie.call_args[1]
            assert call_kwargs["key"] == "access_token"
            assert call_kwargs["value"] == "valid_token"
            # 30 days for remember_me=True
            assert call_kwargs["max_age"] == 2592000
            assert result.success is True

    @pytest.mark.asyncio
    async def test_refresh_raises_401_when_session_lookup_returns_none(self):
        """Test 401 error when session lookup returns None after successful refresh."""
        # Arrange
        response_obj = MagicMock(spec=Response)
        session_repo = AsyncMock()
        user_repo = AsyncMock()
        token_generator = Mock()
        token_generator.hash_token.return_value = "hashed_token"

        # Session lookup returns None (defensive edge case)
        session_repo.get_by_token_hash.return_value = None

        now = datetime.now(UTC)
        mock_user = User(
            id=uuid4(),
            email="test@example.com",
            display_name="Test User",
            email_verified=True,
            status=Status.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=now,
        )

        # Mock RefreshSessionUseCase to return success
        with patch("affilibuster_backend.infrastructure.api.routes.auth.RefreshSessionUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = RefreshResponse(
                success=True,
                session_token="valid_token",
                expires_at=now + timedelta(days=30),
                user=mock_user,
            )

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                await refresh_token(
                    response=response_obj,
                    access_token="valid_token",
                    session_repo=session_repo,
                    user_repo=user_repo,
                    token_generator=token_generator,
                )

            assert exc_info.value.status_code == 401
            assert "Session not found" in exc_info.value.detail


@pytest.mark.unit
class TestVerifyEmailRoute:
    """Test verify_email route handler."""

    @pytest.mark.asyncio
    async def test_verify_email_returns_400_on_invalid_token(self):
        """Test that verify_email returns 400 for invalid token."""
        # Arrange
        body = AuthVerifyEmailPostRequest(token="invalid_token")
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        # Mock VerifyEmailUseCase to return error
        with patch("affilibuster_backend.infrastructure.api.routes.auth.VerifyEmailUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.side_effect = ValueError("Invalid or expired verification token")

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                await verify_email(
                    body=body,
                    user_repo=user_repo,
                    token_repo=token_repo,
                    token_generator=token_generator,
                )

            assert exc_info.value.status_code == 400

    @pytest.mark.asyncio
    async def test_verify_email_success_returns_message(self):
        """Test successful email verification returns success message."""
        # Arrange
        body = AuthVerifyEmailPostRequest(token="valid_token")
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        # Mock VerifyEmailUseCase
        with patch("affilibuster_backend.infrastructure.api.routes.auth.VerifyEmailUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = VerifyEmailResponse(
                success=True,
                message="Email verified successfully",
            )

            # Act
            result = await verify_email(
                body=body,
                user_repo=user_repo,
                token_repo=token_repo,
                token_generator=token_generator,
            )

            # Assert
            assert result.message == "Email verified successfully"


@pytest.mark.unit
class TestResendVerificationRoute:
    """Test resend_verification_email route handler."""

    @pytest.mark.asyncio
    async def test_resend_verification_returns_400_when_already_verified(self):
        """Test that resend verification returns 400 when email is already verified."""
        # Arrange
        user_id = uuid4()
        now = datetime.now(UTC)
        current_user = UserEntity(
            id=user_id,
            email=Email("test@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,  # Already verified
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        # Mock ResendVerificationUseCase to return error
        with patch(
            "affilibuster_backend.infrastructure.api.routes.auth.ResendVerificationUseCase"
        ) as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.side_effect = ValueError("Email is already verified")

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                await resend_verification_email(
                    current_user=current_user,
                    user_repo=user_repo,
                    token_repo=token_repo,
                    token_generator=token_generator,
                )

            assert exc_info.value.status_code == 400
            assert "already verified" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_resend_verification_success(self):
        """Test successful resend verification returns success message."""
        # Arrange
        user_id = uuid4()
        now = datetime.now(UTC)
        current_user = UserEntity(
            id=user_id,
            email=Email("test@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=False,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        # Mock ResendVerificationUseCase
        with patch(
            "affilibuster_backend.infrastructure.api.routes.auth.ResendVerificationUseCase"
        ) as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = ResendVerificationResponse(
                success=True,
                verification_token="new_token",
            )

            # Act
            result = await resend_verification_email(
                current_user=current_user,
                user_repo=user_repo,
                token_repo=token_repo,
                token_generator=token_generator,
            )

            # Assert
            assert result.success is True


@pytest.mark.unit
class TestForgotPasswordRoute:
    """Test forgot_password route handler."""

    @pytest.mark.asyncio
    async def test_forgot_password_returns_422_on_error(self):
        """Test that forgot password returns 422 for validation errors."""
        # Arrange
        body = AuthForgotPasswordPostRequest(email="test@example.com")
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        # Mock RequestPasswordResetUseCase to return error
        with patch(
            "affilibuster_backend.infrastructure.api.routes.auth.RequestPasswordResetUseCase"
        ) as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = RequestPasswordResetResponse(
                success=False,
                error="Validation error",
            )

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                await forgot_password(
                    body=body,
                    user_repo=user_repo,
                    token_repo=token_repo,
                    token_generator=token_generator,
                )

            assert exc_info.value.status_code == 422

    @pytest.mark.asyncio
    async def test_forgot_password_success_returns_generic_message(self):
        """Test forgot password returns generic message on success."""
        # Arrange
        body = AuthForgotPasswordPostRequest(email="test@example.com")
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        # Mock RequestPasswordResetUseCase
        with patch(
            "affilibuster_backend.infrastructure.api.routes.auth.RequestPasswordResetUseCase"
        ) as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = RequestPasswordResetResponse(
                success=True,
                error=None,
            )

            # Act
            result = await forgot_password(
                body=body,
                user_repo=user_repo,
                token_repo=token_repo,
                token_generator=token_generator,
            )

            # Assert
            assert result.message is not None
            assert "has been sent" in result.message


@pytest.mark.unit
class TestResetPasswordRoute:
    """Test reset_password route handler."""

    @pytest.mark.asyncio
    async def test_reset_password_returns_400_on_invalid_token(self):
        """Test that reset_password returns 400 for invalid token."""
        # Arrange
        body = AuthResetPasswordPostRequest(token="invalid_token", new_password=SecretStr("NewPassword123!"))
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        # Mock ResetPasswordUseCase to return error with "Invalid or expired"
        with patch("affilibuster_backend.infrastructure.api.routes.auth.ResetPasswordUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = ResetPasswordResponse(
                success=False,
                error="Invalid or expired reset token",
            )

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                await reset_password(
                    body=body,
                    user_repo=user_repo,
                    token_repo=token_repo,
                    token_generator=token_generator,
                )

            assert exc_info.value.status_code == 400

    @pytest.mark.asyncio
    async def test_reset_password_returns_422_on_validation_error(self):
        """Test that reset_password returns 422 for validation errors."""
        # Arrange
        # Valid Pydantic, but will fail use case validation
        body = AuthResetPasswordPostRequest(token="valid_token", new_password=SecretStr("ValidPassword123!"))
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        # Mock ResetPasswordUseCase to return validation error
        with patch("affilibuster_backend.infrastructure.api.routes.auth.ResetPasswordUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = ResetPasswordResponse(
                success=False,
                error="Password too weak",
            )

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                await reset_password(
                    body=body,
                    user_repo=user_repo,
                    token_repo=token_repo,
                    token_generator=token_generator,
                )

            assert exc_info.value.status_code == 422

    @pytest.mark.asyncio
    async def test_reset_password_success_returns_message(self):
        """Test successful password reset returns success message."""
        # Arrange
        body = AuthResetPasswordPostRequest(token="valid_token", new_password=SecretStr("NewPassword123!"))
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        token_generator = Mock()

        # Mock ResetPasswordUseCase
        with patch("affilibuster_backend.infrastructure.api.routes.auth.ResetPasswordUseCase") as mock_use_case_class:
            mock_use_case = AsyncMock()
            mock_use_case_class.return_value = mock_use_case
            mock_use_case.execute.return_value = ResetPasswordResponse(
                success=True,
                error=None,
            )

            # Act
            result = await reset_password(
                body=body,
                user_repo=user_repo,
                token_repo=token_repo,
                token_generator=token_generator,
            )

            # Assert
            assert result.message is not None
            assert "Password reset successfully" in result.message
