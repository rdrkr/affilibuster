# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
IP anonymization service for GDPR compliance.

Provides utilities for anonymizing and hashing IP addresses to protect
user privacy while maintaining audit trail integrity.

GDPR References:
    - Article 5(1)(c): Data minimization
    - Article 25: Data protection by design and default
    - Article 32: Security of processing
"""

import hashlib
import ipaddress


class IPAnonymizer:
    """
    Service for anonymizing and hashing IP addresses.

    Supports IPv4 (zeroes last octet) and IPv6 (zeroes last 80 bits).
    Also provides salted SHA-256 hashing for consent audit trails where
    a non-reversible identifier is needed.
    """

    def anonymize(self, ip: str) -> str:
        """
        Anonymize an IP address by zeroing trailing bits.

        For IPv4, the last octet is set to 0 (e.g., 192.168.1.42 → 192.168.1.0).
        For IPv6, the last 80 bits are set to 0.

        Args:
            ip: The IP address string to anonymize.

        Returns:
            The anonymized IP address string.

        Raises:
            ValueError: If the IP address is invalid.

        Example:
            >>> anonymizer = IPAnonymizer()
            >>> anonymizer.anonymize("192.168.1.42")
            '192.168.1.0'
            >>> anonymizer.anonymize("2001:db8::1")
            '2001:db8::'
        """
        addr = ipaddress.ip_address(ip)

        if isinstance(addr, ipaddress.IPv4Address):
            # Zero the last octet (8 bits)
            ipv4_network = ipaddress.IPv4Network(f"{ip}/24", strict=False)
            return str(ipv4_network.network_address)

        # IPv6: zero the last 80 bits
        ipv6_network = ipaddress.IPv6Network(f"{ip}/48", strict=False)
        return str(ipv6_network.network_address)

    def hash_ip(self, ip: str, salt: str) -> str:
        """
        Create a salted SHA-256 hash of an IP address.

        Produces a non-reversible identifier suitable for consent audit trails.
        The same IP + salt always produces the same hash, enabling duplicate
        detection without storing raw IPs.

        Args:
            ip: The IP address string to hash.
            salt: A secret salt for the hash (should be stored securely).

        Returns:
            The hex-encoded SHA-256 hash string (64 characters).

        Example:
            >>> anonymizer = IPAnonymizer()
            >>> anonymizer.hash_ip("192.168.1.42", "my-secret-salt")
            'a1b2c3...'  # 64-char hex string
        """
        return hashlib.sha256(f"{salt}:{ip}".encode()).hexdigest()
