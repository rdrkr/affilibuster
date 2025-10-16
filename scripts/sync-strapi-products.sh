#!/bin/bash

# Script to manually sync existing Strapi products to backend
# This simulates what Strapi webhooks will do automatically once configured
# Also cleans up backend content that no longer exists in Strapi

set -e

STRAPI_DB="affilibuster_cms"
BACKEND_DB="affilibuster"
WEBHOOK_URL="http://localhost:8000/v1/webhooks/strapi"
WEBHOOK_SECRET="changeme-webhook-secret"

echo "Fetching products from Strapi database..."

# Temporary file to track synced document IDs
SYNCED_IDS=$(mktemp)
trap "rm -f $SYNCED_IDS" EXIT

# Get all published products from Strapi
docker exec affilibuster-postgres psql -U affilibuster -d "$STRAPI_DB" -t -A -F'|' -c "
  SELECT document_id, title, slug, description, excerpt, published_at, locale, created_at, updated_at
  FROM products
  WHERE published_at IS NOT NULL
  ORDER BY published_at DESC
" | while IFS='|' read -r doc_id title slug description excerpt published_at locale created_at updated_at; do

  # Skip empty lines
  [ -z "$doc_id" ] && continue

  # Track this document ID
  echo "$doc_id" >> "$SYNCED_IDS"

  echo ""
  echo "Syncing: $title (slug: $slug, locale: $locale)"

  # Create webhook payload
  payload=$(cat <<EOF
{
  "event": "entry.publish",
  "model": "product",
  "entry": {
    "documentId": "$doc_id",
    "id": "$doc_id",
    "title": "$title",
    "slug": "$slug",
    "content": "$description",
    "excerpt": "$excerpt",
    "locale": "$locale",
    "publishedAt": "$published_at",
    "createdAt": "$created_at",
    "updatedAt": "$updated_at"
  }
}
EOF
)

  # Send to webhook
  response=$(curl -s -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -H "X-Webhook-Secret: $WEBHOOK_SECRET" \
    -d "$payload")

  echo "Response: $response"

done

echo ""
echo "🧹 Cleaning up backend content not in Strapi..."

# Get unique document IDs (since we have multiple locales per document)
UNIQUE_STRAPI_IDS=$(sort -u "$SYNCED_IDS" | tr '\n' ',' | sed 's/,$//')

# Find and delete backend content that doesn't exist in Strapi
# This uses a Python script to properly generate UUIDs from document IDs
docker exec affilibuster-backend python3 -c "
import sys
sys.path.insert(0, '/app')

from src.infrastructure.database.config import get_db_session
from src.infrastructure.database.models.content import ContentModel
from src.infrastructure.database.models.content_version import ContentVersionModel
from sqlalchemy import select, delete
import asyncio
import hashlib
from uuid import UUID

def generate_uuid_from_string(s: str) -> UUID:
    hash_bytes = hashlib.sha256(s.encode('utf-8')).digest()[:16]
    return UUID(bytes=hash_bytes, version=5)

async def cleanup():
    # Strapi document IDs
    strapi_doc_ids = '$UNIQUE_STRAPI_IDS'.split(',') if '$UNIQUE_STRAPI_IDS' else []
    strapi_uuids = {str(generate_uuid_from_string(doc_id)) for doc_id in strapi_doc_ids if doc_id}

    async with get_db_session() as session:
        # Get all product content IDs from backend
        result = await session.execute(
            select(ContentModel.id).where(ContentModel.type == 'product')
        )
        backend_uuids = {str(row[0]) for row in result.all()}

        # Find content to delete (in backend but not in Strapi)
        to_delete = backend_uuids - strapi_uuids

        if to_delete:
            print(f'  ⚠️  Found {len(to_delete)} content items to delete from backend')

            # Delete content versions first (foreign key constraint)
            for content_id in to_delete:
                await session.execute(
                    delete(ContentVersionModel).where(ContentVersionModel.content_id == UUID(content_id))
                )
                print(f'  🗑️  Deleted versions for content {content_id[:8]}...')

            # Delete content
            for content_id in to_delete:
                await session.execute(
                    delete(ContentModel).where(ContentModel.id == UUID(content_id))
                )
                print(f'  🗑️  Deleted content {content_id[:8]}...')

            await session.commit()
            print(f'  ✅ Cleanup complete - deleted {len(to_delete)} items')
        else:
            print('  ✅ No cleanup needed - backend matches Strapi')

asyncio.run(cleanup())
"

echo ""
echo "✅ Sync and cleanup complete! Check backend API:"
echo "   curl 'http://localhost:8000/v1/content/en?page=1&pageSize=24'"
