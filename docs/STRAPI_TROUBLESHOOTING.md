# Strapi Integration Troubleshooting Guide

## Issue: Backend products don't match Strapi products

### Symptoms
- You create products in Strapi CMS
- Products don't appear on the website
- Backend API returns different products than what's in Strapi

### Root Cause
Strapi webhooks are **not configured** in Strapi admin. The webhook endpoint exists and works, but Strapi isn't calling it when you create/update content.

### Solution

#### Option 1: Configure Strapi Webhooks (Recommended)

Follow **Step 4** in `/docs/STRAPI_SETUP.md`:

1. Log into Strapi admin: `http://localhost:1337/admin`
2. Go to **Settings** → **Webhooks**
3. Click **Create new webhook**
4. Configure:
   - **Name**: `Affilibuster Content Sync`
   - **URL**: `http://backend:8000/v1/webhooks/strapi`
   - **Headers**:
     - `Content-Type`: `application/json`
     - `X-Webhook-Secret`: `changeme-webhook-secret`
   - **Events**: Check all entry events (create, update, delete, publish, unpublish)
5. Click **Save**

Now whenever you create/update products in Strapi, they'll automatically sync to the backend!

#### Option 2: Manually Sync Existing Products

If you already have products in Strapi and need to sync them immediately:

```bash
./scripts/sync-strapi-products.sh
```

This script:
- Reads all published products from Strapi database
- Sends webhook events to backend for each product
- Syncs them to PostgreSQL

#### Option 3: Clear Seed Data (Optional)

If you want ONLY Strapi products (no seed data):

```bash
# Connect to backend database
docker exec -it affilibuster-postgres psql -U affilibuster -d affilibuster

# Delete all content
DELETE FROM content_versions;
DELETE FROM content;

# Exit
\q

# Now sync Strapi products
./scripts/sync-strapi-products.sh
```

### Verification

After configuring webhooks or running sync script:

1. **Check backend API**:
```bash
curl 'http://localhost:8000/v1/content/en?page=1&pageSize=24' | python3 -m json.tool
```

2. **Check frontend**:
```bash
open http://localhost:3000/products
```

3. **Test webhook** (create a new product in Strapi and verify it appears immediately)

### Understanding the Data Flow

```
Strapi CMS → Webhook → Backend API → PostgreSQL → Frontend
    ↓
affilibuster_cms    affilibuster database
database
```

**Important**: Strapi and Backend use **separate PostgreSQL databases**:
- `affilibuster_cms`: Strapi's content (source of truth)
- `affilibuster`: Backend's synced content (optimized for API serving)

## Issue: Products show in Strapi but not on website

### Check 1: Is the product published?

In Strapi:
1. Go to Content Manager → Products
2. Find your product
3. Check if it has a "Published" badge
4. If not, click **Publish**

### Check 2: Is the webhook configured?

```bash
# Check Strapi webhook configuration
curl -s 'http://localhost:1337/api/webhooks' \
  -H "Authorization: Bearer YOUR-STRAPI-API-TOKEN" | python3 -m json.tool
```

Should show at least one webhook pointing to `http://backend:8000/v1/webhooks/strapi`

### Check 3: Check backend logs

```bash
# Watch backend logs in real-time
docker logs -f affilibuster-backend

# Then publish a product in Strapi and look for:
# "Received Strapi webhook: entry.publish"
# "Successfully synced content: ..."
```

### Check 4: Verify product is in backend

```bash
curl 'http://localhost:8000/v1/content/en?page=1&pageSize=100' | python3 -m json.tool | jq '.data[] | .title'
```

Your product title should appear in the list.

## Issue: Webhook returns 401 Unauthorized

**Cause**: Webhook secret mismatch

**Fix**:
1. Check `/backend/.env`: `STRAPI_WEBHOOK_SECRET=changeme-webhook-secret`
2. Check Strapi webhook header: `X-Webhook-Secret: changeme-webhook-secret`
3. They must match exactly
4. Restart backend after changing `.env`

## Issue: Webhook returns 500 Internal Server Error

**Cause**: Usually data format issues

**Fix**:
1. Check backend logs: `docker logs affilibuster-backend --tail 50`
2. Look for the error traceback
3. Common issues:
   - Missing required fields in Strapi content type
   - Timezone errors (should be fixed in current version)
   - Database connection issues

## Testing Webhooks Manually

You can test the webhook endpoint without Strapi:

```bash
curl -X POST http://localhost:8000/v1/webhooks/strapi \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: changeme-webhook-secret" \
  -d '{
    "event": "entry.publish",
    "model": "product",
    "entry": {
      "documentId": "test-123",
      "title": "Test Product",
      "slug": "test-product",
      "content": "Test content",
      "excerpt": "Test excerpt",
      "locale": "en",
      "publishedAt": "2025-10-19T10:00:00.000Z"
    }
  }'
```

Should return:
```json
{
  "status": "success",
  "message": "Content synced for entry.publish",
  "result": {
    "action": "created",
    "content_id": "...",
    "language": "en",
    "title": "Test Product"
  }
}
```

## Best Practices

1. **Always configure webhooks** - Don't rely on manual syncing
2. **Test with one product first** - Before adding many products
3. **Check logs** - Watch both Strapi and backend logs when debugging
4. **Use published content** - Draft content won't sync
5. **Match locales** - Strapi locale (`en`, `it`, `he`) must match backend language codes

## Database Queries for Debugging

### Check what's in Strapi:
```bash
docker exec affilibuster-postgres psql -U affilibuster -d affilibuster_cms -c \
  "SELECT id, document_id, title, slug, locale, published_at FROM products ORDER BY created_at DESC LIMIT 10;"
```

### Check what's in Backend:
```bash
docker exec affilibuster-postgres psql -U affilibuster -d affilibuster -c \
  "SELECT id, title, slug, language_code, published_at FROM content_versions WHERE is_published=true ORDER BY updated_at DESC LIMIT 10;"
```

### Count products by language:
```bash
curl -s 'http://localhost:8000/v1/content/en' | jq '.pagination.totalItems'
curl -s 'http://localhost:8000/v1/content/it' | jq '.pagination.totalItems'
curl -s 'http://localhost:8000/v1/content/he' | jq '.pagination.totalItems'
```
