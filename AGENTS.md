# Affilibuster Agent Development Guide

**Last Updated**: 2025-11-14

## Project Overview

Affilibuster is a modern, production-ready affiliate platform built with clean architecture principles. It's designed as
a multi-language, SEO-optimized platform that can serve as a foundation for multiple affiliate sites.

### Key Characteristics

- **Architecture**: BFF (Backend for TheGreenBrother) pattern - `TheGreenBrother (Next.js) → Backend API (FastAPI) → Strapi CMS`
  - **THE_GREEN_BROTHER NEVER TALKS TO STRAPI DIRECTLY** - All content flows through the backend API
- **Languages**: English (default), Italian, Hebrew (RTL support)
- **Performance**: Lighthouse scores >90, <3s load times on 3G
- **Testing**: 100% test coverage (backend AND frontend - non-negotiable)
- **SEO**: Comprehensive schema markup, hreflang tags, sitemaps
- **Style Guide**: Living documentation at `/[lang]/style-guide` showcasing all reusable components

## Technology Stack

### TheGreenBrother

- **Framework**: Next.js 16 (App Router, SSG/ISR)
- **Language**: TypeScript 5.7+ (strict mode)
- **UI**: React 19, Tailwind CSS 4
- **i18n**: next-intl for multi-language support
- **Testing**: Jest + React Testing Library (unit), Playwright (E2E)
- **Package Manager**: npm

### Backend

- **Framework**: FastAPI 0.120+ (async, OpenAPI/Swagger)
- **Language**: Python 3.13+ (strict typing)
- **Database**: PostgreSQL 15+ with SQLAlchemy ORM
- **Cache**: Redis for intelligent caching
- **Migrations**: Alembic
- **Testing**: pytest with asyncio support
- **Package Manager**: uv

### CMS

- **Platform**: Strapi 5.28+ (headless CMS)
- **Database**: PostgreSQL 15+ (shared with backend)
- **API**: REST API with full CRUD operations

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Supported OS**: macOS (Colima), Linux, Windows (WSL2)

## Core Principles (NON-NEGOTIABLE)

### 1. Clean Architecture

- Core business logic isolated from framework dependencies
- Clear separation: entities → use cases → interface adapters → frameworks
- No database, UI, or external service dependencies in domain layer

### 2. SOLID Principles

- **S**ingle Responsibility: Each module/class has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes are substitutable for base types
- **I**nterface Segregation: Many specific interfaces over one general
- **D**ependency Inversion: Depend on abstractions, not concretions

### 3. DRY Principle (Don't Repeat Yourself)

- Extract repeated UI patterns into reusable widgets
- Use generics for types and functions

### 4. KISS Principle (Keep It Simple, Stupid)

- Write self-explanatory code with clear variable/function names
- Avoid over-engineering simple problems
- Minimize external dependencies
- Break down complex widgets into smaller, manageable pieces
- Start simple, add complexity only when necessary

### 5. No Fallback Strings Principle (CMS-First Content)

- **NEVER** add default/fallback strings for user-facing content in code
- ALL user-facing content MUST come from CMS (Strapi) through the backend API
- If CMS data is missing or unavailable, components should handle gracefully:
  - Return null or render nothing for optional content
  - Show loading states during data fetch
  - Display error states for critical content failures
- No hardcoded UI text except:
  - Technical error messages for developers (console.error, logs)
  - ARIA labels and accessibility attributes that are structural
  - Form validation messages that are programmatically generated
- Rationale: Maintaining content consistency, enabling easy i18n updates, and centralizing content management

### 6. API-First Design

- OpenAPI specifications are the authoritative source of truth
- Implementation follows the spec, not vice versa
- RESTful APIs for all data operations

### 7. Test-First Development (TDD)

- Tests written BEFORE implementation
- Tests MUST fail initially (red phase)
- Implement minimum code to pass tests (green phase)
- Refactor while keeping tests green
- User approval required before implementation begins

### 8. Modular & Reusable Architecture

- Generic, configurable components for reusability across affiliate sites
- Clear configuration boundaries (site-specific data vs. shared logic)

### 9. Integration Testing Priority

- Integration tests for new module or service contracts
- Tests for changes to existing contracts or APIs
- Inter-service and inter-module communication tests

### 10. Performance & SEO Standards

- Page load time <3s on 3G connections
- Lighthouse performance score >90
- Schema markup for products and reviews
- hreflang tags for multi-language support
- Image optimization (lazy loading, WebP, responsive)

### 11. Strong Typing Requirements

- **Strict Type Safety**: All code must be strongly typed with explicit type annotations
- **Generated Models**: Always use OpenAPI-generated response models, never avoid them with `dict[str, Any]`
- **Type Annotations**: Required for all function parameters, return types, and variables
- **No `any` Types**: Forbidden in TypeScript frontend, `Any` only when absolutely necessary in Python
- **Type-First Development**: Define types before implementation, leverage generated type safety
- **Interface Compliance**: Depend on typed interfaces, not concrete implementations
- **Contract-First Development**: All backend-frontend shared types MUST be defined in `contracts/template.openapi.yaml` first. Autogenerated Python and TypeScript types should be used by backend and frontend respectively. This prevents duplicate data classes and broken contracts.

### 12. Style Guide & Component Reusability

- **Living Documentation**: Style guide at `/[lang]/style-guide` showcases all reusable components and design system
- **Working Examples**: Style guide uses actual working components imported from `@/components`, not mockups or demos
- **Single Source of Truth**: Changes to components in the style guide automatically reflect across the entire site
- **Mandatory Registration**: ALL reusable components MUST appear in the style guide with usage examples
- **Component Requirements**:
  - Fully typed with TypeScript strict mode (no `any` types)
  - Support dark mode via Tailwind `dark:` variants
  - Support i18n and RTL languages (English, Italian, Hebrew)
  - Use Tailwind design tokens exclusively (no hard-coded colors, spacing, or font sizes)
  - Accept props for customization and composition
  - Follow DRY and SOLID principles
  - Have 100% test coverage with comprehensive test cases
  - Include JSDoc documentation for all props and behavior
- **Composability**: Break complex UIs into small, focused, composable components that can be combined
- **Design System**: All components must use centralized design tokens:
  - Colors: `primary-*`, `secondary-*`, `tertiary-*`, `neutral-*`, `success-*`, `warning-*`, `error-*`
  - Typography: Predefined text sizes (`text-xs` to `text-6xl`), weights, and line heights
  - Spacing: Consistent spacing scale (`space-y-*`, `p-*`, `m-*`, `gap-*`)
  - Shadows: Standard shadow utilities (`shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`)
- **Reference First**: Before creating a new component, ALWAYS check the style guide for existing reusable options
- **Consistency Over Customization**: Prefer using existing components over creating new variations

### 13. Test Coverage Requirements (100% NON-NEGOTIABLE)

- **Backend**: 100% minimum coverage (lines, branches, functions, statements)
- **TheGreenBrother**: 100% minimum coverage (lines, branches, functions, statements)
- **Non-Negotiable**: All new code must maintain or improve coverage - no exceptions
- **No Merges Without Coverage**: Code without 100% test coverage will not be merged or committed
- **Comprehensive Testing**: Tests must cover:
  - All code paths and branches
  - Error handling and edge cases
  - User interactions and state changes
  - Loading and disabled states
  - All component props and variations
  - Integration between components and services
- **Test-First (TDD)**: Write tests BEFORE implementation, ensure they fail first (red phase)
- **Quality Over Quantity**: Tests must be meaningful and verify actual behavior, not just hit coverage metrics

### 14. E2E Test Requirements (NON-NEGOTIABLE)

E2E tests verify **correctness**, not timing. Performance tests verify **timing**.

**E2E Test Rules**:

- **NO explicit timeouts**: Use global timeout (5 minutes), not per-assertion timeouts
  - ❌ `await expect(element).toBeVisible({ timeout: 30000 })`
  - ✅ `await expect(element).toBeVisible()`
- **NO `waitForTimeout()` calls**: Wait for conditions/elements, not arbitrary time
  - ❌ `await page.waitForTimeout(2000)`
  - ✅ `await page.waitForLoadState('networkidle')`
  - ✅ `await expect(element).toBeVisible()`
- **Use helper functions** from `tests/helpers/`:
  - `waitForHydration(page)` - Wait for React hydration
  - `waitForElement(locator)` - Wait for element visibility
  - `navigateAndWait(page, url)` - Navigate with networkidle
  - `dismissLanguagePrompt(page)` - Dismiss language modal
- **Tests MUST pass regardless of system load** - focus on "Does it work?" not "Is it fast?"

**Performance Test Rules**:

- **Use centralized thresholds** from `tests/config/performance-thresholds.ts`
- **Tag with `@performance`** for easy filtering
- **Network throttling** to simulate real-world conditions

**Rationale**: Separating correctness from performance prevents flaky tests in resource-constrained environments (Docker, CI) and provides clear debugging signals - you know immediately if the issue is "it doesn't work" vs "it's too slow".

See `the-green-brother/tests/README.md` for complete guidelines and migration instructions.

### 15. Theme-First Styling (Mandatory CSS Variable Usage)

- **FORBIDDEN**: Hardcoded color values (hex, rgb, hsl, named colors) in component styles or Tailwind classes
- **MANDATORY**: All colors MUST use Tailwind utility classes that reference theme.css variables
- **Centralized Theme**: All color definitions live in `the-green-brother/src/styles/theme.css` using CSS custom properties
- **Available Color Palettes**:
  - `primary-*` (Green - Catppuccin Mocha): 50-900 scale
  - `secondary-*` (Peach): 50-900 scale
  - `tertiary-*` (Teal): 50-900 scale
  - `neutral-*` (Grayscale): 50-900 scale
  - `success-*`, `error-*`, `warning-*`: 50-900 scale
- **Correct Usage Examples**:
  - ✅ `className="bg-primary-800 text-white"`
  - ✅ `className="text-neutral-200 hover:text-neutral-100"`
  - ✅ `className="border-tertiary-400"`
- **WRONG Usage Examples**:
  - ❌ `className="bg-[#559540] text-[#ffffff]"` (hardcoded hex values)
  - ❌ `style={{ color: '#559540' }}` (inline hardcoded colors)
  - ❌ `className="text-neutral-200"` if `neutral-200` provides insufficient contrast (use theme colors that meet WCAG AA)
- **Rationale**:
  - Maintains design system consistency across the application
  - Enables easy theme switching (light/dark mode)
  - Ensures WCAG AA accessibility compliance through pre-validated color combinations
  - Facilitates brand updates by changing theme.css only
  - Prevents color drift and inconsistencies

### 16. Zero Tolerance for Error Suppression (NON-NEGOTIABLE)

- **FORBIDDEN**: Suppressing or ignoring compilation errors, linting warnings, or type errors
- **MANDATORY**: All errors, warnings, and linting issues MUST be properly fixed at their root cause
- **No Configuration Changes**: Modifying linter, compiler, or build tool configuration to suppress warnings is strictly prohibited
- **Acceptable Suppressions**: Only in rare, well-justified cases with explicit approval:
  - Third-party library type definition issues (must document reason and create upstream issue)
  - Known false positives in linting tools (must document why and provide evidence)
  - Intentional rule exceptions (e.g., `eslint-disable-next-line` with detailed comment explaining necessity)
- **Proper Solutions Required**:
  - ✅ Fix the actual code issue (type errors, logic errors, style violations)
  - ✅ Refactor code to eliminate the warning
  - ✅ Add proper type annotations or guards
  - ✅ Implement proper error handling
  - ❌ Add `@ts-ignore`, `@ts-nocheck`, `any` types to silence errors
  - ❌ Add `eslint-disable`, `ruff: noqa`, `mypy: ignore` without fixing root cause
  - ❌ Modify `.eslintrc`, `ruff.toml`, `mypy.ini` to disable rules that caught real issues
  - ❌ Use `--no-verify` flags to skip pre-commit hooks
- **When No Clear Solution Exists**: Consult the user for a final decision before proceeding
- **Rationale**:
  - Maintains code quality and prevents technical debt accumulation
  - Ensures type safety and catches bugs early
  - Preserves the integrity of automated quality checks
  - Prevents gradual degradation of code standards
  - Makes the codebase more maintainable and reliable

### 17. Source Tree Organization & Consistency (NON-NEGOTIABLE)

- **MANDATORY**: Consistent file organization patterns across the entire codebase
- **Feature-Based Organization**: Group related files into feature subdirectories when 3+ files share a domain
- **Test Structure Mirroring**: Test directory structure MUST exactly mirror source structure
- **No Co-Located Tests**: Test files live in `tests/` directory, never in `src/`
- **Clear Separation**: Distinguish between framework-level utilities and domain logic

#### TheGreenBrother Organization Rules

**Components** (`src/components/`):

- Feature-based subdirectories for related UI components (e.g., `auth/`, `products/`)
- Shared/primitive components at root level (Button, Input, Card, etc.)
- Each feature subdirectory must have `index.ts` barrel export

**Lib Utilities** (`src/lib/`):

- Feature-based subdirectories for domain logic (e.g., `auth/`, `currency/`, `preferences/`)
- Threshold: 3+ related files warrant a subdirectory
- Generated code isolated in `generated/` subdirectory
- Each feature subdirectory must have:
  - `api.ts` - API client functions
  - `types.ts` - Feature-specific types (if not using generated)
  - `index.ts` - Barrel export
  - Helper utilities as needed

**Hooks** (`src/hooks/`):

- Framework-level hooks at `src/hooks/` (e.g., `useSession`, `useTheme`)
- Domain-specific hooks in feature subdirectories (e.g., `src/lib/currency/useCurrency.ts`)
- Co-locate hooks with their domain logic when possible

**Tests** (`tests/`):

- MUST mirror source structure exactly
- `tests/components/` mirrors `src/components/`
- `tests/lib/` mirrors `src/lib/`
- `tests/hooks/` for framework-level hooks
- NO test files in `src/` directories (enforce via linting)

#### Backend Organization Rules

**Domain Layer** (`src/domain/`):

- Pure business logic with no framework dependencies
- `entities/` - Domain models
- `repositories/` - Repository interfaces
- `use_cases/` - Business logic

**Infrastructure Layer** (`src/infrastructure/`):

- Framework-specific implementations
- `api/routes/` - API endpoints (group by feature if >10 routes)
- `database/` - SQLAlchemy models and connection
- `cache/` - Redis implementation
- `cms/` - Strapi client

**Rationale**:

- Reduces cognitive load (related code is co-located)
- Improves discoverability (clear feature boundaries)
- Scales with codebase growth (easy to add new features)
- Enforces Clean Architecture principles
- Maintains test-source alignment

### 18. Frontend Reference Architecture (Mandatory for All Frontend Apps)

- **MANDATORY**: Use the `frontend` package as the canonical reference for all frontend applications
- **Applies to**: `the-green-brother` and any future frontend applications in the monorepo
- **Scope**: Architecture patterns, coding paradigms, idioms, file organization, and component structure
- **Identical Structure**: `frontend` and `the-green-brother` share identical structure, patterns, and conventions
- **When creating new frontends**: Copy `frontend` package structure and patterns as the starting point
- **When making changes to `the-green-brother`**: Ensure patterns, file organization, and idioms align with those in `frontend`
- **Reference First**: Before implementing new patterns in any frontend, check if `frontend` already has an established approach
- **Rationale**:
  - Maintains consistency across frontend applications
  - Enables code reuse and knowledge transfer between projects
  - Simplifies onboarding for developers familiar with any one frontend
  - Provides a stable reference implementation for architectural decisions

## Project Structure

```
affilibuster/
├── backend/                    # FastAPI backend
│   ├── src/
│   │   ├── domain/            # Business logic (no framework deps)
│   │   │   ├── entities/      # Domain models
│   │   │   ├── repositories/  # Repository interfaces
│   │   │   └── use_cases/     # Business logic
│   │   ├── infrastructure/    # Technical implementations
│   │   │   ├── api/           # FastAPI routes, models, middleware
│   │   │   ├── cms/           # Strapi HTTP client
│   │   │   ├── cache/         # Redis implementation
│   │   │   ├── database/      # SQLAlchemy setup & models
│   │   │   └── dependencies.py # Dependency injection
│   │   └── config/            # Settings & configuration
│   ├── tests/                 # Comprehensive test suite
│   └── alembic/               # Database migrations
├── the-green-brother/                  # Next.js frontend (TheGreenBrother)
│   ├── src/
│   │   ├── app/[lang]/        # Language-specific routes
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities, API clients, hooks
│   │   ├── types/             # TypeScript definitions
│   │   └── i18n/              # Internationalization
│   └── tests/                 # Component & E2E tests
├── cms/                       # Strapi CMS
│   ├── src/api/              # Custom controllers & services
│   └── scripts/              # Seeding scripts
├── contracts/                # OpenAPI specifications
│   ├── template.openapi.yaml # Backend API spec (source of truth)
│   ├── strapi.openapi.yaml   # Strapi content types (auto-generated)
│   └── affilibuster.openapi.yaml # Merged spec (auto-generated)
└── specs/                    # Feature specifications
```

## Backend Architecture Patterns

### Generic Reusable Use Cases

Instead of creating individual use case files, two generic classes handle all Strapi operations:
**Benefits**: DRY principle, consistent caching, easy to extend (3 lines per endpoint).

### Repository Pattern with Interfaces

Routes depend on interfaces, not implementations:

- Domain layer (interface)
- Infrastructure layer (implementation)

### Centralized Dependency Injection

Single source of truth in `infrastructure/dependencies.py`:

### Smart Caching Strategy

- **Languages**: 5-minute TTL (config rarely changes)
- **Currencies**: 1-hour TTL (stable data)
- **Products**: 5-minute TTL (moderate updates)
- **User Preferences**: 30-day TTL (session-based)
- **Cache Invalidation**: Automatic on mutations

## OpenAPI Architecture

### Layered System

```
Layer 1: Strapi Content    → Layer 2: Backend Services
• Product schemas          • Currencies API
• Homepage content         • Preferences API
• Navigation               • Language Detection
• Pages                    • Content Proxy Endpoints
```

### Workflow

1. **CMS Startup**: Generates `strapi.openapi.yaml` from content types
2. **Backend Startup**: Merges specs → generates Python models
3. **TheGreenBrother Startup**: Generates TypeScript types from merged spec

### Important Notes

- **Always regenerate after spec changes**: Types must stay in sync
- **Commit generated code**: Generated types are version controlled
- **External references**: Backend spec uses `$ref: './strapi.openapi.yaml#/...'`
- **Type safety**: TheGreenBrother TypeScript and backend Python types match

## Development Commands

### Quick Start

```bash
# One-command startup (everything)
make dev

# Start only Docker services
make start

# Stop services
make stop

# View logs
make logs                # All services
make logs-backend        # Backend only
```

### Backend Development

```bash
cd backend

# Install dependencies
uv sync

# Run server (local)
uvicorn src.main:app --reload --port 8000

# Run migrations
alembic upgrade head

# Type checking
mypy src

# Linting
ruff check .
ruff check . --fix

# Format
ruff format .
```

### TheGreenBrother Development

```bash
cd the-green-brother

# Install dependencies
npm install

# Dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Format
npm run format
npm run format:fix

# Tests
npm test
npm run test:e2e
```

### Testing

```bash
# Run all tests
make test

# Backend tests only
make test-backend

# TheGreenBrother tests only
make test-the-green-brother

# With coverage
make test              # Includes coverage by default
```

### Code Quality

```bash
# Check all code style
make lint

# Auto-fix linting issues
make lint-fix

# Format all code
make format

# Check formatting without changes
make format-check

# Validate OpenAPI specs
make lint-openapi
```

## Testing Requirements

### Coverage Requirements

- **Backend**: 100% minimum (lines, branches, functions, statements)
- **TheGreenBrother**: 100% minimum (lines, branches, functions, statements)
- **Non-Negotiable**: All code must achieve 100% coverage - no exceptions
- **Quality Mandate**: Coverage must be meaningful, testing actual behavior and edge cases

### Backend Testing Patterns

- Use `@pytest.mark.asyncio` for async functions
- Mock with `AsyncMock` for repositories
- Use SQLite for in-memory database tests
- No external service dependencies (all mocked)

Example:

```python
@pytest.mark.asyncio
async def test_get_languages_with_cache(mocker):
  # Arrange
  cache_service = AsyncMock()
  strapi_repo = AsyncMock()
  use_case = GetCMSContentUseCase(strapi_repo, cache_service)

  # Act
  result = await use_case.execute("/api/i18n/locales")

  # Assert
  strapi_repo.get.assert_called_once()
  cache_service.set.assert_called_once()
```

## Code Style Requirements

### Python (Backend)

- **Formatter**: Ruff (120 char line length)
- **Linter**: Ruff (all rules enabled)
- **Type Checker**: Mypy (strict mode)
- **Docstrings**: **REQUIRED** for all public APIs (enforced by Ruff pydocstyle rules)
  - **Convention**: Google-style docstrings
  - **Scope**: All public functions, classes, methods, and modules
  - **Content**: Must include description, parameters, returns, and raises
  - **Enforcement**: `make lint` will fail if docstrings are missing or incomplete
- **Import Order**: Enforced by Ruff
- **Naming**: snake_case for functions/variables, PascalCase for classes

### TypeScript/JavaScript (TheGreenBrother & CMS)

- **Formatter**: Prettier
- **Linter**: ESLint with typescript-eslint
- **Documentation**: **REQUIRED** JSDoc comments (enforced by eslint-plugin-jsdoc)
  - **Scope**: All exported functions, classes, methods, interfaces, types, and enums
  - **Content**: Must include description, `@param` for parameters, `@returns` for return values
  - **TypeScript Integration**: No need for `@type` tags (TypeScript provides types)
  - **Enforcement**: `npm run lint` will fail if JSDoc is missing or incomplete
- **No `any` types**: Strict mode enforced
- **Explicit return types**: Required for all functions
- **No unused imports/variables**: Enforced by ESLint
- **Naming**: camelCase for functions/variables, PascalCase for components/types

### Documentation Examples

**Python (Google-style docstrings):**

```python
def calculate_affiliate_commission(
  price: Decimal,
  commission_rate: Decimal,
  currency: str = "USD"
) -> Decimal:
  """Calculate the affiliate commission for a product sale.

  This function computes the commission amount based on the product price
  and the applicable commission rate for the affiliate program.

  Args:
      price: The product price before commission.
      commission_rate: The commission rate as a decimal (e.g., 0.10 for 10%).
      currency: The currency code for the transaction. Defaults to "USD".

  Returns:
      The calculated commission amount in the specified currency.

  Raises:
      ValueError: If price is negative or commission_rate is not between 0 and 1.

  Example:
      >>> calculate_affiliate_commission(Decimal("100.00"), Decimal("0.15"))
      Decimal('15.00')
  """
  if price < 0:
    raise ValueError("Price cannot be negative")
  if not 0 <= commission_rate <= 1:
    raise ValueError("Commission rate must be between 0 and 1")
  return price * commission_rate
```

**TypeScript (JSDoc):**

````typescript
/**
 * Fetches product data from the backend API.
 *
 * This function retrieves product information including pricing,
 * descriptions, and affiliate links for the specified product ID.
 *
 * @param productId - The unique identifier for the product
 * @param locale - The locale for localized content (e.g., 'en', 'it', 'he')
 * @returns Promise resolving to the product data
 * @throws {ApiError} When the product is not found or API request fails
 *
 * @example
 * ```typescript
 * const product = await fetchProduct('prod-123', 'en');
 * console.log(product.name);
 * ```

*/
export async function fetchProduct(productId: string, locale: string): Promise<Product> {
  const response = await fetch(`/api/products/${productId}?locale=${locale}`)
  if (!response.ok) {
    throw new ApiError(`Failed to fetch product: ${response.statusText}`)
  }
  return response.json()
}
````

## Multi-Language Support

### Supported Languages

- `en` - English (default)
- `it` - Italian
- `he` - Hebrew (RTL)

### Supported Currencies

USD, EUR, ILS, GBP, CAD, AUD, JPY, CNY

### Adding New Languages

1. Update `cms/scripts/seed.ts` with new language seeding
2. Run `npm run seed` in cms directory
3. Backend automatically syncs on next startup
4. **Zero backend code changes required**

## Critical Operational Rules

**Important**: For architectural principles (Clean Architecture, SOLID, TDD, API-First, etc.), see the "Core Principles" section above.

1. **Never delete CMS/Strapi database without permission** - contains production content
2. **All content must be published in Strapi** - draft content returns 404
3. **No fallback strings in frontend** - all user-facing content comes from CMS through backend

## Environment Configuration

### HTTPS Setup

The application runs on HTTPS in development for secure cookies and production parity:

**Certificate Generation** (first time only):

```bash
# Install mkcert
brew install mkcert  # macOS
# OR sudo apt install mkcert  # Linux
# OR choco install mkcert  # Windows

# Install root CA (may require sudo password)
mkcert -install

# Generate localhost certificates
cd certs
mkcert localhost 127.0.0.1 ::1
mv localhost+2.pem localhost.pem
mv localhost+2-key.pem localhost-key.pem
cd ..
```

**Certificate Paths**:

```bash
SSL_CERT_PATH=./certs/localhost.pem
SSL_KEY_PATH=./certs/localhost-key.pem
```

Certificates are mounted into Docker containers and read by:

- **TheGreenBrother**: Custom HTTPS server (`the-green-brother/server.ts`)
- **Backend**: Uvicorn with `--ssl-keyfile` and `--ssl-certfile` flags
- **CMS**: Strapi server configuration (`cms/config/server.ts`)

**Certificate Renewal**: mkcert certificates expire after 3 years. Regenerate with the same commands above.

### Key Environment Variables

```bash
# Protocol Configuration (all services use HTTPS)
THE_GREEN_BROTHER_PROTOCOL=https
BACKEND_PROTOCOL=https
CMS_PROTOCOL=https

# SSL Certificates
SSL_CERT_PATH=./certs/localhost.pem
SSL_KEY_PATH=./certs/localhost-key.pem

# Backend
BACKEND_PORT=8000
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
REDIS_HOST=redis
STRAPI_URL=https://strapi:1337
STRAPI_API_TOKEN=your-token

# TheGreenBrother
NEXT_PUBLIC_API_URL=https://localhost:8000/v1

# CMS
DATABASE_CLIENT=postgres
```

See `.env.dev.example` for complete configuration.

### Switching Between HTTP and HTTPS

To switch protocols, update all three protocol variables in `.env`:

```bash
# For HTTPS (default)
THE_GREEN_BROTHER_PROTOCOL=https
BACKEND_PROTOCOL=https
CMS_PROTOCOL=https

# For HTTP (if needed for debugging)
THE_GREEN_BROTHER_PROTOCOL=http
BACKEND_PROTOCOL=http
CMS_PROTOCOL=http
```

**Note**: Cookie `secure` flag is automatically enabled/disabled based on `BACKEND_PROTOCOL`.

## Common Tasks

### Adding New Backend Endpoints

1. **Create route handler** in `infrastructure/api/routes/`:

```python
@router.get("/new-endpoint")
async def get_new(
  strapi_repo: CMSRepoDep,
  cache_service: CacheServiceDep,
):
  use_case = GetCMSContentUseCase(strapi_repo, cache_service)
  data = await use_case.execute("/api/path", params={...})
  return transform_response(data)
```

1. **Define response model** in route file or `domain/entities/`

2. **Add helper transformation** to normalize Strapi response

3. **Write comprehensive tests** in `tests/unit/`

### Adding New TheGreenBrother Components

1. **Check Style Guide First**: Review `/[lang]/style-guide` to ensure component doesn't already exist
2. **Create component** in `src/components/` (or `src/components/auth/` for auth components)
3. **Write tests FIRST** in `tests/components/` following TDD (red → green → refactor)
4. **Implement component** with these requirements:
   - Fully typed with TypeScript strict mode
   - Support dark mode (`dark:` variants)
   - Use Tailwind design tokens only (no hard-coded values)
   - Support i18n and RTL
   - Accept props for customization
5. **Document props** with comprehensive JSDoc comments
6. **Ensure accessibility** (aria labels, semantic HTML, keyboard navigation)
7. **Add to Style Guide**: Register component in `src/app/[lang]/style-guide/StyleGuideClient.tsx` with:
   - Live working example using actual component
   - Code snippet showing usage
   - Description of functionality and props
   - Multiple variations/states if applicable
8. **Update Style Guide Tests**: Add test coverage for new section in `tests/app/style-guide.test.tsx`
9. **Verify 100% Coverage**: Run `npm test -- --coverage` and ensure all metrics are 100%

### Regenerating OpenAPI Types

```bash
# Regenerate Strapi OpenAPI (when content types change)
cd cms
npm run openapi:generate

# Validate specifications
make lint-openapi
redocly lint contracts/template.openapi.yaml
```

## Useful Links

- **Backend API Docs**: <https://localhost:8000/docs>
- **TheGreenBrother**: <https://localhost:3000>
- **Style Guide**: <https://localhost:3000/en/style-guide> (design system & reusable components)
- **CMS Admin**: <https://localhost:1337/admin>
- **Constitution**: `.specify/memory/constitution.md`
- **Testing Guide**: `specs/003-comprehensive-testing-strategy/quickstart.md`
- **HTTPS Migration Spec**: `specs/002-https-migration/spec.md`

## Troubleshooting

### Port Conflicts

```bash
lsof -i :5432         # Find process using port
kill -9 <PID>         # Kill process
```

### Backend Type Errors

- Add type guards or use `.get()` method instead of direct indexing
- Check if model is in OpenAPI spec or define custom model

### 502 Bad Gateway

- Check STRAPI_URL and STRAPI_API_TOKEN in .env
- Verify Strapi is running: `docker-compose ps`

### Cache Not Working

- Check REDIS_URL in .env
- Verify Redis is running: `docker-compose ps`

## Performance Targets

- Page load <3s on 3G connections
- Lighthouse performance score >90
- LCP (Largest Contentful Paint) <2.5s
- FCP (First Contentful Paint) <1.8s
- TTFB (Time to First Byte) <600ms

## SEO Features

- Comprehensive hreflang tags
- Schema markup (Product, BreadcrumbList, Organization)
- Sitemaps for each language
- SEO-friendly slugs
- Meta tags, OG tags
- Image optimization (lazy loading, WebP)

## gstack

- Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.
- Available gstack skills:
  - `/plan-ceo-review` — CEO-perspective plan review
  - `/plan-eng-review` — Engineering plan review
  - `/plan-design-review` — Design plan review
  - `/design-consultation` — Design system consultation
  - `/review` — Code review
  - `/ship` — Ship code
  - `/browse` — Fast headless browser for QA testing and browsing
  - `/qa` — QA testing
  - `/qa-only` — QA testing only (no fixes)
  - `/qa-design-review` — QA with design review
  - `/setup-browser-cookies` — Set up browser cookies for authenticated browsing
  - `/retro` — Retrospective
  - `/document-release` — Post-ship documentation update
- If gstack skills aren't working, run `cd .claude/skills/gstack && ./setup` to build the binary and register skills.
