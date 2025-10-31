# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
User preferences API routes.

Reference: contracts/api-v1.yaml:178-233

Architecture: Clean architecture pattern with use cases and dependency injection.
Validates user preferences against Strapi currency data.
"""

from datetime import datetime

from fastapi import APIRouter, Header, HTTPException

from domain.entities.user_preferences import UserPreferences
from infrastructure.api.models import (
    Error,
    UpdatePreferences,
)
from infrastructure.api.models import UserPreferences as UserPreferencesModel
from infrastructure.dependencies import (
    GetUserPreferencesUseCaseDep,
    PreferencesRepoDep,
    StrapiProxyGetUseCaseDep,
    UpdateUserPreferencesUseCaseDep,
)

router = APIRouter(prefix="/user/preferences", tags=["preferences"])


async def validate_currency_code(
    code: str,
    use_case: StrapiProxyGetUseCaseDep,
) -> bool:
    """
    Validate that a currency code exists in Strapi.

    Returns True if the currency code is valid and active, False otherwise.
    """
    try:
        currency_data = await use_case.execute(
            "/currencies",
            params={"pagination[pageSize]": "100"},
        )

        # Check if currency code exists and is active
        currencies_list = currency_data if isinstance(currency_data, list) else currency_data.get("data", [])
        for curr in currencies_list:
            curr_attrs = curr.get("attributes", curr)
            if curr_attrs.get("code") == code and curr_attrs.get("isActive", True):
                return True
        return False
    except Exception:
        # On any error, we can't validate, so return False
        return False


@router.get("", response_model=UserPreferencesModel, responses={404: {"model": Error}})
async def get_preferences(
    get_use_case: GetUserPreferencesUseCaseDep,
    update_use_case: UpdateUserPreferencesUseCaseDep,
    x_session_id: str = Header(..., alias="X-Session-Id"),
    x_user_id: str = Header(None, alias="X-User-Id"),
):
    """
    Get user preferences by session ID or user ID.

    Uses cache-aside pattern for performance.
    """
    import re
    import uuid as uuid_lib

    # Validate session ID format (should be UUID or valid session format)
    # If invalid, generate a new valid UUID
    try:
        uuid_lib.UUID(x_session_id)
    except (ValueError, AttributeError):
        # Check if it's a valid session format (alphanumeric with hyphens)
        if re.match(r"^[a-zA-Z0-9-]+$", x_session_id) and len(x_session_id) <= 64:
            # Valid session format, use as-is
            pass
        else:
            # Invalid format, generate new session ID
            x_session_id = str(uuid_lib.uuid4())

    # Execute use case
    prefs = await get_use_case.execute(x_session_id)

    if not prefs:
        # Create new preferences with defaults for new session
        prefs = UserPreferences(
            session_id=x_session_id,
            selected_currency="USD",
            dismissed_language_prompt=False,
            detected_language=None,
        )
        # Save the new preferences
        prefs = await update_use_case.execute(prefs)

    # Convert to response model
    return UserPreferencesModel(
        id=prefs.id,
        sessionId=prefs.session_id,
        selectedCurrency=prefs.selected_currency,
        dismissedLanguagePrompt=prefs.dismissed_language_prompt,
        detectedLanguage=prefs.detected_language,
        expiresAt=prefs.expires_at,
    )


@router.put("", response_model=UserPreferencesModel, responses={400: {"model": Error}})
async def update_preferences(
    request: UpdatePreferences,
    strapi_use_case: StrapiProxyGetUseCaseDep,
    update_use_case: UpdateUserPreferencesUseCaseDep,
    prefs_repo: PreferencesRepoDep,
    x_session_id: str = Header(..., alias="X-Session-Id"),
):
    """
    Update user preferences.

    Updates both database and cache, refreshing TTL to 30 days.
    """
    # Validate currency if provided
    if request.selectedCurrency:
        is_valid = await validate_currency_code(request.selectedCurrency, strapi_use_case)
        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail=Error(
                    error="Bad Request",
                    message=f"Invalid currency code: {request.selectedCurrency}",
                    code="INVALID_CURRENCY",
                    timestamp=datetime.utcnow(),
                ).model_dump(mode="json"),
            )

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
            selected_currency=request.selectedCurrency or "USD",
            dismissed_language_prompt=request.dismissedLanguagePrompt or False,
            detected_language=request.detectedLanguage,
        )

    # Execute use case
    updated = await update_use_case.execute(prefs)

    # Convert to response model
    return UserPreferencesModel(
        id=updated.id,
        sessionId=updated.session_id,
        selectedCurrency=updated.selected_currency,
        dismissedLanguagePrompt=updated.dismissed_language_prompt,
        detectedLanguage=updated.detected_language,
        expiresAt=updated.expires_at,
    )
