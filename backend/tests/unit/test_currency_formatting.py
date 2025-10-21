# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for currency formatting logic.
Reference: research.md:221-234 (Intl.NumberFormat utility)
"""

import pytest

from domain.entities.currency import Currency


@pytest.fixture
def usd_currency():
    """USD currency configuration."""
    return Currency(
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


@pytest.fixture
def eur_currency():
    """EUR currency configuration."""
    return Currency(
        code="EUR",
        name="Euro",
        symbol="€",
        decimal_places=2,
        symbol_position="after",
        thousands_separator=".",
        decimal_separator=",",
        is_active=True,
        sort_order=2,
    )


@pytest.fixture
def ils_currency():
    """ILS currency configuration."""
    return Currency(
        code="ILS",
        name="Israeli Shekel",
        symbol="₪",
        decimal_places=2,
        symbol_position="before",
        thousands_separator=",",
        decimal_separator=".",
        is_active=True,
        sort_order=3,
    )


@pytest.fixture
def jpy_currency():
    """JPY currency configuration (zero decimal places)."""
    return Currency(
        code="JPY",
        name="Japanese Yen",
        symbol="¥",
        decimal_places=0,
        symbol_position="before",
        thousands_separator=",",
        decimal_separator=".",
        is_active=True,
        sort_order=4,
    )


# Use the Currency entity's built-in format_amount method
def format_currency(amount: float, currency: Currency) -> str:
    """
    Format currency using Currency entity's format_amount method.

    Args:
        amount: The amount to format
        currency: Currency configuration

    Returns:
        Formatted currency string
    """
    return currency.format_amount(amount)


@pytest.mark.unit
def test_format_usd_basic(usd_currency):
    """Test formatting USD with basic amount."""
    result = format_currency(29.99, usd_currency)
    assert result == "$29.99"


@pytest.mark.unit
def test_format_usd_with_thousands(usd_currency):
    """Test formatting USD with thousands separator."""
    result = format_currency(1234.56, usd_currency)
    assert result == "$1,234.56"


@pytest.mark.unit
def test_format_usd_large_amount(usd_currency):
    """Test formatting USD with large amount."""
    result = format_currency(1234567.89, usd_currency)
    assert result == "$1,234,567.89"


@pytest.mark.unit
def test_format_eur_basic(eur_currency):
    """Test formatting EUR with Italian locale formatting."""
    result = format_currency(29.99, eur_currency)
    assert result == "29,99 €"


@pytest.mark.unit
def test_format_eur_with_thousands(eur_currency):
    """Test formatting EUR with thousands separator."""
    result = format_currency(1234.56, eur_currency)
    assert result == "1.234,56 €"


@pytest.mark.unit
def test_format_ils_basic(ils_currency):
    """Test formatting Israeli Shekel."""
    result = format_currency(100.50, ils_currency)
    assert result == "₪100.50"


@pytest.mark.unit
def test_format_jpy_no_decimals(jpy_currency):
    """Test formatting Japanese Yen (zero decimal places)."""
    result = format_currency(1500.0, jpy_currency)
    assert result == "¥1,500"


@pytest.mark.unit
def test_format_jpy_rounds_correctly(jpy_currency):
    """Test that JPY rounds correctly (no decimal places)."""
    result = format_currency(1500.67, jpy_currency)
    assert result == "¥1,501"  # Rounds up


@pytest.mark.unit
def test_format_zero_amount(usd_currency):
    """Test formatting zero amount."""
    result = format_currency(0.0, usd_currency)
    assert result == "$0.00"


@pytest.mark.unit
def test_format_negative_amount(usd_currency):
    """Test formatting negative amount."""
    result = format_currency(-50.25, usd_currency)
    assert result == "$-50.25"


@pytest.mark.unit
def test_format_very_small_amount(usd_currency):
    """Test formatting very small amount."""
    result = format_currency(0.01, usd_currency)
    assert result == "$0.01"


@pytest.mark.unit
def test_decimal_places_respected():
    """Test that decimal places configuration is respected."""
    # Currency with 3 decimal places (e.g., KWD)
    kwd = Currency(
        code="KWD",
        name="Kuwaiti Dinar",
        symbol="KD",
        decimal_places=3,
        symbol_position="before",
        thousands_separator=",",
        decimal_separator=".",
        is_active=True,
        sort_order=5,
    )

    result = format_currency(10.123, kwd)
    assert result == "KD10.123"


@pytest.mark.unit
def test_symbol_position_before(usd_currency):
    """Test that symbol position 'before' works correctly."""
    result = format_currency(100.0, usd_currency)
    assert result.startswith("$")
    assert not result.endswith("$")


@pytest.mark.unit
def test_symbol_position_after(eur_currency):
    """Test that symbol position 'after' works correctly."""
    result = format_currency(100.0, eur_currency)
    assert result.endswith("€")
    assert not result.startswith("€")


@pytest.mark.unit
def test_thousands_separator_variations():
    """Test different thousands separator formats."""
    # Space separator (French style)
    currency_with_space = Currency(
        code="EUR",
        name="Euro",
        symbol="€",
        decimal_places=2,
        symbol_position="after",
        thousands_separator=" ",
        decimal_separator=",",
        is_active=True,
        sort_order=1,
    )

    result = format_currency(1000.50, currency_with_space)
    assert result == "1 000,50 €"
