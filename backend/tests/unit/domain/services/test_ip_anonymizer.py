# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for IPAnonymizer service.

Tests IP anonymization (zeroing trailing bits) and salted SHA-256 hashing
for GDPR-compliant IP address handling.
"""

import pytest

from affilibuster_backend.domain.services.ip_anonymizer import IPAnonymizer


@pytest.fixture
def anonymizer():
    """Create an IPAnonymizer instance."""
    return IPAnonymizer()


@pytest.mark.unit
class TestIPAnonymizeIPv4:
    """Test IPv4 address anonymization."""

    def test_anonymize_ipv4_zeroes_last_octet(self, anonymizer):
        """Test that the last octet is zeroed for IPv4 addresses."""
        assert anonymizer.anonymize("192.168.1.42") == "192.168.1.0"

    def test_anonymize_ipv4_already_zero(self, anonymizer):
        """Test that already-anonymized IPv4 addresses are unchanged."""
        assert anonymizer.anonymize("10.0.0.0") == "10.0.0.0"

    def test_anonymize_ipv4_max_last_octet(self, anonymizer):
        """Test with maximum last octet value."""
        assert anonymizer.anonymize("172.16.0.255") == "172.16.0.0"

    def test_anonymize_ipv4_loopback(self, anonymizer):
        """Test loopback address anonymization."""
        assert anonymizer.anonymize("127.0.0.1") == "127.0.0.0"

    def test_anonymize_ipv4_preserves_first_three_octets(self, anonymizer):
        """Test that only the last octet is modified."""
        assert anonymizer.anonymize("203.0.113.195") == "203.0.113.0"


@pytest.mark.unit
class TestIPAnonymizeIPv6:
    """Test IPv6 address anonymization."""

    def test_anonymize_ipv6_zeroes_last_80_bits(self, anonymizer):
        """Test that the last 80 bits are zeroed for IPv6 addresses."""
        assert anonymizer.anonymize("2001:db8::1") == "2001:db8::"

    def test_anonymize_ipv6_full_address(self, anonymizer):
        """Test with a full IPv6 address (/48 prefix preserves first 3 groups)."""
        assert anonymizer.anonymize("2001:0db8:85a3:0000:0000:8a2e:0370:7334") == "2001:db8:85a3::"

    def test_anonymize_ipv6_loopback(self, anonymizer):
        """Test IPv6 loopback address."""
        assert anonymizer.anonymize("::1") == "::"

    def test_anonymize_ipv6_link_local(self, anonymizer):
        """Test IPv6 link-local address."""
        assert anonymizer.anonymize("fe80::1") == "fe80::"


@pytest.mark.unit
class TestIPAnonymizeInvalid:
    """Test error handling for invalid IP addresses."""

    def test_anonymize_invalid_ip_raises_value_error(self, anonymizer):
        """Test that invalid IPs raise ValueError."""
        with pytest.raises(ValueError):
            anonymizer.anonymize("not-an-ip")

    def test_anonymize_empty_string_raises_value_error(self, anonymizer):
        """Test that empty string raises ValueError."""
        with pytest.raises(ValueError):
            anonymizer.anonymize("")


@pytest.mark.unit
class TestIPHash:
    """Test IP address hashing."""

    def test_hash_ip_returns_64_char_hex_string(self, anonymizer):
        """Test that hash output is 64-character hex string (SHA-256)."""
        result = anonymizer.hash_ip("192.168.1.42", "test-salt")
        assert len(result) == 64
        assert all(c in "0123456789abcdef" for c in result)

    def test_hash_ip_same_input_same_output(self, anonymizer):
        """Test that same IP + salt always produces same hash."""
        hash1 = anonymizer.hash_ip("10.0.0.1", "salt-abc")
        hash2 = anonymizer.hash_ip("10.0.0.1", "salt-abc")
        assert hash1 == hash2

    def test_hash_ip_different_ip_different_output(self, anonymizer):
        """Test that different IPs produce different hashes."""
        hash1 = anonymizer.hash_ip("10.0.0.1", "salt")
        hash2 = anonymizer.hash_ip("10.0.0.2", "salt")
        assert hash1 != hash2

    def test_hash_ip_different_salt_different_output(self, anonymizer):
        """Test that different salts produce different hashes."""
        hash1 = anonymizer.hash_ip("10.0.0.1", "salt-a")
        hash2 = anonymizer.hash_ip("10.0.0.1", "salt-b")
        assert hash1 != hash2

    def test_hash_ip_ipv6_address(self, anonymizer):
        """Test hashing with an IPv6 address."""
        result = anonymizer.hash_ip("2001:db8::1", "test-salt")
        assert len(result) == 64
