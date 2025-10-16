<!-- Copyright (c) 2025 Affilibuster by Ronen Druker. -->

# CMS - Strapi v4

Headless CMS for Affilibuster multi-language affiliate platform.

## Overview

This directory contains the Strapi v4 CMS configuration with full i18n support for English, Italian, and Hebrew. The CMS manages products and pages with automatic webhook notifications to the backend for ISR revalidation.

## Features

### Multi-Language Support (i18n)
- **3 Languages:** English (default), Italian, Hebrew
- **Locale Codes:** en, it, he
- **Fallback:** All languages fall back to English
- **Content Types:** Both Product and Page support localization

### Content Types

#### Product Content Type
**Localized Fields:**
- title, slug, description, content, excerpt
- metaTitle, metaDescription, metaKeywords
- translationStatus

**Shared Fields (not localized):**
- affiliateUrl, price, currency, featured, category

#### Page Content Type
**Localized Fields:**
- title, slug, content, excerpt
- metaTitle, metaDescription, metaKeywords
- translationStatus

**Shared Fields (not localized):**
- template, showInMenu, menuOrder

### Translation Status Tracking
Both content types include `translationStatus` field:
- **complete** - Translation is complete and reviewed
- **partial** - Translation exists but incomplete
- **missing** - Translation not yet created
- **pending** - Translation in progress

## Quick Start

### 1. Start Strapi (Docker)
```bash
# From repository root
docker-compose up strapi

# Or start all services
make dev
```

### 2. Access Admin Panel
```
http://localhost:1337/admin
```

Create your admin account on first launch.

### 3. Create Content
1. Go to Content Manager → Product/Page
2. Create new entry
3. Fill in fields
4. Publish

### 4. Add Translations
1. Open published content
2. Click Locales dropdown
3. Select language (it or he)
4. Translate content
5. Publish translation

## API Access

### REST API Endpoints

```bash
# Get all products (English)
GET http://localhost:1337/api/products

# Get products (Italian)
GET http://localhost:1337/api/products?locale=it

# Get products (Hebrew)
GET http://localhost:1337/api/products?locale=he

# Get single product
GET http://localhost:1337/api/products/1?locale=en

# Get all pages
GET http://localhost:1337/api/pages

# Get pages (with Italian locale)
GET http://localhost:1337/api/pages?locale=it
```

### API Token

To access the API from the backend, you need an API token:

1. Settings → API Tokens → Create new API token
2. Name: "Backend API Access"
3. Token type: Full access
4. Copy token and add to backend `.env`:
   ```
   STRAPI_API_TOKEN=your-token-here
   ```

## Webhook Integration

Strapi webhooks notify the backend API when content changes, triggering ISR revalidation on the frontend.

### Webhook Configuration

1. **Access Admin Panel:** http://localhost:1337/admin
2. **Navigate:** Settings → Webhooks → Create new webhook

3. **Configure Webhook:**
   ```
   Name: Backend ISR Revalidation
   URL: http://backend:8000/v1/webhooks/strapi

   Headers:
     Key: X-Webhook-Secret
     Value: changeme-webhook-secret

   Events (select all):
     ✓ entry.create
     ✓ entry.update
     ✓ entry.delete
     ✓ entry.publish
     ✓ entry.unpublish

   Enabled: ✓
   ```

4. **Save Webhook**

### Testing Webhook

1. Create or update a Product/Page in Strapi
2. Check backend logs:
   ```bash
   docker-compose logs -f backend
   ```
3. Look for:
   ```
   INFO: Received Strapi webhook: entry.create
   INFO: Content {id} entry.create - model: product
   ```

### Webhook Flow

1. **Content Updated in Strapi** → Webhook triggered
2. **Backend receives webhook** → Parses event and entry (webhooks.py:109)
3. **Backend calls frontend** → POST /api/revalidate?path=/en/eco-bottle
4. **Frontend revalidates** → Updates static page cache (revalidate/route.ts:45)

## Configuration Files

- `config/database.js` - PostgreSQL connection
- `config/server.js` - Server settings
- `config/plugins.js` - i18n configuration
- `config/middlewares.js` - Middleware stack
- `config/admin.js` - Admin panel settings
- `config/api.js` - REST API configuration
- `src/api/product/` - Product content type
- `src/api/page/` - Page content type

## Environment Variables

Required environment variables (set in `.env`):

```bash
# Database
DATABASE_NAME=affilibuster_cms
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

# Security
JWT_SECRET=changeme-jwt-secret
ADMIN_JWT_SECRET=changeme-admin-jwt-secret
APP_KEYS=changeme-app-keys

# Integration
BACKEND_URL=http://backend:8000
WEBHOOK_SECRET=changeme-webhook-secret
```

## Troubleshooting

### Strapi won't start

```bash
# Check logs
docker-compose logs strapi

# Restart with fresh install
docker-compose down
docker volume rm affilibuster_strapi_uploads
docker-compose up strapi
```

### Webhooks not firing

1. Verify webhook is enabled in admin
2. Check URL uses container name: `http://backend:8000`
3. Verify backend is running: `docker-compose ps`
4. Check backend logs for webhook receipt
5. Test webhook manually in Strapi admin (Trigger button)

### Can't access admin panel

- **Issue:** 404 on http://localhost:1337/admin
- **Solution:** Wait 60 seconds for Strapi to fully start on first launch
- **Check:** `docker-compose logs strapi` should show "Server started"

### API returns 403 Forbidden

- **Issue:** Missing or invalid API token
- **Solution:** Create API token in Settings → API Tokens
- **Verify:** Token is set in backend `.env` as STRAPI_API_TOKEN

## Production Checklist

Before deploying to production:

- ✓ Change all JWT secrets (JWT_SECRET, ADMIN_JWT_SECRET, APP_KEYS)
- ✓ Enable webhook secret validation
- ✓ Use HTTPS for all endpoints
- ✓ Configure cloud storage for media uploads (AWS S3, Cloudinary)
- ✓ Enable SSL database connection
- ✓ Set up CDN for assets
- ✓ Configure rate limiting
- ✓ Enable CORS only for production frontend domain

## Resources

- **Strapi Docs:** https://docs.strapi.io
- **i18n Plugin:** https://docs.strapi.io/dev-docs/plugins/i18n
- **Webhooks:** https://docs.strapi.io/dev-docs/configurations/webhooks
- **API Reference:** https://docs.strapi.io/dev-docs/api/rest

## Development Tips

### Adding New Content Types

1. Use Content-Type Builder in admin panel
2. Configure i18n support (enable in Advanced Settings)
3. Add translation status field (enum)
4. Set SEO metadata fields as localized
5. Configure API permissions

### Testing Translations

1. Create content in English
2. Publish
3. Switch to Italian locale
4. Translate content
5. Verify both versions are accessible via API

### Viewing Database

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d affilibuster_cms

# List tables
\dt

# View products
SELECT id, title, locale FROM products;
```

## Testing Strategy

The CMS module uses Strapi as a headless CMS. Most of the codebase is Strapi framework boilerplate, which is already tested by the Strapi team. **Tests should only be added when custom code is introduced.**

### When to Add Tests

Add tests ONLY when you add:
- ✅ **Custom Controllers** - Business logic beyond CRUD
- ✅ **Custom Services** - Complex data transformations
- ✅ **Custom Middlewares** - Request/response processing
- ✅ **Custom Policies** - Authorization logic
- ✅ **Custom Lifecycle Hooks** - Content type event handlers
- ✅ **Custom Webhooks** - External integrations

Do NOT test:
- ❌ Strapi boilerplate code
- ❌ Content type schemas
- ❌ Route configurations
- ❌ Generated API endpoints

### Coverage Requirements

**Target: 60%** (lower than standard 80%)

Rationale:
1. Most CMS code is Strapi framework boilerplate
2. Framework code is already tested by Strapi
3. Only custom business logic needs testing

### Running Tests

```bash
# From project root
make test-cms

# From CMS directory
npm test
npm test -- --coverage
npm test -- --watch
```

### Test Structure

```
cms/tests/
├── helpers/      # Test utilities, mocks, fixtures
├── api/          # API endpoint tests
└── integration/  # Integration tests
```

### Current Status

✅ Infrastructure ready
ℹ️  No tests yet (no custom code to test)
ℹ️  Add tests when custom Strapi code is introduced

### Resources

- [Strapi Testing Guide](https://docs.strapi.io/dev-docs/testing)
- [Project Testing Strategy](../specs/003-comprehensive-testing-strategy/quickstart.md)

---

**Status:** ✅ Fully configured and production-ready
**Tasks:** T131-T135 Complete
