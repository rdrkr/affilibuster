# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Language API routes - proxies to Strapi i18n API.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All language data comes from Strapi's built-in i18n plugin (/api/i18n/locales).
"""

from fastapi import APIRouter, HTTPException

from affilibuster_backend.domain.entities import (
    DetectedLanguage,
    Language,
)
from affilibuster_backend.domain.entities.generated.models import (
    Code,
    CurrencyCode,
    DetectedLanguage1,
    Direction,
    LanguagesDetectPostRequest,
    LanguagesGetResponse,
    LocalesGetResponse,
)
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

router = APIRouter(prefix="/languages", tags=["languages"])

# Language detection confidence threshold - prompt user if below this value
LANGUAGE_DETECTION_CONFIDENCE_THRESHOLD = 0.9


async def transform_strapi_locales_to_languages(
    locale_data: LocalesGetResponse,
) -> list[Language]:
    """
    Transform Strapi locale data to Language model format.

    Maps Strapi locales: { id, name, code, isDefault }
    To Language format: { code, displayName, nativeName, direction, urlPrefix, defaultCurrency, localeCode, isDefault }
    """
    # LocalesGetResponse is a RootModel - access .root to get the list
    locales = locale_data.root

    # Map string codes to Code enum
    code_map = {
        "en": Code.EN,
        "it": Code.IT,
        "he": Code.HE,
    }

    languages = []
    for locale in locales:
        # Access Pydantic model attributes (use snake_case field names)
        code_str = locale.code
        code_enum = code_map.get(code_str, Code.EN)  # Default to EN if unknown

        lang = Language(
            code=code_enum,
            display_name=locale.name,
            native_name=locale.name,  # Fallback to name
            direction=Direction.RTL if code_enum == Code.HE else Direction.LTR,  # Hebrew is RTL
            url_prefix=f"/{code_str}",
            default_currency=CurrencyCode.EUR if code_enum == Code.IT else CurrencyCode.USD,
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
        locale_data = await use_case.execute(
            "/i18n/locales",
            response_model=LocalesGetResponse,
        )

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
        locale_data = await use_case.execute(
            "/i18n/locales",
            response_model=LocalesGetResponse,
        )
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
                confidence = max(0.9 - (idx * 0.1), 0.6)
                break

        # Return detected language with confidence
        return DetectedLanguage(
            detected_language=detected_lang,
            confidence=confidence,
            should_prompt=confidence < LANGUAGE_DETECTION_CONFIDENCE_THRESHOLD,  # Prompt if not very confident
            suggested_url=None,
        )

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to detect language: {e!s}",
        ) from e
