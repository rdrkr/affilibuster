# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Token generation and hashing service.

Provides cryptographically secure token generation and hashing for
session tokens, password reset tokens, and email verification tokens.
"""

import hashlib
import secrets


class TokenGenerator:
    """
    Service for generating and hashing cryptographically secure tokens.

    This service handles token generation for sessions, password resets,
    and email verification. Uses Python's secrets module for cryptographic
    security and SHA-256 for token hashing.

    Token Workflow:
        1. Generate random token with generate_token()
        2. Send token to user (email, response, etc.)
        3. Hash token with hash_token() before storing in database
        4. Verify token with verify_token() when user provides it

    Security Notes:
        - Tokens are generated using secrets.token_hex() (CSPRNG)
        - Hashes use SHA-256 (irreversible, deterministic)
        - Never store plaintext tokens in database
        - Always hash tokens before persistence
    """

    def generate_token(self, nbytes: int = 32) -> str:
        """
        Generate a cryptographically secure random token.

        Uses Python's secrets module (CSPRNG) to generate a hex token.
        Default length is 32 bytes (64 hex characters).

        Args:
            nbytes: Number of random bytes to generate. Default is 32.

        Returns:
            A hex-encoded random token string.

        Raises:
            ValueError: If nbytes is not positive.

        Example:
            >>> generator = TokenGenerator()
            >>> token = generator.generate_token()
            >>> len(token)
            64
            >>> token = generator.generate_token(nbytes=16)
            >>> len(token)
            32
        """
        if nbytes <= 0:
            raise ValueError("Token length must be positive")

        return secrets.token_hex(nbytes)

    def hash_token(self, token: str) -> str:
        """
        Hash a token using SHA-256.

        Creates a deterministic hash of the token for secure storage.
        The hash is irreversible - you cannot recover the original token
        from the hash.

        Args:
            token: The plaintext token to hash.

        Returns:
            The SHA-256 hash as a hex string (64 characters).

        Raises:
            ValueError: If token is empty or whitespace-only.

        Example:
            >>> generator = TokenGenerator()
            >>> token = "abc123"
            >>> hashed = generator.hash_token(token)
            >>> len(hashed)
            64
        """
        if not token or not token.strip():
            raise ValueError("Token cannot be empty")

        # Encode to bytes and hash with SHA-256
        token_bytes = token.encode("utf-8")
        hash_object = hashlib.sha256(token_bytes)

        return hash_object.hexdigest()

    def verify_token(self, plaintext: str, hashed: str) -> bool:
        """
        Verify a plaintext token against a hashed token.

        Hashes the plaintext token and compares it with the stored hash.

        Args:
            plaintext: The plaintext token to verify.
            hashed: The hashed token to verify against.

        Returns:
            True if the tokens match, False otherwise.

        Raises:
            ValueError: If plaintext or hashed is empty.

        Example:
            >>> generator = TokenGenerator()
            >>> token = generator.generate_token()
            >>> hashed = generator.hash_token(token)
            >>> generator.verify_token(token, hashed)
            True
            >>> generator.verify_token("wrong_token", hashed)
            False
        """
        if not plaintext or not plaintext.strip():
            raise ValueError("Token cannot be empty")

        if not hashed or not hashed.strip():
            raise ValueError("Hashed token cannot be empty")

        # Hash the plaintext and compare with stored hash
        plaintext_hash = self.hash_token(plaintext)

        # Constant-time comparison to prevent timing attacks
        return secrets.compare_digest(plaintext_hash, hashed)
