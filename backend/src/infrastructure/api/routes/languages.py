# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Language API routes - proxies to Strapi i18n API.

Reference: contracts/affilibuster.openapi.yaml

Architecture: Clean architecture pattern with use cases and dependency injection.
All language data comes from Strapi's built-in i18n plugin (/api/i18n/locales).
"""

from typing import Any

from fastapi import APIRouter, HTTPException

from infrastructure.api.models import (
    DetectedLanguage,
    Language,
)
from infrastructure.api.models.generated.models import (
    LanguagesDetectPostRequest,
    LanguagesGetResponse,
)
from infrastructure.dependencies import StrapiProxyGetUseCaseDep

router = APIRouter(prefix="/languages", tags=["languages"])


async def transform_strapi_locales_to_languages(
    locale_data: dict[str, Any],
) -> list[Language]:
    """
    Transform Strapi locale data to Language model format.

    Maps Strapi locales: { id, name, code, isDefault }
    To Language format: { code, displayName, nativeName, direction, urlPrefix, defaultCurrency, localeCode, isDefault }
    """
    # Strapi i18n endpoint returns list directly, not wrapped in 'data' key
    locales = locale_data if isinstance(locale_data, list) else locale_data.get("data", [])

    languages = []
    for locale in locales:
        lang = Language(
            code=locale.get("code", ""),
            displayName=locale.get("name", ""),
            nativeName=locale.get("name", ""),  # Fallback to name
            direction="rtl" if locale.get("code") == "he" else "ltr",  # Hebrew is RTL
            urlPrefix=f"/{locale.get('code', '')}",
            defaultCurrency=("USD" if locale.get("code") != "it" else "EUR"),  # Default to USD, EUR for Italian
            localeCode=locale.get("code", ""),
            isDefault=locale.get("isDefault", False),
        )
        languages.append(lang)

    return sorted(languages, key=lambda x: (x.code != "en", x.code))


@router.get("", response_model=LanguagesGetResponse)
async def get_languages(
    use_case: StrapiProxyGetUseCaseDep,
):
    """
    Get all active languages from Strapi i18n API.

    Returns list of configured locales sorted by language code.
    """
    try:
        locale_data = await use_case.execute("/i18n/locales")

        # Transform to Language model format
        languages = await transform_strapi_locales_to_languages(locale_data)
        return languages

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch languages from Strapi: {e!s}",
        )


@router.post("/detect", response_model=DetectedLanguage)
async def detect_language(
    request: LanguagesDetectPostRequest,
    use_case: StrapiProxyGetUseCaseDep,
):
    """
    Detect user language from Accept-Language header.

    Returns detected language with confidence and suggestion.
    """
    try:
        # Parse browser languages from Accept-Language header
        accept_language = request.acceptLanguage or ""
        browser_languages = []
        if accept_language:
            # Extract language codes from Accept-Language header
            for part in accept_language.split(","):
                lang = part.split(";")[0].strip()
                if lang:
                    browser_languages.append(lang)

        # Get available languages from Strapi
        locale_data = await use_case.execute("/i18n/locales")
        languages = await transform_strapi_locales_to_languages(locale_data)
        available_codes = {lang.code for lang in languages}

        # Find first browser language that's available
        detected_lang = "en"
        confidence = 0.5  # Default low confidence

        for idx, browser_lang in enumerate(browser_languages):
            lang_code = browser_lang.split("-")[0].lower()
            if lang_code in available_codes:
                detected_lang = lang_code
                # Higher confidence for languages earlier in Accept-Language list
                confidence = max(0.9 - (idx * 0.1), 0.6)
                break

        # Return detected language with confidence
        return DetectedLanguage(
            detectedLanguage=detected_lang,
            confidence=confidence,
            shouldPrompt=confidence < 0.9,  # Prompt if not very confident
            suggestedUrl=None,
        )

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to detect language: {e!s}",
        )
