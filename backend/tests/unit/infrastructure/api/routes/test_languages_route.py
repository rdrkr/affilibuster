# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for languages route transformation functions.

Tests the transform_strapi_locales_to_languages function with various edge cases
to ensure proper error handling and data transformation.
"""

from typing import Any
from unittest.mock import patch

import pytest

from affilibuster_backend.domain.entities import Language
from affilibuster_backend.domain.entities.generated.cms_entities import LocalesResponse
from affilibuster_backend.domain.entities.generated.models import (
    CurrencyCode,
    Direction,
    LanguageCode,
)
from affilibuster_backend.infrastructure.api.routes.languages import transform_strapi_locales_to_languages


def _create_locale(locale_id: int, code: str, name: str, *, is_default: bool = False) -> dict[str, Any]:
    """Create a properly formatted locale dict for tests."""
    return {
        "id": locale_id,
        "documentId": f"550e8400-e29b-41d4-a716-44665544{locale_id:04d}",
        "code": code,
        "name": name,
        "createdAt": "2025-10-30T17:41:47.696Z",
        "updatedAt": "2025-10-30T18:23:15.432Z",
        "publishedAt": "2025-10-30T17:41:47.696Z",
        "isDefault": is_default,
    }


@pytest.mark.unit
@pytest.mark.asyncio
class TestTransformStrapiLocalesToLanguages:
    """Test suite for transform_strapi_locales_to_languages function."""

    async def test_transform_with_valid_locales(self) -> None:
        """Test transformation with valid locale data."""
        # Create mock locale data
        locale_data = LocalesResponse(
            root=[
                _create_locale(1, "en", "English", is_default=True),  # type: ignore[list-item]
                _create_locale(2, "it", "Italian"),  # type: ignore[list-item]
            ]
        )

        # Transform
        languages = await transform_strapi_locales_to_languages(locale_data)

        # Assertions
        assert len(languages) == 2
        assert isinstance(languages[0], Language)
        assert languages[0].code == LanguageCode.EN
        assert languages[0].is_default is True

    async def test_transform_with_unknown_language_code(self) -> None:
        """Test transformation handles unknown language codes gracefully."""
        # Create mock locale data with unknown language code
        locale_data = LocalesResponse(
            root=[
                _create_locale(1, "xx", "Unknown Language"),  # type: ignore[list-item]  # Unknown language code
            ]
        )

        # Transform - should not raise exception
        languages = await transform_strapi_locales_to_languages(locale_data)

        # Should fallback to EN for unknown code
        assert len(languages) == 1
        assert languages[0].code == LanguageCode.EN

    async def test_transform_with_pycountry_lookup_error(self) -> None:
        """Test transformation handles pycountry lookup errors."""
        # Create mock locale data
        locale_data = LocalesResponse(
            root=[
                _create_locale(1, "en", "English", is_default=True),  # type: ignore[list-item]
            ]
        )

        # Mock pycountry to raise LookupError
        with patch("affilibuster_backend.infrastructure.api.routes.languages.pycountry.languages.get") as mock_get:
            mock_get.side_effect = LookupError("Language not found")

            # Transform - should not raise exception
            languages = await transform_strapi_locales_to_languages(locale_data)

            # Should still create language with fallback native name
            assert len(languages) == 1
            assert languages[0].native_name == "EN"  # Fallback to uppercase code

    async def test_transform_with_pycountry_attribute_error(self) -> None:
        """Test transformation handles pycountry attribute errors."""
        # Create mock locale data
        locale_data = LocalesResponse(
            root=[
                _create_locale(1, "it", "Italian"),  # type: ignore[list-item]
            ]
        )

        # Mock pycountry to raise AttributeError
        with patch("affilibuster_backend.infrastructure.api.routes.languages.pycountry.languages.get") as mock_get:
            mock_get.side_effect = AttributeError("No name attribute")

            # Transform - should not raise exception
            languages = await transform_strapi_locales_to_languages(locale_data)

            # Should still create language with fallback native name
            assert len(languages) == 1
            assert languages[0].native_name == "IT"  # Fallback to uppercase code

    async def test_transform_with_rtl_language(self) -> None:
        """Test transformation correctly identifies RTL languages."""
        # Create mock locale data with Hebrew (RTL)
        locale_data = LocalesResponse(
            root=[
                _create_locale(1, "he", "Hebrew"),  # type: ignore[list-item]
            ]
        )

        # Transform
        languages = await transform_strapi_locales_to_languages(locale_data)

        # Hebrew should be RTL
        assert len(languages) == 1
        assert languages[0].direction == Direction.RTL

    async def test_transform_with_ltr_language(self) -> None:
        """Test transformation correctly identifies LTR languages."""
        # Create mock locale data with English (LTR)
        locale_data = LocalesResponse(
            root=[
                _create_locale(1, "en", "English", is_default=True),  # type: ignore[list-item]
            ]
        )

        # Transform
        languages = await transform_strapi_locales_to_languages(locale_data)

        # English should be LTR
        assert len(languages) == 1
        assert languages[0].direction == Direction.LTR

    async def test_transform_with_custom_currency_mapping(self) -> None:
        """Test transformation applies correct currency mappings."""
        # Create mock locale data with Italian (EUR) and Hebrew (ILS)
        locale_data = LocalesResponse(
            root=[
                _create_locale(1, "it", "Italian"),  # type: ignore[list-item]
                _create_locale(2, "he", "Hebrew"),  # type: ignore[list-item]
                _create_locale(3, "en", "English", is_default=True),  # type: ignore[list-item]
            ]
        )

        # Transform
        languages = await transform_strapi_locales_to_languages(locale_data)

        # Check currency mappings
        it_lang = next(lang for lang in languages if lang.code == LanguageCode.IT)
        he_lang = next(lang for lang in languages if lang.code == LanguageCode.HE)
        en_lang = next(lang for lang in languages if lang.code == LanguageCode.EN)

        assert it_lang.default_currency == CurrencyCode.EUR
        assert he_lang.default_currency == CurrencyCode.ILS
        assert en_lang.default_currency == CurrencyCode.USD

    async def test_transform_sorting_english_first(self) -> None:
        """Test transformation sorts English first."""
        # Create mock locale data in non-English-first order
        locale_data = LocalesResponse(
            root=[
                _create_locale(1, "it", "Italian"),  # type: ignore[list-item]
                _create_locale(2, "he", "Hebrew"),  # type: ignore[list-item]
                _create_locale(3, "en", "English", is_default=True),  # type: ignore[list-item]
            ]
        )

        # Transform
        languages = await transform_strapi_locales_to_languages(locale_data)

        # English should be first
        assert languages[0].code == LanguageCode.EN

    async def test_transform_with_empty_locale_list(self) -> None:
        """Test transformation handles empty locale list."""
        # Create mock locale data with empty list
        locale_data = LocalesResponse(root=[])

        # Transform
        languages = await transform_strapi_locales_to_languages(locale_data)

        # Should return empty list
        assert len(languages) == 0

    async def test_transform_url_prefix_generation(self) -> None:
        """Test transformation generates correct URL prefixes."""
        # Create mock locale data
        locale_data = LocalesResponse(
            root=[
                _create_locale(1, "en", "English", is_default=True),  # type: ignore[list-item]
                _create_locale(2, "it", "Italian"),  # type: ignore[list-item]
            ]
        )

        # Transform
        languages = await transform_strapi_locales_to_languages(locale_data)

        # Check URL prefixes
        en_lang = next(lang for lang in languages if lang.code == LanguageCode.EN)
        it_lang = next(lang for lang in languages if lang.code == LanguageCode.IT)

        assert en_lang.url_prefix == "/en"
        assert it_lang.url_prefix == "/it"

    async def test_transform_flag_emoji_generation(self) -> None:
        """Test transformation generates flag emojis."""
        # Create mock locale data
        locale_data = LocalesResponse(
            root=[
                _create_locale(1, "en", "English", is_default=True),  # type: ignore[list-item]
            ]
        )

        # Transform
        languages = await transform_strapi_locales_to_languages(locale_data)

        # Should have flag emoji (UK flag for English)
        assert len(languages) == 1
        assert languages[0].flag == "🇬🇧"
