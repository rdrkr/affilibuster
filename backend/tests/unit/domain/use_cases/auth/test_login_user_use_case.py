# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for LoginUserUseCase.

Tests user login business logic including authentication, session creation,
and "remember me" functionality.
Following TDD: These tests are written FIRST and will initially FAIL.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest
from pydantic import SecretStr, ValidationError

from affilibuster_backend.domain.entities.generated.models import AuthLoginPostRequest
from affilibuster_backend.domain.entities.user import Email, HashedPassword, UserEntity, UserStatus
from affilibuster_backend.domain.use_cases.auth.login_user_use_case import LoginUserUseCase


class TestLoginUserUseCase:
    """Test LoginUserUseCase."""

    @pytest.mark.asyncio
    async def test_login_with_valid_credentials(self) -> None:
        """Test successful login with valid email and password."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)
        user = UserEntity(
            id=user_id,
            email=Email("user@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_email.return_value = user
        password_hasher.verify_password.return_value = True
        token_generator.generate_token.return_value = "session_token_123"
        token_generator.hash_token.return_value = "hashed_session_token"

        use_case = LoginUserUseCase(
            user_repository=user_repo,
            session_repository=session_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthLoginPostRequest(
            email="user@example.com",
            password=SecretStr("CorrectPassword123!"),
            remember_me=False,
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is True
        assert result.user is not None
        assert result.user.id == user_id
        assert result.session_token == "session_token_123"
        assert result.error is None

        # Verify password was checked
        password_hasher.verify_password.assert_called_once_with("CorrectPassword123!", "$2b$12$hashedpassword")

        # Verify session was created
        session_repo.create.assert_called_once()

        # Verify user was updated (last_login_at)
        user_repo.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_login_with_wrong_password(self) -> None:
        """Test login fails with incorrect password."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        now = datetime.now(UTC)
        user = UserEntity(
            id=uuid4(),
            email=Email("user@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_email.return_value = user
        password_hasher.verify_password.return_value = False

        use_case = LoginUserUseCase(
            user_repository=user_repo,
            session_repository=session_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthLoginPostRequest(
            email="user@example.com",
            password=SecretStr("WrongPassword123!"),
            remember_me=False,
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error == "Invalid email or password"
        assert result.user is None
        assert result.session_token is None

        # Verify no session was created
        session_repo.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_login_with_nonexistent_email(self) -> None:
        """Test login fails with non-existent email."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_repo.get_by_email.return_value = None

        use_case = LoginUserUseCase(
            user_repository=user_repo,
            session_repository=session_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthLoginPostRequest(
            email="nonexistent@example.com",
            password=SecretStr("SomePassword123!"),
            remember_me=False,
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error == "Invalid email or password"
        assert result.user is None
        assert result.session_token is None

        # Verify password hasher was not called
        password_hasher.verify_password.assert_not_called()

    @pytest.mark.asyncio
    async def test_login_generic_error_message(self) -> None:
        """Test that login returns generic error (doesn't reveal if email exists)."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        # Case 1: User doesn't exist
        user_repo.get_by_email.return_value = None

        use_case = LoginUserUseCase(
            user_repository=user_repo,
            session_repository=session_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request1 = AuthLoginPostRequest(
            email="nonexistent@example.com",
            password=SecretStr("Password123!"),
            remember_me=False,
        )

        result1 = await use_case.execute(request1)

        # Case 2: User exists but wrong password
        now = datetime.now(UTC)
        user = UserEntity(
            id=uuid4(),
            email=Email("user@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_email.return_value = user
        password_hasher.verify_password.return_value = False

        request2 = AuthLoginPostRequest(
            email="user@example.com",
            password=SecretStr("WrongPassword123!"),
            remember_me=False,
        )

        result2 = await use_case.execute(request2)

        # Assert - Both should return the same generic error
        assert result1.error == result2.error == "Invalid email or password"

    @pytest.mark.asyncio
    async def test_login_creates_session(self) -> None:
        """Test that login creates a session in the database."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)
        user = UserEntity(
            id=user_id,
            email=Email("user@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_email.return_value = user
        password_hasher.verify_password.return_value = True
        token_generator.generate_token.return_value = "session_token"
        token_generator.hash_token.return_value = "hashed_session_token"

        use_case = LoginUserUseCase(
            user_repository=user_repo,
            session_repository=session_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthLoginPostRequest(
            email="user@example.com",
            password=SecretStr("Password123!"),
            remember_me=False,
        )

        # Act
        await use_case.execute(request)

        # Assert
        session_repo.create.assert_called_once()
        call_args = session_repo.create.call_args
        created_session = call_args[0][0]
        assert created_session.user_id == user_id
        assert created_session.token_hash == "hashed_session_token"
        assert created_session.remember_me is False

    @pytest.mark.asyncio
    async def test_login_with_remember_me_extends_session(self) -> None:
        """Test that remember_me flag extends session duration to 30 days."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)
        user = UserEntity(
            id=user_id,
            email=Email("user@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_email.return_value = user
        password_hasher.verify_password.return_value = True
        token_generator.generate_token.return_value = "session_token"
        token_generator.hash_token.return_value = "hashed_session_token"

        use_case = LoginUserUseCase(
            user_repository=user_repo,
            session_repository=session_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthLoginPostRequest(
            email="user@example.com",
            password=SecretStr("Password123!"),
            remember_me=True,
        )

        # Act
        await use_case.execute(request)

        # Assert
        call_args = session_repo.create.call_args
        created_session = call_args[0][0]
        assert created_session.remember_me is True

        # Session should expire in ~30 days (allow 1 second tolerance)
        expected_expiry = now + timedelta(days=30)
        actual_expiry = created_session.expires_at
        assert abs((actual_expiry - expected_expiry).total_seconds()) < 2

    @pytest.mark.asyncio
    async def test_login_without_remember_me_short_session(self) -> None:
        """Test that login without remember_me creates 7-day session."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)
        user = UserEntity(
            id=user_id,
            email=Email("user@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_email.return_value = user
        password_hasher.verify_password.return_value = True
        token_generator.generate_token.return_value = "session_token"
        token_generator.hash_token.return_value = "hashed_session_token"

        use_case = LoginUserUseCase(
            user_repository=user_repo,
            session_repository=session_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthLoginPostRequest(
            email="user@example.com",
            password=SecretStr("Password123!"),
            remember_me=False,
        )

        # Act
        await use_case.execute(request)

        # Assert
        call_args = session_repo.create.call_args
        created_session = call_args[0][0]
        assert created_session.remember_me is False

        # Session should expire in ~7 days (allow 1 second tolerance)
        expected_expiry = now + timedelta(days=7)
        actual_expiry = created_session.expires_at
        assert abs((actual_expiry - expected_expiry).total_seconds()) < 2

    @pytest.mark.asyncio
    async def test_login_updates_last_login_timestamp(self) -> None:
        """Test that successful login updates user's last_login_at."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_id = uuid4()
        now = datetime.now(UTC)
        user = UserEntity(
            id=user_id,
            email=Email("user@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_email.return_value = user
        password_hasher.verify_password.return_value = True
        token_generator.generate_token.return_value = "session_token"
        token_generator.hash_token.return_value = "hashed_session_token"

        use_case = LoginUserUseCase(
            user_repository=user_repo,
            session_repository=session_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthLoginPostRequest(
            email="user@example.com",
            password=SecretStr("Password123!"),
            remember_me=False,
        )

        # Act
        await use_case.execute(request)

        # Assert
        user_repo.update.assert_called_once()
        call_args = user_repo.update.call_args
        updated_user = call_args[0][0]
        assert updated_user.last_login_at is not None
        assert isinstance(updated_user.last_login_at, datetime)

    @pytest.mark.asyncio
    async def test_login_with_deleted_user(self) -> None:
        """Test that login fails for deleted users."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        now = datetime.now(UTC)
        user = UserEntity(
            id=uuid4(),
            email=Email("user@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.DELETED,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=now,
        )

        user_repo.get_by_email.return_value = user
        password_hasher.verify_password.return_value = True

        use_case = LoginUserUseCase(
            user_repository=user_repo,
            session_repository=session_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthLoginPostRequest(
            email="user@example.com",
            password=SecretStr("Password123!"),
            remember_me=False,
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error == "Invalid email or password"
        session_repo.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_login_with_locked_user(self) -> None:
        """Test that login fails for locked users."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        now = datetime.now(UTC)
        user = UserEntity(
            id=uuid4(),
            email=Email("user@example.com"),
            hashed_password=HashedPassword("$2b$12$hashedpassword"),
            display_name="Test User",
            email_verified=True,
            status=UserStatus.LOCKED,
            created_at=now,
            updated_at=now,
            last_login_at=None,
            deleted_at=None,
        )

        user_repo.get_by_email.return_value = user
        password_hasher.verify_password.return_value = True

        use_case = LoginUserUseCase(
            user_repository=user_repo,
            session_repository=session_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthLoginPostRequest(
            email="user@example.com",
            password=SecretStr("Password123!"),
            remember_me=False,
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error == "Account is locked"
        session_repo.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_login_with_malformed_email(self) -> None:
        """Test login fails with malformed email (not a valid email format)."""
        # Arrange
        # Act & Assert - Pydantic validates email format during model instantiation
        with pytest.raises(ValidationError) as exc_info:
            AuthLoginPostRequest(
                email="not-a-valid-email",  # Invalid format - no @ symbol
                password=SecretStr("Password123!"),
                remember_me=False,
            )

        assert "email" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_login_with_invalid_email_bypassing_pydantic(self) -> None:
        """Test use case handles invalid email even if Pydantic validation is bypassed."""
        # Arrange
        user_repo = AsyncMock()
        session_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        use_case = LoginUserUseCase(
            user_repository=user_repo,
            session_repository=session_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        # Bypass Pydantic validation using model_construct
        request = AuthLoginPostRequest.model_construct(
            email="invalid-email-format",  # Invalid email that would fail Email() constructor
            password=SecretStr("Password123!"),
            remember_me=False,
        )

        # Act
        result = await use_case.execute(request)

        # Assert - Should return generic error without revealing email is invalid
        assert result.success is False
        assert result.error == "Invalid email or password"
        assert result.user is None
