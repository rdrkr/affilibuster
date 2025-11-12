# Tasks: Core Platform Setup & Multi-Language Infrastructure

**Input**: Design documents from `/specs/001-core-platform-setup/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/api-v1.yaml, quickstart.md

## Execution Summary

This task list implements a multi-language affiliate platform with:
- **Frontend**: Next.js 14 (App Router) with next-intl, Tailwind CSS (RTL support)
- **Backend**: FastAPI with SQLAlchemy, Pydantic validation
- **CMS**: Strapi with i18n plugin
- **Database**: PostgreSQL 15+
- **Cache**: Redis (user preferences, sessions)

**Total Tasks**: 184 tasks across 5 phases
**Estimated Complexity**: High (multi-service architecture, 3 languages, SEO optimization)

---

## How to Use This Task List

Each task includes:
- **File path**: Where to implement the code
- **→ Reference**: Specific sections in design documents (format: `file:lines` or `file:section`)
- **→ Validation**: How to verify the task is complete
- **[P]** marker: Can run in parallel with other [P] tasks (different files, no dependencies)

**Finding References**: Use `Cmd+F` to search design docs by line numbers (e.g., "data-model.md:572")

---

## Phase 3.1: Project Setup (T001-T025)

**Objective**: Initialize monorepo structure and configure all development tools

- [X] **T001** Create monorepo directory structure
      - **Path**: Repository root
      - **→ Reference**: plan.md:232-281 (Project Structure)
      - **Create**: backend/, frontend/, cms/, shared/, .github/
      - **→ Validation**: All directories exist with README.md

- [X] **T002** Initialize backend FastAPI project with Poetry
      - **Path**: backend/pyproject.toml
      - **→ Reference**: research.md:42-74 (FastAPI Decision), plan.md:54-56 (Backend dependencies)
      - **Dependencies**: fastapi>=0.104, sqlalchemy>=2.0, pydantic>=2.0, alembic, pytest, httpx
      - **→ Validation**: `poetry install` succeeds, `poetry run uvicorn src.main:app` starts

- [X] **T003** Initialize frontend Next.js 14 project
      - **Path**: frontend/package.json
      - **→ Reference**: plan.md:50-51, 54-55 (Frontend: Next.js 14, React 18, next-intl, tailwindcss)
      - **Create**: `npx create-next-app@14 --typescript --app --tailwind`
      - **→ Validation**: `npm run dev` starts on port 3000

- [X] **T004** Initialize Strapi CMS
      - **Path**: cms/package.json
      - **→ Reference**: plan.md:52, 58 (CMS: Strapi 4.x with PostgreSQL adapter)
      - **Create**: `npx create-strapi-app@latest cms --typescript`
      - **→ Validation**: `npm run develop` starts admin panel on port 1337

- [X] **T005** Create shared types package structure
      - **Path**: shared/package.json
      - **→ Reference**: plan.md:279-281 (Shared: Common types and contracts)
      - **Setup**: TypeScript library package, export from index.ts
      - **→ Validation**: Package builds with `tsc`, no errors

- [X] **T005A** [P] Generate TypeScript types from API contracts
      - **Path**: shared/types/api.ts
      - **→ Reference**: contracts/api-v1.yaml:275-626 (All component schemas)
      - **Generate**: Language, Currency, ContentResponse, UserPreferences, SEOMetadata, URLData
      - **→ Validation**: Types match OpenAPI schemas exactly

- [X] **T005B** [P] Generate TypeScript types for domain entities
      - **Path**: shared/types/entities.ts
      - **→ Reference**: data-model.md:12-428 (All 7 entity interfaces)
      - **Export**: Language, Content, ContentVersion, URLRoute, Currency, UserPreferences, Locale
      - **→ Validation**: Frontend and backend can import without errors

- [X] **T006** [P] Configure backend linting
      - **Path**: backend/pyproject.toml, backend/.ruff.toml
      - **→ Reference**: plan.md:89 (Minimum 80% test coverage target)
      - **Tools**: ruff (linter), black (formatter), mypy (type checking)
      - **→ Validation**: `ruff check .` passes, `mypy src/` has no errors

- [X] **T007** [P] Configure frontend linting
      - **Path**: frontend/.eslintrc.json, frontend/.prettierrc
      - **→ Reference**: plan.md:50 (TypeScript 5.3+)
      - **Rules**: ESLint with TypeScript, Prettier, import sorting
      - **→ Validation**: `npm run lint` passes on all files

- [X] **T008** [P] Setup PostgreSQL database schemas
      - **Path**: Database server (create manually or via Docker)
      - **→ Reference**: plan.md:57, 62 (PostgreSQL 15+ for all services)
      - **Create**: `affilibuster` (backend), `affilibuster_cms` (Strapi)
      - **→ Validation**: `psql -l` shows both databases

- [X] **T009** [P] Setup Redis connection configuration
      - **Path**: backend/.env.example
      - **→ Reference**: plan.md:59 (Redis for session/currency preferences), research.md:271-285
      - **Config**: REDIS_URL=redis://localhost:6379, TTL settings
      - **→ Validation**: `redis-cli ping` returns PONG

- [X] **T010** Configure Docker Compose for local development
      - **Path**: docker-compose.yml
      - **→ Reference**: plan.md:232-281 (All services)
      - **Services**: postgres:15, redis:7, backend (port 8000), frontend (port 3000), cms (port 1337)
      - **→ Validation**: `docker-compose up -d` starts all services

- [X] **T011** [P] Setup Alembic migrations
      - **Path**: backend/alembic.ini, backend/alembic/env.py
      - **→ Reference**: plan.md:62 (Database: PostgreSQL 15+)
      - **Config**: Point to PostgreSQL, import all models
      - **→ Validation**: `alembic current` shows no errors

- [X] **T012** [P] Configure Vercel deployment settings
      - **Path**: frontend/vercel.json
      - **→ Reference**: plan.md:69-71 (Target Platform: Vercel SSG/ISR)
      - **Config**: Build command, output directory, environment variables
      - **→ Validation**: `vercel build` succeeds locally

- [X] **T013** [P] Setup GitHub Actions CI/CD
      - **Path**: .github/workflows/ci.yml
      - **→ Reference**: plan.md:89 (Minimum 80% test coverage)
      - **Jobs**: Lint, type check, test (backend + frontend), coverage report
      - **→ Validation**: Push to branch triggers workflow, all steps pass

- [X] **T014** [P] Create environment variables template
      - **Path**: .env.example in backend/, frontend/, cms/
      - **→ Reference**: plan.md:54-62 (All config), research.md:271 (CORS_ORIGINS)
      - **Variables**: DATABASE_URL, REDIS_URL, API_URL, JWT_SECRET, CORS_ORIGINS
      - **→ Validation**: Each service starts with example .env

- [X] **T015** Configure CORS middleware
      - **Path**: backend/src/main.py
      - **→ Reference**: research.md:70 (FastAPI middleware for CORS), plan.md:69-71
      - **Allow**: http://localhost:3000, http://localhost:1337, production domains
      - **→ Validation**: Frontend can fetch backend API without CORS errors

- [X] **T016** Setup OpenAPI documentation route
      - **Path**: backend/src/main.py
      - **→ Reference**: research.md:53 (OpenAPI Integration: automatic schema generation)
      - **Routes**: /docs (Swagger UI), /redoc (ReDoc), /openapi.json
      - **→ Validation**: Visit http://localhost:8000/docs shows interactive API docs

- [X] **T017** [P] Initialize pytest configuration
      - **Path**: backend/pytest.ini
      - **→ Reference**: plan.md:65-67 (Backend testing: pytest, httpx)
      - **Config**: Test discovery pattern, coverage settings, asyncio mode
      - **→ Validation**: `pytest --collect-only` finds test files

- [X] **T018** [P] Initialize Jest and React Testing Library
      - **Path**: frontend/jest.config.js, frontend/jest.setup.js
      - **→ Reference**: plan.md:65 (Frontend testing: Jest, React Testing Library)
      - **Config**: TypeScript support, module aliases, coverage thresholds
      - **→ Validation**: `npm run test` runs (even with 0 tests)

- [X] **T019** [P] Initialize Playwright E2E tests
      - **Path**: frontend/playwright.config.ts
      - **→ Reference**: plan.md:65 (Frontend testing: Playwright)
      - **Config**: Browser matrix (chromium, firefox, webkit), base URL, retries
      - **→ Validation**: `npx playwright test --list` shows example test

- [X] **T020** Create database seed script structure
      - **Path**: backend/scripts/seed.py
      - **→ Reference**: data-model.md:37-428 (Sample data for all entities)
      - **Setup**: Async script, database connection, transaction handling
      - **→ Validation**: Script runs without errors (even with empty seed functions)

- [X] **T020A** [P] Seed Languages table with 3 languages
      - **Path**: backend/scripts/seed.py (languages function)
      - **→ Reference**: data-model.md:37-77 (Language sample data)
      - **Data**: en (default, urlPrefix='', direction='ltr'), it (urlPrefix='/it'), he (urlPrefix='/he', direction='rtl')
      - **→ Validation**: `SELECT * FROM languages;` returns 3 rows with correct data

- [X] **T020B** [P] Seed Currencies table with 8 currencies
      - **Path**: backend/scripts/seed.py (currencies function)
      - **→ Reference**: data-model.md:280-316 (Currency sample data)
      - **Data**: USD, EUR, ILS, GBP, CAD, AUD, JPY (decimalPlaces=0), CNY
      - **→ Validation**: `SELECT * FROM currencies;` returns 8 currencies with correct symbols and formatting

- [X] **T020C** [P] Seed Locales table with 3 locales
      - **Path**: backend/scripts/seed.py (locales function)
      - **→ Reference**: data-model.md:395-428 (Locale sample data)
      - **Data**: en-US (dateFormat='MM/DD/YYYY', firstDayOfWeek=0), it-IT (DD/MM/YYYY, 24h), he-IL (DD/MM/YYYY, 24h)
      - **→ Validation**: `SELECT * FROM locales;` returns 3 locales with formatting rules

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL**: These tests MUST be written and MUST FAIL before ANY implementation begins

### Backend Contract Tests (T021-T028)

- [X] **T021** [P] Contract test GET /v1/languages
      - **Path**: backend/tests/contract/test_languages_api.py
      - **→ Reference**: contracts/api-v1.yaml:76-89 (GET /languages endpoint), :276-313 (Language schema)
      - **Validate**: Response is array, contains 3 languages (en, it, he), matches Language schema
      - **→ Validation**: Test fails with "404 Not Found" (endpoint not implemented)

- [X] **T022** [P] Contract test POST /v1/languages/detect
      - **Path**: backend/tests/contract/test_language_detection.py
      - **→ Reference**: contracts/api-v1.yaml:91-121 (POST /languages/detect), :315-340 (DetectedLanguage schema)
      - **Validate**: Request with acceptLanguage='it-IT,it;q=0.9' returns detectedLanguage='it', shouldPrompt=true
      - **→ Validation**: Test fails (endpoint not implemented)

- [X] **T023** [P] Contract test GET /v1/content/{lang}/{slug}
      - **Path**: backend/tests/contract/test_content_get.py
      - **→ Reference**: contracts/api-v1.yaml:30-50 (GET /content/{lang}/{slug}), :399-453 (ContentResponse schema)
      - **Validate**: Response has id, type, title, slug, body, seo (SEOMetadata), url (URLData) fields
      - **→ Validation**: Test fails with 404 (content endpoint not implemented)

- [X] **T024** [P] Contract test GET /v1/content/{lang}
      - **Path**: backend/tests/contract/test_content_list.py
      - **→ Reference**: contracts/api-v1.yaml:52-73 (GET /content/{lang}), :500-561 (ContentListResponse, Pagination)
      - **Validate**: Response has items array and pagination object with page, limit, total, totalPages
      - **→ Validation**: Test fails (list endpoint not implemented)

- [X] **T025** [P] Contract test GET /v1/currencies
      - **Path**: backend/tests/contract/test_currencies_api.py
      - **→ Reference**: contracts/api-v1.yaml:124-137 (GET /currencies), :342-375 (Currency schema)
      - **Validate**: Returns array of Currency objects with code, name, symbol, decimalPlaces, symbolPosition
      - **→ Validation**: Test fails (currencies endpoint not implemented)

- [X] **T026** [P] Contract test POST /v1/currencies/convert
      - **Path**: backend/tests/contract/test_currency_convert.py
      - **→ Reference**: contracts/api-v1.yaml:139-175 (POST /currencies/convert), :376-398 (ConvertedCurrency schema)
      - **Validate**: Request {amount: 29.99, fromCurrency: "USD", toCurrency: "EUR"} returns {amount, currency, formatted, exchangeRate}
      - **→ Validation**: Test fails (convert endpoint not implemented)

- [X] **T027** [P] Contract test GET /v1/user/preferences
      - **Path**: backend/tests/contract/test_preferences_get.py
      - **→ Reference**: contracts/api-v1.yaml:178-208 (GET /user/preferences), :563-591 (UserPreferences schema)
      - **Validate**: Request with X-Session-Id header returns {id, sessionId, selectedCurrency, dismissedLanguagePrompt, expiresAt}
      - **→ Validation**: Test fails with 404 (preferences endpoint not implemented)

- [X] **T028** [P] Contract test PUT /v1/user/preferences
      - **Path**: backend/tests/contract/test_preferences_put.py
      - **→ Reference**: contracts/api-v1.yaml:210-233 (PUT /user/preferences), :593-605 (UpdatePreferences schema)
      - **Validate**: PUT request with {selectedCurrency: "EUR"} updates preferences and returns full UserPreferences object
      - **→ Validation**: Test fails (update endpoint not implemented)

### Backend Integration Tests (T029-T040)

- [X] **T029** [P] Integration test language detection flow
      - **Path**: backend/tests/integration/test_language_detection_flow.py
      - **→ Reference**: quickstart.md:105-121 (Test 1: Language Detection & Prompt)
      - **Scenario**: POST /languages/detect with Accept-Language: it-IT → verify detectedLanguage='it', shouldPrompt=true for non-English
      - **→ Validation**: Test fails (language detection logic not implemented)

- [X] **T030** [P] Integration test content fetching with fallback
      - **Path**: backend/tests/integration/test_content_fallback.py
      - **→ Reference**: quickstart.md:236-249 (Test 6: Content Fallback to English)
      - **Scenario**: Request /content/it/new-product (Italian) when only English version exists → returns English content with notice
      - **→ Validation**: Test fails (fallback logic not implemented)

- [X] **T031** [P] Integration test currency conversion
      - **Path**: backend/tests/integration/test_currency_conversion.py
      - **→ Reference**: quickstart.md:150-168 (Test 3: Currency Selection & Persistence)
      - **Scenario**: Convert 29.99 USD to EUR → verify amount ~27.50, formatted with Euro symbol and comma separator
      - **→ Validation**: Test fails (currency conversion not implemented)

- [X] **T032** [P] Integration test user preferences persistence (Redis)
      - **Path**: backend/tests/integration/test_preferences_cache.py
      - **→ Reference**: research.md:271-285 (Redis cache strategy: session:{sessionId}:preferences, 30-day TTL)
      - **Scenario**: PUT /user/preferences → verify Redis key exists, has correct TTL, retrieves same data on GET
      - **→ Validation**: Test fails (Redis integration not implemented)

- [X] **T033** [P] Integration test URL redirect creation (301)
      - **Path**: backend/tests/integration/test_url_redirects.py
      - **→ Reference**: quickstart.md:213-220 (Test 5: URL Redirects - 301), data-model.md:540-563 (URL Slug Change Flow)
      - **Scenario**: Change slug 'eco-bottle' → 'eco-water-bottle' → verify URLRedirect created with statusCode=301, old URLRoute marked inactive
      - **→ Validation**: Test fails (redirect creation use case not implemented)

- [X] **T034** [P] Integration test content archival (410)
      - **Path**: backend/tests/integration/test_content_archival.py
      - **→ Reference**: quickstart.md:222-230 (Test 5: 410 Gone), data-model.md:515-538 (Content Publishing Flow: Published → Archived)
      - **Scenario**: Archive content → verify URLRedirect created with statusCode=410, content status='archived'
      - **→ Validation**: Test fails (archival workflow not implemented)

- [X] **T035** [P] Integration test multi-language content retrieval
      - **Path**: backend/tests/integration/test_multilanguage.py
      - **→ Reference**: data-model.md:140-144 (ContentVersion.translations field links to other languages)
      - **Scenario**: GET /content/en/eco-bottle → verify 'translations' object contains {it: url, he: url}
      - **→ Validation**: Test fails (translation linking not implemented)

- [X] **T036** [P] Integration test hreflang generation
      - **Path**: backend/tests/integration/test_hreflang.py
      - **→ Reference**: quickstart.md:180-185 (Test 4: hreflang tags), research.md:178-188 (hreflang implementation with x-default)
      - **Scenario**: GET /content/it/prodotti/bottiglia → verify response includes alternateUrls {x-default, it, he}
      - **→ Validation**: Test fails (hreflang generation not implemented)

- [X] **T037** [P] Integration test slug uniqueness validation
      - **Path**: backend/tests/integration/test_slug_validation.py
      - **→ Reference**: data-model.md:140-144 (ContentVersion business rule: slug must be unique per contentId, languageCode)
      - **Scenario**: Create ContentVersion with duplicate slug → verify raises validation error
      - **→ Validation**: Test fails (slug validation not implemented)

- [X] **T038** [P] Integration test session management
      - **Path**: backend/tests/integration/test_session.py
      - **→ Reference**: data-model.md:324-363 (UserPreferences entity with sessionId and TTL)
      - **Scenario**: Create session, verify preferences stored, verify expiration after TTL, verify session ID generation
      - **→ Validation**: Test fails (session management not implemented)

- [X] **T039** [P] Integration test CMS webhook handling
      - **Path**: backend/tests/integration/test_cms_webhooks.py
      - **→ Reference**: plan.md:138 (Backend ↔ CMS content synchronization)
      - **Scenario**: Simulate Strapi webhook for content update → verify backend triggers ISR revalidation
      - **→ Validation**: Test fails (webhook handler not implemented)

- [X] **T040** [P] Integration test API versioning
      - **Path**: backend/tests/integration/test_api_versioning.py
      - **→ Reference**: plan.md:88, 179-186 (API versioning: /api/v1/, backward compatibility)
      - **Scenario**: Verify all endpoints prefixed with /v1/, verify version in OpenAPI spec
      - **→ Validation**: Test passes once API routes implemented with /v1 prefix

### Frontend Integration Tests (T041-T050)

- [X] **T041** [P] E2E test language detection and prompt (Playwright)
      - **Path**: frontend/tests/e2e/language-detection.spec.ts
      - **→ Reference**: quickstart.md:105-121 (Test 1: Language Detection & Prompt)
      - **Scenario**: Set browser language to Italian → visit / → verify prompt "Vuoi passare alla versione italiana?" → click "Sì" → verify redirect to /it
      - **→ Validation**: Test implemented and passing

- [X] **T042** [P] E2E test manual language switching (Playwright)
      - **Path**: frontend/tests/e2e/language-switching.spec.ts
      - **→ Reference**: quickstart.md:125-146 (Test 2: Manual Language Switching)
      - **Scenario**: Visit /products/eco-bottle → click language selector → select עברית → verify redirect to /he/products/eco-bottle, verify dir="rtl"
      - **→ Validation**: Test implemented and passing

- [X] **T043** [P] E2E test RTL layout for Hebrew (Playwright)
      - **Path**: frontend/tests/e2e/rtl-layout.spec.ts
      - **→ Reference**: quickstart.md:138-141 (Hebrew RTL verification), research.md:124-148 (Tailwind RTL implementation)
      - **Scenario**: Visit /he/ → verify <html dir="rtl">, verify navigation right-aligned, verify icons mirrored
      - **→ Validation**: Test implemented and passing

- [X] **T044** [P] E2E test currency selection (Playwright)
      - **Path**: frontend/tests/e2e/currency-selection.spec.ts
      - **→ Reference**: quickstart.md:150-168 (Test 3: Currency Selection & Persistence)
      - **Scenario**: Visit /it → verify prices in EUR (27,50 €) → select USD → verify prices update ($29.99) → switch to /he → verify USD persists
      - **→ Validation**: Test implemented and passing

- [X] **T045** [P] E2E test SEO meta tags validation (Playwright)
      - **Path**: frontend/tests/e2e/seo-meta.spec.ts
      - **→ Reference**: quickstart.md:172-205 (Test 4: SEO Meta Tags & hreflang)
      - **Scenario**: Visit /it/prodotti/bottiglia-eco → view source → verify hreflang tags (x-default, it, he), canonical URL, schema markup inLanguage='it'
      - **→ Validation**: Test implemented and passing

- [X] **T046** [P] E2E test URL redirects (301/410) (Playwright)
      - **Path**: frontend/tests/e2e/redirects.spec.ts
      - **→ Reference**: quickstart.md:209-232 (Test 5: URL Redirects)
      - **Scenario**: Visit old URL /products/eco-bottle → verify 301 redirect to /products/eco-water-bottle, visit deleted URL → verify 410 page in Italian
      - **→ Validation**: Test implemented with comprehensive redirect scenarios

- [X] **T047** [P] E2E test content fallback to English (Playwright)
      - **Path**: frontend/tests/e2e/content-fallback.spec.ts
      - **→ Reference**: quickstart.md:236-249 (Test 6: Content Fallback to English)
      - **Scenario**: Visit /it/products/new-gadget (no Italian translation) → verify UI in Italian, content in English, notice displayed
      - **→ Validation**: Test implemented with fallback scenarios

- [X] **T048** [P] Component test LanguageSwitcher
      - **Path**: frontend/tests/components/LanguageSwitcher.test.tsx
      - **→ Reference**: plan.md:143-147 (Modular components: Language switcher)
      - **Test**: Render component, verify 3 languages displayed, click Italian → verify navigation triggered to /it path
      - **→ Validation**: Test implemented with 16 test cases

- [X] **T049** [P] Component test CurrencySelector
      - **Path**: frontend/tests/components/CurrencySelector.test.tsx
      - **→ Reference**: plan.md:143-147 (Modular components: Currency selector)
      - **Test**: Render component, select EUR → verify API call to PUT /user/preferences, verify UI updates
      - **→ Validation**: Test implemented with 17 test cases

- [X] **T050** [P] Component test LanguagePrompt
      - **Path**: frontend/tests/components/LanguagePrompt.test.tsx
      - **→ Reference**: quickstart.md:105-121 (Language prompt behavior)
      - **Test**: Render with detectedLanguage='it' → verify Italian prompt text, click "Sì" → verify redirect, click "No" → verify dismissal stored
      - **→ Validation**: Test implemented with 20 test cases

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Database Migrations (T051-T058)

- [X] **T051** [P] Migration create languages table
      - **Path**: backend/alembic/versions/001_create_languages.py
      - **→ Reference**: data-model.md:572-586 (PostgreSQL: CREATE TABLE languages)
      - **Schema**: code (PK, VARCHAR(2)), display_name, native_name, direction (CHECK ltr/rtl), url_prefix, default_currency, is_default (CONSTRAINT one default), is_active
      - **→ Validation**: `alembic upgrade head` creates table, `\d languages` shows constraints

- [X] **T052** [P] Migration create content tables
      - **Path**: backend/alembic/versions/002_create_content.py
      - **→ Reference**: data-model.md:589-597 (PostgreSQL: CREATE TABLE content)
      - **Schema**: id (UUID PK), type (CHECK: page/product/article), status (CHECK: draft/published/archived), created_at, updated_at, created_by, updated_by
      - **→ Validation**: Table created with CHECK constraints

- [X] **T053** [P] Migration create content_versions table
      - **Path**: backend/alembic/versions/003_create_content_versions.py
      - **→ Reference**: data-model.md:600-619 (PostgreSQL: CREATE TABLE content_versions)
      - **Schema**: id (UUID PK), content_id (FK), language_code (FK), title, slug, body (TEXT), meta_title, meta_description, meta_keywords (TEXT[]), custom_schema (JSONB), translations (JSONB), UNIQUE(content_id, language_code, slug)
      - **→ Validation**: Table created with UNIQUE constraint, indexes on content_id, language_code, slug

- [X] **T054** [P] Migration create url_routes and url_redirects
      - **Path**: backend/alembic/versions/004_create_url_routes.py
      - **→ Reference**: data-model.md:622-650 (PostgreSQL: CREATE TABLE url_routes, url_redirects)
      - **Schema**: url_routes (path UNIQUE, is_primary CONSTRAINT one per content_version), url_redirects (from_path, to_primary_url_id FK, status_code CHECK 301/410)
      - **→ Validation**: Both tables created with constraints, indexes on path and from_path

- [X] **T055** [P] Migration create currencies table
      - **Path**: backend/alembic/versions/005_create_currencies.py
      - **→ Reference**: data-model.md:653-663 (PostgreSQL: CREATE TABLE currencies)
      - **Schema**: code (PK VARCHAR(3)), name, symbol, decimal_places (CHECK 0-3), symbol_position (CHECK before/after), thousands_separator, decimal_separator
      - **→ Validation**: Table created with CHECK constraints

- [X] **T056** [P] Migration create user_preferences table
      - **Path**: backend/alembic/versions/006_create_user_preferences.py
      - **→ Reference**: data-model.md:666-677 (PostgreSQL: CREATE TABLE user_preferences)
      - **Schema**: id (UUID PK), session_id (UNIQUE), user_id, selected_currency (FK), dismissed_language_prompt, detected_language (FK), expires_at
      - **→ Validation**: Table created with FK to currencies and languages

- [X] **T057** [P] Migration create locales table
      - **Path**: backend/alembic/versions/007_create_locales.py
      - **→ Reference**: data-model.md:680-689 (PostgreSQL: CREATE TABLE locales)
      - **Schema**: code (PK VARCHAR(10)), language_code (FK), country_code, display_name, date_format, time_format (CHECK 12h/24h), first_day_of_week (CHECK 0-6)
      - **→ Validation**: Table created with CHECK constraints

- [X] **T057A** Validate database schema integrity [CHECKPOINT]
      - **Path**: backend/tests/integration/test_schema_validation.py
      - **→ Reference**: data-model.md:569-700 (Complete database schema)
      - **Verify**: All 7 tables exist, all foreign keys correct, all CHECK constraints active, all indexes present, all UNIQUE constraints working
      - **→ Validation**: Query information_schema, verify constraints match data-model.md exactly

### Backend Domain Entities (T058-T065)

- [X] **T058** [P] Language entity
      - **Path**: backend/src/domain/entities/language.py
      - **→ Reference**: data-model.md:12-77 (Language entity definition and sample data)
      - **Implement**: Dataclass with code, displayName, nativeName, direction, urlPrefix, defaultCurrency, localeCode, isDefault, isActive, sortOrder
      - **→ Validation**: Can instantiate with sample data, type hints correct

- [X] **T058A** [P] Implement Language validation rules
      - **Path**: backend/src/domain/entities/language.py (validation methods)
      - **→ Reference**: data-model.md:31-35 (Language business rules)
      - **Validate**: Exactly one language has isDefault=true, English must be default, urlPrefix empty for default, Hebrew has direction='rtl'
      - **→ Validation**: Create invalid Language → raises ValidationError with specific message

- [X] **T059** [P] Content entity
      - **Path**: backend/src/domain/entities/content.py
      - **→ Reference**: data-model.md:81-104 (Content abstract base entity)
      - **Implement**: Base entity with id (UUID), type (ContentType enum), status (ContentStatus enum), createdAt, updatedAt, createdBy, updatedBy
      - **→ Validation**: Cannot delete published content (must archive first per business rules)

- [X] **T060** [P] ContentVersion entity
      - **Path**: backend/src/domain/entities/content_version.py
      - **→ Reference**: data-model.md:108-167 (ContentVersion entity with SEO fields)
      - **Implement**: contentId, languageCode, title, slug, body, excerpt, metaTitle, metaDescription, metaKeywords, customSchema, isPublished, publishedAt, translations (dict)
      - **→ Validation**: Can create with sample data from data-model.md:148-166

- [X] **T060A** [P] Implement ContentVersion validation rules
      - **Path**: backend/src/domain/entities/content_version.py (validation methods)
      - **→ Reference**: data-model.md:140-144 (ContentVersion business rules)
      - **Validate**: Slug unique per (contentId, languageCode), if isPublished=true then publishedAt must be set, translations dict does not include self-reference
      - **→ Validation**: Create ContentVersion with isPublished=true, publishedAt=None → raises ValidationError

- [X] **T061** [P] URLRoute entity
      - **Path**: backend/src/domain/entities/url_route.py
      - **→ Reference**: data-model.md:170-246 (URLRoute entity with redirects)
      - **Implement**: id, contentVersionId, languageCode, path, slug, isActive, isPrimary, redirects (list of URLRedirect), canonicalUrl, alternateUrls (dict)
      - **→ Validation**: Can create with sample data including redirects array

- [X] **T061A** [P] Implement URLRoute validation rules
      - **Path**: backend/src/domain/entities/url_route.py (validation methods)
      - **→ Reference**: data-model.md:208-219 (URLRoute business rules)
      - **Validate**: Path globally unique, only one isPrimary per ContentVersion, URLRedirect.fromPath ≠ URLRoute.path (no self-redirects)
      - **→ Validation**: Create two URLRoutes with same path → raises ValidationError

- [X] **T062** [P] Currency entity
      - **Path**: backend/src/domain/entities/currency.py
      - **→ Reference**: data-model.md:250-316 (Currency entity with formatting rules)
      - **Implement**: code (CurrencyCode), name, symbol, decimalPlaces, symbolPosition, thousandsSeparator, decimalSeparator, isActive, sortOrder
      - **→ Validation**: Can create all 8 sample currencies from data-model.md:280-316

- [X] **T063** [P] UserPreferences entity
      - **Path**: backend/src/domain/entities/user_preferences.py
      - **→ Reference**: data-model.md:320-363 (UserPreferences with session/cache TTL)
      - **Implement**: id, sessionId, userId (optional), selectedCurrency, dismissedLanguagePrompt, detectedLanguage, createdAt, updatedAt, expiresAt
      - **→ Validation**: expiresAt > updatedAt validation per business rules (line 343)

- [X] **T064** [P] Locale entity
      - **Path**: backend/src/domain/entities/locale.py
      - **→ Reference**: data-model.md:367-428 (Locale with cultural formatting)
      - **Implement**: code, languageCode, countryCode, displayName, dateFormat, timeFormat, firstDayOfWeek (0-6), isActive
      - **→ Validation**: Can create all 3 sample locales (en-US, it-IT, he-IL)

- [X] **T064A** Validate all entity business rules [CHECKPOINT]
      - **Path**: backend/tests/unit/test_entity_validation.py
      - **→ Reference**: data-model.md:491-507 (Validation Rules Summary table)
      - **Test**: All 12 validation rules from table, verify correct error messages
      - **→ Validation**: All entity validation tests pass

### Backend Database Models (T065-T071)

- [X] **T065** [P] Language model (SQLAlchemy)
      - **Path**: backend/src/infrastructure/database/models/language.py
      - **→ Reference**: data-model.md:572-586 (PostgreSQL schema), T058 (domain entity)
      - **Map**: Entity → ORM model, use same field names (snake_case), map to languages table
      - **→ Validation**: Can query all languages, relationships to content_versions work

- [X] **T066** [P] Content model (SQLAlchemy)
      - **Path**: backend/src/infrastructure/database/models/content.py
      - **→ Reference**: data-model.md:589-597 (PostgreSQL schema), T059 (domain entity)
      - **Map**: UUID primary key, ENUMs for type and status, CASCADE delete to content_versions
      - **→ Validation**: Can create/query content, delete cascades to versions

- [X] **T067** [P] ContentVersion model (SQLAlchemy)
      - **Path**: backend/src/infrastructure/database/models/content_version.py
      - **→ Reference**: data-model.md:600-619 (PostgreSQL schema with JSONB), T060 (domain entity)
      - **Map**: JSONB for custom_schema and translations, TEXT[] for meta_keywords, FK to content and languages, UNIQUE constraint
      - **→ Validation**: Can insert with JSONB data, UNIQUE constraint prevents duplicate slugs

- [X] **T068** [P] URLRoute model (SQLAlchemy)
      - **Path**: backend/src/infrastructure/database/models/url_route.py
      - **→ Reference**: data-model.md:622-640 (url_routes table), T061 (domain entity)
      - **Map**: JSONB for alternate_urls, UNIQUE on path, CHECK for one primary per content_version
      - **→ Validation**: Can create URLRoute with URLRedirects relationship

- [X] **T069** [P] Currency model (SQLAlchemy)
      - **Path**: backend/src/infrastructure/database/models/currency.py
      - **→ Reference**: data-model.md:653-663 (currencies table), T062 (domain entity)
      - **Map**: VARCHAR(3) primary key, CHECK for decimal_places 0-3, CHECK for symbol_position
      - **→ Validation**: Can insert 8 currencies, CHECK constraints prevent invalid data

- [X] **T070** [P] UserPreferences model (SQLAlchemy)
      - **Path**: backend/src/infrastructure/database/models/user_preferences.py
      - **→ Reference**: data-model.md:666-677 (user_preferences table), T063 (domain entity)
      - **Map**: FK to currencies.code, UNIQUE on session_id, nullable user_id
      - **→ Validation**: Can create preferences, FK constraint prevents invalid currency

- [X] **T071** [P] Locale model (SQLAlchemy)
      - **Path**: backend/src/infrastructure/database/models/locale.py
      - **→ Reference**: data-model.md:680-689 (locales table), T064 (domain entity)
      - **Map**: FK to languages.code, CHECK for time_format and first_day_of_week
      - **→ Validation**: Can insert 3 locales, FK constraint works

### Backend Repository Interfaces (T072-T078)

- [X] **T072** [P] ILanguageRepository interface
      - **Path**: backend/src/domain/repositories/language_repository.py
      - **→ Reference**: plan.md:106-107 (Abstract interfaces: ICMSRepository, ICacheService), T058 (Language entity)
      - **Methods**: get_all() → List[Language], get_by_code(code) → Language, get_default() → Language
      - **→ Validation**: Interface defined with abstract methods (ABC)

- [X] **T073** [P] IContentRepository interface
      - **Path**: backend/src/domain/repositories/content_repository.py
      - **→ Reference**: plan.md:106-107, data-model.md:462-489 (Entity relationships)
      - **Methods**: get_by_slug(lang, slug) → ContentVersion, list_by_language(lang, page, limit) → Paginated, create_redirect(URLRedirect)
      - **→ Validation**: Interface defined, includes methods for content retrieval and redirect management

- [X] **T074** [P] ICurrencyRepository interface
      - **Path**: backend/src/domain/repositories/currency_repository.py
      - **→ Reference**: T062 (Currency entity)
      - **Methods**: get_all() → List[Currency], get_by_code(code) → Currency
      - **→ Validation**: Interface defined

- [X] **T075** [P] IUserPreferencesRepository interface
      - **Path**: backend/src/domain/repositories/preferences_repository.py
      - **→ Reference**: T063 (UserPreferences entity)
      - **Methods**: get_by_session(session_id) → UserPreferences, upsert(preferences) → UserPreferences, delete_expired()
      - **→ Validation**: Interface includes TTL management

- [X] **T076** [P] ICacheService interface
      - **Path**: backend/src/domain/repositories/cache_service.py
      - **→ Reference**: plan.md:122 (ICacheService interface not direct Redis calls), research.md:271-285 (Redis key structure)
      - **Methods**: get(key) → str | None, set(key, value, ttl_seconds), delete(key), exists(key) → bool
      - **→ Validation**: Generic cache interface, not Redis-specific

- [X] **T077** [P] ICMSRepository interface
      - **Path**: backend/src/domain/repositories/cms_repository.py
      - **→ Reference**: plan.md:121 (ICMSRepository interface not direct Strapi calls)
      - **Methods**: get_content(content_id, locale) → dict, list_content(locale, content_type) → List[dict], sync_content(webhook_payload)
      - **→ Validation**: CMS-agnostic interface

- [X] **T078** [P] IURLRouteRepository interface
      - **Path**: backend/src/domain/repositories/url_route_repository.py
      - **→ Reference**: data-model.md:540-563 (URL Slug Change Flow requires repository methods)
      - **Methods**: get_by_path(path) → URLRoute, get_primary_for_content(content_version_id) → URLRoute, create_redirect(URLRedirect), mark_inactive(url_route_id)
      - **→ Validation**: Interface supports slug change workflow

### Backend Repository Implementations (T079-T086)

- [X] **T079** [P] LanguageRepository (PostgreSQL)
      - **Path**: backend/src/infrastructure/database/repositories/language_repository.py
      - **→ Reference**: T072 (ILanguageRepository interface), T065 (Language model)
      - **Implement**: SQLAlchemy queries, implement all interface methods
      - **→ Validation**: Can retrieve all 3 seeded languages, get_default() returns English

- [X] **T080** [P] ContentRepository (PostgreSQL)
      - **Path**: backend/src/infrastructure/database/repositories/content_repository.py
      - **→ Reference**: T073 (IContentRepository interface), T066-T068 (Content models)
      - **Implement**: Complex queries with joins (Content ← ContentVersion ← URLRoute), pagination
      - **→ Validation**: Can fetch content by slug, returns None if not found

- [X] **T081** [P] CurrencyRepository (PostgreSQL)
      - **Path**: backend/src/infrastructure/database/repositories/currency_repository.py
      - **→ Reference**: T074 (ICurrencyRepository interface), T069 (Currency model)
      - **Implement**: Simple get_all and get_by_code queries
      - **→ Validation**: Can retrieve all 8 seeded currencies

- [X] **T082** [P] UserPreferencesRepository (PostgreSQL)
      - **Path**: backend/src/infrastructure/database/repositories/preferences_repository.py
      - **→ Reference**: T075 (IUserPreferencesRepository interface), T070 (UserPreferences model)
      - **Implement**: Upsert logic (INSERT ... ON CONFLICT UPDATE), delete_expired() with expiresAt < now()
      - **→ Validation**: Upsert creates or updates, delete_expired() removes old records

- [X] **T083** [P] RedisCacheService
      - **Path**: backend/src/infrastructure/cache/redis_cache.py
      - **→ Reference**: T076 (ICacheService interface), research.md:271-285 (Redis implementation: SETEX for atomic set-with-expiry)
      - **Implement**: Redis client wrapper, SETEX for set(), GET, DELETE, EXISTS commands
      - **→ Validation**: Can set/get/delete keys, TTL works correctly

- [X] **T083A** [P] Implement cache fallback logic
      - **Path**: backend/src/infrastructure/cache/redis_cache.py (get method)
      - **→ Reference**: research.md:283-285 (Fallback to defaults if key doesn't exist)
      - **Implement**: get() returns None if key doesn't exist (not exception), caller handles fallback
      - **→ Validation**: get('nonexistent-key') returns None, does not raise exception

- [X] **T084** [P] StrapiCMSRepository
      - **Path**: backend/src/infrastructure/cms/strapi_client.py
      - **→ Reference**: T077 (ICMSRepository interface), research.md:81-111 (Strapi i18n plugin: API supports ?locale=it)
      - **Implement**: HTTP client to Strapi API, parse responses, handle i18n plugin format
      - **→ Validation**: Can fetch content from Strapi, handles locale parameter

- [X] **T085** [P] URLRouteRepository (PostgreSQL)
      - **Path**: backend/src/infrastructure/database/repositories/url_route_repository.py
      - **→ Reference**: T078 (IURLRouteRepository interface), T068 (URLRoute model)
      - **Implement**: CRUD for URLRoute, cascade create URLRedirect records
      - **→ Validation**: Can create redirects, mark routes inactive

- [X] **T085A** Verify all repositories implement interfaces [CHECKPOINT]
      - **Path**: backend/tests/unit/test_repository_compliance.py
      - **→ Reference**: All T072-T078 interfaces
      - **Test**: Each repository class implements all abstract methods, type signatures match
      - **→ Validation**: isinstance() checks, method signature inspection passes

### Backend Use Cases (T086-T096)

- [X] **T086** [P] GetAllLanguages use case
      - **Path**: backend/src/domain/use_cases/get_all_languages.py
      - **→ Reference**: plan.md:110 (Use Cases: GetLocalizedContent, SwitchLanguage...), T072 (ILanguageRepository)
      - **Implement**: Inject ILanguageRepository, call get_all(), return only active languages sorted by sortOrder
      - **→ Validation**: Returns 3 languages in correct order (en, it, he)

- [X] **T087** [P] DetectUserLanguage use case
      - **Path**: backend/src/domain/use_cases/detect_user_language.py
      - **→ Reference**: plan.md:110, quickstart.md:105-121 (Language detection from Accept-Language header)
      - **Implement**: Parse Accept-Language header (e.g., "it-IT,it;q=0.9,en;q=0.8"), match to supported languages, return best match with confidence
      - **→ Validation**: Input "it-IT,it;q=0.9" returns detectedLanguage='it', confidence>0.9

- [X] **T088** [P] GetLocalizedContent use case
      - **Path**: backend/src/domain/use_cases/get_localized_content.py
      - **→ Reference**: plan.md:110, contracts/api-v1.yaml:32-33 (Falls back to English if translation unavailable)
      - **Implement**: Inject IContentRepository, try fetch by (lang, slug), if not found try (en, slug), generate hreflang URLs
      - **→ Validation**: Request Italian content that doesn't exist → returns English version with notice

- [X] **T089** [P] ListContentByLanguage use case
      - **Path**: backend/src/domain/use_cases/list_content_by_language.py
      - **→ Reference**: contracts/api-v1.yaml:52-73 (Paginated list by language)
      - **Implement**: Inject IContentRepository, apply pagination, filter by language and optional content type
      - **→ Validation**: Returns ContentListResponse with items and pagination metadata

- [X] **T090** [P] GetAllCurrencies use case
      - **Path**: backend/src/domain/use_cases/get_all_currencies.py
      - **→ Reference**: T074 (ICurrencyRepository)
      - **Implement**: Inject ICurrencyRepository, return all active currencies sorted by sortOrder
      - **→ Validation**: Returns 8 currencies

- [X] **T091** [P] ConvertCurrency use case
      - **Path**: backend/src/domain/use_cases/convert_currency.py
      - **→ Reference**: research.md:221-231 (Use Intl.NumberFormat for formatting, store in cents)
      - **Implement**: Inject ICurrencyRepository for formatting rules, use mock exchange rate API or fixed rates, format with locale
      - **→ Validation**: Convert 29.99 USD → EUR returns ~27.50 with formatted="27,50 €"

- [X] **T092** [P] GetUserPreferences use case
      - **Path**: backend/src/domain/use_cases/get_user_preferences.py
      - **→ Reference**: T075 (IUserPreferencesRepository), T076 (ICacheService)
      - **Implement**: Try cache first (ICacheService.get), if miss query repository, update cache
      - **→ Validation**: First call hits DB, second call hits cache (verify with logs)

- [X] **T093** [P] UpdateUserPreferences use case
      - **Path**: backend/src/domain/use_cases/update_user_preferences.py
      - **→ Reference**: research.md:274-282 (Redis: session:{sessionId}:preferences, 30-day TTL)
      - **Implement**: Inject IUserPreferencesRepository and ICacheService, upsert to DB, update cache with new TTL, refresh expiresAt
      - **→ Validation**: Updates DB and cache, expiresAt extended by 30 days

- [X] **T094** [P] CreateURLRedirect use case
      - **Path**: backend/src/domain/use_cases/create_url_redirect.py
      - **→ Reference**: data-model.md:199-206 (URLRedirect structure)
      - **Implement**: Inject IURLRouteRepository, create URLRedirect with fromPath, toPrimaryUrlId, statusCode (301 or 410), reason, createdBy
      - **→ Validation**: Creates redirect record, immutable (append-only per line 219)

- [X] **T095** [P] HandleSlugChange use case
      - **Path**: backend/src/domain/use_cases/handle_slug_change.py
      - **→ Reference**: data-model.md:540-563 (URL Slug Change Flow step-by-step)
      - **Implement**: (1) Create new URLRoute with new slug, isPrimary=true, (2) Mark old URLRoute isPrimary=false, isActive=false, (3) Create URLRedirect 301 from old path to new URLRoute, (4) Return new URLRoute
      - **→ Validation**: Old URL returns 301, new URL returns 200, URLRedirect record exists

- [X] **T095A** [P] Implement ContentPublishing state machine
      - **Path**: backend/src/domain/use_cases/publish_content.py
      - **→ Reference**: data-model.md:515-538 (Content Publishing Flow: Draft→Published→Archived)
      - **Implement**: State transitions: (Draft → Published) sets Content.status='published', ContentVersion.isPublished=true, publishedAt=now(); (Published → Archived) sets status='archived', isPublished=false, creates 410 redirects
      - **→ Validation**: Publish draft → verify status changes, Archive published → verify 410 redirects created

### Backend API Routes (T096-T103)

- [X] **T096** GET /v1/languages endpoint
      - **Path**: backend/src/infrastructure/api/routes/languages.py
      - **→ Reference**: contracts/api-v1.yaml:76-89, T086 (GetAllLanguages use case)
      - **Implement**: FastAPI route, inject GetAllLanguages use case, return Language[] as JSON
      - **→ Validation**: T021 contract test now passes

- [X] **T097** POST /v1/languages/detect endpoint
      - **Path**: backend/src/infrastructure/api/routes/languages.py
      - **→ Reference**: contracts/api-v1.yaml:91-121, T087 (DetectUserLanguage use case)
      - **Implement**: FastAPI route, parse request body (acceptLanguage, userAgent, countryCode), inject use case, return DetectedLanguage
      - **→ Validation**: T022 contract test now passes

- [X] **T098** GET /v1/content/{lang}/{slug} endpoint
      - **Path**: backend/src/infrastructure/api/routes/content.py
      - **→ Reference**: contracts/api-v1.yaml:30-50, T088 (GetLocalizedContent use case)
      - **Implement**: FastAPI route with path params, inject use case, return ContentResponse or 404
      - **→ Validation**: T023 contract test now passes

- [X] **T099** GET /v1/content/{lang} endpoint
      - **Path**: backend/src/infrastructure/api/routes/content.py
      - **→ Reference**: contracts/api-v1.yaml:52-73, T089 (ListContentByLanguage use case)
      - **Implement**: FastAPI route with query params (page, limit, type), inject use case, return ContentListResponse
      - **→ Validation**: T024 contract test now passes

- [X] **T100** GET /v1/currencies endpoint
      - **Path**: backend/src/infrastructure/api/routes/currencies.py
      - **→ Reference**: contracts/api-v1.yaml:124-137, T090 (GetAllCurrencies use case)
      - **Implement**: FastAPI route, inject use case, return Currency[]
      - **→ Validation**: T025 contract test now passes

- [X] **T101** POST /v1/currencies/convert endpoint
      - **Path**: backend/src/infrastructure/api/routes/currencies.py
      - **→ Reference**: contracts/api-v1.yaml:139-175, T091 (ConvertCurrency use case)
      - **Implement**: FastAPI route, parse request body (amount, fromCurrency, toCurrency, locale), inject use case, return ConvertedCurrency
      - **→ Validation**: T026 contract test now passes

- [X] **T102** GET /v1/user/preferences endpoint
      - **Path**: backend/src/infrastructure/api/routes/preferences.py
      - **→ Reference**: contracts/api-v1.yaml:178-208, T092 (GetUserPreferences use case)
      - **Implement**: FastAPI route, extract X-Session-Id header, inject use case, return UserPreferences or 404
      - **→ Validation**: T027 contract test now passes

- [X] **T103** PUT /v1/user/preferences endpoint
      - **Path**: backend/src/infrastructure/api/routes/preferences.py
      - **→ Reference**: contracts/api-v1.yaml:210-233, T093 (UpdateUserPreferences use case)
      - **Implement**: FastAPI route, extract X-Session-Id, parse request body, inject use case, return updated UserPreferences
      - **→ Validation**: T028 contract test now passes

### Backend API Models (T104-T108)

- [X] **T104** [P] Pydantic request/response models for languages
      - **Path**: backend/src/infrastructure/api/models/languages.py
      - **→ Reference**: contracts/api-v1.yaml:276-340 (Language, DetectedLanguage schemas)
      - **Implement**: Pydantic models matching OpenAPI schemas exactly, use for validation and serialization
      - **→ Validation**: Models validate sample data from contracts/api-v1.yaml

- [X] **T105** [P] Pydantic request/response models for content
      - **Path**: backend/src/infrastructure/api/models/content.py
      - **→ Reference**: contracts/api-v1.yaml:399-561 (ContentResponse, SEOMetadata, URLData, ContentListResponse, Pagination)
      - **Implement**: Nested models for SEO and URL data
      - **→ Validation**: Models serialize ContentVersion entities correctly

- [X] **T106** [P] Pydantic request/response models for currencies
      - **Path**: backend/src/infrastructure/api/models/currencies.py
      - **→ Reference**: contracts/api-v1.yaml:342-398 (Currency, ConvertedCurrency)
      - **Implement**: Currency model with formatting fields, ConvertedCurrency with exchangeRate
      - **→ Validation**: Models match contract schemas

- [X] **T107** [P] Pydantic request/response models for preferences
      - **Path**: backend/src/infrastructure/api/models/preferences.py
      - **→ Reference**: contracts/api-v1.yaml:563-605 (UserPreferences, UpdatePreferences)
      - **Implement**: UserPreferences (response), UpdatePreferences (request body)
      - **→ Validation**: Models validate request/response data

- [X] **T108** [P] Error response models
      - **Path**: backend/src/infrastructure/api/models/errors.py
      - **→ Reference**: contracts/api-v1.yaml:607-626 (Error schema)
      - **Implement**: Pydantic model with error, message, code, timestamp fields
      - **→ Validation**: 404 responses match Error schema

### Frontend Components (T109-T118)

- [X] **T109** [P] LanguageSwitcher component
      - **Path**: frontend/src/components/LanguageSwitcher/index.tsx
      - **→ Reference**: plan.md:143-147 (Modular: Language switcher component), quickstart.md:130-144
      - **Implement**: Dropdown showing 3 languages with native names, current language checkmark, onClick redirects to /[lang]/[current-path]
      - **→ Validation**: T048 component test passes

- [X] **T110** [P] CurrencySelector component
      - **Path**: frontend/src/components/CurrencySelector/index.tsx
      - **→ Reference**: plan.md:145 (Currency selector component), quickstart.md:154-167
      - **Implement**: Dropdown with currency codes and symbols, onClick calls PUT /user/preferences API, updates local state
      - **→ Validation**: T049 component test passes

- [X] **T111** [P] LanguagePrompt component
      - **Path**: frontend/src/components/LanguagePrompt/index.tsx
      - **→ Reference**: quickstart.md:105-121 (Non-intrusive prompt), plan.md:136-139 (Language detection and prompt)
      - **Implement**: Modal/banner with detected language message, "Yes" (redirect) and "No" (dismiss, store in session) buttons, only show if !dismissedLanguagePrompt
      - **→ Validation**: T050 component test passes

- [X] **T112** [P] RTLWrapper component
      - **Path**: frontend/src/components/RTLWrapper/index.tsx
      - **→ Reference**: research.md:142-145 (RTL wrapper component, set dir attribute based on language)
      - **Implement**: Sets dir="rtl" on <html> for Hebrew, dir="ltr" for others, wraps children
      - **→ Validation**: Renders with correct dir attribute, CSS logical properties work

- [X] **T113** [P] SEOHead component (hreflang, schema)
      - **Path**: frontend/src/components/SEOHead/index.tsx
      - **→ Reference**: plan.md:146-147 (SEO meta generator), quickstart.md:180-203
      - **Implement**: Generates <link rel="alternate" hreflang> tags, canonical URL, JSON-LD schema, meta title/description in current language
      - **→ Validation**: T045 E2E test passes

- [X] **T114** [P] ContentFallbackNotice component
      - **Path**: frontend/src/components/ContentFallbackNotice/index.tsx
      - **→ Reference**: quickstart.md:247-248 (Notice: "This content is not yet available in Italian")
      - **Implement**: Banner shown when content.languageCode !== current language, message in UI language
      - **→ Validation**: Shows when content fallback occurs

- [X] **T115** [P] Navigation component (multi-language aware)
      - **Path**: frontend/src/components/Navigation/index.tsx
      - **→ Reference**: plan.md:254-269 (Next.js pages, language routing)
      - **Implement**: Nav links use /[lang] prefix, includes LanguageSwitcher and CurrencySelector
      - **→ Validation**: Links have correct language prefix

- [X] **T116** [P] Footer component (multi-language aware)
      - **Path**: frontend/src/components/Footer/index.tsx
      - **→ Reference**: plan.md:254-269 (Multi-language pages)
      - **Implement**: Footer with language-aware links, copyright in current language
      - **→ Validation**: Renders in all 3 languages

- [X] **T117** [P] Price component (currency formatting)
      - **Path**: frontend/src/components/Price/index.tsx
      - **→ Reference**: research.md:221-234 (Intl.NumberFormat utility), quickstart.md:157-161
      - **Implement**: Takes amount (number), currency (string), locale (string), renders formatted price using Intl.NumberFormat
      - **→ Validation**: Price {amount: 29.99, currency: 'EUR', locale: 'it-IT'} displays "29,99 €"

- [X] **T118** [P] LocaleProvider wrapper
      - **Path**: frontend/src/components/LocaleProvider/index.tsx
      - **→ Reference**: plan.md:254 (app/layout.tsx with i18n provider)
      - **Implement**: React Context providing current locale, currency, language direction to all children
      - **→ Validation**: Child components can access locale context

### Frontend API Client (T119-T123)

- [X] **T119** [P] Languages API client
      - **Path**: frontend/src/lib/api/languages.ts
      - **→ Reference**: contracts/api-v1.yaml:76-121 (Language endpoints), T005A (shared types)
      - **Implement**: getLanguages() → Language[], detectLanguage(acceptLanguage) → DetectedLanguage, use shared types from shared/types/api.ts
      - **→ Validation**: Can fetch languages from backend

- [X] **T120** [P] Content API client
      - **Path**: frontend/src/lib/api/content.ts
      - **→ Reference**: contracts/api-v1.yaml:30-73 (Content endpoints)
      - **Implement**: getContent(lang, slug) → ContentResponse, listContent(lang, page, limit) → ContentListResponse
      - **→ Validation**: Can fetch content by slug

- [X] **T121** [P] Currencies API client
      - **Path**: frontend/src/lib/api/currencies.ts
      - **→ Reference**: contracts/api-v1.yaml:124-175 (Currency endpoints)
      - **Implement**: getCurrencies() → Currency[], convertCurrency(amount, from, to, locale) → ConvertedCurrency
      - **→ Validation**: Can convert currencies

- [X] **T122** [P] Preferences API client
      - **Path**: frontend/src/lib/api/preferences.ts
      - **→ Reference**: contracts/api-v1.yaml:178-233 (Preferences endpoints)
      - **Implement**: getPreferences(sessionId) → UserPreferences, updatePreferences(sessionId, updates) → UserPreferences, includes X-Session-Id header
      - **→ Validation**: Can get/update preferences

- [X] **T123** [P] API error handling utilities
      - **Path**: frontend/src/lib/api/errors.ts
      - **→ Reference**: contracts/api-v1.yaml:607-626 (Error schema)
      - **Implement**: Parse error responses, extract message and code, create user-friendly error messages
      - **→ Validation**: 404 error parsed correctly

### Frontend Routing & Pages (T124-T131)

- [X] **T124** Configure next-intl middleware
      - **Path**: frontend/src/middleware.ts
      - **→ Reference**: research.md:30-34 (next-intl middleware for language detection)
      - **Implement**: next-intl middleware, detect language from Accept-Language, redirect to /[lang] if needed
      - **→ Validation**: Visit / with Italian browser → redirects to /it

- [X] **T124A** [P] Configure next-intl message loading
      - **Path**: frontend/i18n.ts
      - **→ Reference**: research.md:32-34 (getRequestConfig for async message loading, unstable_setRequestLocale)
      - **Implement**: getRequestConfig loads messages from frontend/messages/[lang].json, unstable_setRequestLocale for static rendering
      - **→ Validation**: Messages load for all 3 languages

- [X] **T124B** [P] Create translation files for 3 languages
      - **Path**: frontend/messages/en.json, it.json, he.json
      - **→ Reference**: plan.md:38-45 (3 languages supported)
      - **Create**: UI strings for nav, footer, buttons, prompts in each language
      - **→ Validation**: All UI text translates correctly

- [X] **T125** Create [lang] dynamic segment layout
      - **Path**: frontend/src/app/[lang]/layout.tsx
      - **→ Reference**: research.md:142-144 (Set dir attribute based on language)
      - **Implement**: Root layout with <html lang={lang} dir={direction}>, LocaleProvider, Navigation, Footer
      - **→ Validation**: Layout renders with correct lang and dir

- [X] **T126** Create root page (language detection)
      - **Path**: frontend/src/app/page.tsx
      - **→ Reference**: plan.md:136-139 (Browser/location detection with opt-in prompt)
      - **Implement**: Server component, detect language, redirect to /[lang] or show LanguagePrompt
      - **→ Validation**: T041 E2E test passes

- [X] **T127** [P] Create home page per language
      - **Path**: frontend/src/app/[lang]/page.tsx
      - **→ Reference**: plan.md:254-269 (App Router structure)
      - **Implement**: Home page with translated content, fetches from API or CMS
      - **→ Validation**: /en, /it, /he all render correctly

- [X] **T128** [P] Create product listing page
      - **Path**: frontend/src/app/[lang]/products/page.tsx
      - **→ Reference**: plan.md:128-139 (Integration tests for listing)
      - **Implement**: Server component, fetch products via Content API client, display grid
      - **→ Validation**: Products display in correct language

- [X] **T129** [P] Create product detail page
      - **Path**: frontend/src/app/[lang]/products/[slug]/page.tsx
      - **→ Reference**: quickstart.md:130-144 (Product pages with language-specific slugs)
      - **Implement**: Server component, fetch product by slug, display with SEOHead, Price components
      - **→ Validation**: /en/products/eco-bottle, /it/prodotti/bottiglia-eco both work

- [X] **T130** Configure generateStaticParams for SSG
      - **Path**: frontend/src/app/[lang]/products/[slug]/page.tsx
      - **→ Reference**: research.md:323-329 (SSG for static pages, ISR for CMS content)
      - **Implement**: export async function generateStaticParams() fetches all products, generates paths for all languages
      - **→ Validation**: `npm run build` generates static HTML for products

- [X] **T130A** [P] Configure ISR revalidate timing
      - **Path**: frontend/src/app/[lang]/products/[slug]/page.tsx
      - **→ Reference**: research.md:323-329 (export const revalidate = 60 for ISR)
      - **Implement**: export const revalidate = 60 (60-second revalidation for CMS content)
      - **→ Validation**: Page regenerates after 60 seconds

### CMS Configuration (T131-T135)

- [X] **T131** Configure Strapi i18n plugin
      - **Path**: cms/src/config/plugins.ts
      - **→ Reference**: research.md:101-107 (Enable i18n plugin, set default locale to en, configure fallback)
      - **Implement**: strapi.plugins['i18n'], default locale 'en', fallbacks: it→en, he→en
      - **→ Validation**: Strapi admin shows locale switcher

- [X] **T132** [P] Create Product content type with i18n
      - **Path**: cms/src/api/product/content-types/product/schema.json
      - **→ Reference**: research.md:102-107 (pluginOptions: i18n: {localized: true})
      - **Implement**: Fields: title (string), slug (string, required), description (richtext), price (number), image (media), metaTitle, metaDescription
      - **→ Validation**: Can create product in English, translate to Italian and Hebrew

- [X] **T133** [P] Create Page content type with i18n
      - **Path**: cms/src/api/page/content-types/page/schema.json
      - **→ Reference**: research.md:102-107
      - **Implement**: Fields: title, slug, body (richtext), seo (component: metaTitle, metaDescription, customSchema)
      - **→ Validation**: Can create page in all 3 languages

- [X] **T134** Configure webhook for content updates
      - **Path**: cms/src/api/webhook/routes/webhook.ts
      - **→ Reference**: plan.md:164-165 (Backend ↔ CMS content synchronization)
      - **Implement**: Strapi webhook triggers POST to backend/api/webhooks on content publish/update
      - **→ Validation**: Publish content in Strapi → webhook fires → backend receives payload

- [X] **T135** [P] Create custom admin panel translation status field
      - **Path**: cms/src/admin/app.tsx
      - **→ Reference**: research.md:107 (Custom admin panel field to show translation status per locale)
      - **Implement**: Custom field showing checkmarks for published locales, "Draft" or "Missing" for others
      - **→ Validation**: Admin panel shows translation status for each content item

---

## Phase 3.4: Integration (T136-T151)

**Objective**: Connect all services and implement cross-cutting concerns

- [X] **T136** Connect frontend to backend API (environment variables)
      - **Path**: frontend/.env.local
      - **→ Reference**: plan.md:136 (Frontend ↔ Backend content fetching)
      - **Config**: NEXT_PUBLIC_API_URL=http://localhost:8000/v1 (dev), production URL for prod
      - **→ Validation**: Frontend API clients can reach backend

- [X] **T137** Implement session ID generation middleware
      - **Path**: frontend/src/middleware.ts (extend existing next-intl middleware)
      - **→ Reference**: data-model.md:344-346 (sessionId required, generated on first visit)
      - **Implement**: Generate UUID, store in cookie if not exists, attach to all API requests
      - **→ Validation**: First visit creates session cookie, persists across pages

- [X] **T138** Connect backend to Strapi CMS (API token)
      - **Path**: backend/src/config/settings.py
      - **→ Reference**: T084 (StrapiCMSRepository implementation)
      - **Config**: STRAPI_URL, STRAPI_API_TOKEN from environment
      - **→ Validation**: Backend can fetch content from Strapi

- [X] **T139** Implement Redis session storage
      - **Path**: backend/src/infrastructure/cache/redis_cache.py (use T083 implementation)
      - **→ Reference**: research.md:271-285 (Key structure, TTL strategy)
      - **Implement**: Already done in T083, verify integration with UserPreferences use cases
      - **→ Validation**: T032 integration test passes

- [X] **T140** Configure CORS for all services
      - **Path**: backend/src/main.py (extend T015)
      - **→ Reference**: research.md:70 (CORS middleware), plan.md:271 (CORS_ORIGINS config)
      - **Config**: Add CMS origin (http://localhost:1337), frontend origin, production domains
      - **→ Validation**: CMS and frontend can call backend without CORS errors

- [X] **T141** Implement request logging middleware
      - **Path**: backend/src/infrastructure/middleware/logging.py
      - **→ Reference**: plan.md:237 (Request/response logging)
      - **Implement**: FastAPI middleware logging all requests (method, path, status, duration)
      - **→ Validation**: Logs show all API requests in structured format

- [X] **T142** Implement error handling middleware
      - **Path**: backend/src/infrastructure/middleware/error_handler.py
      - **→ Reference**: contracts/api-v1.yaml:607-626 (Error schema), T108 (Error models)
      - **Implement**: Catch all exceptions, return Error schema with appropriate status code, log errors
      - **→ Validation**: Unhandled exception returns 500 with Error format

- [X] **T143** Setup on-demand ISR revalidation endpoint
      - **Path**: frontend/src/app/api/revalidate/route.ts
      - **→ Reference**: research.md:331-332 (CMS triggers /api/revalidate?path=/it/prodotti/eco-bottle)
      - **Implement**: API route handler, validate secret token, call revalidatePath(), return success
      - **→ Validation**: POST /api/revalidate?secret=xxx&path=/it → revalidates path

- [X] **T144** Implement Strapi webhook handler
      - **Path**: backend/src/infrastructure/api/routes/webhooks.py
      - **→ Reference**: T134 (CMS webhook config), T143 (ISR revalidation endpoint)
      - **Implement**: POST /webhooks/strapi, parse payload, call frontend /api/revalidate for affected paths
      - **→ Validation**: T039 integration test passes

- [X] **T145** Configure URL redirect handling in frontend middleware
      - **Path**: frontend/src/proxy.ts (renamed from middleware.ts)
      - **→ Reference**: quickstart.md:213-230 (301/410 redirects), data-model.md:540-563
      - **Implement**: Backend API endpoint /v1/redirects/check, frontend proxy calls API before i18n routing
      - **→ Validation**: Unit and integration tests pass, E2E tests in redirects.spec.ts

- [X] **T146** Implement hreflang tag generation
      - **Path**: frontend/src/lib/seo/hreflang.ts
      - **→ Reference**: research.md:178-188 (hreflang implementation: x-default, it, he)
      - **Implement**: Function takes content with translations, generates <link> tags for x-default, it, he
      - **→ Validation**: Used by T113 SEOHead component

- [X] **T146A** [P] Generate x-default hreflang tag
      - **Path**: frontend/src/lib/seo/hreflang.ts (part of T146)
      - **→ Reference**: research.md:179 (x-default on English version - root domain)
      - **Rule**: x-default always points to English version at root path
      - **→ Validation**: English pages have x-default pointing to themselves

- [X] **T147** Implement schema markup generation
      - **Path**: frontend/src/lib/seo/schema.ts
      - **→ Reference**: plan.md:197-201 (Schema markup: Organization, WebPage, BreadcrumbList), quickstart.md:190-198
      - **Implement**: Functions generating JSON-LD for Organization, WebPage (with inLanguage), Product (future), BreadcrumbList
      - **→ Validation**: Used by T113 SEOHead component

- [X] **T147A** [P] Implement Organization schema
      - **Path**: frontend/src/lib/seo/schema.ts (part of T147)
      - **→ Reference**: plan.md:198 (Organization schema)
      - **Generate**: JSON-LD with @type: Organization, name, logo, sameAs social links
      - **→ Validation**: Schema validates at https://validator.schema.org

- [X] **T148** Create sitemap generation API route
      - **Path**: frontend/src/app/api/sitemap-[lang].xml/route.ts
      - **→ Reference**: research.md:186-188 (Sitemap generation per language: sitemap-en.xml, sitemap-it.xml, sitemap-il.xml)
      - **Implement**: Dynamic route, fetch all content for language, generate XML sitemap with <loc>, <lastmod>, <changefreq>
      - **→ Validation**: Visit /api/sitemap-en.xml returns valid XML sitemap

- [X] **T148A** [P] Generate language-specific sitemaps
      - **Path**: frontend/src/app/api/sitemap-[lang].xml/route.ts (part of T148)
      - **→ Reference**: research.md:186-188
      - **Generate**: sitemap.xml (index), sitemap-en.xml, sitemap-it.xml, sitemap-il.xml
      - **→ Validation**: All 4 sitemaps accessible, main sitemap indexes other 3

- [X] **T149** Implement currency formatting utility (Intl.NumberFormat)
      - **Path**: frontend/src/lib/utils/currency.ts
      - **→ Reference**: research.md:221-234 (formatCurrency function using Intl.NumberFormat)
      - **Implement**: function formatCurrency(amount, currency, locale) using Intl.NumberFormat with currency style, minimumFractionDigits=2
      - **→ Validation**: formatCurrency(29.99, 'EUR', 'it-IT') returns "29,99 €"

- [X] **T150** Configure Tailwind RTL plugin
      - **Path**: frontend/tailwind.config.ts
      - **→ Reference**: research.md:124-148 (tailwindcss-rtl plugin)
      - **Install**: npm install tailwindcss-rtl, add to plugins array
      - **→ Validation**: rtl: prefix available in Tailwind classes

- [X] **T150A** [P] Implement RTL utility classes
      - **Path**: frontend/src/styles/rtl.css
      - **→ Reference**: research.md:145-148 (Logical properties: ms-4, icon mirroring)
      - **Implement**: Custom CSS for RTL-specific adjustments, logical properties (margin-start, margin-end)
      - **→ Validation**: Hebrew pages use logical properties, icons mirror correctly

---

## Phase 3.5: Polish (T151-T162)

**Objective**: Testing, optimization, validation, documentation

- [X] **T151** [P] Unit tests for currency formatting
      - **Path**: backend/tests/unit/test_currency_formatting.py
      - **→ Reference**: T091 (ConvertCurrency use case), research.md:221-234
      - **Test**: Format various amounts in different currencies, verify symbol position, decimal separator, thousands separator
      - **→ Validation**: All formatting tests pass

- [X] **T152** [P] Unit tests for language detection logic
      - **Path**: backend/tests/unit/test_language_detection.py
      - **→ Reference**: T087 (DetectUserLanguage use case)
      - **Test**: Various Accept-Language headers (it-IT, en-US, he-IL, mixed), verify correct detection and confidence scores
      - **→ Validation**: Edge cases handled (unknown languages default to English)

- [X] **T153** [P] Unit tests for slug validation
      - **Path**: backend/tests/unit/test_slug_validation.py
      - **→ Reference**: data-model.md:141-142 (slug must be unique per contentId, languageCode)
      - **Test**: Attempt duplicate slugs, verify validation errors, test slug uniqueness across languages
      - **→ Validation**: All validation rules enforced

- [X] **T154** Run Lighthouse audits (>90 score) for all languages
      - **Path**: scripts/lighthouse-audit.sh
      - **→ Reference**: plan.md:79, 193-196 (Lighthouse >90 score plan)
      - **Test**: lighthouse http://localhost:3000, http://localhost:3000/it, http://localhost:3000/he
      - **→ Validation**: Performance, Accessibility, Best Practices, SEO all >90 for all 3 languages

- [X] **T154A** [P] Run API performance benchmarks
      - **Path**: backend/tests/performance/test_api_benchmarks.py
      - **→ Reference**: plan.md:77-82 (TTFB <600ms, all endpoints <200ms)
      - **Benchmark**: All 8 API endpoints under load, verify response times
      - **→ Validation**: All endpoints <200ms response time, TTFB <600ms

- [X] **T155** Performance test page load <3s on 3G throttling
      - **Path**: frontend/tests/performance/test_page_load.spec.ts (Playwright)
      - **→ Reference**: plan.md:78, quickstart.md:285-294
      - **Test**: Playwright with network throttling (Slow 3G), measure LCP, FCP, TTFB for all pages
      - **→ Validation**: LCP <2.5s, FCP <1.8s, TTFB <600ms, total load <3s

- [X] **T155A** [P] Measure LCP, FCP, CLS (Web Vitals)
      - **Path**: frontend/tests/performance/test_web_vitals.spec.ts
      - **→ Reference**: plan.md:79-82 (LCP <2.5s, FCP <1.8s)
      - **Measure**: Use Playwright to capture Web Vitals metrics on all pages
      - **→ Validation**: All Core Web Vitals meet Google's "Good" thresholds

- [X] **T156** Execute manual quickstart.md validation tests
      - **Path**: scripts/manual-validation.sh
      - **→ Reference**: quickstart.md:103-249 (Tests 1-6)
      - **Execute**: All 6 test scenarios manually, verify all checkmarks pass
      - **→ Validation**: All quickstart tests pass without errors

- [X] **T156A** [P] Run accessibility audit (WCAG 2.1 AA)
      - **Path**: frontend/tests/e2e/test_a11y.spec.ts
      - **→ Reference**: plan.md:90 (WCAG 2.1 AA accessibility compliance)
      - **Test**: Use @axe-core/playwright to scan all pages in all 3 languages
      - **→ Validation**: No WCAG 2.1 AA violations, keyboard navigation works, screen reader friendly

---

## Dependencies

### Critical Path
1. **Setup** (T001-T025) → Everything
2. **Tests** (T021-T050) → Implementation (T051-T151)
3. **Migrations** (T051-T058) → Models (T065-T071) → Repositories (T079-T086)
4. **Entities** (T058-T065) → Use Cases (T086-T096) → API Routes (T096-T103)
5. **Shared Types** (T005A-T005B) → Frontend API Clients (T119-T123) → Pages (T127-T131)
6. **Core** (T051-T135) → Integration (T136-T151) → Polish (T151-T162)

### Blocking Dependencies
- T008 (PostgreSQL) blocks T011 (Alembic), T051-T058 (Migrations)
- T020A-T020C (Seed data) block T021-T028 (Contract tests need data)
- T051-T058 (Migrations) block T065-T071 (Models)
- T072-T078 (Interfaces) block T079-T086 (Implementations)
- T086-T096 (Use cases) block T096-T103 (API routes)
- T005A (Shared types from contracts) blocks T119-T123 (API clients)
- T124 (next-intl middleware) blocks T125-T131 (Pages)
- T138 (Strapi connection) blocks T144 (Webhook handler)
- T143 (ISR revalidation endpoint) blocks T144 (Webhook handler calls it)

---

## Parallel Execution Examples

### Example 1: Contract Tests (T021-T028)
All contract tests can run in parallel as they test different endpoints:
```bash
# Run 8 contract tests simultaneously
pytest backend/tests/contract/test_languages_api.py \
      backend/tests/contract/test_language_detection.py \
      backend/tests/contract/test_content_get.py \
      backend/tests/contract/test_content_list.py \
      backend/tests/contract/test_currencies_api.py \
      backend/tests/contract/test_currency_convert.py \
      backend/tests/contract/test_preferences_get.py \
      backend/tests/contract/test_preferences_put.py \
      -n 8
```

### Example 2: Entity Creation (T058-T064)
All domain entities can be created in parallel:
```bash
# Create 7 entity files in parallel
parallel ::: \
  "Create Language entity in backend/src/domain/entities/language.py" \
  "Create Content entity in backend/src/domain/entities/content.py" \
  "Create ContentVersion entity in backend/src/domain/entities/content_version.py" \
  "Create URLRoute entity in backend/src/domain/entities/url_route.py" \
  "Create Currency entity in backend/src/domain/entities/currency.py" \
  "Create UserPreferences entity in backend/src/domain/entities/user_preferences.py" \
  "Create Locale entity in backend/src/domain/entities/locale.py"
```

### Example 3: Frontend Components (T109-T118)
All components are independent and can be built in parallel:
```bash
# Launch 10 component tasks in parallel
# Each developer takes 2-3 components
Developer 1: T109, T110, T111
Developer 2: T112, T113, T114
Developer 3: T115, T116, T117, T118
```

---

## Validation Checklist

**GATE: Must verify before marking feature complete**

- [x] All 8 API contracts have corresponding tests (T021-T028)
- [x] All 7 entities have model tasks (T058-T071)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (different files, no shared state)
- [x] Each task specifies exact file path
- [x] Each task includes references to design documents
- [x] No task modifies same file as another [P] task
- [x] All quickstart.md scenarios have E2E tests (T041-T047)
- [x] All endpoints have implementation tasks (T096-T103)
- [x] Performance targets defined (T154-T155)
- [x] Accessibility compliance tested (T156A)
- [x] All validation rules implemented (T058A, T060A, T061A, T064A)
- [x] All state machines implemented (T095A)
- [x] Database schema integrity verified (T057A)
- [x] Repository interface compliance verified (T085A)

---

## Notes

- **[P] markers**: 110 out of 184 tasks can run in parallel (60%)
- **TDD approach**: 30 tests (T021-T050) MUST fail before T051+ implementation
- **Clean Architecture**: Entities → Use Cases → Adapters → Frameworks
- **API-First**: OpenAPI contract drives backend implementation
- **Monorepo**: Shared types in `shared/` used by frontend/backend
- **SEO**: hreflang (T146), schema (T147), sitemaps (T148) in integration phase
- **Performance**: SSG (T130), ISR (T143, T130A), Lighthouse (T154)
- **Document References**: All tasks include `→ Reference:` pointing to specific design doc sections
- **Quality Gates**: 5 checkpoint tasks ensure major phases complete correctly
- **Validation**: Each task includes `→ Validation:` criteria for "done"

---

**Status**: Enhanced task list complete with all fixes applied, ready for `/implement` command
**Total Tasks**: 184 (was 156, added 28 missing tasks)
**Estimated Duration**: 5-7 weeks (2-3 developers working in parallel)
**Path References**: Fixed to `/specs/001-core-platform-setup/`
**Design Doc References**: All 184 tasks now include specific references to plan.md, data-model.md, contracts/api-v1.yaml, research.md, or quickstart.md
