# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Consent API routes.

Provides endpoints for recording consent decisions for GDPR compliance.
Consent banner configuration is served by auto-generated CMS proxy routes
(/consent for page content, /consent-categories for category definitions).
"""

from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Header, HTTPException, Request

from affilibuster_backend.domain.entities.generated.models import (
    ConsentAction,
    Error,
    RecordConsentRequest,
    RecordConsentResponse,
)
from affilibuster_backend.infrastructure.dependencies import RecordConsentUseCaseDep

router = APIRouter(prefix="/consent", tags=["consent"])


@router.post("", status_code=201, responses={400: {"model": Error}})
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
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    return await use_case.execute(
        consent_request=body,
        session_id=x_session_id,
        ip_address=ip_address,
        user_agent=user_agent,
    )
