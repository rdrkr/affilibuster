# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Language domain entity.

Reference: data-model.md:12-77
"""

from dataclasses import dataclass
from typing import Literal


LanguageCode = Literal['en', 'it', 'he']
Direction = Literal['ltr', 'rtl']


@dataclass
class Language:
    """
    Represents a supported language configuration.

    Business Rules:
    - Exactly one language must have isDefault = true
    - English (code: 'en') must be the default language
    - All languages have explicit URL prefixes (/en, /it, /he)
    - Hebrew must have direction = 'rtl', all others 'ltr'
    """

    code: LanguageCode
    display_name: str
    native_name: str
    direction: Direction
    url_prefix: str
    default_currency: str  # CurrencyCode
    locale_code: str
    is_default: bool
    is_active: bool
    sort_order: int

    def validate(self) -> None:
        """
        Validate business rules for Language entity.

        Raises:
            ValueError: If any business rule is violated
        """
        # Rule: English must be default
        if self.code == 'en' and not self.is_default:
            raise ValueError("English (code: 'en') must be the default language")

        # Rule: Hebrew must be RTL
        if self.code == 'he' and self.direction != 'rtl':
            raise ValueError("Hebrew must have direction='rtl'")

        # Rule: Non-Hebrew languages must be LTR
        if self.code != 'he' and self.direction != 'ltr':
            raise ValueError(f"Language '{self.code}' must have direction='ltr'")

    def __post_init__(self):
        """Run validation after initialization."""
        self.validate()
