# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
User preferences API routes.

Reference: contracts/api-v1.yaml:178-233

Architecture: Clean architecture pattern with use cases and dependency injection.
Validates user preferences against Strapi currency data.
"""

import re
import uuid as uuid_lib
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Header, HTTPException

from affilibuster_backend.domain.entities import (
    Error,
    UpdatePreferences,
)
from affilibuster_backend.domain.entities import UserPreferences as UserPreferencesModel
from affilibuster_backend.domain.entities.generated.models import CurrenciesGetResponse
from affilibuster_backend.domain.entities.user_preferences import UserPreferences
from affilibuster_backend.infrastructure.dependencies import (
    GetCMSContentUseCaseDep,
    GetUserPreferencesUseCaseDep,
    PreferencesRepoDep,
    UpdateUserPreferencesUseCaseDep,
)

router = APIRouter(prefix="/user/preferences", tags=["preferences"])

# Maximum length for session ID validation (alphanumeric with hyphens)
MAX_SESSION_ID_LENGTH = 64


async def validate_currency_code(
    code: str,
    use_case: GetCMSContentUseCaseDep,
) -> bool:
    """
    Validate that a currency code exists in Strapi.

    Returns True if the currency code is valid and active, False otherwise.
    """
    try:
        currency_data = await use_case.execute(
            "/currencies",
            response_model=CurrenciesGetResponse,
        )

        # Check if currency code exists and is active
        # currency_data is a Pydantic CurrenciesGetResponse model with a 'data' field
        return any(curr.code == code and curr.is_active for curr in currency_data.data)
    except Exception:  # noqa: BLE001
        # On any error (network, parsing, CMS unavailable), we can't validate, so return False
        return False


@router.get("", responses={404: {"model": Error}})
async def get_preferences(
    get_use_case: GetUserPreferencesUseCaseDep,
    update_use_case: UpdateUserPreferencesUseCaseDep,
    x_session_id: Annotated[str, Header(alias="X-Session-Id")],
    _x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
) -> UserPreferencesModel:
    """
    Get user preferences by session ID or user ID.

    Uses cache-aside pattern for performance.
    """
    # Validate session ID format (should be UUID or valid session format)
    # If invalid, generate a new valid UUID
    try:
        uuid_lib.UUID(x_session_id)
    except (ValueError, AttributeError):
        # Check if it's a valid session format (alphanumeric with hyphens)
        if re.match(r"^[a-zA-Z0-9-]+$", x_session_id) and len(x_session_id) <= MAX_SESSION_ID_LENGTH:
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


@router.put("", responses={400: {"model": Error}})
async def update_preferences(
    request: UpdatePreferences,
    strapi_use_case: GetCMSContentUseCaseDep,
    update_use_case: UpdateUserPreferencesUseCaseDep,
    prefs_repo: PreferencesRepoDep,
    x_session_id: Annotated[str, Header(alias="X-Session-Id")],
) -> UserPreferencesModel:
    """
    Update user preferences.

    Updates both database and cache, refreshing TTL to 30 days.
    """
    # Validate currency if provided
    if request.selected_currency:
        is_valid = await validate_currency_code(request.selected_currency, strapi_use_case)
        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail=Error(
                    error="Bad Request",
                    message=f"Invalid currency code: {request.selected_currency}",
                    code="INVALID_CURRENCY",
                    timestamp=datetime.now(UTC),
                ).model_dump(mode="json"),
            )

    # Get existing preferences or create new
    existing = await prefs_repo.get_by_session(x_session_id)

    if existing:
        # Update existing
        if request.selected_currency:
            existing.selected_currency = request.selected_currency
        if request.dismissed_language_prompt is not None:
            existing.dismissed_language_prompt = request.dismissed_language_prompt
        if request.detected_language is not None:
            # Convert enum to string value for entity
            existing.detected_language = request.detected_language.value if request.detected_language else None
        prefs = existing
    else:
        # Create new
        prefs = UserPreferences(
            session_id=x_session_id,
            selected_currency=request.selected_currency or "USD",
            dismissed_language_prompt=request.dismissed_language_prompt or False,
            # Convert enum to string value for entity
            detected_language=request.detected_language.value if request.detected_language else None,
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
