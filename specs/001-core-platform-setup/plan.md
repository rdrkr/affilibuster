
# Implementation Plan: Core Platform Setup & Multi-Language Infrastructure

**Branch**: `001-core-platform-setup` | **Date**: 2025-10-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-core-platform-setup/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Loaded from /specs/001-core-platform-setup/spec.md
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ Project Type: Web application (Next.js + FastAPI)
   → ✅ All technical decisions made (see Technical Context)
3. Fill the Constitution Check section
   → ✅ Completed based on constitution v1.0.0
4. Evaluate Constitution Check section
   → ✅ No violations identified
   → ✅ Update Progress Tracking: Initial Constitution Check PASS
5. Execute Phase 0 → research.md
   → In progress
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → Pending Phase 0 completion
7. Re-evaluate Constitution Check section
   → Pending Phase 1 completion
8. Plan Phase 2 → Describe task generation approach
   → Pending
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 9. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

This feature establishes the foundational platform infrastructure for a multi-language eco-friendly affiliate website. The platform will support three languages (English, Italian, Hebrew) with separate URL paths per language, dynamic currency selection, and comprehensive SEO optimization. The architecture uses Next.js for the frontend (SSG/ISR for performance), FastAPI for the backend API, PostgreSQL for data persistence, and Strapi as a headless CMS for non-technical content management.

Key capabilities:
- Language-specific URL routing (root for English, /it for Italian, /il for Hebrew) with RTL support for Hebrew
- Browser/location detection with opt-in language switching prompts
- Multi-currency support with user preferences persistence
- SEO-optimized URLs with custom slugs per language
- hreflang tags, schema markup, and language-specific sitemaps
- Static HTML generation for performance (<3s load, Lighthouse >90)
- API-first design supporting future headless expansions

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.3+ with Next.js 14 (App Router)
- Backend: Python 3.11+ with type hints
- CMS: Strapi 4.x (TypeScript)

**Primary Dependencies**:
- Frontend: Next.js 14, React 18, next-intl (i18n), tailwindcss, next-seo
- Backend: FastAPI 0.104+
- Database: PostgreSQL 15+
- CMS: Strapi 4.x with PostgreSQL adapter
- Caching: Redis (for session/currency preferences)
- Testing: Frontend (Jest, React Testing Library, Playwright), Backend (pytest, httpx)

**Storage**: PostgreSQL 15+ (primary database for all services)

**Testing**:
- Frontend: Jest (unit), React Testing Library (component), Playwright (E2E)
- Backend: pytest (unit/integration), httpx (API client testing)
- Contract testing: Pact or manual OpenAPI validation

**Target Platform**:
- Frontend: Vercel (SSG/ISR deployment)
- Backend: Vercel serverless functions or dedicated Python hosting
- CMS: Self-hosted or Strapi Cloud
- Database: Vercel Postgres or managed PostgreSQL

**Project Type**: Web application (frontend + backend + CMS)

**Performance Goals**:
- Page load <3s on 3G connections
- Lighthouse performance score >90
- Time to First Byte (TTFB) <600ms
- First Contentful Paint (FCP) <1.8s
- Largest Contentful Paint (LCP) <2.5s

**Constraints**:
- Must support RTL layouts for Hebrew
- SEO-critical: proper hreflang, schema markup, custom slugs
- 301/410 redirect management for URL changes
- API versioning from day one (v1)
- Minimum 80% test coverage
- WCAG 2.1 AA accessibility compliance

**Scale/Scope**:
- Initial: 3 languages, ~50-100 pages per language
- Traffic: 10k-50k monthly visitors initially
- CMS users: 5-10 non-technical editors
- Future: Additional affiliate sites using same platform

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Clean Architecture Compliance**
- [x] Business logic isolated from framework dependencies
  - Language entities, URL routing logic, currency conversion in domain layer
  - Next.js, FastAPI, Strapi as framework/infrastructure layer only
- [x] Dependency inversion properly applied
  - Abstract interfaces for CMS, database, caching defined in use cases
  - Concrete implementations (Strapi, PostgreSQL, Redis) inject via DI
- [x] Clear layer separation (entities → use cases → adapters → frameworks)
  - Entities: Language, Content, URLRoute, Currency, UserPreferences
  - Use Cases: GetLocalizedContent, SwitchLanguage, SetCurrency, DetectUserLanguage
  - Adapters: REST API controllers, Next.js pages, Strapi plugins
  - Frameworks: Next.js, FastAPI, Strapi
- Violations: None

**II. SOLID Principles Compliance**
- [x] Single Responsibility: Each module has one reason to change
  - Language detection module separate from routing
  - Currency formatting separate from pricing logic
  - URL generation separate from content retrieval
- [x] Dependencies on abstractions, not concretions
  - ICMSRepository interface, not direct Strapi calls
  - ICacheService interface, not direct Redis calls
- Violations: None

**III. Test-First Development**
- [x] Tests planned before implementation
  - Contract tests for all language/content APIs
  - Integration tests for language switching flow
  - E2E tests for SEO requirements (hreflang, schema)
- [x] Contract tests for all API endpoints
  - /api/v1/content/{lang}/{slug}
  - /api/v1/languages
  - /api/v1/currencies
  - /api/v1/user/preferences
- [x] Integration tests for user flows
  - Language detection and prompt display
  - Manual language switching with URL redirect
  - Currency selector persistence
  - Fallback to English for missing translations
- [x] Minimum 80% code coverage target

**IV. Modular & Reusable Architecture**
- [x] Components designed for multi-site reusability
  - Language switcher component (framework-agnostic logic)
  - Currency selector component
  - RTL layout wrapper
  - SEO meta generator (hreflang, schema)
- [x] Configuration separated from core logic
  - Site config: supported languages, default currency, domain
  - All business logic reads from config, never hardcoded
- [x] Generic implementation over site-specific code
  - Language/currency services work for any affiliate site
  - URL routing system accepts any language/slug configuration
- Violations: None

**V. Integration Testing Priority**
- [x] Tests planned for all new contracts
  - CMS content API contract
  - Language preference API contract
  - Currency API contract
- [x] Tests planned for inter-module communication
  - Frontend ↔ Backend content fetching
  - Backend ↔ CMS content synchronization
  - Backend ↔ Cache for user preferences
- [x] Tests planned for shared schemas
  - Content model schema (used by CMS, API, Frontend)
  - Language model schema
  - URLRoute schema

**VI. API-First Design**
- [x] API contracts defined before implementation
  - OpenAPI 3.1 spec for all endpoints
  - Defined in Phase 1 (see /contracts/)
- [x] Contract documents in /contracts/
  - content-api.yaml
  - language-api.yaml
  - currency-api.yaml
  - preferences-api.yaml
- [x] API versioning strategy defined
  - All endpoints prefixed with /api/v1/
  - Version in URL path, not headers
  - Backward compatibility for v1 during v2 development
- [x] Documentation plan in place
  - OpenAPI specs serve as documentation
  - Swagger UI for API exploration
  - Examples in quickstart.md

**VII. Performance & SEO Standards**
- [x] Page load <3s target validated
  - Next.js SSG for all static pages
  - ISR for dynamic content (revalidate every 60s)
  - Critical CSS inlined via Next.js optimization
- [x] Lighthouse >90 score plan
  - Image optimization (WebP, srcset, lazy loading)
  - Font optimization (subset, preload)
  - Code splitting per route
- [x] Schema markup planned for entities
  - Organization schema
  - WebPage schema with language alternates
  - Product schema (future features)
  - BreadcrumbList schema
- [x] Multi-language SEO strategy (hreflang tags)
  - x-default for English (root domain)
  - it for /it/* paths
  - he for /il/* paths
  - Canonical URLs per language version
- [x] Image optimization strategy defined
  - Next.js Image component (automatic WebP conversion)
  - Responsive images with srcset
  - Lazy loading below the fold
  - Alt tags required in CMS schema

## Project Structure

### Documentation (this feature)
```
specs/002-core-platform-setup/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── content-api.yaml
│   ├── language-api.yaml
│   ├── currency-api.yaml
│   └── preferences-api.yaml
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
backend/
├── src/
│   ├── domain/
│   │   ├── entities/         # Language, Content, URLRoute, Currency, UserPreferences
│   │   ├── repositories/     # Abstract interfaces (ICMSRepository, ICacheService)
│   │   └── use_cases/        # GetLocalizedContent, SwitchLanguage, etc.
│   ├── infrastructure/
│   │   ├── api/              # FastAPI routers, request/response models
│   │   ├── cms/              # Strapi client implementation
│   │   ├── cache/            # Redis client implementation
│   │   └── database/         # PostgreSQL models (SQLAlchemy/Tortoise)
│   └── config/               # Settings, environment variables
└── tests/
    ├── contract/             # OpenAPI contract validation tests
    ├── integration/          # API integration tests
    └── unit/                 # Domain logic unit tests

frontend/
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── [lang]/           # Dynamic language route segment
│   │   ├── api/              # API route handlers (if needed)
│   │   └── layout.tsx        # Root layout with i18n provider
│   ├── components/
│   │   ├── LanguageSwitcher/ # Language selector component
│   │   ├── CurrencySelector/ # Currency selector component
│   │   ├── LanguagePrompt/   # Language detection prompt
│   │   └── RTLWrapper/       # RTL layout wrapper for Hebrew
│   ├── lib/
│   │   ├── api/              # Backend API client
│   │   ├── i18n/             # next-intl configuration
│   │   └── seo/              # SEO helpers (hreflang, schema)
│   └── types/                # TypeScript type definitions
└── tests/
    ├── components/           # Component tests (React Testing Library)
    ├── integration/          # Integration tests (Playwright)
    └── unit/                 # Utility function tests

cms/
├── src/
│   ├── api/                  # Custom Strapi API extensions
│   ├── plugins/              # Custom plugins (multi-language, SEO)
│   └── config/               # Strapi configuration
└── tests/
    └── integration/          # CMS API tests

shared/
├── types/                    # Shared TypeScript types across frontend/backend
└── contracts/                # OpenAPI specs (source of truth)
```

**Structure Decision**: Web application structure selected due to clear separation of concerns:
- **Backend**: API-first backend providing language, content, currency services
- **Frontend**: Next.js SSG/ISR frontend consuming backend APIs
- **CMS**: Strapi headless CMS for content management by non-technical editors
- **Shared**: Common types and contracts for consistency

This structure supports Clean Architecture by enforcing clear boundaries between layers and enables independent deployment of frontend/backend/CMS services.

## Phase 0: Outline & Research

### Research Tasks

All technical decisions have been provided through clarifications. The following research will validate and document best practices:

1. **Next.js 14 App Router i18n best practices**
   - Decision: Use next-intl for internationalization
   - Research: Validate next-intl vs next-i18next for App Router
   - Focus: SSG/ISR support, URL routing patterns, performance

2. **Python backend framework selection**
   - Decision: FastAPI selected
   - Research: Clean Architecture support, type safety, async capabilities
   - Focus: Which better supports domain-driven design patterns

3. **Strapi multi-language content modeling**
   - Decision: How to structure content types for 3 languages
   - Research: Strapi i18n plugin vs custom implementation
   - Focus: Admin UX for editors, API performance, partial translations

4. **RTL layout implementation**
   - Decision: CSS-in-JS vs Tailwind CSS for RTL support
   - Research: Best practices for Hebrew RTL layouts
   - Focus: Component mirroring, text direction handling

5. **SEO optimization for multi-language sites**
   - Decision: hreflang implementation strategy
   - Research: Google's multi-language SEO guidelines
   - Focus: Sitemap generation, schema markup per language

6. **Currency handling and formatting**
   - Decision: Library selection for currency formatting
   - Research: dinero.js vs currency.js vs Intl.NumberFormat
   - Focus: Locale-aware formatting, precision handling

7. **Caching strategy for user preferences**
   - Decision: Redis caching patterns
   - Research: Session storage vs dedicated cache for currency/language prefs
   - Focus: TTL strategy, cache invalidation

8. **Static generation vs ISR trade-offs**
   - Decision: When to use SSG vs ISR for different page types
   - Research: Next.js revalidation strategies
   - Focus: Build time vs runtime performance, stale content handling

### Research Output Template

Each research task will be documented in `research.md` with:

```markdown
## [Research Topic]

### Decision
[Final decision made]

### Rationale
[Why this decision was chosen]

### Alternatives Considered
- **Option A**: [Pros/Cons]
- **Option B**: [Pros/Cons]

### Implementation Notes
[Key technical details for Phase 1]

### References
- [Documentation links]
- [Blog posts, guides]
```

**Output**: research.md with all decisions validated and documented

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

### 1. Data Model Design

Extract entities from feature spec and design data models in `data-model.md`:

#### Core Entities

**Language Entity**
```typescript
interface Language {
  code: string;              // 'en' | 'it' | 'he'
  displayName: string;       // 'English', 'Italiano', 'עברית'
  direction: 'ltr' | 'rtl';
  urlPrefix: string;         // '' | '/it' | '/il'
  defaultCurrency: CurrencyCode;
  localeCode: string;        // 'en-US', 'it-IT', 'he-IL'
  isDefault: boolean;
}
```

**Content Entity (Abstract)**
```typescript
interface Content {
  id: string;
  type: 'page' | 'product' | 'article';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}
```

**ContentVersion Entity**
```typescript
interface ContentVersion {
  contentId: string;
  languageCode: string;
  title: string;
  slug: string;              // Customizable per language
  body: string;              // Rich text content
  metaTitle?: string;
  metaDescription?: string;
  customSchema?: object;     // Custom schema markup
  isPublished: boolean;
  translations: {            // Linked versions in other languages
    [lang: string]: string;  // contentId
  };
}
```

**URLRoute Entity**
```typescript
interface URLRoute {
  id: string;
  contentVersionId: string;
  languageCode: string;
  path: string;              // Full path: '/products/eco-bottle' or '/it/prodotti/bottiglia'
  slug: string;              // Last segment: 'eco-bottle'
  redirects: URLRedirect[];
  canonicalUrl: string;
  alternateUrls: {           // For hreflang
    [lang: string]: string;
  };
}

interface URLRedirect {
  fromPath: string;
  statusCode: 301 | 410;
  createdAt: Date;
}
```

**Currency Entity**
```typescript
interface Currency {
  code: CurrencyCode;        // 'USD' | 'EUR' | 'ILS' | ...
  symbol: string;            // '$', '€', '₪'
  decimalPlaces: number;     // Usually 2
  symbolPosition: 'before' | 'after';
  thousandsSeparator: string; // ',', '.', ' '
  decimalSeparator: string;   // '.', ','
}
```

**UserPreferences Entity**
```typescript
interface UserPreferences {
  sessionId: string;         // Anonymous users
  userId?: string;           // Logged-in users (future)
  selectedCurrency: CurrencyCode;
  dismissedLanguagePrompt: boolean;
  detectedLanguage?: string;
  createdAt: Date;
  expiresAt: Date;           // TTL for cache
}
```

**Locale Entity**
```typescript
interface Locale {
  code: string;              // 'en-US', 'it-IT', 'he-IL'
  languageCode: string;
  countryCode: string;
  dateFormat: string;        // 'MM/DD/YYYY', 'DD/MM/YYYY'
  timeFormat: string;        // '12h', '24h'
  firstDayOfWeek: number;    // 0 (Sunday) - 6 (Saturday)
}
```

#### Relationships

- Language 1:N ContentVersion (one language has many content versions)
- ContentVersion 1:1 URLRoute (each version has one primary URL)
- URLRoute 1:N URLRedirect (old URLs redirect to current URL)
- UserPreferences N:1 Currency (many users select one currency)

#### Validation Rules

- Language.code must be one of: 'en', 'it', 'he'
- ContentVersion.slug must be unique per (contentId, languageCode)
- URLRoute.path must be unique across all languages
- URLRedirect.fromPath must not equal URLRoute.path (no self-redirects)
- UserPreferences.expiresAt must be > createdAt

#### State Transitions

**Content Publishing Flow**:
1. Draft → Review → Published
2. Published → Archived (when removed, creates 410 redirect)

**URL Slug Changes**:
1. Admin updates slug
2. System creates new URLRoute with new path
3. System creates URLRedirect (301) from old path to new path
4. Old URLRoute marked as redirected

### 2. API Contract Generation

Generate OpenAPI 3.1 contracts for all endpoints:

#### Content API (`contracts/content-api.yaml`)

```yaml
openapi: 3.1.0
paths:
  /api/v1/content/{lang}/{slug}:
    get:
      summary: Get localized content by slug
      parameters:
        - name: lang
          in: path
          required: true
          schema:
            type: string
            enum: [en, it, he]
        - name: slug
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Content found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContentResponse'
        '404':
          description: Content not found (fallback to English or 404 page)
```

#### Language API (`contracts/language-api.yaml`)

```yaml
/api/v1/languages:
  get:
    summary: Get all supported languages
    responses:
      '200':
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/Language'

/api/v1/languages/detect:
  post:
    summary: Detect user's preferred language from headers
    requestBody:
      content:
        application/json:
          schema:
            type: object
            properties:
              acceptLanguage: { type: string }
              userAgent: { type: string }
    responses:
      '200':
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DetectedLanguage'
```

#### Currency API (`contracts/currency-api.yaml`)

```yaml
/api/v1/currencies:
  get:
    summary: Get all supported currencies
    responses:
      '200':
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/Currency'

/api/v1/currencies/convert:
  post:
    summary: Convert price to selected currency
    requestBody:
      content:
        application/json:
          schema:
            type: object
            properties:
              amount: { type: number }
              fromCurrency: { type: string }
              toCurrency: { type: string }
    responses:
      '200':
        content:
          application/json:
            schema:
              type: object
              properties:
                amount: { type: number }
                formatted: { type: string }
```

#### Preferences API (`contracts/preferences-api.yaml`)

```yaml
/api/v1/user/preferences:
  get:
    summary: Get user preferences
    parameters:
      - name: sessionId
        in: header
        required: true
        schema:
          type: string
    responses:
      '200':
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserPreferences'

  put:
    summary: Update user preferences
    requestBody:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/UpdatePreferences'
    responses:
      '200':
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserPreferences'
```

### 3. Contract Test Generation

Generate failing contract tests (TDD red phase):

**Backend Contract Tests** (`backend/tests/contract/`):
- `test_content_api_contract.py`: Validate content API responses against OpenAPI schema
- `test_language_api_contract.py`: Validate language detection and listing
- `test_currency_api_contract.py`: Validate currency operations
- `test_preferences_api_contract.py`: Validate user preferences CRUD

**Frontend Integration Tests** (`frontend/tests/integration/`):
- `content-fetching.spec.ts`: Test API client fetches content correctly
- `language-switching.spec.ts`: Test language switch triggers correct API calls
- `currency-selection.spec.ts`: Test currency selector updates preferences

All tests will initially fail (no implementation).

### 4. Integration Test Scenarios

Extract from user stories in spec:

**Scenario 1: Language Detection & Prompt**
```typescript
describe('Language Detection Flow', () => {
  it('should detect browser language and show prompt', async () => {
    // Given: User with Italian browser lands on English site
    // When: Page loads
    // Then: Prompt appears asking to switch to Italian (/it)
  });

  it('should not prompt if user dismisses', async () => {
    // Given: User dismissed prompt
    // When: User navigates to another page
    // Then: No prompt appears (session storage check)
  });
});
```

**Scenario 2: Manual Language Switching**
```typescript
describe('Manual Language Switch', () => {
  it('should redirect to correct language URL', async () => {
    // Given: User on /products/eco-bottle
    // When: User selects Italian from language switcher
    // Then: Redirects to /it/prodotti/bottiglia-eco
    // And: Content displays in Italian
  });
});
```

**Scenario 3: RTL Layout**
```typescript
describe('RTL Layout for Hebrew', () => {
  it('should apply RTL styles for Hebrew pages', async () => {
    // Given: User navigates to /il/products/eco-bottle
    // When: Page renders
    // Then: html[dir="rtl"] is set
    // And: CSS applies RTL layout
  });
});
```

**Scenario 4: Currency Selection**
```typescript
describe('Currency Selector', () => {
  it('should persist currency across language switches', async () => {
    // Given: User selects EUR on English site
    // When: User switches to Hebrew (/il)
    // Then: Prices still display in EUR
    // And: Currency preference saved in session
  });
});
```

**Scenario 5: Fallback to English**
```typescript
describe('Content Fallback', () => {
  it('should show English content when translation missing', async () => {
    // Given: Product has English and Italian, but not Hebrew
    // When: User navigates to /il/products/new-product
    // Then: UI is in Hebrew
    // And: Content displays in English (fallback)
  });
});
```

**Scenario 6: SEO Verification**
```typescript
describe('SEO Meta Tags', () => {
  it('should generate correct hreflang tags', async () => {
    // Given: Page exists in all 3 languages
    // When: Page renders
    // Then: hreflang tags include x-default, it, he
    // And: Each points to correct URL
  });

  it('should include schema markup in correct language', async () => {
    // Given: Italian page
    // When: Page renders
    // Then: Schema markup is in Italian
  });
});
```

### 5. Quickstart Guide

Create `quickstart.md` with step-by-step validation:

```markdown
# Quickstart: Multi-Language Platform

## Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis

## Setup Steps

1. Clone repository and install dependencies
2. Configure environment variables (see .env.example)
3. Run database migrations
4. Start development servers (frontend, backend, CMS)

## Verify Multi-Language Support

### Test 1: Language Detection
1. Open browser with Italian language preference
2. Navigate to http://localhost:3000
3. ✅ Verify prompt appears: "Vuoi passare alla versione italiana?"
4. Click "Sì"
5. ✅ Verify redirect to /it
6. ✅ Verify UI is in Italian

### Test 2: Manual Language Switch
1. Navigate to /products/eco-bottle
2. Click language selector
3. Select "עברית" (Hebrew)
4. ✅ Verify redirect to /il/products/eco-bottle
5. ✅ Verify RTL layout (dir="rtl")
6. ✅ Verify UI text in Hebrew

### Test 3: Currency Selection
1. On /it page, open currency selector
2. Select "USD"
3. ✅ Verify prices show in USD (e.g., "$10.00")
4. Switch to /he page
5. ✅ Verify prices still in USD (preference persisted)

### Test 4: SEO Meta Tags
1. Navigate to /it/prodotti/eco-bottle
2. View page source
3. ✅ Verify <html lang="it">
4. ✅ Verify hreflang tags present:
   - <link rel="alternate" hreflang="x-default" href="https://affilibuster.com/products/eco-bottle" />
   - <link rel="alternate" hreflang="it" href="https://affilibuster.com/it/prodotti/eco-bottle" />
   - <link rel="alternate" hreflang="he" href="https://affilibuster.com/il/products/eco-bottle" />
5. ✅ Verify schema markup in Italian

### Test 5: URL Redirects
1. CMS: Change English slug from "eco-bottle" to "eco-water-bottle"
2. Navigate to /products/eco-bottle (old URL)
3. ✅ Verify 301 redirect to /products/eco-water-bottle
4. CMS: Delete Italian version of product
5. Navigate to /it/prodotti/eco-bottle
6. ✅ Verify 410 Gone status

## Performance Validation

1. Run Lighthouse audit on each language version:
   - /
   - /it
   - /il
2. ✅ Verify all scores >90
3. ✅ Verify LCP <2.5s on 3G throttling
```

### 6. Update Agent Context

Run the agent context update script:

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will update `CLAUDE.md` with:
- Project structure overview
- Technology stack (Next.js 14, FastAPI, Strapi, PostgreSQL)
- Key architectural decisions
- Multi-language routing patterns
- Currency handling approach
- SEO optimization strategy

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
The /tasks command will load `.specify/templates/tasks-template.md` and generate tasks from Phase 1 artifacts:

1. **From OpenAPI Contracts** (contracts/\*.yaml):
   - Each endpoint → contract test task [P]
   - Each endpoint → implementation task
   - Each endpoint → integration test task

2. **From Data Model** (data-model.md):
   - Each entity → database migration task [P]
   - Each entity → model class task [P]
   - Each entity → repository implementation task
   - Each entity → use case implementation task

3. **From Quickstart** (quickstart.md):
   - Each test scenario → E2E test task
   - Each validation step → manual testing checklist

**Ordering Strategy**:
1. **Setup Phase** (T001-T010):
   - Initialize project structure (backend, frontend, CMS)
   - Configure databases and caching
   - Setup testing frameworks

2. **Tests First - TDD** (T011-T040):
   - Contract tests for all APIs [P]
   - Integration tests for user flows [P]
   - E2E tests from quickstart scenarios [P]

3. **Core Implementation** (T041-T080):
   - Database models and migrations [P]
   - Domain entities and use cases [P]
   - API endpoint implementations (depends on tests)
   - Frontend components (LanguageSwitcher, CurrencySelector) [P]
   - Frontend pages with language routing [P]

4. **Integration** (T081-T100):
   - CMS content model configuration
   - Frontend ↔ Backend API integration
   - Backend ↔ CMS integration
   - Redis caching layer

5. **SEO & Performance** (T101-T120):
   - hreflang tag generation
   - Schema markup implementation
   - Sitemap generation
   - Image optimization
   - Critical CSS inlining

6. **Polish & Validation** (T121-T130):
   - Run all tests (contract, integration, E2E)
   - Lighthouse audits (all languages)
   - Manual quickstart validation
   - Documentation updates

**Task Parallelization**:
- Different files = [P] marker for parallel execution
- Same file = sequential execution
- Examples:
  - [P] T011-T020: Contract tests (different files)
  - T041: Currency model → T042: Currency repository (same domain, sequential)

**Estimated Output**: 130 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No violations identified. All constitutional principles are satisfied:
- Clean Architecture: Clear separation between domain, use cases, and infrastructure
- SOLID: Single responsibility maintained across all modules
- TDD: Contract and integration tests planned before implementation
- Modular: Language and currency systems are reusable across affiliate sites
- API-First: OpenAPI contracts define all interfaces
- Performance: SSG/ISR strategy meets <3s load time and Lighthouse >90 targets

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) ✅
  - research.md created with 8 technical decisions documented
- [x] Phase 1: Design complete (/plan command) ✅
  - data-model.md created (7 entities, relationships, validation rules)
  - contracts/api-v1.yaml created (OpenAPI 3.1 spec for all endpoints)
  - quickstart.md created (6 verification tests, performance validation)
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
  - Task generation strategy defined
  - Estimated 130 tasks across 6 phases
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
  - Clean Architecture: Domain entities isolated, DI patterns defined
  - SOLID: Single responsibility maintained
  - TDD: Contract tests planned before implementation
  - Modular: Reusable components designed (language switcher, currency selector)
  - API-First: OpenAPI contracts complete
  - Performance: SSG/ISR strategy meets targets
- [x] All NEEDS CLARIFICATION resolved (all tech decisions made) ✅
- [x] Complexity deviations documented (none) ✅

**Artifacts Generated**:
- ✅ /specs/002-core-platform-setup/research.md
- ✅ /specs/002-core-platform-setup/data-model.md
- ✅ /specs/002-core-platform-setup/contracts/api-v1.yaml
- ✅ /specs/002-core-platform-setup/quickstart.md
- ✅ /specs/002-core-platform-setup/plan.md (this file)

**Next Step**: Run `/tasks` command to generate tasks.md from Phase 1 artifacts

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
