# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for profile management routes.

Tests cover:
- GET /auth/profile - Get user profile
- PATCH /auth/profile - Update profile
- POST /auth/profile/change-password - Change password
"""

from uuid import uuid4

import pytest
from httpx import AsyncClient

from affilibuster_backend.domain.entities.generated.models import (
    AuthProfileChangePasswordPostResponse,
    UserProfile,
)


@pytest.mark.asyncio
class TestGetProfile:
    """Test suite for GET /auth/profile endpoint."""

    async def test_get_profile_success(self, integration_client: AsyncClient):
        """Test getting profile for authenticated user."""
        # First register and login to get access token
        register_data = {
            "email": f"profile_test_{uuid4()}@example.com",
            "password": "SecurePass123!",
            "display_name": "Profile Test User",
        }

        response = await integration_client.post("/v1/auth/register", json=register_data)
        assert response.status_code == 201

        # Login to get access token
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"],
        }

        response = await integration_client.post("/v1/auth/login", json=login_data)
        assert response.status_code == 200
        access_token = response.cookies.get("access_token")
        assert access_token is not None

        # Set cookie on client
        integration_client.cookies.set("access_token", access_token)

        # Get profile
        response = await integration_client.get("/v1/auth/profile")

        assert response.status_code == 200
        # Parse response into typed Pydantic model
        profile = UserProfile(**response.json())
        assert profile.email == register_data["email"]
        assert profile.display_name == register_data["display_name"]
        assert profile.email_verified is False  # Not verified yet
        assert profile.id is not None
        assert profile.created_at is not None

        # Clear cookies after test
        integration_client.cookies.clear()

    async def test_get_profile_without_authentication_fails(self, integration_client: AsyncClient):
        """Test getting profile without authentication returns 401."""
        # Ensure cookies are clear
        integration_client.cookies.clear()

        response = await integration_client.get("/v1/auth/profile")

        assert response.status_code == 401

    async def test_get_profile_with_invalid_token_fails(self, integration_client: AsyncClient):
        """Test getting profile with invalid token returns 401."""
        # Set invalid token
        integration_client.cookies.set("access_token", "invalid_token_12345")

        response = await integration_client.get("/v1/auth/profile")

        assert response.status_code == 401

        # Clear cookies after test
        integration_client.cookies.clear()


@pytest.mark.asyncio
class TestUpdateProfile:
    """Test suite for PATCH /auth/profile endpoint."""

    async def test_update_profile_success(self, integration_client: AsyncClient):
        """Test updating profile display name."""
        # Register and login
        register_data = {
            "email": f"update_test_{uuid4()}@example.com",
            "password": "SecurePass123!",
            "display_name": "Original Name",
        }

        response = await integration_client.post("/v1/auth/register", json=register_data)
        assert response.status_code == 201

        login_data = {
            "email": register_data["email"],
            "password": register_data["password"],
        }

        response = await integration_client.post("/v1/auth/login", json=login_data)
        assert response.status_code == 200
        access_token = response.cookies.get("access_token")
        assert access_token is not None

        # Set cookie on client
        integration_client.cookies.set("access_token", access_token)

        # Update profile
        update_data = {"display_name": "Updated Name"}
        response = await integration_client.patch(
            "/v1/auth/profile",
            json=update_data,
        )

        assert response.status_code == 200
        # Parse response into typed Pydantic model
        profile = UserProfile(**response.json())
        assert profile.display_name == "Updated Name"
        assert profile.email == register_data["email"]

        # Clear cookies after test
        integration_client.cookies.clear()

    async def test_update_profile_with_empty_name_fails(self, integration_client: AsyncClient):
        """Test updating profile with empty display name fails."""
        # Register and login
        register_data = {
            "email": f"update_empty_{uuid4()}@example.com",
            "password": "SecurePass123!",
            "display_name": "Original Name",
        }

        response = await integration_client.post("/v1/auth/register", json=register_data)
        assert response.status_code == 201

        login_data = {
            "email": register_data["email"],
            "password": register_data["password"],
        }

        response = await integration_client.post("/v1/auth/login", json=login_data)
        assert response.status_code == 200
        access_token = response.cookies.get("access_token")
        assert access_token is not None

        # Set cookie on client
        integration_client.cookies.set("access_token", access_token)

        # Try to update with empty name
        update_data = {"display_name": ""}
        response = await integration_client.patch(
            "/v1/auth/profile",
            json=update_data,
        )

        assert response.status_code == 422  # Validation error

        # Clear cookies after test
        integration_client.cookies.clear()

    async def test_update_profile_without_authentication_fails(self, integration_client: AsyncClient):
        """Test updating profile without authentication returns 401."""
        # Ensure cookies are clear
        integration_client.cookies.clear()

        update_data = {"display_name": "New Name"}
        response = await integration_client.patch("/v1/auth/profile", json=update_data)

        assert response.status_code == 401


@pytest.mark.asyncio
class TestChangePassword:
    """Test suite for POST /auth/profile/change-password endpoint."""

    async def test_change_password_success(self, integration_client: AsyncClient):
        """Test successfully changing password."""
        # Register and login
        register_data = {
            "email": f"change_pass_{uuid4()}@example.com",
            "password": "OldPassword123!",
            "display_name": "Password Changer",
        }

        response = await integration_client.post("/v1/auth/register", json=register_data)
        assert response.status_code == 201

        login_data = {
            "email": register_data["email"],
            "password": register_data["password"],
        }

        response = await integration_client.post("/v1/auth/login", json=login_data)
        assert response.status_code == 200
        access_token = response.cookies.get("access_token")
        assert access_token is not None

        # Set cookie on client
        integration_client.cookies.set("access_token", access_token)

        # Change password
        change_data = {
            "current_password": "OldPassword123!",
            "new_password": "NewPassword123!",
        }
        response = await integration_client.post(
            "/v1/auth/profile/change-password",
            json=change_data,
        )

        assert response.status_code == 200
        # Parse response into typed Pydantic model
        result = AuthProfileChangePasswordPostResponse(**response.json())
        assert result.message is not None
        assert "successfully" in result.message.lower()

        # Clear cookies before testing login
        integration_client.cookies.clear()

        # Verify old password no longer works
        login_old = {
            "email": register_data["email"],
            "password": "OldPassword123!",
        }
        response = await integration_client.post("/v1/auth/login", json=login_old)
        assert response.status_code == 401

        # Verify new password works
        login_new = {
            "email": register_data["email"],
            "password": "NewPassword123!",
        }
        response = await integration_client.post("/v1/auth/login", json=login_new)
        assert response.status_code == 200

        # Clear cookies after test
        integration_client.cookies.clear()

    async def test_change_password_with_wrong_current_password_fails(self, integration_client: AsyncClient):
        """Test changing password with wrong current password fails."""
        # Register and login
        register_data = {
            "email": f"wrong_pass_{uuid4()}@example.com",
            "password": "CorrectPassword123!",
            "display_name": "Wrong Password User",
        }

        response = await integration_client.post("/v1/auth/register", json=register_data)
        assert response.status_code == 201

        login_data = {
            "email": register_data["email"],
            "password": register_data["password"],
        }

        response = await integration_client.post("/v1/auth/login", json=login_data)
        assert response.status_code == 200
        access_token = response.cookies.get("access_token")
        assert access_token is not None

        # Set cookie on client
        integration_client.cookies.set("access_token", access_token)

        # Try to change password with wrong current password
        change_data = {
            "current_password": "WrongPassword123!",
            "new_password": "NewPassword123!",
        }
        response = await integration_client.post(
            "/v1/auth/profile/change-password",
            json=change_data,
        )

        assert response.status_code == 400

        # Clear cookies after test
        integration_client.cookies.clear()

    async def test_change_password_with_weak_new_password_fails(self, integration_client: AsyncClient):
        """Test changing password to weak password fails."""
        # Register and login
        register_data = {
            "email": f"weak_new_pass_{uuid4()}@example.com",
            "password": "StrongPassword123!",
            "display_name": "Weak Password User",
        }

        response = await integration_client.post("/v1/auth/register", json=register_data)
        assert response.status_code == 201

        login_data = {
            "email": register_data["email"],
            "password": register_data["password"],
        }

        response = await integration_client.post("/v1/auth/login", json=login_data)
        assert response.status_code == 200
        access_token = response.cookies.get("access_token")
        assert access_token is not None

        # Set cookie on client
        integration_client.cookies.set("access_token", access_token)

        # Try to change to weak password
        change_data = {
            "current_password": "StrongPassword123!",
            "new_password": "weak",  # Too short
        }
        response = await integration_client.post(
            "/v1/auth/profile/change-password",
            json=change_data,
        )

        assert response.status_code == 422  # Validation error

        # Clear cookies after test
        integration_client.cookies.clear()

    async def test_change_password_without_authentication_fails(self, integration_client: AsyncClient):
        """Test changing password without authentication returns 401."""
        # Ensure cookies are clear
        integration_client.cookies.clear()

        change_data = {
            "current_password": "OldPassword123!",
            "new_password": "NewPassword123!",
        }
        response = await integration_client.post(
            "/v1/auth/profile/change-password",
            json=change_data,
        )

        assert response.status_code == 401
