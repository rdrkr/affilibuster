# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Strapi CMS repository implementation.

Reference: T077 (ICMSRepository interface), research.md:81-111
"""

import os
import hmac
import hashlib
from typing import Optional, List, Any
import httpx

from src.domain.repositories.cms_repository import ICMSRepository


class StrapiCMSRepository(ICMSRepository):
    """
    Strapi CMS implementation of ICMSRepository.

    Uses Strapi REST API with i18n plugin support.
    """

    def __init__(self, base_url: Optional[str] = None, api_token: Optional[str] = None):
        """
        Initialize Strapi client.

        Args:
            base_url: Strapi API base URL (defaults to environment variable)
            api_token: Strapi API token (defaults to environment variable)
        """
        self.base_url = (base_url or os.getenv('STRAPI_URL', 'http://localhost:1337')).rstrip('/')
        self.api_token = api_token or os.getenv('STRAPI_API_TOKEN', '')
        self.webhook_secret = os.getenv('STRAPI_WEBHOOK_SECRET', '')

    def _get_headers(self) -> dict:
        """Get headers for Strapi API requests."""
        headers = {'Content-Type': 'application/json'}
        if self.api_token:
            headers['Authorization'] = f'Bearer {self.api_token}'
        return headers

    async def get_content(self, content_id: str, locale: str) -> Optional[dict]:
        """
        Get content by ID and locale.

        Args:
            content_id: Content identifier in Strapi
            locale: Locale code (e.g., 'en', 'it', 'he')

        Returns:
            Optional[dict]: Content data if found, None otherwise
        """
        url = f'{self.base_url}/api/contents/{content_id}'
        params = {'locale': locale}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=self._get_headers(), params=params)
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 404:
                    return None
                else:
                    response.raise_for_status()
            except httpx.HTTPError:
                return None

    async def list_content(
        self, locale: str, content_type: str, page: int = 1, page_size: int = 20
    ) -> dict:
        """
        List content by type and locale with pagination.

        Args:
            locale: Locale code
            content_type: Content type (e.g., 'page', 'product', 'article')
            page: Page number (1-indexed)
            page_size: Items per page

        Returns:
            dict: Paginated content list with metadata
        """
        url = f'{self.base_url}/api/{content_type}s'
        params = {
            'locale': locale,
            'pagination[page]': page,
            'pagination[pageSize]': page_size,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()
            return response.json()

    async def sync_content(self, webhook_payload: dict) -> None:
        """
        Process Strapi webhook to sync content.

        Args:
            webhook_payload: Webhook data from Strapi
        """
        # Extract event and model information
        event = webhook_payload.get('event')
        model = webhook_payload.get('model')
        entry = webhook_payload.get('entry', {})

        # Process based on event type
        if event in ['entry.create', 'entry.update']:
            # Sync content to local database
            # This would typically call a use case or service
            pass
        elif event == 'entry.delete':
            # Archive content
            pass
        elif event == 'entry.publish':
            # Publish content
            pass
        elif event == 'entry.unpublish':
            # Unpublish content
            pass

    async def get_content_by_slug(self, slug: str, locale: str, content_type: str) -> Optional[dict]:
        """
        Get content by slug, locale, and type.

        Args:
            slug: Content slug
            locale: Locale code
            content_type: Content type

        Returns:
            Optional[dict]: Content data if found, None otherwise
        """
        url = f'{self.base_url}/api/{content_type}s'
        params = {
            'filters[slug][$eq]': slug,
            'locale': locale,
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=self._get_headers(), params=params)
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('data', [])
                    return results[0] if results else None
                elif response.status_code == 404:
                    return None
                else:
                    response.raise_for_status()
            except httpx.HTTPError:
                return None

    async def validate_webhook_signature(self, payload: dict, signature: str) -> bool:
        """
        Validate webhook signature from Strapi.

        Args:
            payload: Webhook payload
            signature: Signature header from Strapi

        Returns:
            bool: True if signature is valid, False otherwise
        """
        if not self.webhook_secret:
            # If no secret is configured, skip validation (dev mode)
            return True

        import json

        # Compute HMAC signature
        payload_str = json.dumps(payload, separators=(',', ':'))
        expected_signature = hmac.new(
            self.webhook_secret.encode(),
            payload_str.encode(),
            hashlib.sha256,
        ).hexdigest()

        # Compare signatures (timing-safe comparison)
        return hmac.compare_digest(signature, expected_signature)
