# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
UserSession domain entity.

Represents an authenticated user session with token-based authentication.
Sessions can expire and be extended based on remember_me preferences.
"""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import UUID


@dataclass
class UserSession:
    """
    User session entity for authentication tracking.

    This is a DOMAIN ENTITY (NOT part of OpenAPI contract).
    Used for business logic and repository operations.

    Why not in OpenAPI:
    - Internal implementation detail of session management
    - Contains sensitive security data (token_hash) never exposed via API
    - Provides business methods (is_expired, extend_expiration)
    - API only receives/returns plaintext tokens in cookies, this manages hashed storage
    - Clean Architecture: domain entities are framework-independent

    Manages session lifecycle including creation, validation, expiration,
    and extension. Tokens are stored as hashes for security.

    Attributes:
        id: Unique session identifier.
        user_id: ID of the user this session belongs to.
        token_hash: Hashed authentication token (never stored in plaintext).
        expires_at: When this session expires.
        remember_me: Whether this is a long-lived "remember me" session.
        created_at: When this session was created.

    Raises:
        ValueError: If validation fails during creation.
    """

    id: UUID
    user_id: UUID
    token_hash: str
    expires_at: datetime
    remember_me: bool
    created_at: datetime

    def __post_init__(self) -> None:
        """
        Validate session data after initialization.

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
        Check if this session has expired.

        Returns:
            True if the session has expired, False otherwise.
        """
        return datetime.now(UTC) >= self.expires_at

    def extend_expiration(self, days: int) -> None:
        """
        Extend the session expiration by the specified number of days.

        Args:
            days: Number of days to extend the expiration by.

        Raises:
            ValueError: If days is not positive.
        """
        if days <= 0:
            raise ValueError("Extension must be positive")

        self.expires_at = self.expires_at + timedelta(days=days)

    def __repr__(self) -> str:
        """
        Return string representation with sensitive data masked.

        Returns:
            String representation of the session without exposing token_hash.
        """
        return (
            f"UserSession(id={self.id}, user_id={self.user_id}, "
            f"expires_at={self.expires_at}, remember_me={self.remember_me}, "
            f"created_at={self.created_at})"
        )
