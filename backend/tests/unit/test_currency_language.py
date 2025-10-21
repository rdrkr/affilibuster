# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for Currency and Language domain entities.

Covers:
- Currency entity validation and formatting
- Language entity validation
"""

import pytest

from domain.entities.currency import Currency
from domain.entities.language import Language


class TestCurrencyValidation:
    """Test Currency entity validation."""

    def test_create_valid_currency_usd(self):
        """Test creating valid USD currency."""
        currency = Currency(
            code="USD",
            name="US Dollar",
            symbol="$",
            decimal_places=2,
            symbol_position="before",
            thousands_separator=",",
            decimal_separator=".",
            is_active=True,
            sort_order=1,
        )

        assert currency.code == "USD"
        assert currency.symbol == "$"

    def test_error_when_code_not_3_characters(self):
        """Test validation fails when code is not 3 characters."""
        with pytest.raises(ValueError, match="Currency code must be 3 characters"):
            Currency(
                code="US",  # Only 2 characters
                name="US Dollar",
                symbol="$",
                decimal_places=2,
                symbol_position="before",
                thousands_separator=",",
                decimal_separator=".",
            )

    def test_error_when_code_not_uppercase(self):
        """Test validation fails when code is not uppercase."""
        with pytest.raises(ValueError, match="Currency code must be uppercase"):
            Currency(
                code="usd",  # Lowercase
                name="US Dollar",
                symbol="$",
                decimal_places=2,
                symbol_position="before",
                thousands_separator=",",
                decimal_separator=".",
            )

    def test_error_when_decimal_places_negative(self):
        """Test validation fails when decimal_places < 0."""
        with pytest.raises(ValueError, match="decimalPlaces must be between 0 and 3"):
            Currency(
                code="USD",
                name="US Dollar",
                symbol="$",
                decimal_places=-1,
                symbol_position="before",
                thousands_separator=",",
                decimal_separator=".",
            )

    def test_error_when_decimal_places_too_large(self):
        """Test validation fails when decimal_places > 3."""
        with pytest.raises(ValueError, match="decimalPlaces must be between 0 and 3"):
            Currency(
                code="USD",
                name="US Dollar",
                symbol="$",
                decimal_places=4,
                symbol_position="before",
                thousands_separator=",",
                decimal_separator=".",
            )

    def test_error_when_separators_same(self):
        """Test validation fails when thousands and decimal separators are the same."""
        with pytest.raises(ValueError, match="Thousands and decimal separators must be different"):
            Currency(
                code="USD",
                name="US Dollar",
                symbol="$",
                decimal_places=2,
                symbol_position="before",
                thousands_separator=",",
                decimal_separator=",",  # Same as thousands
            )


class TestCurrencyFormatAmount:
    """Test Currency format_amount method."""

    def test_format_usd_with_cents(self):
        """Test formatting USD amount with cents."""
        currency = Currency(
            code="USD",
            name="US Dollar",
            symbol="$",
            decimal_places=2,
            symbol_position="before",
            thousands_separator=",",
            decimal_separator=".",
        )

        formatted = currency.format_amount(1234.56)
        assert formatted == "$1,234.56"

    def test_format_eur_with_symbol_after(self):
        """Test formatting EUR with symbol after amount."""
        currency = Currency(
            code="EUR",
            name="Euro",
            symbol="€",
            decimal_places=2,
            symbol_position="after",
            thousands_separator=".",
            decimal_separator=",",
        )

        formatted = currency.format_amount(1234.56)
        assert formatted == "1.234,56 €"

    def test_format_jpy_zero_decimals(self):
        """Test formatting JPY (0 decimal places)."""
        currency = Currency(
            code="JPY",
            name="Japanese Yen",
            symbol="¥",
            decimal_places=0,
            symbol_position="before",
            thousands_separator=",",
            decimal_separator=".",
        )

        formatted = currency.format_amount(1234.99)
        assert formatted == "¥1,235"  # Rounded

    def test_format_small_amount_no_thousands_separator(self):
        """Test formatting small amount (no thousands separator needed)."""
        currency = Currency(
            code="USD",
            name="US Dollar",
            symbol="$",
            decimal_places=2,
            symbol_position="before",
            thousands_separator=",",
            decimal_separator=".",
        )

        formatted = currency.format_amount(99.99)
        assert formatted == "$99.99"

    def test_format_large_amount_multiple_separators(self):
        """Test formatting large amount with multiple thousands separators."""
        currency = Currency(
            code="USD",
            name="US Dollar",
            symbol="$",
            decimal_places=2,
            symbol_position="before",
            thousands_separator=",",
            decimal_separator=".",
        )

        formatted = currency.format_amount(1234567.89)
        assert formatted == "$1,234,567.89"

    def test_format_rounds_to_decimal_places(self):
        """Test that amounts are rounded to currency's decimal places."""
        currency = Currency(
            code="USD",
            name="US Dollar",
            symbol="$",
            decimal_places=2,
            symbol_position="before",
            thousands_separator=",",
            decimal_separator=".",
        )

        formatted = currency.format_amount(10.999)
        assert formatted == "$11.00"  # Rounded up


class TestLanguageValidation:
    """Test Language entity validation."""

    def test_create_valid_language_english(self):
        """Test creating valid English language."""
        language = Language(
            code="en",
            display_name="English",
            native_name="English",
            direction="ltr",
            url_prefix="/en",
            default_currency="USD",
            locale_code="en-US",
            is_default=True,
            is_active=True,
            sort_order=1,
        )

        assert language.code == "en"
        assert language.is_default is True

    def test_error_when_english_not_default(self):
        """Test validation fails when English is not set as default."""
        with pytest.raises(ValueError, match="English .* must be the default language"):
            Language(
                code="en",
                display_name="English",
                native_name="English",
                direction="ltr",
                url_prefix="/en",
                default_currency="USD",
                locale_code="en-US",
                is_default=False,  # Invalid: English must be default
                is_active=True,
                sort_order=1,
            )

    def test_error_when_hebrew_not_rtl(self):
        """Test validation fails when Hebrew is not set to RTL."""
        with pytest.raises(ValueError, match="Hebrew must have direction='rtl'"):
            Language(
                code="he",
                display_name="Hebrew",
                native_name="עברית",
                direction="ltr",  # Invalid: should be rtl
                url_prefix="/he",
                default_currency="ILS",
                locale_code="he-IL",
                is_default=False,
                is_active=True,
                sort_order=3,
            )

    def test_error_when_non_hebrew_is_rtl(self):
        """Test validation fails when non-Hebrew language is RTL."""
        with pytest.raises(ValueError, match="Language 'it' must have direction='ltr'"):
            Language(
                code="it",
                display_name="Italian",
                native_name="Italiano",
                direction="rtl",  # Invalid: should be ltr
                url_prefix="/it",
                default_currency="EUR",
                locale_code="it-IT",
                is_default=False,
                is_active=True,
                sort_order=2,
            )

    def test_create_valid_language_italian(self):
        """Test creating valid Italian language."""
        language = Language(
            code="it",
            display_name="Italian",
            native_name="Italiano",
            direction="ltr",
            url_prefix="/it",
            default_currency="EUR",
            locale_code="it-IT",
            is_default=False,
            is_active=True,
            sort_order=2,
        )

        assert language.code == "it"
        assert language.direction == "ltr"

    def test_create_valid_language_hebrew(self):
        """Test creating valid Hebrew language."""
        language = Language(
            code="he",
            display_name="Hebrew",
            native_name="עברית",
            direction="rtl",
            url_prefix="/he",
            default_currency="ILS",
            locale_code="he-IL",
            is_default=False,
            is_active=True,
            sort_order=3,
        )

        assert language.code == "he"
        assert language.direction == "rtl"
