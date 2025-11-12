# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for UserSession domain entity.

Tests session creation, validation, and expiration logic.
Following TDD: These tests are written FIRST and will initially FAIL.
"""

from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest

from affilibuster_backend.domain.entities.user_session import UserSession


class TestUserSession:
    """Test UserSession entity."""

    def test_create_session_with_valid_data(self) -> None:
        """Test creating a session with valid data."""
        session_id = uuid4()
        user_id = uuid4()
        token_hash = "hashed_token_value"
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(days=7)

        session = UserSession(
            id=session_id,
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            remember_me=False,
            created_at=created_at,
        )

        assert session.id == session_id
        assert session.user_id == user_id
        assert session.token_hash == token_hash
        assert session.expires_at == expires_at
        assert session.remember_me is False
        assert session.created_at == created_at

    def test_create_session_with_remember_me(self) -> None:
        """Test creating a session with remember_me flag."""
        session_id = uuid4()
        user_id = uuid4()
        token_hash = "hashed_token_value"
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(days=30)

        session = UserSession(
            id=session_id,
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            remember_me=True,
            created_at=created_at,
        )

        assert session.remember_me is True

    def test_session_validation_empty_token_hash(self) -> None:
        """Test session creation rejects empty token hash."""
        session_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(days=7)

        with pytest.raises(ValueError, match="Token hash cannot be empty"):
            UserSession(
                id=session_id,
                user_id=user_id,
                token_hash="",
                expires_at=expires_at,
                remember_me=False,
                created_at=created_at,
            )

    def test_session_validation_whitespace_token_hash(self) -> None:
        """Test session creation rejects whitespace-only token hash."""
        session_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(days=7)

        with pytest.raises(ValueError, match="Token hash cannot be empty"):
            UserSession(
                id=session_id,
                user_id=user_id,
                token_hash="   ",
                expires_at=expires_at,
                remember_me=False,
                created_at=created_at,
            )

    def test_session_validation_expires_at_in_past(self) -> None:
        """Test session creation rejects expiration before creation time."""
        session_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at - timedelta(days=1)  # Before creation

        with pytest.raises(ValueError, match="Expiration must be after creation"):
            UserSession(
                id=session_id,
                user_id=user_id,
                token_hash="hashed_token",
                expires_at=expires_at,
                remember_me=False,
                created_at=created_at,
            )

    def test_session_validation_expires_at_before_created_at(self) -> None:
        """Test session creation rejects expires_at before created_at."""
        session_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at - timedelta(minutes=1)

        with pytest.raises(ValueError, match="Expiration must be after creation"):
            UserSession(
                id=session_id,
                user_id=user_id,
                token_hash="hashed_token",
                expires_at=expires_at,
                remember_me=False,
                created_at=created_at,
            )

    def test_is_expired_returns_false_for_valid_session(self) -> None:
        """Test is_expired returns False for valid session."""
        session_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(days=7)

        session = UserSession(
            id=session_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=expires_at,
            remember_me=False,
            created_at=created_at,
        )

        assert session.is_expired() is False

    def test_is_expired_returns_true_for_expired_session(self) -> None:
        """Test is_expired returns True for expired session."""
        session_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC) - timedelta(days=8)
        expires_at = created_at + timedelta(days=7)  # Expired 1 day ago

        session = UserSession(
            id=session_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=expires_at,
            remember_me=False,
            created_at=created_at,
        )

        assert session.is_expired() is True

    def test_extend_expiration(self) -> None:
        """Test extending session expiration."""
        session_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        original_expires_at = created_at + timedelta(days=7)

        session = UserSession(
            id=session_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=original_expires_at,
            remember_me=False,
            created_at=created_at,
        )

        extension_days = 7
        session.extend_expiration(days=extension_days)

        # Should be extended by 7 days from original expiration
        expected_expires_at = original_expires_at + timedelta(days=extension_days)
        assert abs((session.expires_at - expected_expires_at).total_seconds()) < 1

    def test_extend_expiration_negative_days_raises_error(self) -> None:
        """Test extending expiration with negative days raises error."""
        session_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(days=7)

        session = UserSession(
            id=session_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=expires_at,
            remember_me=False,
            created_at=created_at,
        )

        with pytest.raises(ValueError, match="Extension must be positive"):
            session.extend_expiration(days=-1)

    def test_extend_expiration_zero_days_raises_error(self) -> None:
        """Test extending expiration with zero days raises error."""
        session_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(days=7)

        session = UserSession(
            id=session_id,
            user_id=user_id,
            token_hash="hashed_token",
            expires_at=expires_at,
            remember_me=False,
            created_at=created_at,
        )

        with pytest.raises(ValueError, match="Extension must be positive"):
            session.extend_expiration(days=0)

    def test_session_repr(self) -> None:
        """Test session string representation."""
        session_id = uuid4()
        user_id = uuid4()
        created_at = datetime.now(UTC)
        expires_at = created_at + timedelta(days=7)

        session = UserSession(
            id=session_id,
            user_id=user_id,
            token_hash="hashed_token_value",
            expires_at=expires_at,
            remember_me=False,
            created_at=created_at,
        )

        repr_str = repr(session)

        assert "UserSession" in repr_str
        assert str(session_id) in repr_str
        assert str(user_id) in repr_str
        # Token hash should NOT be in repr for security
        assert "hashed_token_value" not in repr_str
