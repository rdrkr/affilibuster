# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
User preferences API routes.

Reference: contracts/api-v1.yaml:178-233
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.config import get_db
from src.infrastructure.database.repositories.preferences_repository import UserPreferencesRepository
from src.infrastructure.database.repositories.currency_repository import CurrencyRepository
from src.infrastructure.cache.redis_cache import RedisCacheService
from src.infrastructure.api.models.preferences import (
    UserPreferencesResponse,
    UpdatePreferencesRequest,
)
from src.infrastructure.api.models.errors import ErrorResponse
from src.domain.use_cases.get_user_preferences import GetUserPreferences
from src.domain.use_cases.update_user_preferences import UpdateUserPreferences
from src.domain.entities.user_preferences import UserPreferences


router = APIRouter(prefix='/v1/user/preferences', tags=['preferences'])


@router.get('', response_model=UserPreferencesResponse, responses={404: {'model': ErrorResponse}})
async def get_preferences(
    x_session_id: str = Header(..., alias='X-Session-Id'),
    db: AsyncSession = Depends(get_db),
):
    """
    Get user preferences by session ID.

    Uses cache-aside pattern for performance.
    """
    import uuid as uuid_lib
    import re

    # Validate session ID format (should be UUID or valid session format)
    # If invalid, generate a new valid UUID
    is_valid_uuid = False
    try:
        uuid_lib.UUID(x_session_id)
        is_valid_uuid = True
    except (ValueError, AttributeError):
        # Check if it's a valid session format (alphanumeric with hyphens)
        if re.match(r'^[a-zA-Z0-9-]+$', x_session_id) and len(x_session_id) <= 64:
            # Valid session format, use as-is
            pass
        else:
            # Invalid format, generate new session ID
            x_session_id = str(uuid_lib.uuid4())

    # Create repositories and use case
    prefs_repo = UserPreferencesRepository(db)
    cache_service = RedisCacheService()
    use_case = GetUserPreferences(prefs_repo, cache_service)

    # Execute use case
    prefs = await use_case.execute(x_session_id)

    if not prefs:
        # Create new preferences with defaults for new session
        from src.domain.entities.user_preferences import UserPreferences
        prefs = UserPreferences(
            session_id=x_session_id,
            selected_currency='USD',
            dismissed_language_prompt=False,
            detected_language=None,
        )
        # Save the new preferences
        update_use_case = UpdateUserPreferences(prefs_repo, cache_service)
        prefs = await update_use_case.execute(prefs)

    # Convert to response model
    return UserPreferencesResponse(
        id=prefs.id,
        session_id=prefs.session_id,
        selected_currency=prefs.selected_currency,
        dismissed_language_prompt=prefs.dismissed_language_prompt,
        detected_language=prefs.detected_language,
        created_at=prefs.created_at,
        updated_at=prefs.updated_at,
        expires_at=prefs.expires_at,
    )


@router.put('', response_model=UserPreferencesResponse, responses={400: {'model': ErrorResponse}})
async def update_preferences(
    request: UpdatePreferencesRequest,
    x_session_id: str = Header(..., alias='X-Session-Id'),
    db: AsyncSession = Depends(get_db),
):
    """
    Update user preferences.

    Updates both database and cache, refreshing TTL to 30 days.
    """
    # Validate currency if provided
    if request.selectedCurrency:
        currency_repo = CurrencyRepository(db)
        currency = await currency_repo.get_by_code(request.selectedCurrency)
        if not currency:
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    error='Bad Request',
                    message=f"Invalid currency code: {request.selectedCurrency}",
                    code='INVALID_CURRENCY',
                ).model_dump(mode='json'),
            )

    # Create repositories and use case
    prefs_repo = UserPreferencesRepository(db)
    cache_service = RedisCacheService()
    use_case = UpdateUserPreferences(prefs_repo, cache_service)

    # Get existing preferences or create new
    existing = await prefs_repo.get_by_session(x_session_id)

    if existing:
        # Update existing
        if request.selectedCurrency:
            existing.selected_currency = request.selectedCurrency
        if request.dismissedLanguagePrompt is not None:
            existing.dismissed_language_prompt = request.dismissedLanguagePrompt
        if request.detectedLanguage:
            existing.detected_language = request.detectedLanguage
        prefs = existing
    else:
        # Create new
        prefs = UserPreferences(
            session_id=x_session_id,
            selected_currency=request.selectedCurrency or 'USD',
            dismissed_language_prompt=request.dismissedLanguagePrompt or False,
            detected_language=request.detectedLanguage,
        )

    # Execute use case
    updated = await use_case.execute(prefs)

    # Convert to response model
    return UserPreferencesResponse(
        id=updated.id,
        session_id=updated.session_id,
        selected_currency=updated.selected_currency,
        dismissed_language_prompt=updated.dismissed_language_prompt,
        detected_language=updated.detected_language,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
        expires_at=updated.expires_at,
    )
