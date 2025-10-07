# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Language API routes.

Reference: contracts/api-v1.yaml:76-121
"""

from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.config import get_db
from src.infrastructure.database.repositories.language_repository import LanguageRepository
from src.infrastructure.api.models.languages import (
    LanguageResponse,
    DetectLanguageRequest,
    DetectedLanguageResponse,
)
from src.domain.use_cases.get_all_languages import GetAllLanguages
from src.domain.use_cases.detect_user_language import DetectUserLanguage


router = APIRouter(prefix='/v1/languages', tags=['languages'])


@router.get('', response_model=List[LanguageResponse])
async def get_languages(db: AsyncSession = Depends(get_db)):
    """
    Get all active languages.

    Returns list of available languages sorted by sort_order.
    """
    # Create repository and use case
    repo = LanguageRepository(db)
    use_case = GetAllLanguages(repo)

    # Execute use case
    languages = await use_case.execute()

    # Convert to response models
    return [
        LanguageResponse(
            code=lang.code,
            display_name=lang.display_name,
            native_name=lang.native_name,
            direction=lang.direction,
            url_prefix=lang.url_prefix,
            default_currency=lang.default_currency,
            locale_code=lang.locale_code,
            is_default=lang.is_default,
            is_active=lang.is_active,
            sort_order=lang.sort_order,
        )
        for lang in languages
    ]


@router.post('/detect', response_model=DetectedLanguageResponse)
async def detect_language(
    request: DetectLanguageRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Detect user language from Accept-Language header and other signals.

    Returns detected language with confidence score.
    """
    # Create repository and use case
    repo = LanguageRepository(db)
    use_case = DetectUserLanguage(repo)

    # Execute use case
    result = await use_case.execute(
        accept_language=request.acceptLanguage,
        user_agent=request.userAgent,
        country_code=request.countryCode,
    )

    # Parse browser languages from Accept-Language header
    browser_languages = []
    if request.acceptLanguage:
        # Extract language codes from Accept-Language header
        for part in request.acceptLanguage.split(','):
            lang = part.split(';')[0].strip()
            if lang:
                browser_languages.append(lang)

    # Determine fallback language (always English)
    default_lang = await repo.get_default()
    fallback = default_lang.code if default_lang else 'en'

    # Convert to response model
    return DetectedLanguageResponse(
        detected=result.language_code,
        preferred=result.language_code,
        browser_languages=browser_languages,
        fallback=fallback,
    )
