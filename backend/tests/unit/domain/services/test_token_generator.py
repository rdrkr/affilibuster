# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for TokenGenerator domain service.

Tests cryptographically secure token generation for sessions and verification.
Following TDD: These tests are written FIRST and will initially FAIL.
"""

import pytest

from affilibuster_backend.domain.services.token_generator import TokenGenerator


class TestTokenGenerator:
    """Test TokenGenerator service."""

    def test_generate_token_returns_string(self) -> None:
        """Test generate_token returns a string."""
        generator = TokenGenerator()

        token = generator.generate_token()

        assert isinstance(token, str)
        assert len(token) > 0

    def test_generate_token_default_length(self) -> None:
        """Test generate_token returns 32 bytes (64 hex chars) by default."""
        generator = TokenGenerator()

        token = generator.generate_token()

        # Default 32 bytes = 64 hex characters
        assert len(token) == 64

    def test_generate_token_custom_length(self) -> None:
        """Test generate_token respects custom byte length."""
        generator = TokenGenerator()

        token_16 = generator.generate_token(nbytes=16)
        token_64 = generator.generate_token(nbytes=64)

        # 16 bytes = 32 hex chars, 64 bytes = 128 hex chars
        assert len(token_16) == 32
        assert len(token_64) == 128

    def test_generate_token_unique_values(self) -> None:
        """Test generate_token produces unique tokens."""
        generator = TokenGenerator()

        token1 = generator.generate_token()
        token2 = generator.generate_token()
        token3 = generator.generate_token()

        # All tokens should be unique
        assert token1 != token2
        assert token2 != token3
        assert token1 != token3

    def test_generate_token_hex_characters_only(self) -> None:
        """Test generate_token returns only hex characters (0-9, a-f)."""
        generator = TokenGenerator()

        token = generator.generate_token()

        # Should only contain hex characters
        assert all(c in "0123456789abcdef" for c in token)

    def test_generate_token_zero_bytes_raises_error(self) -> None:
        """Test generate_token raises error for zero bytes."""
        generator = TokenGenerator()

        with pytest.raises(ValueError, match="Token length must be positive"):
            generator.generate_token(nbytes=0)

    def test_generate_token_negative_bytes_raises_error(self) -> None:
        """Test generate_token raises error for negative bytes."""
        generator = TokenGenerator()

        with pytest.raises(ValueError, match="Token length must be positive"):
            generator.generate_token(nbytes=-1)

    def test_generate_token_very_long_token(self) -> None:
        """Test generate_token handles very long tokens."""
        generator = TokenGenerator()

        token = generator.generate_token(nbytes=256)

        assert len(token) == 512  # 256 bytes = 512 hex chars
        assert all(c in "0123456789abcdef" for c in token)

    def test_hash_token_returns_hashed_string(self) -> None:
        """Test hash_token returns a SHA-256 hash."""
        generator = TokenGenerator()
        token = generator.generate_token()

        hashed = generator.hash_token(token)

        # SHA-256 produces 64 hex characters
        assert len(hashed) == 64
        assert all(c in "0123456789abcdef" for c in hashed)
        # Hash should not be the same as token (unless by extreme chance)
        assert hashed != token

    def test_hash_token_same_input_same_hash(self) -> None:
        """Test hash_token produces same hash for same input (deterministic)."""
        generator = TokenGenerator()
        token = "test_token_123"

        hash1 = generator.hash_token(token)
        hash2 = generator.hash_token(token)

        # Same input should always produce same hash
        assert hash1 == hash2

    def test_hash_token_different_input_different_hash(self) -> None:
        """Test hash_token produces different hashes for different inputs."""
        generator = TokenGenerator()

        hash1 = generator.hash_token("token1")
        hash2 = generator.hash_token("token2")

        assert hash1 != hash2

    def test_hash_token_empty_string_raises_error(self) -> None:
        """Test hash_token raises error for empty token."""
        generator = TokenGenerator()

        with pytest.raises(ValueError, match="Token cannot be empty"):
            generator.hash_token("")

    def test_hash_token_whitespace_only_raises_error(self) -> None:
        """Test hash_token raises error for whitespace-only token."""
        generator = TokenGenerator()

        with pytest.raises(ValueError, match="Token cannot be empty"):
            generator.hash_token("   ")

    def test_hash_token_unicode_characters(self) -> None:
        """Test hash_token handles unicode characters."""
        generator = TokenGenerator()
        token = "tökën_🔒_123"

        hashed = generator.hash_token(token)

        assert len(hashed) == 64
        assert all(c in "0123456789abcdef" for c in hashed)

    def test_verify_token_correct_token_returns_true(self) -> None:
        """Test verify_token returns True for correct token."""
        generator = TokenGenerator()
        token = generator.generate_token()
        hashed = generator.hash_token(token)

        result = generator.verify_token(token, hashed)

        assert result is True

    def test_verify_token_incorrect_token_returns_false(self) -> None:
        """Test verify_token returns False for incorrect token."""
        generator = TokenGenerator()
        token = generator.generate_token()
        hashed = generator.hash_token(token)
        wrong_token = generator.generate_token()

        result = generator.verify_token(wrong_token, hashed)

        assert result is False

    def test_verify_token_case_sensitive(self) -> None:
        """Test verify_token is case-sensitive."""
        generator = TokenGenerator()
        token = "abc123"
        hashed = generator.hash_token(token)
        wrong_case = "ABC123"

        result = generator.verify_token(wrong_case, hashed)

        assert result is False

    def test_verify_token_empty_plaintext_raises_error(self) -> None:
        """Test verify_token raises error for empty plaintext token."""
        generator = TokenGenerator()
        hashed = generator.hash_token("valid_token")

        with pytest.raises(ValueError, match="Token cannot be empty"):
            generator.verify_token("", hashed)

    def test_verify_token_empty_hashed_raises_error(self) -> None:
        """Test verify_token raises error for empty hashed token."""
        generator = TokenGenerator()

        with pytest.raises(ValueError, match="Hashed token cannot be empty"):
            generator.verify_token("valid_token", "")

    def test_full_workflow_generate_hash_verify(self) -> None:
        """Test complete workflow: generate -> hash -> verify."""
        generator = TokenGenerator()

        # Generate token
        token = generator.generate_token()

        # Hash token for storage
        hashed = generator.hash_token(token)

        # Verify correct token
        assert generator.verify_token(token, hashed) is True

        # Verify wrong token fails
        wrong_token = generator.generate_token()
        assert generator.verify_token(wrong_token, hashed) is False
