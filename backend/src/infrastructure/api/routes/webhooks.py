# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
CMS Webhook routes for content synchronization.

Reference: plan.md:138 (Backend ↔ CMS content synchronization)
"""

from fastapi import APIRouter, Request, Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import logging
import os

from src.infrastructure.database.config import get_db
from src.infrastructure.database.repositories.content_repository import ContentRepository
from src.domain.use_cases.sync_content_from_strapi import SyncContentFromStrapi

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/v1/webhooks', tags=['webhooks'])


@router.post('/strapi')
async def handle_strapi_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_webhook_secret: Optional[str] = Header(None, alias='X-Webhook-Secret'),
):
    """
    Handle Strapi CMS webhook for content updates.

    Syncs content from Strapi to PostgreSQL and triggers ISR revalidation.
    """
    # Optional: Validate webhook secret
    webhook_secret = os.getenv('STRAPI_WEBHOOK_SECRET')
    if webhook_secret and x_webhook_secret != webhook_secret:
        logger.warning("Invalid webhook secret received")
        raise HTTPException(status_code=401, detail='Invalid webhook secret')

    # Parse webhook payload
    payload = await request.json()

    # Log webhook for debugging
    logger.info(f"Received Strapi webhook: {payload.get('event', 'unknown')}")

    # Extract content information
    event = payload.get('event')
    model = payload.get('model')
    entry = payload.get('entry', {})

    if not event or not model or not entry:
        logger.error(f"Invalid webhook payload: {payload}")
        raise HTTPException(status_code=400, detail='Invalid webhook payload')

    # Sync content to PostgreSQL using use case
    content_repo = ContentRepository(db)
    use_case = SyncContentFromStrapi(content_repo)

    try:
        result = await use_case.execute(event, model, entry)
        await db.commit()

        if result:
            logger.info(f"Successfully synced content: {result}")

            # TODO: Trigger frontend ISR revalidation
            # This would call the frontend /api/revalidate endpoint
            # For now, just acknowledge receipt

            return {
                'status': 'success',
                'message': f'Content synced for {event}',
                'result': result,
            }
        else:
            logger.info(f"Webhook received but no action taken for {event}")
            return {
                'status': 'received',
                'message': f'No action required for {event}',
                'event': event,
            }

    except Exception as e:
        logger.error(f"Error syncing content from Strapi: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail=f'Error syncing content: {str(e)}')
