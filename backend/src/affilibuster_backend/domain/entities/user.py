# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
User domain entity.

This module contains the User aggregate root and related value objects.
Following Clean Architecture: no framework dependencies, pure business logic.
"""

import re
from dataclasses import dataclass
from datetime import UTC, datetime
from enum import StrEnum
from uuid import UUID

# Validation constants
MIN_HASHED_PASSWORD_LENGTH = 10
MAX_DISPLAY_NAME_LENGTH = 100


class UserStatus(StrEnum):
    """User account status."""

    ACTIVE = "active"
    LOCKED = "locked"
    DELETED = "deleted"


@dataclass(frozen=True)
class Email:
    """Email value object with validation.

    This is a domain value object (NOT part of OpenAPI contract).
    It encapsulates business logic for email validation and normalization.

    Why not in OpenAPI:
    - Contains business rules (validation, normalization to lowercase)
    - Immutable value object pattern (frozen dataclass)
    - Used internally by domain entities (UserEntity)
    - API layer uses plain strings, this adds domain-level validation

    Ensures email addresses are valid and normalized.
    Immutable to prevent accidental modification.
    """

    value: str

    def __post_init__(self) -> None:
        """Validate email format."""
        if not self.value or not self.value.strip():
            raise ValueError("Email cannot be empty")

        # Normalize to lowercase
        normalized = self.value.lower().strip()
        object.__setattr__(self, "value", normalized)

        # Simple email validation regex
        email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_regex, self.value):
            raise ValueError(f"Invalid email format: {self.value}")

    def __str__(self) -> str:
        """Return string representation of email."""
        return self.value

    def __eq__(self, other: object) -> bool:
        """Compare emails for equality."""
        if not isinstance(other, Email):
            return False
        return self.value == other.value

    def __hash__(self) -> int:
        """Make email hashable for use in sets/dicts."""
        return hash(self.value)


@dataclass(frozen=True)
class HashedPassword:
    """Hashed password value object.

    This is a domain value object (NOT part of OpenAPI contract).
    It represents hashed passwords with validation logic.

    Why not in OpenAPI:
    - Never exposed via API (sensitive security data)
    - Contains validation for hashed password format
    - Immutable value object pattern (frozen dataclass)
    - Used only internally by domain entities (UserEntity)
    - API uses SecretStr for plaintext passwords, this is for storage

    Represents a securely hashed password (never plaintext).
    Immutable to prevent accidental modification.
    """

    value: str

    def __post_init__(self) -> None:
        """Validate hashed password."""
        if not self.value or not self.value.strip():
            raise ValueError("Hashed password cannot be empty")

        if len(self.value) < MIN_HASHED_PASSWORD_LENGTH:
            raise ValueError(f"Hashed password must be at least {MIN_HASHED_PASSWORD_LENGTH} characters")

    def __repr__(self) -> str:
        """Return masked representation for security."""
        return "HashedPassword(***)"

    def __eq__(self, other: object) -> bool:
        """Compare hashed passwords for equality."""
        if not isinstance(other, HashedPassword):
            return False
        return self.value == other.value

    def __hash__(self) -> int:
        """Make hashed password hashable."""
        return hash(self.value)


@dataclass
class UserEntity:
    """
    User aggregate root (domain entity).

    This is a DOMAIN ENTITY (NOT part of OpenAPI contract).
    Used for business logic, repositories, and use cases.

    Why not in OpenAPI:
    - Contains sensitive fields never exposed via API (hashed_password, deleted_at)
    - Uses domain value objects (Email, HashedPassword) not in API
    - Provides business methods (soft_delete, verify_email, lock_account, etc.)
    - Represents full internal state, not just API representation
    - Clean Architecture: domain entities are framework-independent

    The OpenAPI-generated User model (from .generated.models) is used for API responses.
    Route handlers transform UserEntity → API User model before returning.

    Represents an authenticated user account in the system.
    Contains business logic for user operations.
    """

    id: UUID
    email: Email
    hashed_password: HashedPassword
    display_name: str
    email_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: datetime | None
    status: UserStatus
    deleted_at: datetime | None

    def __post_init__(self) -> None:
        """Validate user data."""
        if not self.display_name or not self.display_name.strip():
            raise ValueError("Display name cannot be empty")

        if len(self.display_name) > MAX_DISPLAY_NAME_LENGTH:
            raise ValueError(f"Display name must be {MAX_DISPLAY_NAME_LENGTH} characters or less")

    @property
    def is_active(self) -> bool:
        """Check if user account is active.

        Returns:
            True if user is active, False otherwise
        """
        return self.status == UserStatus.ACTIVE

    def soft_delete(self) -> None:
        """Mark user as deleted (soft delete).

        Raises:
            ValueError: If user is already deleted
        """
        if self.status == UserStatus.DELETED:
            raise ValueError("User is already deleted")

        self.status = UserStatus.DELETED
        self.deleted_at = datetime.now(UTC)
        self.updated_at = datetime.now(UTC)

    def verify_email(self) -> None:
        """Mark user email as verified.

        Raises:
            ValueError: If email is already verified
        """
        if self.email_verified:
            raise ValueError("Email is already verified")

        self.email_verified = True
        self.updated_at = datetime.now(UTC)

    def update_last_login(self) -> None:
        """Update the last login timestamp to now."""
        self.last_login_at = datetime.now(UTC)
        self.updated_at = datetime.now(UTC)

    def lock_account(self) -> None:
        """Lock the user account."""
        self.status = UserStatus.LOCKED
        self.updated_at = datetime.now(UTC)

    def unlock_account(self) -> None:
        """Unlock the user account."""
        self.status = UserStatus.ACTIVE
        self.updated_at = datetime.now(UTC)

    def __repr__(self) -> str:
        """Return string representation of user (password masked)."""
        return (
            f"UserEntity(id={self.id}, "
            f"email={self.email.value}, "
            f"display_name='{self.display_name}', "
            f"status={self.status.value})"
        )
