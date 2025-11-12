# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for authentication API routes.

Tests all authentication endpoints with real database integration.
"""

import uuid

import pytest

from affilibuster_backend.domain.entities.generated.models import (
    AuthForgotPasswordPostResponse,
    AuthLogoutPostResponse,
    LoginResponse,
    RefreshResponse,
    RegisterResponse,
)


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestRegisterRoute:
    """Test suite for POST /auth/register endpoint."""

    async def test_register_new_user_success(self, integration_client):
        """Test successful user registration."""
        unique_email = f"newuser-{uuid.uuid4()}@example.com"
        response = await integration_client.post(
            "/v1/auth/register",
            json={
                "email": unique_email,
                "password": "SecurePassword123!",
                "display_name": "New User",
            },
        )
        assert response.status_code == 201

        # Parse response into typed Pydantic model
        data = RegisterResponse(**response.json())
        assert data.message == "Registration successful. Please check your email for verification."
        assert data.user.email == unique_email
        assert data.user.display_name == "New User"
        assert data.user.email_verified is False
        assert data.user.id is not None
        assert data.verification_token is not None

    async def test_register_duplicate_email_fails(self, integration_client):
        """Test that registering with duplicate email fails."""
        unique_email = f"duplicate-{uuid.uuid4()}@example.com"
        # Register first user
        await integration_client.post(
            "/v1/auth/register",
            json={
                "email": unique_email,
                "password": "Password123!",
                "display_name": "First User",
            },
        )

        # Try to register with same email
        response = await integration_client.post(
            "/v1/auth/register",
            json={
                "email": unique_email,
                "password": "DifferentPassword123!",
                "display_name": "Second User",
            },
        )
        assert response.status_code == 409  # Conflict
        assert "already registered" in response.json()["detail"].lower()

    async def test_register_weak_password_fails(self, integration_client):
        """Test that weak password is rejected."""
        unique_email = f"weakpass-{uuid.uuid4()}@example.com"
        response = await integration_client.post(
            "/v1/auth/register",
            json={
                "email": unique_email,
                "password": "weak",
                "display_name": "Weak Password User",
            },
        )
        assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestLoginRoute:
    """Test suite for POST /auth/login endpoint."""

    async def test_login_with_valid_credentials(self, integration_client):
        """Test successful login with valid credentials."""
        unique_email = f"logintest-{uuid.uuid4()}@example.com"
        # Register user first
        await integration_client.post(
            "/v1/auth/register",
            json={
                "email": unique_email,
                "password": "Password123!",
                "display_name": "Login Test",
            },
        )

        # Login
        response = await integration_client.post(
            "/v1/auth/login",
            json={
                "email": unique_email,
                "password": "Password123!",
                "rememberMe": False,
            },
        )
        assert response.status_code == 200

        # Parse response into typed Pydantic model
        data = LoginResponse(**response.json())
        assert data.user.email == unique_email
        assert "Set-Cookie" in response.headers  # Session cookie set

    async def test_login_with_wrong_password_fails(self, integration_client):
        """Test that login fails with wrong password."""
        unique_email = f"wrongpass-{uuid.uuid4()}@example.com"
        # Register user
        await integration_client.post(
            "/v1/auth/register",
            json={
                "email": unique_email,
                "password": "CorrectPassword123!",
                "display_name": "Wrong Pass User",
            },
        )

        # Try login with wrong password
        response = await integration_client.post(
            "/v1/auth/login",
            json={
                "email": unique_email,
                "password": "WrongPassword123!",
                "rememberMe": False,
            },
        )
        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()

    async def test_login_nonexistent_user_fails(self, integration_client):
        """Test that login fails for non-existent user."""
        response = await integration_client.post(
            "/v1/auth/login",
            json={
                "email": f"nonexistent-{uuid.uuid4()}@example.com",
                "password": "Password123!",
                "rememberMe": False,
            },
        )
        assert response.status_code == 401


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestLogoutRoute:
    """Test suite for POST /auth/logout endpoint."""

    async def test_logout_with_valid_session(self, integration_client):
        """Test successful logout."""
        unique_email = f"logouttest-{uuid.uuid4()}@example.com"
        # Register and login
        await integration_client.post(
            "/v1/auth/register",
            json={
                "email": unique_email,
                "password": "Password123!",
                "display_name": "Logout Test",
            },
        )
        login_response = await integration_client.post(
            "/v1/auth/login",
            json={
                "email": unique_email,
                "password": "Password123!",
                "rememberMe": False,
            },
        )

        # Set session cookie on client
        access_token = login_response.cookies.get("access_token")
        if access_token:
            integration_client.cookies.set("access_token", access_token)

        # Logout
        response = await integration_client.post("/v1/auth/logout")
        assert response.status_code == 200
        data = AuthLogoutPostResponse(**response.json())
        assert data.message == "Logout successful"

    async def test_logout_without_session_fails(self, integration_client):
        """Test that logout fails without session."""
        response = await integration_client.post("/v1/auth/logout")
        assert response.status_code == 401


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestRefreshRoute:
    """Test suite for POST /auth/refresh endpoint."""

    async def test_refresh_with_valid_session(self, integration_client):
        """Test session refresh."""
        unique_email = f"refreshtest-{uuid.uuid4()}@example.com"
        # Register and login
        await integration_client.post(
            "/v1/auth/register",
            json={
                "email": unique_email,
                "password": "Password123!",
                "display_name": "Refresh Test",
            },
        )
        login_response = await integration_client.post(
            "/v1/auth/login",
            json={
                "email": unique_email,
                "password": "Password123!",
                "rememberMe": False,
            },
        )

        # Set session cookie on client
        access_token = login_response.cookies.get("access_token")
        if access_token:
            integration_client.cookies.set("access_token", access_token)

        # Refresh session
        response = await integration_client.post("/v1/auth/refresh")
        assert response.status_code == 200
        # Parse response into typed Pydantic model
        data = RefreshResponse(**response.json())
        assert data.success is True
        assert data.session_token is not None
        assert data.expires_at is not None


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestVerifyEmailRoute:
    """Test suite for POST /auth/verify-email endpoint."""

    async def test_verify_email_with_invalid_token_fails(self, integration_client):
        """Test email verification with invalid token."""
        response = await integration_client.post(
            "/v1/auth/verify-email",
            json={"token": "invalid-token-12345"},
        )
        assert response.status_code == 400


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestForgotPasswordRoute:
    """Test suite for POST /auth/forgot-password endpoint."""

    async def test_forgot_password_with_valid_email(self, integration_client):
        """Test password reset request with valid email."""
        unique_email = f"forgotpass-{uuid.uuid4()}@example.com"
        # Register user first
        await integration_client.post(
            "/v1/auth/register",
            json={
                "email": unique_email,
                "password": "Password123!",
                "display_name": "Forgot Pass User",
            },
        )

        # Request password reset
        response = await integration_client.post(
            "/v1/auth/forgot-password",
            json={"email": unique_email},
        )
        assert response.status_code == 200
        # Parse response into typed Pydantic model
        data = AuthForgotPasswordPostResponse(**response.json())
        assert data.message is not None
        assert "has been sent" in data.message.lower()

    async def test_forgot_password_with_nonexistent_email_returns_success(self, integration_client):
        """Test that forgot password returns success even for non-existent email (security)."""
        response = await integration_client.post(
            "/v1/auth/forgot-password",
            json={"email": f"nonexistent-{uuid.uuid4()}@example.com"},
        )
        # Should return 200 to prevent email enumeration
        assert response.status_code == 200


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestResetPasswordRoute:
    """Test suite for POST /auth/reset-password endpoint."""

    async def test_reset_password_with_invalid_token_fails(self, integration_client):
        """Test password reset with invalid token."""
        response = await integration_client.post(
            "/v1/auth/reset-password",
            json={
                "token": "invalid-reset-token",
                "newPassword": "NewPassword123!",
            },
        )
        assert response.status_code == 400
