# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Consent API routes.

Provides endpoints for recording consent decisions for GDPR compliance.
Consent banner configuration is served by auto-generated CMS proxy routes
(/consent for page content, /consent-categories for category definitions).

IP addresses are hashed at write time using salted SHA-256 to prevent
storing raw PII while maintaining audit trail integrity (GDPR Art. 5(1)(c)).
"""

from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Header, HTTPException, Request

from affilibuster_backend.config import settings
from affilibuster_backend.domain.entities.generated.models import (
    ConsentAction,
    Error,
    RecordConsentRequest,
    RecordConsentResponse,
)
from affilibuster_backend.domain.services.ip_anonymizer import IPAnonymizer
from affilibuster_backend.infrastructure.dependencies import RecordConsentUseCaseDep

router = APIRouter(prefix="/consent", tags=["consent"])

_ip_anonymizer = IPAnonymizer()


@router.post("", status_code=201, responses={400: {"model": Error}, 429: {"description": "Rate limit exceeded"}})
async def record_consent(
    body: RecordConsentRequest,
    use_case: RecordConsentUseCaseDep,
    request: Request,
    x_session_id: Annotated[str | None, Header(alias="X-Session-Id")] = None,
) -> RecordConsentResponse:
    """
    Record a consent event.

    Creates an immutable audit trail entry for GDPR compliance.
    Accepts requests from both authenticated and anonymous users.
    IP addresses are hashed before storage to avoid persisting raw PII.
    """
    # Validate consent type and action combination
    if body.action == ConsentAction.ACCEPT_ALL and body.categories.necessary is not True:
        raise HTTPException(
            status_code=400,
            detail=Error(
                error="Bad Request",
                message="Necessary cookies must be accepted",
                code="INVALID_CONSENT",
                timestamp=datetime.now(UTC),
            ).model_dump(mode="json"),
        )

    # Extract client metadata for audit trail
    # Hash IP address instead of storing raw PII (GDPR Art. 5(1)(c))
    raw_ip = request.client.host if request.client else None
    ip_address_hash = _ip_anonymizer.hash_ip(raw_ip, settings.ip_hash_salt) if raw_ip else None

    return await use_case.execute(
        consent_request=body,
        session_id=x_session_id,
        ip_address=ip_address_hash,
        user_agent=None,
    )
