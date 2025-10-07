# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Currency domain entity.

Reference: data-model.md:250-315
"""

from dataclasses import dataclass
from typing import Literal


SymbolPosition = Literal['before', 'after']


@dataclass
class Currency:
    """
    Supported currency configuration.

    Business Rules:
    - code must be valid ISO 4217 currency code (e.g., USD, EUR, ILS)
    - At least one currency must have isActive = true [enforced at service level]
    - decimalPlaces must be 0-3 (99.9% of currencies)
    """

    code: str  # ISO 4217: 'USD' | 'EUR' | 'ILS' | etc.
    name: str  # 'US Dollar', 'Euro', 'Israeli Shekel'
    symbol: str  # '$', '€', '₪'
    decimal_places: int  # Typically 2, but 0 for JPY, 3 for KWD
    symbol_position: SymbolPosition
    thousands_separator: str  # ',', '.', ' '
    decimal_separator: str  # '.', ','
    is_active: bool = True
    sort_order: int = 0

    def validate(self) -> None:
        """
        Validate business rules for Currency entity.

        Raises:
            ValueError: If any business rule is violated
        """
        # Rule: code must be 3 characters (ISO 4217)
        if len(self.code) != 3:
            raise ValueError("Currency code must be 3 characters (ISO 4217)")

        # Rule: code must be uppercase
        if self.code != self.code.upper():
            raise ValueError("Currency code must be uppercase")

        # Rule: decimalPlaces must be 0-3
        if not 0 <= self.decimal_places <= 3:
            raise ValueError("decimalPlaces must be between 0 and 3")

        # Rule: thousands and decimal separators must be different
        if self.thousands_separator == self.decimal_separator:
            raise ValueError("Thousands and decimal separators must be different")

    def __post_init__(self):
        """Run validation after initialization."""
        self.validate()

    def format_amount(self, amount: float) -> str:
        """
        Format a monetary amount according to currency settings.

        Args:
            amount: The amount to format

        Returns:
            Formatted string (e.g., "$1,234.56" or "1.234,56 €")
        """
        # Round to decimal places
        rounded = round(amount, self.decimal_places)

        # Format with decimal separator
        if self.decimal_places == 0:
            formatted_number = f"{int(rounded)}"
        else:
            formatted_number = f"{rounded:.{self.decimal_places}f}"

        # Replace decimal separator if needed
        if self.decimal_separator != '.':
            formatted_number = formatted_number.replace('.', self.decimal_separator)

        # Add thousands separator
        parts = formatted_number.split(self.decimal_separator)
        integer_part = parts[0]

        # Add thousands separators (from right to left)
        if len(integer_part) > 3:
            reversed_int = integer_part[::-1]
            chunks = [reversed_int[i:i+3] for i in range(0, len(reversed_int), 3)]
            integer_part = self.thousands_separator.join(chunks)[::-1]

        if len(parts) > 1:
            formatted_number = f"{integer_part}{self.decimal_separator}{parts[1]}"
        else:
            formatted_number = integer_part

        # Add currency symbol
        if self.symbol_position == 'before':
            return f"{self.symbol}{formatted_number}"
        else:
            return f"{formatted_number} {self.symbol}"
