# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Password hashing service using bcrypt.

Provides secure password hashing and verification for user authentication.
Uses bcrypt algorithm with automatic salt generation.
"""

import bcrypt


class PasswordHasher:
    """
    Service for hashing and verifying passwords using bcrypt.

    This service handles all password cryptography operations, ensuring
    secure password storage and verification. Uses bcrypt with automatic
    salt generation for each hash.

    Bcrypt Details:
        - Cost factor: 12 (default, ~300ms on modern hardware)
        - Salt: Automatically generated per password
        - Hash format: $2b$12$[22 char salt][31 char hash]
        - Total length: 60 characters
        - Max password length: 72 bytes (bcrypt limitation)
    """

    def hash_password(self, plaintext: str) -> str:
        """
        Hash a plaintext password using bcrypt.

        Generates a unique salt for each password and returns a bcrypt hash.
        The salt is embedded in the hash, so no separate storage is needed.

        Args:
            plaintext: The plaintext password to hash.

        Returns:
            The bcrypt hash string (60 characters, starts with $2b$).

        Raises:
            ValueError: If plaintext is empty or whitespace-only.

        Example:
            >>> hasher = PasswordHasher()
            >>> hashed = hasher.hash_password("MyPassword123!")
            >>> hashed
            '$2b$12$abcdefgh...'
        """
        if not plaintext or not plaintext.strip():
            raise ValueError("Password cannot be empty")

        # Encode to bytes (bcrypt requires bytes)
        password_bytes = plaintext.encode("utf-8")

        # Truncate to 72 bytes (bcrypt limitation)
        # Note: bcrypt only uses first 72 bytes, so we truncate explicitly
        password_bytes = password_bytes[:72]

        # Generate salt and hash password
        salt = bcrypt.gensalt()
        hashed_bytes = bcrypt.hashpw(password_bytes, salt)

        # Return hash as string
        return hashed_bytes.decode("utf-8")

    def verify_password(self, plaintext: str, hashed: str) -> bool:
        """
        Verify a plaintext password against a bcrypt hash.

        Extracts the salt from the hash and compares the hashed plaintext
        with the stored hash.

        Args:
            plaintext: The plaintext password to verify.
            hashed: The bcrypt hash to verify against.

        Returns:
            True if the password matches, False otherwise.

        Raises:
            ValueError: If plaintext or hashed is empty.

        Example:
            >>> hasher = PasswordHasher()
            >>> hashed = hasher.hash_password("MyPassword123!")
            >>> hasher.verify_password("MyPassword123!", hashed)
            True
            >>> hasher.verify_password("WrongPassword", hashed)
            False
        """
        if not plaintext or not plaintext.strip():
            raise ValueError("Password cannot be empty")

        if not hashed or not hashed.strip():
            raise ValueError("Hashed password cannot be empty")

        try:
            # Encode to bytes
            password_bytes = plaintext.encode("utf-8")

            # Truncate to 72 bytes (bcrypt limitation)
            # Note: bcrypt only uses first 72 bytes, so we truncate explicitly
            password_bytes = password_bytes[:72]

            hashed_bytes = hashed.encode("utf-8")

            # Verify password
            return bcrypt.checkpw(password_bytes, hashed_bytes)
        except (ValueError, AttributeError):
            # Invalid hash format or encoding error
            return False
