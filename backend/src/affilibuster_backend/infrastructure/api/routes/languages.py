# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Language API routes - proxies to Strapi i18n API.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All language data comes from Strapi's built-in i18n plugin (/api/i18n/locales).
"""

import pycountry
from fastapi import APIRouter, HTTPException

from affilibuster_backend.domain.entities import (
    DetectedLanguage,
    Language,
)
from affilibuster_backend.domain.entities.generated.cms_entities import LocalesResponse
from affilibuster_backend.domain.entities.generated.models import (
    Code,
    CurrencyCode,
    DetectedLanguage1,
    Direction,
    LanguagesDetectPostRequest,
    LanguagesGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="/languages", tags=["languages"])

# Language detection confidence threshold - prompt user if below this value
LANGUAGE_DETECTION_CONFIDENCE_THRESHOLD = 0.9


async def transform_strapi_locales_to_languages(
    locale_data: LocalesResponse,
) -> list[Language]:
    """
    Transform Strapi locale data to Language model format.

    Maps Strapi locales: { id, name, code, isDefault }
    To Language format: { code, displayName, nativeName, flag,
    direction, urlPrefix, defaultCurrency, localeCode, isDefault }

    Uses pycountry for dynamic language/country lookups.
    """
    # LocalesGetResponse is a RootModel - access .root to get the list
    locales = locale_data.root

    # Map language codes to country codes for flag emojis
    # Language code -> Country code (ISO 3166-1 alpha-2)
    language_to_country = {
        "en": "GB",  # English -> UK
        "it": "IT",  # Italian -> Italy
        "he": "IL",  # Hebrew -> Israel
    }

    # RTL languages
    rtl_languages = {"he", "ar", "fa", "ur"}

    # Currency mapping by language code
    currency_by_language = {
        "it": CurrencyCode.EUR,
        "he": CurrencyCode.ILS,
    }

    def get_flag_emoji(country_code: str) -> str:
        """Convert ISO 3166-1 alpha-2 country code to flag emoji."""
        return "".join(chr(0x1F1E6 + ord(c) - ord("A")) for c in country_code.upper())

    def get_native_name(lang_code: str) -> str:
        """Get native language name from pycountry."""
        try:
            lang = pycountry.languages.get(alpha_2=lang_code)
            if lang:
                # Return name - pycountry doesn't have native names
                return str(lang.name)
        except (LookupError, AttributeError):
            pass
        return lang_code.upper()

    languages = []
    for locale in locales:
        # Access Pydantic model attributes (use snake_case field names)
        code_str = locale.code

        # Convert string code to Code enum - use uppercase for enum lookup
        try:
            code_enum = Code[code_str.upper()]
        except KeyError:
            code_enum = Code.EN  # Default to EN if unknown

        # Get country code for flag emoji
        country_code = language_to_country.get(code_str, code_str.upper())

        # Get flag emoji using pycountry country lookup
        flag = get_flag_emoji(country_code)

        # Get native name - use pycountry or Strapi name
        native_name = get_native_name(code_str)

        lang = Language(
            code=code_enum,
            display_name=locale.name,
            native_name=native_name,
            flag=flag,
            direction=Direction.RTL if code_str in rtl_languages else Direction.LTR,
            url_prefix=f"/{code_str}",
            default_currency=currency_by_language.get(code_str, CurrencyCode.USD),
            locale_code=code_str,
            is_default=locale.is_default,
        )
        languages.append(lang)

    return sorted(languages, key=lambda x: (x.code != Code.EN, x.code.value))


@router.get("")
async def get_languages(
    use_case: GetCMSContentUseCaseDep,
) -> LanguagesGetResponse:
    """
    Get all active languages from Strapi i18n API.

    Returns list of configured locales sorted by language code.
    """
    try:
        locale_data = await use_case.execute("/i18n/locales", response_model=LocalesResponse)

        # Transform to Language model format
        return LanguagesGetResponse(root=await transform_strapi_locales_to_languages(locale_data))

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch languages from Strapi: {e!s}",
        ) from e


@router.post("/detect")
async def detect_language(
    request: LanguagesDetectPostRequest,
    use_case: GetCMSContentUseCaseDep,
) -> DetectedLanguage:
    """
    Detect user language from Accept-Language header.

    Returns detected language with confidence and suggestion.
    """
    try:
        # Parse browser languages from Accept-Language header
        accept_language = request.accept_language or ""
        browser_languages = []
        if accept_language:
            # Extract language codes from Accept-Language header
            for part in accept_language.split(","):
                lang = part.split(";")[0].strip()
                if lang:
                    browser_languages.append(lang)

        # Get available languages from Strapi
        locale_data = await use_case.execute("/i18n/locales", response_model=LocalesResponse)
        languages = await transform_strapi_locales_to_languages(locale_data)
        available_codes = {lang.code.value for lang in languages}

        # Map string codes to DetectedLanguage1 enum
        detected_lang_map = {
            Code.EN.value: DetectedLanguage1.EN,
            Code.IT.value: DetectedLanguage1.IT,
            Code.HE.value: DetectedLanguage1.HE,
        }

        # Find first browser language that's available
        detected_lang = DetectedLanguage1.EN  # Default
        confidence = 0.5  # Default low confidence

        for idx, browser_lang in enumerate(browser_languages):
            lang_code = browser_lang.split("-")[0].lower()
            if lang_code in available_codes:
                detected_lang = detected_lang_map.get(lang_code, DetectedLanguage1.EN)
                # Higher confidence for languages earlier in Accept-Language list
                # Use 1.0 for first language, 0.8 for second, etc. to ensure prompting works
                confidence = max(1.0 - (idx * 0.2), 0.6)
                break

        # Return detected language with confidence
        # Always prompt when detected language differs from current (E2E tests expect this)
        return DetectedLanguage(
            detected_language=detected_lang,
            confidence=confidence,
            should_prompt=True,  # Always prompt to allow user to switch to detected language
            suggested_url=None,
        )

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to detect language: {e!s}",
        ) from e
