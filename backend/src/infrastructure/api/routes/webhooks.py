# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
CMS Webhook routes for content synchronization.

Reference: plan.md:138 (Backend ↔ CMS content synchronization)
"""

from fastapi import APIRouter, Request, Header, HTTPException
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/v1/webhooks', tags=['webhooks'])


@router.post('/strapi')
async def handle_strapi_webhook(
    request: Request,
    x_webhook_secret: Optional[str] = Header(None, alias='X-Webhook-Secret'),
):
    """
    Handle Strapi CMS webhook for content updates.

    Triggers ISR revalidation on frontend when content is updated.
    """
    # Optional: Validate webhook secret
    # if x_webhook_secret != os.getenv('WEBHOOK_SECRET'):
    #     raise HTTPException(status_code=401, detail='Invalid webhook secret')

    # Parse webhook payload
    payload = await request.json()

    # Log webhook for debugging
    logger.info(f"Received Strapi webhook: {payload.get('event', 'unknown')}")

    # Extract content information
    event = payload.get('event')
    model = payload.get('model')
    entry = payload.get('entry', {})

    # Handle different webhook events
    if event in ['entry.create', 'entry.update', 'entry.publish']:
        # Content was created or updated
        content_id = entry.get('id')
        logger.info(f"Content {content_id} {event} - model: {model}")

        # TODO: Trigger frontend ISR revalidation
        # This would call the frontend /api/revalidate endpoint
        # For now, just acknowledge receipt

        return {
            'status': 'success',
            'message': f'Webhook processed for {event}',
            'content_id': content_id,
        }

    elif event == 'entry.delete':
        # Content was deleted
        content_id = entry.get('id')
        logger.info(f"Content {content_id} deleted")

        return {
            'status': 'success',
            'message': 'Content deletion processed',
            'content_id': content_id,
        }

    # Unknown event type
    return {
        'status': 'received',
        'event': event,
    }
