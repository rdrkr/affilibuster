# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Sync content from Strapi CMS webhook.

Reference: plan.md:138 (Backend ↔ CMS content synchronization)
"""

from typing import Dict, Any, Optional
from uuid import UUID, uuid4
from datetime import UTC, datetime
import logging

from src.domain.entities.content import Content, ContentType, ContentStatus
from src.domain.entities.content_version import ContentVersion
from src.domain.repositories.content_repository import IContentRepository

logger = logging.getLogger(__name__)


class SyncContentFromStrapi:
    """
    Use case for syncing content from Strapi webhooks to PostgreSQL.

    Handles:
    - Creating new content from Strapi
    - Updating existing content when changed in Strapi
    - Publishing/unpublishing based on Strapi state
    - Mapping Strapi's i18n structure to our multilanguage model
    """

    def __init__(self, content_repository: IContentRepository):
        """
        Initialize use case.

        Args:
            content_repository: Content repository for database operations
        """
        self.content_repo = content_repository

    async def execute(
        self, event: str, model: str, entry: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Sync content from Strapi webhook event.

        Args:
            event: Webhook event type (e.g., 'entry.create', 'entry.publish')
            model: Content model name (e.g., 'product', 'page')
            entry: Strapi entry data

        Returns:
            Optional[Dict]: Result summary with synced content info
        """
        # Map Strapi model to our ContentType
        try:
            content_type = ContentType(model)
        except ValueError:
            logger.warning(f"Unknown content type '{model}' from Strapi")
            return None

        # Extract data from Strapi entry
        strapi_id = entry.get('documentId') or entry.get('id')
        if not strapi_id:
            logger.error(f"No ID found in Strapi entry: {entry}")
            return None

        # Use Strapi's documentId as our content_id (deterministic UUID from string)
        content_id = self._generate_uuid_from_string(strapi_id)

        # Map Strapi locale to our language code
        language_code = self._map_strapi_locale(entry.get('locale', 'en'))

        # Handle different webhook events
        if event in ['entry.create', 'entry.update', 'entry.publish']:
            return await self._sync_content_version(
                content_id=content_id,
                content_type=content_type,
                language_code=language_code,
                entry=entry,
                is_published=(event == 'entry.publish' or entry.get('publishedAt') is not None),
            )
        elif event == 'entry.unpublish':
            return await self._unpublish_content(content_id, language_code)
        elif event == 'entry.delete':
            return await self._archive_content(content_id)
        else:
            logger.info(f"Unhandled Strapi event: {event}")
            return None

    async def _sync_content_version(
        self,
        content_id: UUID,
        content_type: ContentType,
        language_code: str,
        entry: Dict[str, Any],
        is_published: bool,
    ) -> Dict[str, Any]:
        """
        Create or update content version from Strapi entry.

        Args:
            content_id: Content UUID
            content_type: Type of content
            language_code: Language code
            entry: Strapi entry data
            is_published: Whether content is published

        Returns:
            Dict: Sync result summary
        """
        # Check if content version already exists
        existing_version = await self.content_repo.get_by_id(content_id, language_code)

        # Parse published timestamp (convert to timezone-naive for database)
        published_at = None
        if is_published:
            published_at_str = entry.get('publishedAt')
            if published_at_str:
                try:
                    # Parse ISO datetime and convert to naive datetime (UTC)
                    dt = datetime.fromisoformat(published_at_str.replace('Z', '+00:00'))
                    published_at = dt.replace(tzinfo=None)
                except Exception as e:
                    logger.warning(f"Failed to parse publishedAt '{published_at_str}': {e}")
                    published_at = datetime.now(UTC).replace(tzinfo=None)
            else:
                published_at = datetime.now(UTC).replace(tzinfo=None)

        # Map Strapi data to our ContentVersion entity
        version_data = ContentVersion(
            id=existing_version.id if existing_version else uuid4(),
            content_id=content_id,
            language_code=language_code,
            title=entry.get('title', ''),
            slug=entry.get('slug', ''),
            body=entry.get('content', '') or entry.get('description', ''),
            excerpt=entry.get('excerpt'),
            meta_title=entry.get('metaTitle'),
            meta_description=entry.get('metaDescription'),
            meta_keywords=entry.get('metaKeywords', []) if isinstance(entry.get('metaKeywords'), list) else [],
            custom_schema={},
            is_published=is_published,
            published_at=published_at,
            translations={},  # Will be populated from localizations
            created_at=existing_version.created_at if existing_version else datetime.now(UTC).replace(tzinfo=None),
            updated_at=datetime.now(UTC).replace(tzinfo=None),
        )

        # If content doesn't exist yet, create it
        if not existing_version:
            content = Content(
                id=content_id,
                type=content_type,
                status=ContentStatus.PUBLISHED if is_published else ContentStatus.DRAFT,
                created_by='strapi',
                updated_by='strapi',
            )
            await self.content_repo.create(content, version_data)
            logger.info(f"Created new content {content_id} ({language_code}): {entry.get('title')}")
            return {
                'action': 'created',
                'content_id': str(content_id),
                'language': language_code,
                'title': entry.get('title'),
            }
        else:
            # Update existing version
            await self.content_repo.update_version(version_data)
            logger.info(f"Updated content {content_id} ({language_code}): {entry.get('title')}")
            return {
                'action': 'updated',
                'content_id': str(content_id),
                'language': language_code,
                'title': entry.get('title'),
            }

    async def _unpublish_content(
        self, content_id: UUID, language_code: str
    ) -> Optional[Dict[str, Any]]:
        """
        Unpublish a content version.

        Args:
            content_id: Content UUID
            language_code: Language code

        Returns:
            Dict: Unpublish result
        """
        existing_version = await self.content_repo.get_by_id(content_id, language_code)
        if existing_version:
            existing_version.unpublish()
            await self.content_repo.update_version(existing_version)
            logger.info(f"Unpublished content {content_id} ({language_code})")
            return {
                'action': 'unpublished',
                'content_id': str(content_id),
                'language': language_code,
            }
        return None

    async def _archive_content(self, content_id: UUID) -> Dict[str, Any]:
        """
        Archive content (all language versions).

        Args:
            content_id: Content UUID

        Returns:
            Dict: Archive result
        """
        await self.content_repo.archive_content(content_id)
        logger.info(f"Archived content {content_id}")
        return {
            'action': 'archived',
            'content_id': str(content_id),
        }

    def _map_strapi_locale(self, strapi_locale: str) -> str:
        """
        Map Strapi locale to our language code.

        Args:
            strapi_locale: Strapi locale (e.g., 'en', 'it', 'he-IL')

        Returns:
            str: Our language code (e.g., 'en', 'it', 'he')
        """
        # Strapi might use 'he-IL', we use 'he'
        return strapi_locale.split('-')[0].lower()

    def _generate_uuid_from_string(self, s: str) -> UUID:
        """
        Generate deterministic UUID from string.

        This ensures the same Strapi documentId always maps to the same UUID.

        Args:
            s: Input string (Strapi documentId)

        Returns:
            UUID: Deterministic UUID
        """
        import hashlib

        # Use SHA256 to create deterministic hash
        hash_bytes = hashlib.sha256(s.encode('utf-8')).digest()[:16]

        # Convert to UUID (version 5 style)
        return UUID(bytes=hash_bytes, version=5)
