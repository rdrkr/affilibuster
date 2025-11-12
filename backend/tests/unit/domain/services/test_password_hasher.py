# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for PasswordHasher domain service.

Tests password hashing and verification using bcrypt.
Following TDD: These tests are written FIRST and will initially FAIL.
"""

import pytest

from affilibuster_backend.domain.services.password_hasher import PasswordHasher


class TestPasswordHasher:
    """Test PasswordHasher service."""

    def test_hash_password_returns_hashed_string(self) -> None:
        """Test hash_password returns a bcrypt hashed string."""
        hasher = PasswordHasher()
        plaintext = "SecurePassword123!"

        hashed = hasher.hash_password(plaintext)

        # Bcrypt hashes start with $2b$ and are 60 characters
        assert hashed.startswith("$2b$")
        assert len(hashed) == 60
        # Hash should not be the same as plaintext
        assert hashed != plaintext

    def test_hash_password_same_input_different_hash(self) -> None:
        """Test hash_password produces different hashes for same input (salt)."""
        hasher = PasswordHasher()
        plaintext = "SecurePassword123!"

        hash1 = hasher.hash_password(plaintext)
        hash2 = hasher.hash_password(plaintext)

        # Same password should produce different hashes due to salt
        assert hash1 != hash2
        # But both should be valid bcrypt hashes
        assert hash1.startswith("$2b$")
        assert hash2.startswith("$2b$")

    def test_hash_password_empty_string_raises_error(self) -> None:
        """Test hash_password raises error for empty password."""
        hasher = PasswordHasher()

        with pytest.raises(ValueError, match="Password cannot be empty"):
            hasher.hash_password("")

    def test_hash_password_whitespace_only_raises_error(self) -> None:
        """Test hash_password raises error for whitespace-only password."""
        hasher = PasswordHasher()

        with pytest.raises(ValueError, match="Password cannot be empty"):
            hasher.hash_password("   ")

    def test_verify_password_correct_password_returns_true(self) -> None:
        """Test verify_password returns True for correct password."""
        hasher = PasswordHasher()
        plaintext = "SecurePassword123!"
        hashed = hasher.hash_password(plaintext)

        result = hasher.verify_password(plaintext, hashed)

        assert result is True

    def test_verify_password_incorrect_password_returns_false(self) -> None:
        """Test verify_password returns False for incorrect password."""
        hasher = PasswordHasher()
        plaintext = "SecurePassword123!"
        hashed = hasher.hash_password(plaintext)
        wrong_password = "WrongPassword456!"

        result = hasher.verify_password(wrong_password, hashed)

        assert result is False

    def test_verify_password_case_sensitive(self) -> None:
        """Test verify_password is case-sensitive."""
        hasher = PasswordHasher()
        plaintext = "SecurePassword123!"
        hashed = hasher.hash_password(plaintext)
        wrong_case = "securepassword123!"

        result = hasher.verify_password(wrong_case, hashed)

        assert result is False

    def test_verify_password_empty_plaintext_raises_error(self) -> None:
        """Test verify_password raises error for empty plaintext."""
        hasher = PasswordHasher()
        hashed = hasher.hash_password("ValidPassword123!")

        with pytest.raises(ValueError, match="Password cannot be empty"):
            hasher.verify_password("", hashed)

    def test_verify_password_empty_hashed_raises_error(self) -> None:
        """Test verify_password raises error for empty hashed password."""
        hasher = PasswordHasher()

        with pytest.raises(ValueError, match="Hashed password cannot be empty"):
            hasher.verify_password("ValidPassword123!", "")

    def test_verify_password_invalid_hash_format_returns_false(self) -> None:
        """Test verify_password returns False for invalid hash format."""
        hasher = PasswordHasher()
        plaintext = "SecurePassword123!"
        invalid_hash = "not-a-valid-bcrypt-hash"

        result = hasher.verify_password(plaintext, invalid_hash)

        assert result is False

    def test_hash_password_unicode_characters(self) -> None:
        """Test hash_password handles unicode characters."""
        hasher = PasswordHasher()
        plaintext = "Pässwörd123!🔒"

        hashed = hasher.hash_password(plaintext)

        assert hashed.startswith("$2b$")
        assert hasher.verify_password(plaintext, hashed) is True

    def test_hash_password_very_long_password(self) -> None:
        """Test hash_password handles very long passwords."""
        hasher = PasswordHasher()
        # Bcrypt has 72 byte limit, test with longer password
        plaintext = "a" * 100

        hashed = hasher.hash_password(plaintext)

        assert hashed.startswith("$2b$")
        # Note: bcrypt only uses first 72 bytes
        assert hasher.verify_password(plaintext, hashed) is True

    def test_hash_password_special_characters(self) -> None:
        """Test hash_password handles special characters."""
        hasher = PasswordHasher()
        plaintext = "P@ssw0rd!#$%^&*()_+-=[]{}|;:',.<>?/~`"

        hashed = hasher.hash_password(plaintext)

        assert hashed.startswith("$2b$")
        assert hasher.verify_password(plaintext, hashed) is True
