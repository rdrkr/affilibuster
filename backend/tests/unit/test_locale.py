# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for Locale domain entity.

Covers:
- Valid locale creation
- Validation rules (code format, country code, first_day_of_week)
- Helper methods (get_week_start_date, format_date, is_12hour_format)
"""

import pytest
from src.domain.entities.locale import Locale


class TestLocaleCreation:
    """Test valid Locale entity creation."""

    def test_create_locale_en_us(self):
        """Test creating English (United States) locale."""
        locale = Locale(
            code='en-US',
            language_code='en',
            country_code='US',
            display_name='English (United States)',
            date_format='MM/DD/YYYY',
            time_format='12h',
            first_day_of_week=0,
            is_active=True
        )

        assert locale.code == 'en-US'
        assert locale.language_code == 'en'
        assert locale.country_code == 'US'
        assert locale.display_name == 'English (United States)'
        assert locale.date_format == 'MM/DD/YYYY'
        assert locale.time_format == '12h'
        assert locale.first_day_of_week == 0
        assert locale.is_active is True

    def test_create_locale_it_it(self):
        """Test creating Italian (Italy) locale."""
        locale = Locale(
            code='it-IT',
            language_code='it',
            country_code='IT',
            display_name='Italiano (Italia)',
            date_format='DD/MM/YYYY',
            time_format='24h',
            first_day_of_week=1,  # Monday
            is_active=True
        )

        assert locale.code == 'it-IT'
        assert locale.country_code == 'IT'
        assert locale.time_format == '24h'
        assert locale.first_day_of_week == 1

    def test_create_locale_he_il(self):
        """Test creating Hebrew (Israel) locale."""
        locale = Locale(
            code='he-IL',
            language_code='he',
            country_code='IL',
            display_name='עברית (ישראל)',
            date_format='DD/MM/YYYY',
            time_format='24h',
            first_day_of_week=0,  # Sunday
            is_active=True
        )

        assert locale.code == 'he-IL'
        assert locale.country_code == 'IL'
        assert locale.display_name == 'עברית (ישראל)'

    def test_create_inactive_locale(self):
        """Test creating an inactive locale."""
        locale = Locale(
            code='fr-FR',
            language_code='fr',
            country_code='FR',
            display_name='Français (France)',
            date_format='DD/MM/YYYY',
            time_format='24h',
            first_day_of_week=1,
            is_active=False
        )

        assert locale.is_active is False


class TestLocaleValidation:
    """Test Locale validation rules."""

    def test_invalid_code_missing_hyphen(self):
        """Test validation fails when locale code missing hyphen."""
        with pytest.raises(ValueError, match="must be in IETF BCP 47 format"):
            Locale(
                code='enUS',  # Missing hyphen
                language_code='en',
                country_code='US',
                display_name='English (United States)',
                date_format='MM/DD/YYYY',
                time_format='12h',
                first_day_of_week=0
            )

    def test_invalid_code_multiple_hyphens(self):
        """Test validation fails with more than 2 parts."""
        with pytest.raises(ValueError, match="must have exactly 2 parts"):
            Locale(
                code='en-US-variant',  # Too many parts
                language_code='en',
                country_code='US',
                display_name='English (United States)',
                date_format='MM/DD/YYYY',
                time_format='12h',
                first_day_of_week=0
            )

    def test_invalid_code_uppercase_language(self):
        """Test validation fails when language code is uppercase."""
        with pytest.raises(ValueError, match="Language code part must be lowercase"):
            Locale(
                code='EN-US',  # Language part should be lowercase
                language_code='en',
                country_code='US',
                display_name='English (United States)',
                date_format='MM/DD/YYYY',
                time_format='12h',
                first_day_of_week=0
            )

    def test_invalid_code_lowercase_country(self):
        """Test validation fails when country code is lowercase."""
        with pytest.raises(ValueError, match="Country code part must be uppercase"):
            Locale(
                code='en-us',  # Country part should be uppercase
                language_code='en',
                country_code='US',
                display_name='English (United States)',
                date_format='MM/DD/YYYY',
                time_format='12h',
                first_day_of_week=0
            )

    def test_invalid_country_code_length(self):
        """Test validation fails when country code is not 2 characters."""
        with pytest.raises(ValueError, match="Country code must be 2 characters"):
            Locale(
                code='en-USA',
                language_code='en',
                country_code='USA',  # Should be 2 characters
                display_name='English (United States)',
                date_format='MM/DD/YYYY',
                time_format='12h',
                first_day_of_week=0
            )

    def test_invalid_country_code_lowercase(self):
        """Test validation fails when country_code field is lowercase."""
        with pytest.raises(ValueError, match="Country code must be uppercase"):
            Locale(
                code='en-US',
                language_code='en',
                country_code='us',  # Should be uppercase
                display_name='English (United States)',
                date_format='MM/DD/YYYY',
                time_format='12h',
                first_day_of_week=0
            )

    def test_invalid_first_day_of_week_negative(self):
        """Test validation fails when first_day_of_week is negative."""
        with pytest.raises(ValueError, match="firstDayOfWeek must be between 0"):
            Locale(
                code='en-US',
                language_code='en',
                country_code='US',
                display_name='English (United States)',
                date_format='MM/DD/YYYY',
                time_format='12h',
                first_day_of_week=-1  # Invalid: negative
            )

    def test_invalid_first_day_of_week_too_large(self):
        """Test validation fails when first_day_of_week > 6."""
        with pytest.raises(ValueError, match="firstDayOfWeek must be between 0"):
            Locale(
                code='en-US',
                language_code='en',
                country_code='US',
                display_name='English (United States)',
                date_format='MM/DD/YYYY',
                time_format='12h',
                first_day_of_week=7  # Invalid: must be 0-6
            )

    def test_valid_first_day_of_week_range(self):
        """Test all valid first_day_of_week values (0-6)."""
        for day in range(7):  # 0-6 inclusive
            locale = Locale(
                code='en-US',
                language_code='en',
                country_code='US',
                display_name='English (United States)',
                date_format='MM/DD/YYYY',
                time_format='12h',
                first_day_of_week=day
            )
            assert locale.first_day_of_week == day


class TestLocaleHelperMethods:
    """Test Locale helper methods."""

    def test_get_week_start_date_sunday(self):
        """Test get_week_start_date for Sunday start (US)."""
        locale = Locale(
            code='en-US',
            language_code='en',
            country_code='US',
            display_name='English (United States)',
            date_format='MM/DD/YYYY',
            time_format='12h',
            first_day_of_week=0  # Sunday
        )

        result = locale.get_week_start_date(None)
        assert result == 0

    def test_get_week_start_date_monday(self):
        """Test get_week_start_date for Monday start (Italy)."""
        locale = Locale(
            code='it-IT',
            language_code='it',
            country_code='IT',
            display_name='Italiano (Italia)',
            date_format='DD/MM/YYYY',
            time_format='24h',
            first_day_of_week=1  # Monday
        )

        result = locale.get_week_start_date(None)
        assert result == 1

    def test_format_date_us_format(self):
        """Test format_date returns US format."""
        locale = Locale(
            code='en-US',
            language_code='en',
            country_code='US',
            display_name='English (United States)',
            date_format='MM/DD/YYYY',
            time_format='12h',
            first_day_of_week=0
        )

        result = locale.format_date(None)
        assert result == 'MM/DD/YYYY'

    def test_format_date_eu_format(self):
        """Test format_date returns European format."""
        locale = Locale(
            code='it-IT',
            language_code='it',
            country_code='IT',
            display_name='Italiano (Italia)',
            date_format='DD/MM/YYYY',
            time_format='24h',
            first_day_of_week=1
        )

        result = locale.format_date(None)
        assert result == 'DD/MM/YYYY'

    def test_format_date_iso_format(self):
        """Test format_date returns ISO format."""
        locale = Locale(
            code='en-GB',
            language_code='en',
            country_code='GB',
            display_name='English (United Kingdom)',
            date_format='YYYY-MM-DD',
            time_format='24h',
            first_day_of_week=1
        )

        result = locale.format_date(None)
        assert result == 'YYYY-MM-DD'

    def test_is_12hour_format_true(self):
        """Test is_12hour_format returns True for 12h format."""
        locale = Locale(
            code='en-US',
            language_code='en',
            country_code='US',
            display_name='English (United States)',
            date_format='MM/DD/YYYY',
            time_format='12h',
            first_day_of_week=0
        )

        assert locale.is_12hour_format() is True

    def test_is_12hour_format_false(self):
        """Test is_12hour_format returns False for 24h format."""
        locale = Locale(
            code='it-IT',
            language_code='it',
            country_code='IT',
            display_name='Italiano (Italia)',
            date_format='DD/MM/YYYY',
            time_format='24h',
            first_day_of_week=1
        )

        assert locale.is_12hour_format() is False


class TestLocaleEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_locale_with_special_characters_in_display_name(self):
        """Test locale creation with Unicode characters."""
        locale = Locale(
            code='he-IL',
            language_code='he',
            country_code='IL',
            display_name='עברית (ישראל)',  # Hebrew characters
            date_format='DD/MM/YYYY',
            time_format='24h',
            first_day_of_week=0
        )

        assert '(' in locale.display_name
        assert ')' in locale.display_name

    def test_locale_code_with_different_case_combinations(self):
        """Test that locale code validation catches case issues."""
        # Valid: lowercase-UPPERCASE
        locale = Locale(
            code='en-US',
            language_code='en',
            country_code='US',
            display_name='English (United States)',
            date_format='MM/DD/YYYY',
            time_format='12h',
            first_day_of_week=0
        )
        assert locale.code == 'en-US'

    def test_multiple_validation_calls(self):
        """Test that validation can be called multiple times."""
        locale = Locale(
            code='en-US',
            language_code='en',
            country_code='US',
            display_name='English (United States)',
            date_format='MM/DD/YYYY',
            time_format='12h',
            first_day_of_week=0
        )

        # Should not raise error on multiple calls
        locale.validate()
        locale.validate()
        locale.validate()
