# Affilibuster Agent Development Guide

**Last Updated**: 2025-11-04

## Project Overview

Affilibuster is a modern, production-ready affiliate platform built with clean architecture principles. It's designed as
a multi-language, SEO-optimized platform that can serve as a foundation for multiple affiliate sites.

### Key Characteristics

- **Architecture**: BFF (Backend for Frontend) pattern - `Frontend (Next.js) → Backend API (FastAPI) → Strapi CMS`
  - **FRONTEND NEVER TALKS TO STRAPI DIRECTLY** - All content flows through the backend API
- **Languages**: English (default), Italian, Hebrew (RTL support)
- **Performance**: Lighthouse scores >90, <3s load times on 3G
- **Testing**: 100% project line coverage
- **SEO**: Comprehensive schema markup, hreflang tags, sitemaps

## Technology Stack

### Frontend

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

### 5. API-First Design

- OpenAPI specifications are the authoritative source of truth
- Implementation follows the spec, not vice versa
- RESTful APIs for all data operations

### 6. Test-First Development (TDD)

- Tests written BEFORE implementation
- Tests MUST fail initially (red phase)
- Implement minimum code to pass tests (green phase)
- Refactor while keeping tests green
- User approval required before implementation begins

### 7. Modular & Reusable Architecture

- Generic, configurable components for reusability across affiliate sites
- Clear configuration boundaries (site-specific data vs. shared logic)

### 8. Integration Testing Priority

- Integration tests for new module or service contracts
- Tests for changes to existing contracts or APIs
- Inter-service and inter-module communication tests

### 9. Performance & SEO Standards

- Page load time <3s on 3G connections
- Lighthouse performance score >90
- Schema markup for products and reviews
- hreflang tags for multi-language support
- Image optimization (lazy loading, WebP, responsive)

### 10. Strong Typing Requirements

- **Strict Type Safety**: All code must be strongly typed with explicit type annotations
- **Generated Models**: Always use OpenAPI-generated response models, never avoid them with `dict[str, Any]`
- **Type Annotations**: Required for all function parameters, return types, and variables
- **No `any` Types**: Forbidden in TypeScript frontend, `Any` only when absolutely necessary in Python
- **Type-First Development**: Define types before implementation, leverage generated type safety
- **Interface Compliance**: Depend on typed interfaces, not concrete implementations

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
├── frontend/                  # Next.js frontend
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
3. **Frontend Startup**: Generates TypeScript types from merged spec

### Important Notes

- **Always regenerate after spec changes**: Types must stay in sync
- **Commit generated code**: Generated types are version controlled
- **External references**: Backend spec uses `$ref: './strapi.openapi.yaml#/...'`
- **Type safety**: Frontend TypeScript and backend Python types match

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

### Frontend Development

```bash
cd frontend

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

# Frontend tests only
make test-frontend

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

- **Backend**: 100% minimum
- **Frontend**: 15% minimum (branches, functions, lines, statements)

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

### TypeScript/JavaScript (Frontend & CMS)

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

```typescript
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
export async function fetchProduct(
productId: string,
locale: string
): Promise<Product> {
const response = await fetch(`/api/products/${productId}?locale=${locale}`);
if (!response.ok) {
throw new ApiError(`Failed to fetch product: ${response.statusText}`);
}
return response.json();
}

```

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

Key environment variables:

```bash
# Backend
BACKEND_PORT=8000
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
REDIS_HOST=redis
STRAPI_URL=http://strapi:1337
STRAPI_API_TOKEN=your-token

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# CMS
DATABASE_CLIENT=postgres
```

See `.env.dev.example` for complete configuration.

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

2. **Define response model** in route file or `domain/entities/`

3. **Add helper transformation** to normalize Strapi response

4. **Write comprehensive tests** in `tests/unit/`

### Adding New Frontend Components

1. **Create component** in `src/components/`
2. **Write tests** in `tests/components/` (TDD)
3. **Document props** with JSDoc
4. **Ensure accessibility** (aria labels, semantic HTML)

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

- **Backend API Docs**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000
- **CMS Admin**: http://localhost:1337/admin
- **Constitution**: `.specify/memory/constitution.md`
- **Testing Guide**: `specs/003-comprehensive-testing-strategy/quickstart.md`

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
