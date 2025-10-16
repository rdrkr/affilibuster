# Strapi CMS Integration Setup Guide

This guide explains how to complete the Strapi CMS integration with the Affilibuster backend.

## Architecture Overview

```
Strapi CMS → Webhook → Backend API → PostgreSQL → Frontend
```

When you create or update content in Strapi, it triggers a webhook that syncs the content to PostgreSQL. The frontend then fetches content from the backend API (which reads from PostgreSQL).

## Prerequisites

- Strapi running on `http://localhost:1337`
- Backend API running on `http://localhost:8000`
- PostgreSQL database initialized

## Step 1: Access Strapi Admin

1. Navigate to `http://localhost:1337/admin`
2. Log in with your admin credentials
   - If this is your first time, you'll need to create an admin account

## Step 2: Generate API Token

1. In Strapi admin, go to **Settings** (gear icon in left sidebar)
2. Under "Global Settings", click **API Tokens**
3. Click **Create new API Token**
4. Configure the token:
   - **Name**: `Affilibuster Backend`
   - **Description**: `Token for backend webhook sync`
   - **Token duration**: `Unlimited`
   - **Token type**: `Full access` or `Custom`
     - If Custom, enable: `find`, `findOne`, `create`, `update`, `delete` for all content types
5. Click **Save**
6. **Copy the generated token** (you won't be able to see it again!)

## Step 3: Configure Backend with API Token

1. Update `/backend/.env` with the Strapi API token:

```bash
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-copied-token-here
STRAPI_WEBHOOK_SECRET=changeme-webhook-secret
```

2. Restart the backend:

```bash
docker restart affilibuster-backend
```

## Step 4: Configure Strapi Webhooks

1. In Strapi admin, go to **Settings** → **Webhooks**
2. Click **Create new webhook**
3. Configure the webhook:

   **Name**: `Affilibuster Content Sync`

   **URL**: `http://backend:8000/v1/webhooks/strapi`

   **Headers**:
   - `Content-Type`: `application/json`
   - `X-Webhook-Secret`: `changeme-webhook-secret`

   **Events** (check these):
   - `entry.create`
   - `entry.update`
   - `entry.delete`
   - `entry.publish`
   - `entry.unpublish`

4. Click **Save**

## Step 5: Test the Integration

### Option A: Create a Test Product in Strapi

1. In Strapi admin, go to **Content Manager** → **Product**
2. Click **Create new entry**
3. Fill in the product details:
   - **Title**: `Test Product from Strapi`
   - **Slug**: `test-product-from-strapi` (auto-generated)
   - **Content**: Add some rich text content
   - **Excerpt**: `This is a test product`
   - **Meta Title**: `Test Product`
   - **Meta Description**: `Testing Strapi integration`
   - **Locale**: `English (en)`
4. Click **Save**
5. Click **Publish**

### Option B: Test with curl

```bash
curl -X POST http://localhost:8000/v1/webhooks/strapi \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: changeme-webhook-secret" \
  -d '{
    "event": "entry.publish",
    "model": "product",
    "entry": {
      "documentId": "test-product-456",
      "id": "test-product-456",
      "title": "Test Product via Webhook",
      "slug": "test-product-via-webhook",
      "content": "<p>This product was created via webhook</p>",
      "excerpt": "Webhook test product",
      "metaTitle": "Test Product",
      "metaDescription": "Testing webhook integration",
      "metaKeywords": ["test", "webhook"],
      "locale": "en",
      "publishedAt": "2025-10-19T09:00:00.000Z"
    }
  }'
```

Expected response:
```json
{
  "status": "success",
  "message": "Content synced for entry.publish",
  "result": {
    "action": "created",
    "content_id": "...",
    "language": "en",
    "title": "Test Product via Webhook"
  }
}
```

### Verify the Product Appears on Website

1. Check the backend API:
```bash
curl -s 'http://localhost:8000/v1/content/en?page=1&pageSize=24' | python3 -m json.tool
```

2. Visit the frontend: `http://localhost:3000/products`

Your new product should appear in the list!

## Troubleshooting

### Webhook Returns 401 Unauthorized

- Check that `X-Webhook-Secret` header matches `STRAPI_WEBHOOK_SECRET` in backend `.env`
- Restart backend after changing `.env` file

### Webhook Returns 500 Error

- Check backend logs: `docker logs affilibuster-backend --tail 50`
- Common issues:
  - Missing required fields in webhook payload
  - Database connection issues
  - Timezone-related errors (should be fixed in current implementation)

### Content Not Appearing on Website

1. Verify content was synced to PostgreSQL:
```bash
curl -s 'http://localhost:8000/v1/content/en' | python3 -m json.tool
```

2. Check that frontend ISR cache has been revalidated (60-second cache)

3. Try hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### Checking Backend Logs

```bash
# View real-time logs
docker logs -f affilibuster-backend

# View last 50 lines
docker logs affilibuster-backend --tail 50
```

## Supported Content Types

The webhook handler supports:

- **Products** (`product`)
- **Pages** (`page`)
- **Articles** (`article`) - if you add this content type

## Multilanguage Support

Strapi's i18n plugin is configured for:
- English (`en`) - default
- Italian (`it`)
- Hebrew (`he`)

To create translations:

1. Create content in default language (English)
2. Click **Add new locale** in the content editor
3. Select the target language
4. Fill in translated content
5. Publish the translation

The webhook will sync each language version separately to PostgreSQL.

## Data Mapping

Strapi fields → Backend database:

| Strapi Field | Backend Field | Notes |
|---|---|---|
| `documentId` | `content.id` | Converted to deterministic UUID |
| `title` | `content_version.title` | |
| `slug` | `content_version.slug` | |
| `content` | `content_version.body` | Rich text |
| `excerpt` | `content_version.excerpt` | |
| `metaTitle` | `content_version.meta_title` | SEO |
| `metaDescription` | `content_version.meta_description` | SEO |
| `metaKeywords` | `content_version.meta_keywords` | Array |
| `locale` | `content_version.language_code` | e.g., `en`, `it`, `he` |
| `publishedAt` | `content_version.published_at` | Timestamp |

## Next Steps

After completing this setup:

1. ✅ Strapi content automatically syncs to PostgreSQL
2. ✅ Frontend displays content from backend API
3. 🔄 **Todo**: Implement ISR revalidation trigger in frontend
   - When webhook syncs content, it should call frontend `/api/revalidate` endpoint
   - This ensures immediate updates without waiting for 60-second cache

## Security Notes

For production:

- Use strong, unique values for:
  - `STRAPI_API_TOKEN`
  - `STRAPI_WEBHOOK_SECRET`
  - `JWT_SECRET`
  - `ADMIN_JWT_SECRET`
  - `API_TOKEN_SALT`

- Configure proper CORS settings

- Use HTTPS for webhook URLs

- Implement rate limiting on webhook endpoint

- Consider adding IP whitelist for webhook requests
