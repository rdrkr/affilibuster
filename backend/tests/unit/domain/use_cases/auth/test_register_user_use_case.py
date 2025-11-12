# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for RegisterUserUseCase.

Tests user registration business logic including validation, password hashing,
and email verification token generation.
Following TDD: These tests are written FIRST and will initially FAIL.
"""

from unittest.mock import AsyncMock, Mock

import pytest
from pydantic import SecretStr, ValidationError

from affilibuster_backend.domain.entities.generated.models import (
    AuthRegisterPostRequest,
)
from affilibuster_backend.domain.entities.user import UserStatus
from affilibuster_backend.domain.use_cases.auth.register_user_use_case import (
    RegisterUserUseCase,
)


class TestRegisterUserUseCase:
    """Test RegisterUserUseCase."""

    @pytest.mark.asyncio
    async def test_register_user_with_valid_data(self) -> None:
        """Test successful user registration with valid data."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_repo.exists_by_email.return_value = False
        user_repo.create.side_effect = lambda user: user  # Return the user that was passed in
        password_hasher.hash_password.return_value = "$2b$12$hashedpassword"
        token_generator.generate_token.return_value = "verification_token_123"
        token_generator.hash_token.return_value = "hashed_verification_token"

        use_case = RegisterUserUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthRegisterPostRequest(
            email="user@example.com",
            password=SecretStr("SecurePassword123!"),
            display_name="Test User",
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is True
        assert result.user is not None
        assert result.user.email.value == "user@example.com"
        assert result.user.display_name == "Test User"
        assert result.user.email_verified is False
        assert result.user.status == UserStatus.ACTIVE
        assert result.verification_token == "verification_token_123"

        # Verify password was hashed
        password_hasher.hash_password.assert_called_once_with("SecurePassword123!")

        # Verify user was created
        user_repo.create.assert_called_once()

        # Verify verification token was created
        token_repo.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_register_user_with_existing_email(self) -> None:
        """Test registration fails when email already exists."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_repo.exists_by_email.return_value = True

        use_case = RegisterUserUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthRegisterPostRequest(
            email="existing@example.com",
            password=SecretStr("SecurePassword123!"),
            display_name="Test User",
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error == "Email already registered"

        # Verify no user was created
        user_repo.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_register_user_with_invalid_email(self) -> None:
        """Test registration fails with invalid email format."""
        # Arrange
        # Act & Assert - Pydantic validates email format during model instantiation
        with pytest.raises(ValidationError) as exc_info:
            AuthRegisterPostRequest(
                email="not-an-email",
                password=SecretStr("SecurePassword123!"),
                display_name="Test User",
            )

        assert "email" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_register_user_with_empty_email(self) -> None:
        """Test registration fails with empty email."""
        # Arrange
        # Act & Assert - Pydantic validates empty email during model instantiation
        with pytest.raises(ValidationError) as exc_info:
            AuthRegisterPostRequest(
                email="",
                password=SecretStr("SecurePassword123!"),
                display_name="Test User",
            )

        assert "email" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_register_user_with_weak_password(self) -> None:
        """Test registration fails with weak password."""
        # Arrange
        # Act & Assert - Pydantic validates password length during model instantiation
        with pytest.raises(ValidationError) as exc_info:
            AuthRegisterPostRequest(
                email="user@example.com",
                password=SecretStr("weak"),
                display_name="Test User",
            )

        assert "password" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_register_user_with_empty_password(self) -> None:
        """Test registration fails with empty password."""
        # Arrange
        # Act & Assert - Pydantic validates password length during model instantiation
        with pytest.raises(ValidationError) as exc_info:
            AuthRegisterPostRequest(
                email="user@example.com",
                password=SecretStr(""),
                display_name="Test User",
            )

        assert "password" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_register_user_with_empty_display_name(self) -> None:
        """Test registration fails with empty display name."""
        # Arrange
        # Act & Assert - Pydantic validates displayName minLength during model instantiation
        with pytest.raises(ValidationError) as exc_info:
            AuthRegisterPostRequest(
                email="user@example.com",
                password=SecretStr("SecurePassword123!"),
                display_name="",
            )

        assert "display_name" in str(exc_info.value) or "displayName" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_register_user_with_whitespace_display_name(self) -> None:
        """Test registration fails with whitespace-only display name."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        use_case = RegisterUserUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthRegisterPostRequest(
            email="user@example.com",
            password=SecretStr("SecurePassword123!"),
            display_name="   ",
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error is not None
        assert "Display name cannot be empty" in result.error

    @pytest.mark.asyncio
    async def test_register_user_with_long_display_name(self) -> None:
        """Test registration fails with display name over 100 characters."""
        # Arrange
        # Act & Assert - Pydantic validates displayName maxLength during model instantiation
        with pytest.raises(ValidationError) as exc_info:
            AuthRegisterPostRequest(
                email="user@example.com",
                password=SecretStr("SecurePassword123!"),
                display_name="a" * 101,
            )

        assert "display_name" in str(exc_info.value) or "displayName" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_register_user_password_is_hashed(self) -> None:
        """Test that password is hashed before storing."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_repo.exists_by_email.return_value = False
        password_hasher.hash_password.return_value = "$2b$12$hashedpassword"
        token_generator.generate_token.return_value = "token"
        token_generator.hash_token.return_value = "hashed_token"

        use_case = RegisterUserUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthRegisterPostRequest(
            email="user@example.com",
            password=SecretStr("PlaintextPassword123!"),
            display_name="Test User",
        )

        # Act
        await use_case.execute(request)

        # Assert
        password_hasher.hash_password.assert_called_once_with("PlaintextPassword123!")

        # Verify user created with hashed password
        call_args = user_repo.create.call_args
        created_user = call_args[0][0]
        assert created_user.hashed_password.value == "$2b$12$hashedpassword"

    @pytest.mark.asyncio
    async def test_register_user_generates_verification_token(self) -> None:
        """Test that email verification token is generated."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_repo.exists_by_email.return_value = False
        password_hasher.hash_password.return_value = "$2b$12$hashedpassword"
        token_generator.generate_token.return_value = "plaintext_token"
        token_generator.hash_token.return_value = "hashed_token_value"

        use_case = RegisterUserUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthRegisterPostRequest(
            email="user@example.com",
            password=SecretStr("SecurePassword123!"),
            display_name="Test User",
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.verification_token == "plaintext_token"

        # Verify token was generated
        token_generator.generate_token.assert_called_once()

        # Verify token was hashed
        token_generator.hash_token.assert_called_once_with("plaintext_token")

        # Verify verification token was stored
        token_repo.create.assert_called_once()
        call_args = token_repo.create.call_args
        created_token = call_args[0][0]
        assert created_token.token_hash == "hashed_token_value"
        assert created_token.used_at is None

    @pytest.mark.asyncio
    async def test_register_user_email_not_verified_initially(self) -> None:
        """Test that newly registered user has email_verified=False."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_repo.exists_by_email.return_value = False
        user_repo.create.side_effect = lambda user: user  # Return the user that was passed in
        password_hasher.hash_password.return_value = "$2b$12$hashedpassword"
        token_generator.generate_token.return_value = "token"
        token_generator.hash_token.return_value = "hashed_token"

        use_case = RegisterUserUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        request = AuthRegisterPostRequest(
            email="user@example.com",
            password=SecretStr("SecurePassword123!"),
            display_name="Test User",
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.user is not None
        assert result.user.email_verified is False

        # Verify user created with email_verified=False
        call_args = user_repo.create.call_args
        created_user = call_args[0][0]
        assert created_user.email_verified is False

    @pytest.mark.asyncio
    async def test_register_with_invalid_email_bypassing_pydantic(self) -> None:
        """Test registration handles invalid email even if Pydantic validation is bypassed."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        use_case = RegisterUserUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        # Bypass Pydantic validation using model_construct
        request = AuthRegisterPostRequest.model_construct(
            email="invalid-email-format",  # Invalid email
            password=SecretStr("Password123!"),
            display_name="Test User",
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error is not None
        assert "email" in result.error.lower() or "invalid" in result.error.lower()
        assert result.user is None

    @pytest.mark.asyncio
    async def test_register_with_empty_password_bypassing_pydantic(self) -> None:
        """Test registration handles empty password even if Pydantic validation is bypassed."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        use_case = RegisterUserUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        # Bypass Pydantic validation using model_construct
        request = AuthRegisterPostRequest.model_construct(
            email="test@example.com",
            password=SecretStr("   "),  # Whitespace-only password
            display_name="Test User",
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error is not None
        assert "password" in result.error.lower()
        assert "empty" in result.error.lower()
        assert result.user is None

    @pytest.mark.asyncio
    async def test_register_with_short_password_bypassing_pydantic(self) -> None:
        """Test registration handles short password even if Pydantic validation is bypassed."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_repo.exists_by_email.return_value = False

        use_case = RegisterUserUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        # Bypass Pydantic validation using model_construct
        request = AuthRegisterPostRequest.model_construct(
            email="test@example.com",
            password=SecretStr("short"),  # Less than 8 characters
            display_name="Test User",
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error is not None
        assert "password" in result.error.lower()
        assert "8" in result.error or "characters" in result.error.lower()
        assert result.user is None

    @pytest.mark.asyncio
    async def test_register_with_long_display_name_bypassing_pydantic(self) -> None:
        """Test registration handles long display name even if Pydantic validation is bypassed."""
        # Arrange
        user_repo = AsyncMock()
        token_repo = AsyncMock()
        password_hasher = Mock()
        token_generator = Mock()

        user_repo.exists_by_email.return_value = False

        use_case = RegisterUserUseCase(
            user_repository=user_repo,
            token_repository=token_repo,
            password_hasher=password_hasher,
            token_generator=token_generator,
        )

        # Bypass Pydantic validation using model_construct
        request = AuthRegisterPostRequest.model_construct(
            email="test@example.com",
            password=SecretStr("Password123!"),
            display_name="a" * 101,  # Over 100 characters
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.success is False
        assert result.error is not None
        assert "display" in result.error.lower()
        assert "100" in result.error or "characters" in result.error.lower()
        assert result.user is None
