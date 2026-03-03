# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Newsletter API routes.

Provides endpoints for subscribing to and unsubscribing from the newsletter
via the configured email marketing provider (e.g., Brevo).

Records GDPR consent audit trail entries on subscribe (consent acceptance)
and unsubscribe (consent withdrawal). IP addresses are hashed before storage
to avoid persisting raw PII (GDPR Art. 5(1)(c)).
"""

import logging
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Header, HTTPException, Request

from affilibuster_backend.config import settings
from affilibuster_backend.domain.entities.generated.models import (
    ConsentAction,
    ConsentCategories,
    ConsentType,
    Error,
    NewsletterSubscribeRequest,
    NewsletterSubscribeResponse,
    NewsletterUnsubscribeRequest,
    NewsletterUnsubscribeResponse,
    RecordConsentRequest,
)
from affilibuster_backend.domain.services.ip_anonymizer import IPAnonymizer
from affilibuster_backend.domain.services.newsletter_service import (
    NewsletterSubscribeError,
    NewsletterUnsubscribeError,
)
from affilibuster_backend.infrastructure.dependencies import (
    RecordConsentUseCaseDep,
    SubscribeNewsletterUseCaseDep,
    UnsubscribeNewsletterUseCaseDep,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

_ip_anonymizer = IPAnonymizer()


@router.post(
    "/subscribe",
    responses={
        400: {"model": Error},
        502: {"model": Error},
    },
)
async def subscribe_newsletter(
    body: NewsletterSubscribeRequest,
    use_case: SubscribeNewsletterUseCaseDep,
    consent_use_case: RecordConsentUseCaseDep,
    request: Request,
    x_session_id: Annotated[str | None, Header(alias="X-Session-Id")] = None,
) -> NewsletterSubscribeResponse:
    """
    Subscribe an email address to the newsletter.

    Proxies the subscription to the configured email marketing provider
    and records a GDPR consent audit trail entry.
    """
    try:
        result = await use_case.execute(email=body.email)
    except NewsletterSubscribeError as e:
        raise HTTPException(
            status_code=502,
            detail=Error(
                error="Bad Gateway",
                message=str(e),
                code="NEWSLETTER_PROVIDER_ERROR",
                timestamp=datetime.now(UTC),
            ).model_dump(mode="json"),
        ) from e

    # Record consent acceptance in audit trail (GDPR Art. 7(1))
    # Wrapped in try/except: consent recording must not fail the subscription
    # response since the email was already sent by the provider.
    try:
        raw_ip = request.client.host if request.client else None
        ip_hash = _ip_anonymizer.hash_ip(raw_ip, settings.ip_hash_salt) if raw_ip else None

        await consent_use_case.execute(
            consent_request=RecordConsentRequest(
                consent_type=ConsentType.NEWSLETTER,
                categories=ConsentCategories(necessary=True),
                action=ConsentAction.ACCEPT_ALL,
            ),
            session_id=x_session_id,
            ip_address=ip_hash,
            user_agent=None,
        )
    except Exception:
        logger.exception("Failed to record newsletter subscribe consent for %s", body.email)

    return result


@router.post(
    "/unsubscribe",
    responses={
        401: {"model": Error},
        502: {"model": Error},
    },
)
async def unsubscribe_newsletter(
    body: NewsletterUnsubscribeRequest,
    use_case: UnsubscribeNewsletterUseCaseDep,
    consent_use_case: RecordConsentUseCaseDep,
    request: Request,
    x_session_id: Annotated[str | None, Header(alias="X-Session-Id")] = None,
) -> NewsletterUnsubscribeResponse:
    """
    Unsubscribe an email address from the newsletter.

    Removes the email from the mailing list via the configured
    email marketing provider and records a consent withdrawal.
    """
    try:
        result = await use_case.execute(email=body.email)
    except NewsletterUnsubscribeError as e:
        raise HTTPException(
            status_code=502,
            detail=Error(
                error="Bad Gateway",
                message=str(e),
                code="NEWSLETTER_PROVIDER_ERROR",
                timestamp=datetime.now(UTC),
            ).model_dump(mode="json"),
        ) from e

    # Record consent withdrawal in audit trail (GDPR Art. 7(3))
    # Wrapped in try/except: consent recording must not fail the unsubscription
    # response since the provider action was already completed.
    try:
        raw_ip = request.client.host if request.client else None
        ip_hash = _ip_anonymizer.hash_ip(raw_ip, settings.ip_hash_salt) if raw_ip else None

        await consent_use_case.execute(
            consent_request=RecordConsentRequest(
                consent_type=ConsentType.NEWSLETTER,
                categories=ConsentCategories(necessary=True),
                action=ConsentAction.REVOKE,
            ),
            session_id=x_session_id,
            ip_address=ip_hash,
            user_agent=None,
        )
    except Exception:
        logger.exception("Failed to record newsletter unsubscribe consent for %s", body.email)

    return result
