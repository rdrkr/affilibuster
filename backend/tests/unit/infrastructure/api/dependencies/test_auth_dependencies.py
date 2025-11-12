# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for authentication dependencies.

Tests FastAPI dependency injection for authentication middleware.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest
from fastapi import HTTPException, Request, status

from affilibuster_backend.domain.entities.user import Email, HashedPassword, UserEntity, UserStatus
from affilibuster_backend.domain.entities.user_session import UserSession
from affilibuster_backend.infrastructure.api.dependencies.auth_dependencies import (
    get_current_user,
    get_current_verified_user,
)


@pytest.mark.unit
class TestGetCurrentUser:
    """Test get_current_user dependency."""

    async def test_get_current_user_with_valid_cookie_token(self) -> None:
        """Test extracting user from valid cookie token."""
        # Arrange
        user_id = uuid4()
        token = "valid_token_from_cookie"
        token_hash = "hashed_token"

        now = datetime.now(UTC)
        session = UserSession(
            id=uuid4(),
            user_id=user_id,
            token_hash=token_hash,
            expires_at=now + timedelta(days=1),
            remember_me=False,
            created_at=now,
        )

        user = UserEntity(
            id=user_id,
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

        request = AsyncMock(spec=Request)
        request.headers.get.return_value = None

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user

        session_repo = AsyncMock()
        session_repo.get_by_token_hash.return_value = session

        token_generator = Mock()
        token_generator.hash_token.return_value = token_hash

        # Act
        result = await get_current_user(
            request=request,
            access_token=token,
            user_repo=user_repo,
            session_repo=session_repo,
            token_generator=token_generator,
        )

        # Assert
        assert result.id == user_id
        assert result.email.value == "test@example.com"
        assert result.display_name == "Test User"
        token_generator.hash_token.assert_called_once_with(token)
        session_repo.get_by_token_hash.assert_called_once_with(token_hash)
        user_repo.get_by_id.assert_called_once_with(user_id)

    async def test_get_current_user_with_valid_authorization_header(self) -> None:
        """Test extracting user from Authorization header."""
        # Arrange
        user_id = uuid4()
        token = "valid_bearer_token"
        token_hash = "hashed_token"

        now = datetime.now(UTC)
        session = UserSession(
            id=uuid4(),
            user_id=user_id,
            token_hash=token_hash,
            expires_at=now + timedelta(days=1),
            remember_me=False,
            created_at=now,
        )

        user = UserEntity(
            id=user_id,
            email=Email("bearer@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Bearer User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=now,
            deleted_at=None,
        )

        request = AsyncMock(spec=Request)
        request.headers.get.return_value = f"Bearer {token}"

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = user

        session_repo = AsyncMock()
        session_repo.get_by_token_hash.return_value = session

        token_generator = Mock()
        token_generator.hash_token.return_value = token_hash

        # Act
        result = await get_current_user(
            request=request,
            access_token=None,  # No cookie token
            user_repo=user_repo,
            session_repo=session_repo,
            token_generator=token_generator,
        )

        # Assert
        assert result.id == user_id
        assert result.email.value == "bearer@example.com"
        request.headers.get.assert_called_once_with("Authorization")

    async def test_get_current_user_raises_401_when_no_token(self) -> None:
        """Test 401 error when no token is provided."""
        # Arrange
        request = AsyncMock(spec=Request)
        request.headers.get.return_value = None

        user_repo = AsyncMock()
        session_repo = AsyncMock()
        token_generator = Mock()

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(
                request=request,
                access_token=None,
                user_repo=user_repo,
                session_repo=session_repo,
                token_generator=token_generator,
            )

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Not authenticated"

    async def test_get_current_user_raises_401_when_session_not_found(self) -> None:
        """Test 401 error when session is not found."""
        # Arrange
        token = "invalid_token"
        token_hash = "hashed_invalid_token"

        request = AsyncMock(spec=Request)
        request.headers.get.return_value = None

        user_repo = AsyncMock()

        session_repo = AsyncMock()
        session_repo.get_by_token_hash.return_value = None  # Session not found

        token_generator = Mock()
        token_generator.hash_token.return_value = token_hash

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(
                request=request,
                access_token=token,
                user_repo=user_repo,
                session_repo=session_repo,
                token_generator=token_generator,
            )

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Invalid or expired session"

    async def test_get_current_user_raises_401_when_session_expired(self) -> None:
        """Test 401 error when session is expired."""
        # Arrange
        user_id = uuid4()
        token = "expired_token"
        token_hash = "hashed_expired_token"

        now = datetime.now(UTC)
        expired_session = UserSession(
            id=uuid4(),
            user_id=user_id,
            token_hash=token_hash,
            expires_at=now - timedelta(days=1),  # Expired
            remember_me=False,
            created_at=now - timedelta(days=2),
        )

        request = AsyncMock(spec=Request)
        request.headers.get.return_value = None

        user_repo = AsyncMock()

        session_repo = AsyncMock()
        session_repo.get_by_token_hash.return_value = expired_session

        token_generator = Mock()
        token_generator.hash_token.return_value = token_hash

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(
                request=request,
                access_token=token,
                user_repo=user_repo,
                session_repo=session_repo,
                token_generator=token_generator,
            )

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Invalid or expired session"

    async def test_get_current_user_raises_401_when_user_not_found(self) -> None:
        """Test 401 error when user is not found."""
        # Arrange
        user_id = uuid4()
        token = "valid_token"
        token_hash = "hashed_token"

        now = datetime.now(UTC)
        session = UserSession(
            id=uuid4(),
            user_id=user_id,
            token_hash=token_hash,
            expires_at=now + timedelta(days=1),
            remember_me=False,
            created_at=now,
        )

        request = AsyncMock(spec=Request)
        request.headers.get.return_value = None

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = None  # User not found

        session_repo = AsyncMock()
        session_repo.get_by_token_hash.return_value = session

        token_generator = Mock()
        token_generator.hash_token.return_value = token_hash

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(
                request=request,
                access_token=token,
                user_repo=user_repo,
                session_repo=session_repo,
                token_generator=token_generator,
            )

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "User not found"

    async def test_get_current_user_raises_403_when_user_inactive(self) -> None:
        """Test 403 error when user account is inactive."""
        # Arrange
        user_id = uuid4()
        token = "valid_token"
        token_hash = "hashed_token"

        now = datetime.now(UTC)
        session = UserSession(
            id=uuid4(),
            user_id=user_id,
            token_hash=token_hash,
            expires_at=now + timedelta(days=1),
            remember_me=False,
            created_at=now,
        )

        inactive_user = UserEntity(
            id=user_id,
            email=Email("inactive@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Inactive User",
            email_verified=True,
            status=UserStatus.LOCKED,  # Inactive
            created_at=now,
            updated_at=now,
            last_login_at=now,
            deleted_at=None,
        )

        request = AsyncMock(spec=Request)
        request.headers.get.return_value = None

        user_repo = AsyncMock()
        user_repo.get_by_id.return_value = inactive_user

        session_repo = AsyncMock()
        session_repo.get_by_token_hash.return_value = session

        token_generator = Mock()
        token_generator.hash_token.return_value = token_hash

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(
                request=request,
                access_token=token,
                user_repo=user_repo,
                session_repo=session_repo,
                token_generator=token_generator,
            )

        assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
        assert exc_info.value.detail == "Account is locked or deleted"


@pytest.mark.unit
class TestGetCurrentVerifiedUser:
    """Test get_current_verified_user dependency."""

    async def test_get_current_verified_user_with_verified_email(self) -> None:
        """Test returning user when email is verified."""
        # Arrange
        now = datetime.now(UTC)
        verified_user = UserEntity(
            id=uuid4(),
            email=Email("verified@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Verified User",
            email_verified=True,  # Email verified
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=now,
            deleted_at=None,
        )

        # Act
        result = await get_current_verified_user(verified_user)

        # Assert
        assert result.id == verified_user.id
        assert result.email_verified is True

    async def test_get_current_verified_user_raises_403_when_unverified(self) -> None:
        """Test 403 error when email is not verified."""
        # Arrange
        now = datetime.now(UTC)
        unverified_user = UserEntity(
            id=uuid4(),
            email=Email("unverified@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Unverified User",
            email_verified=False,  # Email NOT verified
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=now,
            deleted_at=None,
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_current_verified_user(unverified_user)

        assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
        assert exc_info.value.detail == "Email verification required"


@pytest.mark.unit
class TestDependencyGetters:
    """Test dependency getter functions."""

    @pytest.mark.asyncio
    async def test_get_user_repo_returns_repository(self) -> None:
        """Test get_user_repo returns user repository instance."""
        from affilibuster_backend.infrastructure.api.dependencies.auth_dependencies import get_user_repo
        from affilibuster_backend.infrastructure.database.config import get_db

        async for db in get_db():
            repo = get_user_repo(db=db)
            assert repo is not None
            from affilibuster_backend.domain.repositories.user_repository import IUserRepository

            assert isinstance(repo, IUserRepository)
            break

    @pytest.mark.asyncio
    async def test_get_session_repo_returns_repository(self) -> None:
        """Test get_session_repo returns session repository instance."""
        from affilibuster_backend.infrastructure.api.dependencies.auth_dependencies import get_session_repo
        from affilibuster_backend.infrastructure.database.config import get_db

        async for db in get_db():
            repo = get_session_repo(db=db)
            assert repo is not None
            from affilibuster_backend.domain.repositories.session_repository import ISessionRepository

            assert isinstance(repo, ISessionRepository)
            break

    def test_get_token_generator_returns_instance(self) -> None:
        """Test get_token_generator returns token generator instance."""
        from affilibuster_backend.infrastructure.api.dependencies.auth_dependencies import get_token_generator

        generator = get_token_generator()
        assert generator is not None
        from affilibuster_backend.domain.services.token_generator import TokenGenerator

        assert isinstance(generator, TokenGenerator)

    def test_get_password_hasher_returns_instance(self) -> None:
        """Test get_password_hasher returns password hasher instance."""
        from affilibuster_backend.infrastructure.api.dependencies.auth_dependencies import get_password_hasher

        hasher = get_password_hasher()
        assert hasher is not None
        from affilibuster_backend.domain.services.password_hasher import PasswordHasher

        assert isinstance(hasher, PasswordHasher)

    async def test_get_current_user_raises_500_when_dependencies_are_none(self) -> None:
        """Test 500 error when dependencies are None."""
        # Arrange
        token = "valid_token"
        request = AsyncMock(spec=Request)
        request.headers.get.return_value = None

        # Act & Assert - Pass None for all dependencies
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(
                request=request,
                access_token=token,
                user_repo=None,  # None dependency
                session_repo=None,  # None dependency
                token_generator=None,  # None dependency
            )

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Service unavailable" in exc_info.value.detail
