# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for User domain entity.

Tests user creation, validation, and business logic.
Following TDD: These tests are written FIRST and will initially FAIL.
"""

from datetime import UTC, datetime
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.user import (
    Email,
    HashedPassword,
    UserEntity,
    UserStatus,
)


class TestEmail:
    """Test Email value object."""

    def test_create_valid_email(self) -> None:
        """Test creating a valid email."""
        email = Email("user@example.com")
        assert str(email) == "user@example.com"
        assert email.value == "user@example.com"

    def test_email_validation_invalid_format(self) -> None:
        """Test email validation rejects invalid format."""
        with pytest.raises(ValueError, match="Invalid email format"):
            Email("not-an-email")

    def test_email_validation_missing_at(self) -> None:
        """Test email validation rejects missing @ symbol."""
        with pytest.raises(ValueError, match="Invalid email format"):
            Email("userexample.com")

    def test_email_validation_empty(self) -> None:
        """Test email validation rejects empty string."""
        with pytest.raises(ValueError, match="Email cannot be empty"):
            Email("")

    def test_email_validation_whitespace(self) -> None:
        """Test email validation rejects whitespace only."""
        with pytest.raises(ValueError, match="Email cannot be empty"):
            Email("   ")

    def test_email_normalization(self) -> None:
        """Test email is normalized to lowercase."""
        email = Email("USER@EXAMPLE.COM")
        assert email.value == "user@example.com"

    def test_email_equality(self) -> None:
        """Test email equality comparison."""
        email1 = Email("user@example.com")
        email2 = Email("user@example.com")
        email3 = Email("other@example.com")

        assert email1 == email2
        assert email1 != email3

    def test_email_equality_with_non_email(self) -> None:
        """Test email comparison with non-Email object returns False."""
        email = Email("user@example.com")
        assert email != "user@example.com"
        assert email != 123
        assert email is not None

    def test_email_hash(self) -> None:
        """Test email can be used in sets/dicts."""
        email1 = Email("user@example.com")
        email2 = Email("user@example.com")

        email_set = {email1, email2}
        assert len(email_set) == 1


class TestHashedPassword:
    """Test HashedPassword value object."""

    def test_create_hashed_password(self) -> None:
        """Test creating a hashed password."""
        hashed = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        assert hashed.value == "$2b$12$abcdefghijklmnopqrstuv"

    def test_hashed_password_validation_empty(self) -> None:
        """Test hashed password validation rejects empty string."""
        with pytest.raises(ValueError, match="Hashed password cannot be empty"):
            HashedPassword("")

    def test_hashed_password_validation_too_short(self) -> None:
        """Test hashed password validation rejects short strings."""
        with pytest.raises(ValueError, match="Hashed password must be at least 10 characters"):
            HashedPassword("short")

    def test_hashed_password_no_plaintext(self) -> None:
        """Test that plaintext passwords are rejected."""
        # This will be enforced by using only hashed values
        with pytest.raises(ValueError, match="Hashed password must be at least 10 characters"):
            HashedPassword("password")

    def test_hashed_password_repr_masked(self) -> None:
        """Test that repr masks the password hash."""
        hashed = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        assert "***" in repr(hashed)
        assert "$2b$12$" not in repr(hashed)

    def test_hashed_password_equality(self) -> None:
        """Test hashed password equality comparison."""
        hashed1 = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        hashed2 = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        hashed3 = HashedPassword("$2b$12$differenthashvalue123")

        assert hashed1 == hashed2
        assert hashed1 != hashed3

    def test_hashed_password_equality_with_non_hashed_password(self) -> None:
        """Test hashed password comparison with non-HashedPassword returns False."""
        hashed = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        assert hashed != "$2b$12$abcdefghijklmnopqrstuv"
        assert hashed != 123
        assert hashed is not None

    def test_hashed_password_hash(self) -> None:
        """Test hashed password can be used in sets/dicts."""
        hashed1 = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        hashed2 = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")

        password_set = {hashed1, hashed2}
        assert len(password_set) == 1


class TestUser:
    """Test User entity."""

    def test_create_user_with_valid_data(self) -> None:
        """Test creating a user with valid data."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        display_name = "Test User"
        created_at = datetime.now(UTC)

        user = UserEntity(
            id=user_id,
            email=email,
            hashed_password=hashed_password,
            display_name=display_name,
            email_verified=False,
            created_at=created_at,
            updated_at=created_at,
            last_login_at=None,
            status=UserStatus.ACTIVE,
            deleted_at=None,
        )

        assert user.id == user_id
        assert user.email == email
        assert user.hashed_password == hashed_password
        assert user.display_name == display_name
        assert user.email_verified is False
        assert user.created_at == created_at
        assert user.updated_at == created_at
        assert user.last_login_at is None
        assert user.status == UserStatus.ACTIVE
        assert user.deleted_at is None

    def test_create_user_display_name_validation_empty(self) -> None:
        """Test user creation rejects empty display name."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        created_at = datetime.now(UTC)

        with pytest.raises(ValueError, match="Display name cannot be empty"):
            UserEntity(
                id=user_id,
                email=email,
                hashed_password=hashed_password,
                display_name="",
                email_verified=False,
                created_at=created_at,
                updated_at=created_at,
                last_login_at=None,
                status=UserStatus.ACTIVE,
                deleted_at=None,
            )

    def test_create_user_display_name_validation_whitespace(self) -> None:
        """Test user creation rejects whitespace-only display name."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        created_at = datetime.now(UTC)

        with pytest.raises(ValueError, match="Display name cannot be empty"):
            UserEntity(
                id=user_id,
                email=email,
                hashed_password=hashed_password,
                display_name="   ",
                email_verified=False,
                created_at=created_at,
                updated_at=created_at,
                last_login_at=None,
                status=UserStatus.ACTIVE,
                deleted_at=None,
            )

    def test_create_user_display_name_validation_too_long(self) -> None:
        """Test user creation rejects display name over 100 characters."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        created_at = datetime.now(UTC)

        with pytest.raises(ValueError, match="Display name must be 100 characters or less"):
            UserEntity(
                id=user_id,
                email=email,
                hashed_password=hashed_password,
                display_name="a" * 101,
                email_verified=False,
                created_at=created_at,
                updated_at=created_at,
                last_login_at=None,
                status=UserStatus.ACTIVE,
                deleted_at=None,
            )

    def test_user_is_active(self) -> None:
        """Test is_active property."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        created_at = datetime.now(UTC)

        user = UserEntity(
            id=user_id,
            email=email,
            hashed_password=hashed_password,
            display_name="Test User",
            email_verified=False,
            created_at=created_at,
            updated_at=created_at,
            last_login_at=None,
            status=UserStatus.ACTIVE,
            deleted_at=None,
        )

        assert user.is_active is True

    def test_user_is_not_active_when_deleted(self) -> None:
        """Test is_active returns False when user is deleted."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        created_at = datetime.now(UTC)

        user = UserEntity(
            id=user_id,
            email=email,
            hashed_password=hashed_password,
            display_name="Test User",
            email_verified=False,
            created_at=created_at,
            updated_at=created_at,
            last_login_at=None,
            status=UserStatus.DELETED,
            deleted_at=datetime.now(UTC),
        )

        assert user.is_active is False

    def test_user_is_not_active_when_locked(self) -> None:
        """Test is_active returns False when user is locked."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        created_at = datetime.now(UTC)

        user = UserEntity(
            id=user_id,
            email=email,
            hashed_password=hashed_password,
            display_name="Test User",
            email_verified=False,
            created_at=created_at,
            updated_at=created_at,
            last_login_at=None,
            status=UserStatus.LOCKED,
            deleted_at=None,
        )

        assert user.is_active is False

    def test_soft_delete(self) -> None:
        """Test soft delete marks user as deleted."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        created_at = datetime.now(UTC)

        user = UserEntity(
            id=user_id,
            email=email,
            hashed_password=hashed_password,
            display_name="Test User",
            email_verified=False,
            created_at=created_at,
            updated_at=created_at,
            last_login_at=None,
            status=UserStatus.ACTIVE,
            deleted_at=None,
        )

        user.soft_delete()

        assert user.status == UserStatus.DELETED
        assert user.deleted_at is not None
        assert user.is_active is False

    def test_soft_delete_already_deleted(self) -> None:
        """Test soft delete on already deleted user raises error."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        created_at = datetime.now(UTC)

        user = UserEntity(
            id=user_id,
            email=email,
            hashed_password=hashed_password,
            display_name="Test User",
            email_verified=False,
            created_at=created_at,
            updated_at=created_at,
            last_login_at=None,
            status=UserStatus.DELETED,
            deleted_at=datetime.now(UTC),
        )

        with pytest.raises(ValueError, match="User is already deleted"):
            user.soft_delete()

    def test_verify_email(self) -> None:
        """Test email verification."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        created_at = datetime.now(UTC)

        user = UserEntity(
            id=user_id,
            email=email,
            hashed_password=hashed_password,
            display_name="Test User",
            email_verified=False,
            created_at=created_at,
            updated_at=created_at,
            last_login_at=None,
            status=UserStatus.ACTIVE,
            deleted_at=None,
        )

        user.verify_email()

        assert user.email_verified is True

    def test_verify_email_already_verified(self) -> None:
        """Test verifying already verified email raises error."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        created_at = datetime.now(UTC)

        user = UserEntity(
            id=user_id,
            email=email,
            hashed_password=hashed_password,
            display_name="Test User",
            email_verified=True,
            created_at=created_at,
            updated_at=created_at,
            last_login_at=None,
            status=UserStatus.ACTIVE,
            deleted_at=None,
        )

        with pytest.raises(ValueError, match="Email is already verified"):
            user.verify_email()

    def test_update_last_login(self) -> None:
        """Test updating last login timestamp."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        created_at = datetime.now(UTC)

        user = UserEntity(
            id=user_id,
            email=email,
            hashed_password=hashed_password,
            display_name="Test User",
            email_verified=False,
            created_at=created_at,
            updated_at=created_at,
            last_login_at=None,
            status=UserStatus.ACTIVE,
            deleted_at=None,
        )

        assert user.last_login_at is None

        user.update_last_login()

        assert user.last_login_at is not None
        assert isinstance(user.last_login_at, datetime)

    def test_lock_account(self) -> None:
        """Test locking user account."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        created_at = datetime.now(UTC)

        user = UserEntity(
            id=user_id,
            email=email,
            hashed_password=hashed_password,
            display_name="Test User",
            email_verified=False,
            created_at=created_at,
            updated_at=created_at,
            last_login_at=None,
            status=UserStatus.ACTIVE,
            deleted_at=None,
        )

        user.lock_account()

        assert user.status == UserStatus.LOCKED
        assert user.is_active is False

    def test_unlock_account(self) -> None:
        """Test unlocking user account."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        created_at = datetime.now(UTC)

        user = UserEntity(
            id=user_id,
            email=email,
            hashed_password=hashed_password,
            display_name="Test User",
            email_verified=False,
            created_at=created_at,
            updated_at=created_at,
            last_login_at=None,
            status=UserStatus.LOCKED,
            deleted_at=None,
        )

        user.unlock_account()

        assert user.status == UserStatus.ACTIVE
        assert user.is_active is True

    def test_user_repr(self) -> None:
        """Test user string representation."""
        user_id = uuid4()
        email = Email("user@example.com")
        hashed_password = HashedPassword("$2b$12$abcdefghijklmnopqrstuv")
        created_at = datetime.now(UTC)

        user = UserEntity(
            id=user_id,
            email=email,
            hashed_password=hashed_password,
            display_name="Test User",
            email_verified=False,
            created_at=created_at,
            updated_at=created_at,
            last_login_at=None,
            status=UserStatus.ACTIVE,
            deleted_at=None,
        )

        repr_str = repr(user)

        assert "User" in repr_str
        assert str(user_id) in repr_str
        assert "user@example.com" in repr_str
        # Password should NOT be in repr
        assert "$2b$12$" not in repr_str
