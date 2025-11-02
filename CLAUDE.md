# Affilibuster Development Guidelines for Claude

**Last Updated**: 2025-11-03

## Project Overview

Affilibuster is a modern, production-ready affiliate platform with multi-language support, performance optimization, and
clean architecture.

**Key Architecture**: BFF (Backend for Frontend) pattern with strict separation:

- Frontend → Backend API → Strapi CMS
- **Critical Rule**: Frontend NEVER talks to Strapi directly

## Technology Stack

### Backend

- **Language**: Python 3.13+
- **Framework**: FastAPI 0.120+ (async, OpenAPI/Swagger)
- **Package Manager**: uv (0.9.7+)
- **Database**: PostgreSQL 15+ with SQLAlchemy ORM
- **Cache**: Redis
- **Migrations**: Alembic
- **Testing**: pytest with asyncio support
- **Type Checking**: MyPy (strict mode)
- **Linter/Formatter**: Ruff

### Frontend

- **Language**: TypeScript 5.7+ (strict mode)
- **Framework**: Next.js 16 (App Router, SSG/ISR)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 with RTL support
- **i18n**: next-intl
- **SEO**: next-seo with schema markup
- **Testing**: Jest + React Testing Library (unit), Playwright (E2E)
- **Package Manager**: npm
- **Linter**: ESLint
- **Formatter**: Prettier

### CMS

- **Platform**: Strapi 5.28+
- **Runtime**: Node.js 22+
- **Database**: PostgreSQL 15+ (shared with backend)
- **API**: REST API with full CRUD operations

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Supported OS**: macOS (Colima), Linux, Windows (WSL2)

## Project Structure

```
affilibuster/                      # Monorepo root
├── backend/                       # FastAPI backend
│   ├── src/
│   │   ├── domain/               # Business logic (entities, use cases)
│   │   ├── infrastructure/       # External integrations (API, DB, CMS)
│   │   └── config/               # Configuration & settings
│   ├── tests/
│   │   ├── unit/                 # Unit tests
│   │   ├── integration/          # Integration tests
│   │   └── helpers/              # Test helpers
│   └── alembic/                  # Database migrations
├── frontend/                      # Next.js 16 frontend
│   ├── src/
│   │   ├── app/[lang]/           # Language-specific routes
│   │   ├── components/           # React components
│   │   ├── lib/                  # Utilities, API clients, hooks
│   │   └── types/                # TypeScript type definitions
│   └── tests/
├── cms/                           # Strapi 5 CMS
│   ├── src/api/                  # Custom controllers & services
│   └── scripts/                  # Seeding scripts
├── contracts/                     # OpenAPI specifications
│   ├── template.openapi.yaml     # Backend API spec (source of truth)
│   ├── strapi.openapi.yaml       # Strapi content types (auto-generated)
│   └── affilibuster.openapi.yaml # Merged spec (auto-generated)
├── specs/                         # Feature specifications
└── scripts/                       # Development scripts
```

## Design Principles (CRITICAL - MUST FOLLOW)

See `.specify/memory/constitution.md` for full details. Key principles:

### 1. Clean Architecture (Non-Negotiable)

- Core business logic isolated from framework dependencies
- Clear separation: entities → use cases → interface adapters → frameworks
- No database, UI, or external service dependencies in domain layer

### 2. SOLID Principles (Strictly Enforced)

- **S**ingle Responsibility: Each module/class has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes are substitutable for base types
- **I**nterface Segregation: Many specific interfaces over one general
- **D**ependency Inversion: Depend on abstractions, not concretions

### 3. Test-First Development (TDD)

- ✅ Tests written BEFORE implementation
- ✅ Tests MUST fail initially (red phase)
- ✅ Implement minimum code to pass tests (green phase)
- ✅ Refactor while keeping tests green
- ⚠️ **User approval required before implementation begins**

### 4. API-First Design

- OpenAPI specifications are the authoritative source of truth
- Implementation follows the spec, not vice versa
- RESTful APIs for all data operations

### 5. Backend-Specific Patterns

#### Generic Reusable Use Cases

- **StrapiProxyGetUseCase**: Handles ALL GET requests with intelligent caching
- **StrapiProxyMutateUseCase**: Handles POST/PUT/DELETE with cache invalidation
- Benefits: DRY principle, consistent caching, easy to extend

#### Repository Pattern

- Routes depend on interfaces (e.g., `IStrapiRepository`), not implementations
- Enables easy testing and implementation swapping

#### Centralized Dependency Injection

- `infrastructure/dependencies.py` is the single source of truth
- Type-safe dependency injection in routes

## Common Commands

### Development

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

# Run server (with Docker)
docker-compose up backend

# Run server (local)
uvicorn src.main:app --reload --port 8000

# Run migrations
alembic upgrade head

# Create migration
alembic revision -m "description"

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
PYTHONPATH=/Users/ronendruker/Development/repos/affilibuster/backend/src pytest

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

## OpenAPI Code Generation

Affilibuster uses a **layered OpenAPI architecture** for type-safe API definitions.

### Architecture

- **Layer 1 (Strapi)**: Content type schemas auto-generated from Strapi CMS
- **Layer 2 (Backend)**: API contract that references Strapi schemas via external `$ref`
- **Generated Code**: TypeScript types and Python Pydantic models auto-generated from specs

### Specifications

- **Backend API**: `contracts/template.openapi.yaml` (source of truth)
- **Strapi Content**: `contracts/strapi.openapi.yaml` (auto-generated by CMS)
- **Merged Spec**: `contracts/affilibuster.openapi.yaml` (auto-generated by backend)

### Workflow

1. **CMS Startup**: Generates `strapi.openapi.yaml` from content types
2. **Backend Startup**: Merges specs → generates Python models
3. **Frontend Startup**: Generates TypeScript types from merged spec

### Important Notes

1. **Always regenerate after spec changes**: Types must stay in sync
2. **Commit generated code**: Generated types are version controlled
3. **External references**: Backend spec uses `$ref: './strapi.openapi.yaml#/...'`
4. **Type safety**: Frontend TypeScript and backend Python types match by using same source

### Manual Regeneration

```bash
# Regenerate Strapi OpenAPI (when content types change)
cd cms
npm run openapi:generate

# Validate specifications
make lint-openapi
redocly lint contracts/template.openapi.yaml
```

## Testing Requirements

### Coverage Requirements

- **Backend**: 80% minimum
- **Frontend**: 80% minimum
- **CMS**: 60% minimum (lower due to Strapi boilerplate)

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
  use_case = StrapiProxyGetUseCase(strapi_repo, cache_service)

  # Act
  result = await use_case.execute("/api/i18n/locales")

  # Assert
  strapi_repo.get.assert_called_once()
  cache_service.set.assert_called_once()
```

## Adding New Features

### Backend: Adding New Endpoints

1. **Create route handler** in `infrastructure/api/routes/`:

```python
@router.get("/new-endpoint")
async def get_new(
  strapi_repo: StrapiRepoDep,
  cache_service: CacheServiceDep,
):
  use_case = StrapiProxyGetUseCase(strapi_repo, cache_service)
  data = await use_case.execute("/api/path", params={...})
  return transform_response(data)
```

2. **Define response model** in route file or `infrastructure/api/models/`

3. **Add helper transformation** to normalize Strapi response

4. **Write comprehensive tests** in `tests/unit/`

### Frontend: Adding New Components

1. **Create component** in `src/components/`
2. **Write tests** in `tests/components/` (TDD)
3. **Document props** with JSDoc
4. **Ensure accessibility** (aria labels, semantic HTML)

## Code Style Requirements

### Python (Backend)

- **Formatter**: Ruff (120 char line length)
- **Linter**: Ruff
- **Type Checker**: Mypy (strict mode)
- **Docstrings**: Required for all public APIs
- **Import Order**: Enforced by Ruff
- **Naming**: snake_case for functions/variables, PascalCase for classes

### TypeScript (Frontend)

- **No `any` types**: Strict mode enforced
- **Explicit return types**: Required for all functions
- **Documentation**: JSDoc required for all public APIs
- **No unused imports/variables**: Enforced by ESLint
- **Naming**: camelCase for functions/variables, PascalCase for components/types

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

## Performance & SEO Standards

### Performance Targets

- Page load <3s on 3G connections
- Lighthouse performance score >90
- LCP (Largest Contentful Paint) <2.5s
- FCP (First Contentful Paint) <1.8s
- TTFB (Time to First Byte) <600ms

### SEO Features

- Comprehensive hreflang tags
- Schema markup (Product, BreadcrumbList, Organization)
- Sitemaps for each language
- SEO-friendly slugs
- Meta tags, OG tags
- Image optimization (lazy loading, WebP)

## Critical Rules

1. **Never delete CMS/Strapi database without permission**
2. **Frontend NEVER talks to Strapi directly** - all requests go through backend
3. **All content must be published in Strapi** - draft content returns 404
4. **No fallback strings in frontend** - all content from Strapi
5. **OpenAPI specs are source of truth** - implementation follows spec
6. **Test-first development** - write tests before implementation
7. **80% coverage minimum** - tests must pass this threshold
8. **Follow Clean Architecture** - no framework dependencies in domain layer
9. **Repository pattern** - depend on interfaces, not implementations
10. **Document all public APIs** - JSDoc/docstrings required

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
