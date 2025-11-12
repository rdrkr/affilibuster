# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
EmailVerificationToken domain entity.

Represents a one-time token for email verification during registration.
Tokens expire after a period (typically 24 hours) and can only be used once.
"""

from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import UUID


@dataclass
class EmailVerificationToken:
    """
    Email verification token entity for secure email confirmation.

    This is a DOMAIN ENTITY (NOT part of OpenAPI contract).
    Used for business logic and repository operations.

    Why not in OpenAPI:
    - Internal implementation detail of email verification flow
    - Contains sensitive security data (token_hash) never exposed via API
    - Provides business methods (is_expired, is_valid, mark_as_used)
    - API only receives/returns plaintext tokens, this manages hashed storage
    - Clean Architecture: domain entities are framework-independent

    Manages the lifecycle of email verification tokens including creation,
    validation, expiration, and single-use enforcement.

    Attributes:
        id: Unique token identifier.
        user_id: ID of the user this token belongs to.
        token_hash: Hashed verification token (never stored in plaintext).
        expires_at: When this token expires (typically 24 hours).
        used_at: When this token was used (None if unused).
        created_at: When this token was created.

    Raises:
        ValueError: If validation fails during creation or usage.
    """

    id: UUID
    user_id: UUID
    token_hash: str
    expires_at: datetime
    used_at: datetime | None
    created_at: datetime

    def __post_init__(self) -> None:
        """
        Validate token data after initialization.

        Raises:
            ValueError: If token_hash is empty or expires_at is before created_at.
        """
        # Validate token hash
        if not self.token_hash or not self.token_hash.strip():
            raise ValueError("Token hash cannot be empty")

        # Validate expiration is after creation
        if self.expires_at <= self.created_at:
            raise ValueError("Expiration must be after creation")

    def is_expired(self) -> bool:
        """
        Check if this token has expired.

        Returns:
            True if the token has expired, False otherwise.
        """
        return datetime.now(UTC) >= self.expires_at

    def is_valid(self) -> bool:
        """
        Check if this token is valid (not expired and not used).

        Returns:
            True if the token is valid, False otherwise.
        """
        return not self.is_expired() and self.used_at is None

    def mark_as_used(self) -> None:
        """
        Mark this token as used.

        This prevents the token from being used again and records
        when it was consumed.

        Raises:
            ValueError: If token is already used or expired.
        """
        if self.used_at is not None:
            raise ValueError("Token has already been used")

        if self.is_expired():
            raise ValueError("Cannot use expired token")

        self.used_at = datetime.now(UTC)

    def __repr__(self) -> str:
        """
        Return string representation with sensitive data masked.

        Returns:
            String representation of the token without exposing token_hash.
        """
        return (
            f"EmailVerificationToken(id={self.id}, user_id={self.user_id}, "
            f"expires_at={self.expires_at}, used_at={self.used_at}, "
            f"created_at={self.created_at})"
        )
