# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for EmailVerificationToken domain entity.

Tests token creation, validation, expiration, and usage tracking.
Following TDD: These tests are written FIRST and will initially FAIL.
"""

from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.email_verification_token import (
    EmailVerificationToken,
)


class TestEmailVerificationToken:
    """Test EmailVerificationToken entity."""

    def test_create_token_with_valid_data(self) -> None:
        """Test creating an email verification token with valid data."""
        token_id = uuid4()
        user_id = uuid4()
        token_hash = "hashed_verification_token_value"
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(hours=24)

        token = EmailVerificationToken(
            id=token_id,
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            used_at=None,
            created_at=created_at,
        )

        assert token.id == token_id
        assert token.user_id == user_id
        assert token.token_hash == token_hash
        assert token.expires_at == expires_at
        assert token.used_at is None
        assert token.created_at == created_at

    def test_token_validation_empty_token_hash(self) -> None:
        """Test token creation rejects empty token hash."""
        token_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(hours=24)

        with pytest.raises(ValueError, match="Token hash cannot be empty"):
            EmailVerificationToken(
                id=token_id,
                user_id=user_id,
                token_hash="",
                expires_at=expires_at,
                used_at=None,
                created_at=created_at,
            )

    def test_token_validation_whitespace_token_hash(self) -> None:
        """Test token creation rejects whitespace-only token hash."""
        token_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(hours=24)

        with pytest.raises(ValueError, match="Token hash cannot be empty"):
            EmailVerificationToken(
                id=token_id,
                user_id=user_id,
                token_hash="   ",
                expires_at=expires_at,
                used_at=None,
                created_at=created_at,
            )

    def test_token_validation_expires_at_in_past(self) -> None:
        """Test token creation rejects expiration before creation time."""
        token_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at - timedelta(hours=1)  # Before creation

        with pytest.raises(ValueError, match="Expiration must be after creation"):
            EmailVerificationToken(
                id=token_id,
                user_id=user_id,
                token_hash="hashed_token",
                expires_at=expires_at,
                used_at=None,
                created_at=created_at,
            )

    def test_token_validation_expires_at_before_created_at(self) -> None:
        """Test token creation rejects expires_at before created_at."""
        token_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at - timedelta(minutes=1)

        with pytest.raises(ValueError, match="Expiration must be after creation"):
            EmailVerificationToken(
                id=token_id,
                user_id=user_id,
                token_hash="hashed_token",
                expires_at=expires_at,
                used_at=None,
                created_at=created_at,
            )

    def test_is_expired_returns_false_for_valid_token(self) -> None:
        """Test is_expired returns False for valid token."""
        token_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(hours=24)

        token = EmailVerificationToken(
            id=token_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=expires_at,
            used_at=None,
            created_at=created_at,
        )

        assert token.is_expired() is False

    def test_is_expired_returns_true_for_expired_token(self) -> None:
        """Test is_expired returns True for expired token."""
        token_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC) - timedelta(hours=25)
        expires_at = created_at + timedelta(hours=24)  # Expired 1 hour ago

        token = EmailVerificationToken(
            id=token_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=expires_at,
            used_at=None,
            created_at=created_at,
        )

        assert token.is_expired() is True

    def test_is_valid_returns_true_for_unused_unexpired_token(self) -> None:
        """Test is_valid returns True for unused, unexpired token."""
        token_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(hours=24)

        token = EmailVerificationToken(
            id=token_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=expires_at,
            used_at=None,
            created_at=created_at,
        )

        assert token.is_valid() is True

    def test_is_valid_returns_false_for_expired_token(self) -> None:
        """Test is_valid returns False for expired token."""
        token_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC) - timedelta(hours=25)
        expires_at = created_at + timedelta(hours=24)

        token = EmailVerificationToken(
            id=token_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=expires_at,
            used_at=None,
            created_at=created_at,
        )

        assert token.is_valid() is False

    def test_is_valid_returns_false_for_used_token(self) -> None:
        """Test is_valid returns False for already-used token."""
        token_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(hours=24)
        used_at = datetime.now(UTC)

        token = EmailVerificationToken(
            id=token_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=expires_at,
            used_at=used_at,
            created_at=created_at,
        )

        assert token.is_valid() is False

    def test_mark_as_used(self) -> None:
        """Test marking token as used."""
        token_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(hours=24)

        token = EmailVerificationToken(
            id=token_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=expires_at,
            used_at=None,
            created_at=created_at,
        )

        assert token.used_at is None
        assert token.is_valid() is True

        token.mark_as_used()

        assert token.used_at is not None
        assert isinstance(token.used_at, datetime)
        assert token.is_valid() is False

    def test_mark_as_used_already_used_raises_error(self) -> None:
        """Test marking already-used token raises error."""
        token_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(hours=24)
        used_at = datetime.now(UTC)

        token = EmailVerificationToken(
            id=token_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=expires_at,
            used_at=used_at,
            created_at=created_at,
        )

        with pytest.raises(ValueError, match="Token has already been used"):
            token.mark_as_used()

    def test_mark_as_used_expired_token_raises_error(self) -> None:
        """Test marking expired token as used raises error."""
        token_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC) - timedelta(hours=25)
        expires_at = created_at + timedelta(hours=24)

        token = EmailVerificationToken(
            id=token_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=expires_at,
            used_at=None,
            created_at=created_at,
        )

        with pytest.raises(ValueError, match="Cannot use expired token"):
            token.mark_as_used()

    def test_token_repr(self) -> None:
        """Test token string representation."""
        token_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(hours=24)

        token = EmailVerificationToken(
            id=token_id,
            user_id=user_id,
            token_hash="hashed_token_value",
            expires_at=expires_at,
            used_at=None,
            created_at=created_at,
        )

        repr_str = repr(token)

        assert "EmailVerificationToken" in repr_str
        assert str(token_id) in repr_str
        assert str(user_id) in repr_str
        # Token hash should NOT be in repr for security
        assert "hashed_token_value" not in repr_str
