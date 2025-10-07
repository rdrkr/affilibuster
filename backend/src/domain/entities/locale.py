# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Locale domain entity.

Reference: data-model.md:366-414
"""

from dataclasses import dataclass
from typing import Literal


TimeFormat = Literal['12h', '24h']


@dataclass
class Locale:
    """
    Cultural and regional formatting settings.

    Business Rules:
    - code must be valid IETF BCP 47 locale code (e.g., 'en-US', 'it-IT', 'he-IL')
    - Each active Language must have at least one active Locale [enforced at service level]
    - firstDayOfWeek must be 0-6 (Sunday = 0, Monday = 1, etc.)
    """

    code: str  # IETF BCP 47: 'en-US', 'it-IT', 'he-IL'
    language_code: str  # LanguageCode
    country_code: str  # ISO 3166-1 alpha-2: 'US', 'IT', 'IL'
    display_name: str  # 'English (United States)'
    date_format: str  # 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'
    time_format: TimeFormat
    first_day_of_week: int  # 0 (Sunday) - 6 (Saturday)
    is_active: bool = True

    def validate(self) -> None:
        """
        Validate business rules for Locale entity.

        Raises:
            ValueError: If any business rule is violated
        """
        # Rule: code must contain a hyphen (language-country format)
        if '-' not in self.code:
            raise ValueError(
                "Locale code must be in IETF BCP 47 format (e.g., 'en-US')"
            )

        # Rule: code parts should match languageCode and countryCode
        parts = self.code.split('-')
        if len(parts) != 2:
            raise ValueError(
                "Locale code must have exactly 2 parts: language-country"
            )

        # Rule: language code should be lowercase
        if parts[0] != parts[0].lower():
            raise ValueError("Language code part must be lowercase")

        # Rule: country code should be uppercase
        if parts[1] != parts[1].upper():
            raise ValueError("Country code part must be uppercase")

        # Rule: country code must be 2 characters (ISO 3166-1 alpha-2)
        if len(self.country_code) != 2:
            raise ValueError("Country code must be 2 characters (ISO 3166-1 alpha-2)")

        # Rule: country code must be uppercase
        if self.country_code != self.country_code.upper():
            raise ValueError("Country code must be uppercase")

        # Rule: firstDayOfWeek must be 0-6
        if not 0 <= self.first_day_of_week <= 6:
            raise ValueError("firstDayOfWeek must be between 0 (Sunday) and 6 (Saturday)")

    def __post_init__(self):
        """Run validation after initialization."""
        self.validate()

    def get_week_start_date(self, reference_date) -> int:
        """
        Get the weekday number for the first day of the week.

        Args:
            reference_date: Not used, kept for API compatibility

        Returns:
            int: First day of week (0=Sunday, 1=Monday, etc.)
        """
        return self.first_day_of_week

    def format_date(self, date: str) -> str:
        """
        Get the date format pattern for this locale.

        Args:
            date: Not used, kept for API compatibility

        Returns:
            str: Date format pattern (e.g., 'MM/DD/YYYY')
        """
        return self.date_format

    def is_12hour_format(self) -> bool:
        """
        Check if this locale uses 12-hour time format.

        Returns:
            bool: True if 12-hour format, False for 24-hour
        """
        return self.time_format == '12h'
