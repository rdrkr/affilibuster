# Data Model: Core Platform Setup & Multi-Language Infrastructure

**Date**: 2025-10-04
**Feature**: Core Platform Setup & Multi-Language Infrastructure

## Overview

This data model supports a multi-language affiliate platform with three languages (English, Italian, Hebrew), dynamic currency selection, and SEO-optimized URL routing. The design follows Clean Architecture principles with clear entity boundaries and relationships.

## Core Entities

### 1. Language

Represents a supported language configuration.

```typescript
interface Language {
  code: LanguageCode;        // 'en' | 'it' | 'he'
  displayName: string;       // 'English', 'Italiano', 'עברית'
  nativeName: string;        // 'English', 'Italiano', 'עברית'
  direction: 'ltr' | 'rtl';
  urlPrefix: string;         // '' (root for English) | '/it' | '/il'
  defaultCurrency: CurrencyCode;
  localeCode: string;        // 'en-US', 'it-IT', 'he-IL'
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}
```

**Business Rules**:
- Exactly one language must have `isDefault = true`
- English (code: 'en') must be the default language
- `urlPrefix` must be empty string for default language
- Hebrew must have `direction = 'rtl'`, all others `'ltr'`

**Sample Data**:
```json
[
  {
    "code": "en",
    "displayName": "English",
    "nativeName": "English",
    "direction": "ltr",
    "urlPrefix": "",
    "defaultCurrency": "USD",
    "localeCode": "en-US",
    "isDefault": true,
    "isActive": true,
    "sortOrder": 1
  },
  {
    "code": "it",
    "displayName": "Italian",
    "nativeName": "Italiano",
    "direction": "ltr",
    "urlPrefix": "/it",
    "defaultCurrency": "EUR",
    "localeCode": "it-IT",
    "isDefault": false,
    "isActive": true,
    "sortOrder": 2
  },
  {
    "code": "he",
    "displayName": "Hebrew",
    "nativeName": "עברית",
    "direction": "rtl",
    "urlPrefix": "/il",
    "defaultCurrency": "ILS",
    "localeCode": "he-IL",
    "isDefault": false,
    "isActive": true,
    "sortOrder": 3
  }
]
```

---

### 2. Content (Abstract Base)

Base entity for all content types (pages, products, articles).

```typescript
interface Content {
  id: string;                // UUID
  type: ContentType;         // 'page' | 'product' | 'article'
  status: ContentStatus;     // 'draft' | 'published' | 'archived'
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;         // User ID
  updatedBy: string;         // User ID
}

type ContentType = 'page' | 'product' | 'article';
type ContentStatus = 'draft' | 'published' | 'archived';
```

**Business Rules**:
- Cannot delete content with status 'published' (must archive first)
- `createdAt` and `createdBy` are immutable
- `updatedAt` and `updatedBy` update automatically on any change

---

### 3. ContentVersion

Language-specific version of content.

```typescript
interface ContentVersion {
  id: string;                // UUID
  contentId: string;         // FK to Content
  languageCode: LanguageCode;
  title: string;
  slug: string;              // URL-safe slug, customizable per language
  body: string;              // Rich text content (HTML or JSON)
  excerpt?: string;          // Short description

  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  customSchema?: object;     // Custom JSON-LD schema markup

  // Publishing
  isPublished: boolean;
  publishedAt?: Date;

  // Translations (linked content versions in other languages)
  translations: Record<LanguageCode, string>; // { it: contentVersionId, he: contentVersionId }

  // Audit
  createdAt: Date;
  updatedAt: Date;
}
```

**Business Rules**:
- `slug` must be unique per `(contentId, languageCode)` combination
- If `isPublished = true`, `publishedAt` must be set
- `translations` must not include self-reference (can't link to own languageCode)
- When content is archived, all associated `ContentVersion` records set `isPublished = false`

**Sample Data**:
```json
{
  "id": "cv-123",
  "contentId": "c-456",
  "languageCode": "en",
  "title": "Eco-Friendly Water Bottle",
  "slug": "eco-water-bottle",
  "body": "<p>Sustainable stainless steel bottle...</p>",
  "excerpt": "Reusable water bottle made from recycled materials",
  "metaTitle": "Buy Eco-Friendly Water Bottle | Affilibuster",
  "metaDescription": "Shop sustainable water bottles...",
  "customSchema": { "@type": "Product", "name": "..." },
  "isPublished": true,
  "publishedAt": "2025-10-01T00:00:00Z",
  "translations": {
    "it": "cv-124",
    "he": "cv-125"
  }
}
```

---

### 4. URLRoute

SEO-optimized URL routing with redirect management.

```typescript
interface URLRoute {
  id: string;                // UUID
  contentVersionId: string;  // FK to ContentVersion
  languageCode: LanguageCode;
  path: string;              // Full path: '/products/eco-bottle' or '/it/prodotti/bottiglia-eco'
  slug: string;              // Last segment: 'eco-bottle'

  // URL Status
  isActive: boolean;
  isPrimary: boolean;        // True for current/canonical URL

  // Redirects
  redirects: URLRedirect[];

  // SEO
  canonicalUrl: string;      // Self-reference for primary URL
  alternateUrls: Record<LanguageCode, string>; // For hreflang tags

  // Audit
  createdAt: Date;
  updatedAt: Date;
}

interface URLRedirect {
  fromPath: string;
  toPrimaryUrlId: string;    // FK to URLRoute (primary URL)
  statusCode: 301 | 410;
  createdAt: Date;
  createdBy: string;         // User ID who triggered redirect
  reason?: string;           // "slug_changed" | "content_deleted" | "manual"
}
```

**Business Rules**:
- `path` must be globally unique (across all languages)
- Only one URLRoute can have `isPrimary = true` per ContentVersion
- When slug changes:
  1. Create new URLRoute with `isPrimary = true`
  2. Old URLRoute set `isPrimary = false`, `isActive = false`
  3. Create URLRedirect (301) from old path to new URLRoute
- When content deleted/archived:
  1. Set URLRoute `isActive = false`
  2. Create URLRedirect (410 Gone) from path
- `redirects` are immutable (append-only audit log)

**Sample Data**:
```json
{
  "id": "url-789",
  "contentVersionId": "cv-123",
  "languageCode": "en",
  "path": "/products/eco-water-bottle",
  "slug": "eco-water-bottle",
  "isActive": true,
  "isPrimary": true,
  "redirects": [
    {
      "fromPath": "/products/eco-bottle",
      "toPrimaryUrlId": "url-789",
      "statusCode": 301,
      "createdAt": "2025-10-01T10:00:00Z",
      "createdBy": "user-001",
      "reason": "slug_changed"
    }
  ],
  "canonicalUrl": "https://affilibuster.com/products/eco-water-bottle",
  "alternateUrls": {
    "it": "https://affilibuster.com/it/prodotti/bottiglia-eco",
    "he": "https://affilibuster.com/il/products/eco-water-bottle"
  }
}
```

---

### 5. Currency

Supported currency configuration.

```typescript
interface Currency {
  code: CurrencyCode;        // ISO 4217: 'USD' | 'EUR' | 'ILS' | ...
  name: string;              // 'US Dollar', 'Euro', 'Israeli Shekel'
  symbol: string;            // '$', '€', '₪'
  decimalPlaces: number;     // Typically 2, but 0 for JPY, 3 for KWD
  symbolPosition: 'before' | 'after';

  // Locale-specific formatting
  thousandsSeparator: string; // ',', '.', ' '
  decimalSeparator: string;   // '.', ','

  // Metadata
  isActive: boolean;
  sortOrder: number;
}

type CurrencyCode = 'USD' | 'EUR' | 'ILS' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | string;
```

**Business Rules**:
- `code` must be valid ISO 4217 currency code
- At least one currency must have `isActive = true`
- `decimalPlaces` must be 0-3 (99.9% of currencies)

**Sample Data**:
```json
[
  {
    "code": "USD",
    "name": "US Dollar",
    "symbol": "$",
    "decimalPlaces": 2,
    "symbolPosition": "before",
    "thousandsSeparator": ",",
    "decimalSeparator": ".",
    "isActive": true,
    "sortOrder": 1
  },
  {
    "code": "EUR",
    "name": "Euro",
    "symbol": "€",
    "decimalPlaces": 2,
    "symbolPosition": "after",
    "thousandsSeparator": ".",
    "decimalSeparator": ",",
    "isActive": true,
    "sortOrder": 2
  },
  {
    "code": "ILS",
    "name": "Israeli Shekel",
    "symbol": "₪",
    "decimalPlaces": 2,
    "symbolPosition": "before",
    "thousandsSeparator": ",",
    "decimalSeparator": ".",
    "isActive": true,
    "sortOrder": 3
  }
]
```

---

### 6. UserPreferences

Stores user preferences for language prompts and currency selection.

```typescript
interface UserPreferences {
  id: string;                // UUID
  sessionId: string;         // For anonymous users
  userId?: string;           // For logged-in users (future)

  // Preferences
  selectedCurrency: CurrencyCode;
  dismissedLanguagePrompt: boolean;
  detectedLanguage?: LanguageCode;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;           // TTL for cache (30 days from last update)
}
```

**Business Rules**:
- `expiresAt` must be > `updatedAt`
- `sessionId` is required (generated on first visit)
- `userId` takes precedence over `sessionId` if both exist (logged-in user)
- When currency changed, `updatedAt` and `expiresAt` refresh (extend TTL)
- When language prompt dismissed, `dismissedLanguagePrompt = true` for session only

**Sample Data**:
```json
{
  "id": "pref-001",
  "sessionId": "sess-abc123",
  "userId": null,
  "selectedCurrency": "EUR",
  "dismissedLanguagePrompt": true,
  "detectedLanguage": "it",
  "createdAt": "2025-10-01T10:00:00Z",
  "updatedAt": "2025-10-04T15:30:00Z",
  "expiresAt": "2025-11-03T15:30:00Z"
}
```

---

### 7. Locale

Cultural and regional formatting settings.

```typescript
interface Locale {
  code: string;              // IETF BCP 47: 'en-US', 'it-IT', 'he-IL'
  languageCode: LanguageCode;
  countryCode: string;       // ISO 3166-1 alpha-2: 'US', 'IT', 'IL'

  // Display Names
  displayName: string;       // 'English (United States)'

  // Formatting
  dateFormat: string;        // 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'
  timeFormat: '12h' | '24h';
  firstDayOfWeek: number;    // 0 (Sunday) - 6 (Saturday)

  // Metadata
  isActive: boolean;
}
```

**Business Rules**:
- `code` must be valid IETF BCP 47 locale code
- Each active Language must have at least one active Locale
- `firstDayOfWeek` must be 0-6 (Sunday = 0, Monday = 1, etc.)

**Sample Data**:
```json
[
  {
    "code": "en-US",
    "languageCode": "en",
    "countryCode": "US",
    "displayName": "English (United States)",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12h",
    "firstDayOfWeek": 0,
    "isActive": true
  },
  {
    "code": "it-IT",
    "languageCode": "it",
    "countryCode": "IT",
    "displayName": "Italiano (Italia)",
    "dateFormat": "DD/MM/YYYY",
    "timeFormat": "24h",
    "firstDayOfWeek": 1,
    "isActive": true
  },
  {
    "code": "he-IL",
    "languageCode": "he",
    "countryCode": "IL",
    "displayName": "עברית (ישראל)",
    "dateFormat": "DD/MM/YYYY",
    "timeFormat": "24h",
    "firstDayOfWeek": 0,
    "isActive": true
  }
]
```

---

## Entity Relationships

### Diagram

```
Language (1) ───< (N) ContentVersion
                         │
                         │ (1)
                         │
                         ▼
                     URLRoute (1) ───< (N) URLRedirect
                         │
                         │ (N)
                         │
                         ▼
                     Content (1)

Currency (1) ───< (N) UserPreferences

Language (1) ───< (N) Locale

ContentVersion (N) ──< translations >── (N) ContentVersion
```

### Relationship Details

1. **Language → ContentVersion** (1:N)
   - One language has many content versions
   - ContentVersion.languageCode → Language.code

2. **Content → ContentVersion** (1:N)
   - One content item has multiple language versions
   - ContentVersion.contentId → Content.id
   - Cascade delete: When Content deleted, all ContentVersions deleted

3. **ContentVersion → URLRoute** (1:1 primary, 1:N historical)
   - Each content version has one PRIMARY URLRoute
   - Each content version may have multiple historical URLRoutes (old slugs)
   - URLRoute.contentVersionId → ContentVersion.id

4. **URLRoute → URLRedirect** (1:N)
   - One URL can have multiple redirects (historical slug changes)
   - URLRedirect.toPrimaryUrlId → URLRoute.id

5. **ContentVersion → ContentVersion** (N:N via translations field)
   - Content versions link to their translations in other languages
   - Self-referential relationship via `translations` JSON field
   - No hard FK constraint (allows partial translations)

6. **Currency → UserPreferences** (1:N)
   - One currency can be selected by many users
   - UserPreferences.selectedCurrency → Currency.code

7. **Language → Locale** (1:N)
   - One language can have multiple locales (e.g., en-US, en-GB)
   - Locale.languageCode → Language.code

---

## Validation Rules Summary

| Entity | Field | Rule |
|--------|-------|------|
| Language | code | Must be one of: 'en', 'it', 'he' |
| Language | isDefault | Exactly one language must be default |
| Language | urlPrefix | Empty string for default language, unique for others |
| ContentVersion | slug | Unique per (contentId, languageCode) |
| ContentVersion | isPublished | If true, publishedAt must be set |
| URLRoute | path | Globally unique across all languages |
| URLRoute | isPrimary | Only one primary URL per ContentVersion |
| URLRedirect | fromPath | Cannot equal URLRoute.path (no self-redirects) |
| URLRedirect | statusCode | Must be 301 or 410 |
| UserPreferences | expiresAt | Must be > createdAt |
| Currency | code | Must be valid ISO 4217 code |
| Locale | code | Must be valid IETF BCP 47 code |
| Locale | firstDayOfWeek | Must be 0-6 |

---

## State Transitions

### Content Publishing Flow

```
[Draft] ──(admin publishes)──> [Published] ──(admin archives)──> [Archived]
   │                                │
   │                                │
   └──(admin deletes)──> [Deleted] <─┘
```

**Business Logic**:
1. **Draft → Published**:
   - Set `Content.status = 'published'`
   - Set all associated `ContentVersion.isPublished = true`
   - Set `ContentVersion.publishedAt = now()`
   - URLRoutes become active

2. **Published → Archived**:
   - Set `Content.status = 'archived'`
   - Set all `ContentVersion.isPublished = false`
   - URLRoutes `isActive = false`
   - Create 410 redirects from all URLs

3. **Any State → Deleted**:
   - Soft delete: Set `Content.status = 'deleted'`
   - Hard delete: CASCADE delete all ContentVersions, URLRoutes, URLRedirects

### URL Slug Change Flow

```
[Old Slug] ──(admin changes slug)──> [New Slug]
    │
    │ (system creates redirect)
    ▼
[301 Redirect] ──(old slug)──> [New Slug]
```

**Business Logic**:
1. Admin updates `ContentVersion.slug` (e.g., "eco-bottle" → "eco-water-bottle")
2. System creates new `URLRoute`:
   - `path = "/products/eco-water-bottle"`
   - `isPrimary = true`
   - `isActive = true`
3. System updates old `URLRoute`:
   - `isPrimary = false`
   - `isActive = false`
4. System creates `URLRedirect`:
   - `fromPath = "/products/eco-bottle"`
   - `toPrimaryUrlId = <new URLRoute.id>`
   - `statusCode = 301`
   - `reason = "slug_changed"`

---

## Database Schema (PostgreSQL)

### Tables

```sql
-- Languages
CREATE TABLE languages (
    code VARCHAR(2) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    direction VARCHAR(3) NOT NULL CHECK (direction IN ('ltr', 'rtl')),
    url_prefix VARCHAR(10) NOT NULL,
    default_currency VARCHAR(3) NOT NULL,
    locale_code VARCHAR(10) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL,
    CONSTRAINT one_default_language CHECK (
        (SELECT COUNT(*) FROM languages WHERE is_default = TRUE) = 1
    )
);

-- Content (base)
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('page', 'product', 'article')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL
);

-- Content Versions
CREATE TABLE content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    language_code VARCHAR(2) NOT NULL REFERENCES languages(code),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    excerpt TEXT,
    meta_title VARCHAR(500),
    meta_description VARCHAR(1000),
    meta_keywords TEXT[], -- PostgreSQL array
    custom_schema JSONB,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP,
    translations JSONB, -- { "it": "uuid", "he": "uuid" }
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(content_id, language_code),
    UNIQUE(content_id, language_code, slug)
);

-- URL Routes
CREATE TABLE url_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_version_id UUID NOT NULL REFERENCES content_versions(id) ON DELETE CASCADE,
    language_code VARCHAR(2) NOT NULL REFERENCES languages(code),
    path VARCHAR(500) NOT NULL UNIQUE,
    slug VARCHAR(200) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    canonical_url VARCHAR(500) NOT NULL,
    alternate_urls JSONB, -- { "it": "url", "he": "url" }
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT one_primary_per_content_version CHECK (
        (SELECT COUNT(*) FROM url_routes
         WHERE content_version_id = url_routes.content_version_id
         AND is_primary = TRUE) <= 1
    )
);

-- URL Redirects
CREATE TABLE url_redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_path VARCHAR(500) NOT NULL,
    to_primary_url_id UUID NOT NULL REFERENCES url_routes(id),
    status_code INTEGER NOT NULL CHECK (status_code IN (301, 410)),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    reason VARCHAR(50)
);

-- Currencies
CREATE TABLE currencies (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    decimal_places INTEGER NOT NULL DEFAULT 2 CHECK (decimal_places BETWEEN 0 AND 3),
    symbol_position VARCHAR(10) NOT NULL CHECK (symbol_position IN ('before', 'after')),
    thousands_separator VARCHAR(5) NOT NULL,
    decimal_separator VARCHAR(5) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL
);

-- User Preferences (may be stored in Redis instead)
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    selected_currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    dismissed_language_prompt BOOLEAN NOT NULL DEFAULT FALSE,
    detected_language VARCHAR(2) REFERENCES languages(code),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    UNIQUE(session_id)
);

-- Locales
CREATE TABLE locales (
    code VARCHAR(10) PRIMARY KEY,
    language_code VARCHAR(2) NOT NULL REFERENCES languages(code),
    country_code VARCHAR(2) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    date_format VARCHAR(20) NOT NULL,
    time_format VARCHAR(3) NOT NULL CHECK (time_format IN ('12h', '24h')),
    first_day_of_week INTEGER NOT NULL CHECK (first_day_of_week BETWEEN 0 AND 6),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_content_versions_content_id ON content_versions(content_id);
CREATE INDEX idx_content_versions_language_code ON content_versions(language_code);
CREATE INDEX idx_content_versions_slug ON content_versions(slug);
CREATE INDEX idx_url_routes_content_version_id ON url_routes(content_version_id);
CREATE INDEX idx_url_routes_path ON url_routes(path);
CREATE INDEX idx_url_redirects_from_path ON url_redirects(from_path);
CREATE INDEX idx_user_preferences_session_id ON user_preferences(session_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

---

## Summary

This data model provides:

1. **Multi-Language Support**: 3 languages (English, Italian, Hebrew) with RTL support
2. **SEO Optimization**: URL routing with redirects (301/410), canonical URLs, hreflang support
3. **Content Management**: Versioned content with partial translations and publishing workflow
4. **User Preferences**: Currency selection and language prompt dismissal (Redis or PostgreSQL)
5. **Locale Support**: Cultural formatting for dates, times, numbers per language
6. **Audit Trail**: Immutable redirect history, created/updated timestamps

**Key Design Decisions**:
- ✅ Clean Architecture: Entities are framework-agnostic
- ✅ SOLID: Single responsibility per entity
- ✅ Performance: Denormalized `translations` field for fast lookups
- ✅ SEO: Comprehensive URL management with redirect history
- ✅ Flexibility: JSONB fields for custom schema and translations mapping
- ✅ Data Integrity: Check constraints, unique constraints, foreign keys

**Status**: Phase 1 Data Model Complete ✅
**Next**: API Contracts (OpenAPI schemas)
