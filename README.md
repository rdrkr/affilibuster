<!-- Copyright (c) 2025 Affilibuster by Ronen Druker. -->

# Affilibuster - Multi-Language Affiliate Platform

<!--suppress HtmlDeprecatedAttribute -->
<div align="center">

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Python 3.13+](https://img.shields.io/badge/python-3.13%2B-blue)](https://www.python.org/)
[![Node.js 22+](https://img.shields.io/badge/node.js-22%2B-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.3%2B-blue)](https://www.typescriptlang.org/)
[![Next.js 15+](https://img.shields.io/badge/next.js-15%2B-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.115%2B-teal)](https://fastapi.tiangolo.com/)
[![Strapi 5+](https://img.shields.io/badge/strapi-5%2B-purple)](https://strapi.io/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15%2B-336791)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)

**A modern, production-ready affiliate platform with multi-language support, performance optimization, and clean
architecture.**

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Contributing](#-contributing)

</div>

---

## Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
  - [System Design](#system-design)
  - [Project Structure](#project-structure)
  - [Technology Stack](#-technology-stack)
- [Design Principles](#-design-principles)
- [Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [One-Command Setup](#one-command-startup-)
  - [Access Applications](#access-your-applications)
- [Development](#-development)
  - [Setup Instructions](#development-setup-with-docker-step-by-step)
  - [Local Development](#local-development-without-docker)
- [Testing](#-testing)
  - [Running Tests](#quick-commands)
  - [Coverage Requirements](#coverage-requirements)
- [Code Quality](#-code-quality--linting)
  - [Linting & Formatting](#quick-commands-1)
  - [Strict Standards](#strict-mode-enforcement)
- [API Documentation](#-api-documentation)
- [Content Architecture](#-content-architecture)
- [Internationalization](#-internationalization)
- [Performance & SEO](#-performance--seo)
- [Contributing](#-contributing)

---

## ✨ Features

- **🌍 Multi-Language Support**: English (default), Italian, and Hebrew with automatic RTL layout
- **💱 Dynamic Currency**: Support for multiple currencies (USD, EUR, ILS, GBP, CAD, AUD, JPY, CNY) with user preferences
- **🔍 SEO Optimized**: Comprehensive hreflang tags, schema markup, sitemaps, and breadcrumbs
- **⚡ High Performance**: Static Site Generation (SSG) / Incremental Static Regeneration (ISR) with <3s load times and
  Lighthouse scores >90
- **🏗️ Clean Architecture**: Domain-driven design with clear separation of concerns and SOLID principles
- **🧪 Test-First Development**: Comprehensive testing infrastructure with 80%+ coverage across all modules
- **🔐 Secure**: Affiliate link generation, GDPR compliance, secure credential management
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS
- **🎨 Headless CMS**: Strapi integration with full content management capabilities

---

## 🏗️ Architecture

### System Design

Affilibuster follows a **single source of truth** architecture where all content originates from Strapi CMS and flows
through the backend to the frontend:

```
Frontend (Next.js 15, TypeScript)
  ↓ (API calls only)
Backend API (FastAPI, Python 3.13)
  ↓ (syncs from)
Strapi CMS (Headless, PostgreSQL)
  ├── Products (collection type)
  ├── Single Types (pages)
  └── System Metadata (languages, currencies)
```

**Key Rule**: Frontend NEVER talks to Strapi directly. All content flows through the backend API.

### Project Structure

```
affilibuster/                      # Monorepo root
├── backend/                       # FastAPI backend
│   ├── src/
│   │   ├── domain/               # Business logic (entities, use cases)
│   │   ├── infrastructure/       # External integrations (API, DB, CMS)
│   │   └── config/               # Configuration & settings
│   ├── tests/
│   │   ├── contract/             # API contract tests
│   │   ├── integration/          # Integration tests
│   │   ├── performance/          # Performance tests
│   │   └── unit/                 # Unit tests
│   └── alembic/                  # Database migrations
│
├── frontend/                      # Next.js 15 frontend
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages
│   │   │   └── [lang]/           # Language-specific routes
│   │   ├── components/           # React components
│   │   ├── lib/                  # Utilities, API clients, hooks
│   │   ├── types/                # TypeScript type definitions
│   │   ├── i18n/                 # Internationalization config
│   │   └── styles/               # Global styles
│   ├── tests/
│   │   ├── components/           # Component tests (Jest + RTL)
│   │   ├── integration/          # E2E tests (Playwright)
│   │   └── unit/                 # Utility tests
│   └── public/                   # Static assets
│
├── cms/                           # Strapi 5 headless CMS
│   ├── config/                   # Strapi configuration
│   ├── src/api/                  # Custom controllers & services
│   ├── types/generated/          # Generated TypeScript types
│   ├── database/migrations/      # Database migrations
│   └── public/uploads/           # Uploaded media
│
├── contracts/                     # OpenAPI specifications (source of truth)
│   ├── template.openapi.yaml     # Backend API specification
│   ├── strapi.openapi.yaml       # Strapi content types (auto-generated)
│   └── affilibuster.openapi.yaml # Merged specification (auto-generated)
│
├── specs/                         # Feature specifications & designs
│   ├── 001-core-platform-setup/
│   └── 003-comprehensive-testing-strategy/
│
├── scripts/                       # Development & deployment scripts
├── .specify/                      # SpecKit project configuration
│   ├── memory/constitution.md    # Project constitution & principles
│   └── templates/                # Documentation templates
│
└── docker-compose.yaml             # Local development environment

```

### 🛠️ Technology Stack

<details>
<summary><b>Frontend</b></summary>

- **Framework**: Next.js 15 (App Router, SSG/ISR)
- **Language**: TypeScript 5.3+ (strict mode)
- **Styling**: Tailwind CSS 4 with RTL support
- **Internationalization**: next-intl
- **SEO**: next-seo with schema markup
- **Testing**: Jest + React Testing Library (unit), Playwright (E2E)
- **Package Manager**: npm

</details>

<details>
<summary><b>Backend</b></summary>

- **Framework**: FastAPI 0.115+ (async, OpenAPI/Swagger)
- **Language**: Python 3.13+ (strict typing with MyPy)
- **Database**: PostgreSQL 15+ with SQLAlchemy ORM
- **Cache**: Redis (session management, caching)
- **Migrations**: Alembic
- **Testing**: pytest with asyncio support, 80% coverage requirement
- **Package Manager**: uv

</details>

<details>
<summary><b>CMS</b></summary>

- **Platform**: Strapi 5+ (headless CMS)
- **Database**: PostgreSQL 15+ (shared with backend)
- **Internationalization**: i18n plugin for multi-language content
- **API**: REST API with full CRUD operations
- **Admin Panel**: Built-in React admin dashboard

</details>

<details>
<summary><b>Infrastructure</b></summary>

- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **Environment**: macOS (Colima), Linux, Windows (WSL2)

</details>

---

## 🎯 Design Principles

The Affilibuster project is built on a robust set of principles documented in [
`.specify/memory/constitution.md`](.specify/memory/constitution.md). All code and features MUST adhere to these
principles:

### I. Clean Architecture

- Core business logic isolated from framework dependencies
- Clear separation of concerns: entities, use cases, interface adapters, frameworks
- No database, UI, or external service dependencies in business logic

### II. SOLID Principles (Non-Negotiable)

- **S**ingle Responsibility: Each module/class has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes are substitutable for base types
- **I**nterface Segregation: Many specific interfaces over one general interface
- **D**ependency Inversion: Depend on abstractions, not concretions

### III. Test-First Development (TDD)

- Tests written BEFORE implementation
- Tests MUST fail initially (red phase)
- Implement minimum code to pass tests (green phase)
- Refactor while keeping tests green
- User approval required before implementation begins

### IV. Modular & Reusable Architecture

- Generic, configurable components for reusability across affiliate sites
- Clear configuration boundaries (site-specific data vs. shared logic)

### V. Integration Testing Priority

- Integration tests for new module or service contracts
- Tests for changes to existing contracts or APIs
- Inter-service and inter-module communication tests
- Critical user flow testing

### VI. API-First Design

- Clear contract definitions before implementation
- RESTful APIs for all data operations
- API versioning from the start
- Comprehensive API documentation
- Support for headless CMS integration

### VII. Performance & SEO Standards

- Page load time <3s on 3G connections
- Lighthouse performance score >90
- Schema markup for products and reviews
- hreflang tags for multi-language support
- Image optimization (lazy loading, WebP, responsive)
- Static HTML generation where feasible
- Pagination instead of infinite scroll

---

## 🔧 Backend Architecture

The backend is a **BFF (Backend for Frontend)** service built with FastAPI that bridges Strapi CMS and the frontend
application. It implements Clean Architecture with strict separation of concerns.

### Core Patterns

#### Generic Reusable Use Cases

Instead of creating individual use case files for each endpoint, two generic classes handle all Strapi operations:

- **StrapiProxyGetUseCase**: Handles GET requests with intelligent caching
- **StrapiProxyMutateUseCase**: Handles POST/PUT/DELETE requests with automatic cache invalidation

**Benefits:**

- DRY principle: No code duplication across 24+ endpoints
- Consistent caching and error handling
- Easy to add new endpoints (3 lines of code)
- Maintains Clean Architecture principles

Example:

```python
# ONE generic class handles ALL GET requests
use_case = StrapiProxyGetUseCase(strapi_repo, cache_service, cache_ttl=300)
result = await use_case.execute("/any/strapi/path", params={...})
```

#### Repository Pattern with Interfaces

Routes depend on interfaces, not implementations, enabling easy testing and swapping implementations:

```python
# Domain layer (business logic)
class IStrapiRepository(ABC):
  @abstractmethod
  async def get(self, path: str, params: Optional[Dict] = None): ...


# Infrastructure layer (implementation)
class StrapiRepositoryImpl(IStrapiRepository):
  async def get(self, path: str, params: Optional[Dict] = None):
# httpx client, error handling, authentication
```

#### Centralized Dependency Injection

Single source of truth for singleton creation:

```python
# infrastructure/dependencies.py
initialize_dependencies()  # Called once at startup


# Routes receive injected dependencies
@router.get("")
async def handler(
  strapi_repo: StrapiRepoDep,  # Type-safe, injected
  cache_service: CacheServiceDep,
):
  ...
```

### Smart Caching Strategy

- **Languages**: 5-minute TTL (config rarely changes)
- **Currencies**: 1-hour TTL (stable data)
- **Products**: 5-minute TTL (moderate updates)
- **User Preferences**: 30-day TTL (session-based)
- **Cache Invalidation**: Automatic on mutations

### Backend Project Structure

```
backend/
├── src/
│   ├── main.py                          # FastAPI application entry point
│   ├── config/
│   │   └── settings.py                  # Pydantic settings (environment variables)
│   │
│   ├── domain/                          # Business logic (no framework dependencies)
│   │   ├── entities/
│   │   │   └── user_preferences.py      # Domain models
│   │   ├── repositories/
│   │   │   ├── strapi_repository.py     # IStrapiRepository interface
│   │   │   ├── cache_service.py         # ICacheService interface
│   │   │   └── preferences_repository.py
│   │   └── use_cases/
│   │       ├── strapi_proxy.py          # Generic Strapi use cases
│   │       ├── get_user_preferences.py
│   │       └── update_user_preferences.py
│   │
│   ├── infrastructure/                  # Technical implementations
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── languages.py         # GET /languages, POST /languages/detect
│   │   │   │   ├── currencies.py        # GET /currencies, POST /currencies/convert
│   │   │   │   ├── content.py           # GET /content/{lang}/{slug}, etc.
│   │   │   │   └── preferences.py       # GET/PUT /user/preferences
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   └── generated/
│   │   │   │       └── models.py        # Auto-generated from OpenAPI spec
│   │   │   └── middleware/
│   │   │
│   │   ├── cms/
│   │   │   └── strapi_repository_impl.py # Strapi HTTP client (httpx)
│   │   │
│   │   ├── cache/
│   │   │   └── redis_cache.py            # Redis cache implementation
│   │   │
│   │   ├── database/
│   │   │   ├── config.py                 # SQLAlchemy async setup
│   │   │   ├── models/                   # SQLAlchemy ORM models
│   │   │   └── repositories/             # Database query implementations
│   │   │
│   │   └── dependencies.py               # Centralized dependency injection
│   │
├── tests/
│   ├── unit/
│   │   ├── test_strapi_proxy_use_cases.py    # Generic use case tests
│   │   ├── test_currencies_route.py
│   │   ├── test_languages_route.py
│   │   ├── test_content_route.py
│   │   └── test_user_preferences.py
│   ├── integration/
│   ├── contract/
│   └── conftest.py
│
├── alembic/                             # Database migrations
│   ├── versions/
│   └── env.py
│
└── pyproject.toml
```

---

## 🚀 Quick Start

### Prerequisites

#### macOS

```bash
# Option 1: Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop

# Option 2: Colima + Docker CLI (lighter alternative)
brew install colima docker docker-compose docker-buildx
colima start
```

#### Linux

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt-get install docker-compose-plugin
```

#### Windows

Download [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Environment Configuration

Before starting services, configure your environment:

```bash
# Copy environment template
cp .env.dev.example .env

# Edit .env with your configuration
# See .env.dev.example for detailed documentation
```

**For Docker** (default): Use pre-configured values in `.env.example`
**For Local Development**: Replace `postgres`, `redis`, `strapi` hostnames with `localhost`

See [`.env.example`](.env.dev.example) for complete configuration documentation.

#### Backend Environment Variables

Backend-specific configuration:

```bash
# Application
APP_ENV=development                           # development or production
DEBUG=true                                     # Enable debug mode
LOG_LEVEL=DEBUG                               # DEBUG, INFO, WARNING, ERROR

# Server
BACKEND_PROTOCOL=http                         # http or https
BACKEND_PORT=8000                            # Backend API port
BACKEND_HOST=localhost                       # Backend hostname
INTERNAL_BACKEND_HOST=backend                # Internal Docker hostname

# Security
JWT_SECRET=your-secret-key-change-in-production

# External Services
EXCHANGE_RATE_API_KEY=your-exchange-rate-api-key
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest

# Database & Cache (shared with CMS)
POSTGRES_PROTOCOL=postgresql
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=affilibuster
POSTGRES_PASSWORD=affilibuster
POSTGRES_BACKEND_NAME=affilibuster_db_backend
POSTGRES_SSL=false

REDIS_PROTOCOL=redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_TTL_PREFERENCES=2592000  # 30 days in seconds
```

### One-Command Startup ⚡

Start **everything** (Docker + Backend + Frontend + CMS) with one command:

```bash
make dev
```

This single command:

- ✅ Checks Docker is running
- ✅ Starts PostgreSQL + Redis + Backend + Strapi (Docker)
- ✅ Auto-installs frontend dependencies
- ✅ Starts Next.js frontend
- ✅ Shows all service logs
- ✅ Handles cleanup on Ctrl+C

**⏱️ Wait ~30 seconds** for all services to be ready.

### Access Your Applications

| Service           | URL                         | Notes                                      |
|-------------------|-----------------------------|--------------------------------------------|
| **Frontend**      | http://localhost:3000       | Next.js (English, default)                 |
| **Frontend (IT)** | http://localhost:3000/it    | Italian locale                             |
| **Frontend (HE)** | http://localhost:3000/he    | Hebrew locale (RTL)                        |
| **Backend API**   | http://localhost:8000       | FastAPI REST API                           |
| **API Docs**      | http://localhost:8000/docs  | Swagger UI                                 |
| **API ReDoc**     | http://localhost:8000/redoc | ReDoc documentation                        |
| **CMS Admin**     | http://localhost:1337/admin | Strapi admin panel (takes ~60s first time) |
| **CMS API**       | http://localhost:1337/api   | REST API                                   |

### Stop Services

Press **Ctrl+C** in the terminal or run:

```bash
make stop
```

---

## 🛠️ Development

### Development Setup with Docker (Step by Step)

<details>
<summary><b>1. Clone and Configure Environment</b></summary>

```bash
git clone https://github.com/rdrkr/affilibuster.git
cd affilibuster

# Copy environment configuration
cp .env.dev.example .env

# Edit .env if needed (default values work for Docker)
```

</details>

<details>
<summary><b>2. Start Docker Services</b></summary>

```bash
# Start Docker services only
make start

# Or with docker-compose
docker-compose up -d
```

Services started:

- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 8000)

</details>

<details>
<summary><b>3. Verify Services are Healthy</b></summary>

```bash
docker-compose ps
# Or
make ps

# Health check
curl http://localhost:8000/health
# Or
make health
```

All services should show "healthy" status.

</details>

<details>
<summary><b>4. View Logs</b></summary>

```bash
# All services
make logs

# Backend only
make logs-backend

# Or with docker-compose
docker-compose logs -f backend
```

</details>

<details>
<summary><b>5. Start Frontend (Separate Terminal)</b></summary>

```bash
cd frontend
npm install
cp .env.dev.example .env.local
npm run dev
```

Access at: http://localhost:3000

</details>

<details>
<summary><b>6. Start CMS (Separate Terminal)</b></summary>

```bash
cd cms
npm install
cp .env.dev.example .env
npm run develop
```

Access at: http://localhost:1337/admin

</details>

### Local Development (without Docker)

<details>
<summary><b>Backend Setup</b></summary>

```bash
cd backend

# Install dependencies
uv sync

# Setup environment (copy from root and edit)
cp ../.env.dev.example .env

# Run migrations
alembic upgrade head

# Start server
uvicorn src.main:app --reload --port 8000
```

</details>

#### Backend Development Guidelines

**Code Style:**

- **Formatter**: Ruff
- **Linter**: Ruff
- **Type Checker**: Mypy (strict mode)

All business logic is strictly typed. Framework integration code (routes, middleware) has relaxed checking due to
FastAPI's dynamic nature.

**Adding New Endpoints:**

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

2. **Define response model** in `infrastructure/api/models/__init__.py` or route file

3. **Add helper transformation function** to normalize Strapi response:

```python
async def transform_response(strapi_data: Dict) -> YourModel:
  attrs = strapi_data.get("attributes", strapi_data)
  return YourModel(
    field1=attrs.get("field1"),
    field2=attrs.get("field2"),
  )
```

4. **Add comprehensive tests** in `tests/unit/`

<details>
<summary><b>Frontend Setup</b></summary>

```bash
cd frontend

npm install
# Copy NEXT_PUBLIC_* variables from root .env.dev.example to .env.local
cp ../.env.dev.example .env.local
# Edit .env.local to only keep NEXT_PUBLIC_* variables, update URLs to localhost

npm run dev
```

</details>

<details>
<summary><b>CMS Setup</b></summary>

```bash
cd cms

npm install
# Copy Strapi variables from root .env.dev.example to .env
cp ../.env.dev.example .env

npm run develop
```

</details>

---

## 🧪 Testing

Affilibuster has comprehensive testing infrastructure with 80%+ coverage requirements.

### Quick Commands

```bash
# Run all tests
make test

# Run tests in parallel (faster)
make test-parallel

# Individual modules
make test-backend          # Backend (pytest)
make test-backend-fast     # Backend unit tests only
make test-frontend         # Frontend (Jest)
make test-cms              # CMS (when custom code added)

# Coverage
make coverage-merge        # Merge all module reports
make coverage-view         # Open merged HTML report
```

### Test Categories (Backend)

```bash
# Filter by test type using pytest markers
docker-compose exec backend pytest -m "unit"           # Unit tests only
docker-compose exec backend pytest -m "integration"    # Integration tests
docker-compose exec backend pytest -m "contract"       # API contract tests
docker-compose exec backend pytest -m "not slow"       # Skip slow tests
```

#### Backend Testing Patterns

All backend tests follow these patterns:

- **Async Tests**: Use `@pytest.mark.asyncio` for async functions
- **Mocking**: Use `AsyncMock` for repository mocking, `mocker.patch()` for dependencies
- **In-Memory Database**: Use SQLite for database tests without external dependencies
- **No External Services**: All integrations mocked (Strapi, Redis, PostgreSQL)

Example test:

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

### Coverage Requirements

| Module   | Target | Tool                                   |
|----------|--------|----------------------------------------|
| Backend  | 80%    | pytest + coverage.py                   |
| Frontend | 80%    | Jest                                   |
| CMS      | 60%    | Jest (lower due to Strapi boilerplate) |

### Error Handling

⚠️ **Important**: `make test` will **FAIL** (exit code ≠ 0) if:

- Any test fails
- Coverage falls below the required thresholds
- Any module encounters errors

This is by design - the test suite runs all modules to show all errors at once.

```bash
# Use in CI/CD pipelines
make test && echo "✅ Ready to deploy" || echo "❌ Build failed"
```

📖 **Full Testing Guide
**: [specs/003-comprehensive-testing-strategy/quickstart.md](specs/003-comprehensive-testing-strategy/quickstart.md)

---

## 🎨 Code Quality & Linting

Affilibuster enforces strict code quality standards across all languages.

### Quick Commands

```bash
# Check code style (all modules)
make lint

# Check specific types
make lint-python            # Check Python code (Ruff)
make lint-typescript        # Check TypeScript/JavaScript (ESLint)
make lint-shell             # Check shell scripts (ShellCheck)
make lint-openapi           # Validate OpenAPI specifications (Redocly)

# Check-only mode (no auto-fix)
make lint-check                # Check all without fixing
make lint-python-check         # Check Python only (Ruff)
make lint-typescript-check     # Check TypeScript only (ESLint)
make lint-shell-check          # Check shell only (ShellCheck)
make lint-openapi-check        # Validate OpenAPI only (Redocly, check-only)

# Format code
make format                 # Format all code (Ruff, Prettier, shfmt)
make format-check           # Check formatting without making changes

# Format specific types
make format-python          # Format Python code (Ruff)
make format-typescript      # Format TypeScript/JavaScript (Prettier)
make format-shell           # Format shell scripts (shfmt)
make format-makefile        # Validate Makefile (checkmake)
```

### Tools by Language

| Language              | Linter     | Formatter | Validator     |
|-----------------------|------------|-----------|---------------|
| Python                | Ruff       | Ruff      | MyPy (strict) |
| TypeScript/JavaScript | ESLint     | Prettier  | TypeScript    |
| Bash                  | ShellCheck | shfmt     | N/A           |
| OpenAPI               | Redocly    | N/A       | Redocly       |
| Makefile              | checkmake  | N/A       | N/A           |

### Strict Mode Enforcement

All modules are configured in **strict mode**:

- ✅ No `any` types in TypeScript
- ✅ All functions must have explicit return types
- ✅ Comprehensive type coverage (95%+ for shared types)
- ✅ Documentation required for all public APIs (Python)
- ✅ No unused imports or variables
- ✅ Consistent code style enforced

### Pre-commit Hooks

Pre-commit hooks are automatically installed as part of `make setup`. They prevent accidental commits of badly formatted
code:

```bash
# Hooks run automatically on every commit
# To bypass: git commit --no-verify (not recommended)
```

## 📡 API Documentation

### OpenAPI Architecture

Affilibuster uses a **layered OpenAPI architecture** with auto-generated types for type safety across all services.

#### Layered Specification System

```
┌──────────────────────────────────────────────────────────────┐
│                    OpenAPI Specifications                    │
├──────────────────────────┬───────────────────────────────────┤
│ Layer 1: Strapi Content  │ Layer 2: Backend Services         │
├──────────────────────────┼───────────────────────────────────┤
│ • Product                │ • Currencies API                  │
│ • Homepage               │ • Preferences API                 │
│ • Navigation             │ • Language Detection              │
│ • Pages                  │ • Content Proxy Endpoints         │
│ (i18n, rich fields)      │ (extends Strapi types)            │
└──────────────────────────┴───────────────────────────────────┘
         │                              │
         │ references via $ref          │
         └──────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
   Code Generators         Code Generators
   @hey-api/openapi-ts    datamodel-code-generator
         │                         │
         ▼                         ▼
   TypeScript Types      Python Pydantic Models
   generated/            backend/src/
                         infrastructure/api/
                         generated/
```

#### Specification Files

- **Template (Backend API)**: `contracts/template.openapi.yaml` - Defines all backend endpoints and types
- **Strapi Content**: `contracts/strapi.openapi.yaml` - Auto-generated content schemas (generated by CMS during startup)
- **Merged Specification**: `contracts/affilibuster.openapi.yaml` - Merged spec (generated by Backend during startup)
- **Backend references Strapi** via external `$ref` for clean separation of concerns

#### Code Generation Workflow

Code generation is handled automatically by each service container during startup:

**CMS (Strapi)**:

- Generates `contracts/strapi.openapi.yaml` from content types
- Runs automatically before Strapi server starts

**Backend (FastAPI)**:

- Merges `template.openapi.yaml` + `strapi.openapi.yaml` → `affilibuster.openapi.yaml`
- Generates Python models from merged spec
- Runs automatically during container startup

**Frontend (Next.js)**:

- Generates TypeScript types from `affilibuster.openapi.yaml`
- Runs automatically during container startup

**To manually regenerate Strapi OpenAPI** (when content types change):

```bash
cd cms
npm run openapi:generate
```

**Validate Specifications**:

```bash
# Using Redocly CLI with strict linting rules (recommended)
make lint-openapi

# Or run directly
redocly lint contracts/template.openapi.yaml
redocly lint contracts/strapi.openapi.yaml
```

**Configuration**: OpenAPI linting rules are defined in `redocly.yaml` at the repository root:

- Uses `recommended-strict` ruleset for comprehensive validation
- Allows localhost URLs for development (see `no-server-example.com` rule)
- Allows external schema references (see `no-unused-components` rule)

See [redocly.yaml](cms/redocly.yaml) for full configuration.

#### Type Safety

- **TypeScript**: Generated in `shared/types/generated/` from `@hey-api/openapi-ts`
- **Python**: Generated in `backend/src/infrastructure/api/models/generated/` from `datamodel-code-generator`
- **Both** use the same source OpenAPI spec, ensuring frontend and backend types always match

**Important**: Always regenerate types after OpenAPI spec changes to maintain type safety.

### REST API Endpoints

#### Base URLs

- Development: `http://localhost:8000`
- Production: `https://api.affilibuster.com` (example)

#### Interactive Documentation

- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`
- **OpenAPI JSON**: `/openapi.json`

#### Content Endpoints

```bash
# Get single type content (page, footer, etc.)
GET /api/v1/content/single-types/{lang}/{type_name}

# Examples
GET /api/v1/content/single-types/en/homepage
GET /api/v1/content/single-types/it/privacy
GET /api/v1/content/single-types/he/about

# List products (with pagination)
GET /api/v1/content/{lang}?page=1&pageSize=20

# Get specific product
GET /api/v1/content/{lang}/{slug}

# Health check
GET /health
```

#### Supported Languages

- `en` - English (default)
- `it` - Italian
- `he` - Hebrew

### API Contracts

API contracts are defined in OpenAPI 3.1.0 format:

- **Backend API**: `contracts/template.openapi.yaml`
- **Strapi Content**: `contracts/strapi.openapi.yaml`
- **Generated TypeScript Types**: `shared/types/generated/` and re-exported from `shared/types/api.ts`
- **Generated Python Models**: `backend/src/infrastructure/api/models/generated/models.py`

**Key Principle**: OpenAPI specifications are the authoritative source of truth. Implementation follows the spec, not
vice versa.

#### Backend Error Handling

All backend errors return a consistent JSON response format:

```json
{
  "error": "Not Found",
  "message": "Content not found",
  "code": "CONTENT_NOT_FOUND",
  "timestamp": "2025-10-29T12:00:00Z"
}
```

| HTTP Code | Meaning     | When                         |
|-----------|-------------|------------------------------|
| 200       | Success     | Normal operation             |
| 400       | Bad Request | Invalid parameters           |
| 404       | Not Found   | Content/preference not found |
| 502       | Bad Gateway | Strapi unreachable           |

#### Data Flow Examples

**Getting Languages with Cache:**

```
1. Client: GET /v1/languages
2. Route: Calls StrapiProxyGetUseCase
3. Use Case: Checks cache → MISS → Calls Strapi
4. Repository: HTTP GET /api/i18n/locales with Bearer token
5. Use Case: Caches result (5-minute TTL)
6. Route: Transforms Strapi format → Language schema
7. Client: Returns sorted language list (EN first)
```

On subsequent requests within 5 minutes:

- Cache HIT → Skip Strapi call → Faster response (~10ms vs ~200ms)

**User Preferences (Backend Database):**

```
1. Client: GET /v1/user/preferences
   Header: X-Session-Id: session-abc-123
2. Route: Validates session ID format
3. Use Case: Checks cache → Queries PostgreSQL
4. Database: SELECT * FROM user_preferences WHERE session_id = ?
5. Use Case: Caches with 30-day TTL
6. Route: Returns UserPreferencesModel
7. Client: Receives currency, language preferences, etc.
```

---

## 🌐 Content Architecture

### Single Source of Truth: Strapi CMS

All user-facing content originates from Strapi CMS, ensuring:

- **Consistency**: One authoritative source for all content
- **Scalability**: Easy to add new languages without backend code changes
- **Maintainability**: No hardcoded fallback strings in frontend

### Content Types

#### Collection Types (Multi-instance)

- `product` - Affiliate products with URLs, pricing, featured status
- `system-language` - Supported languages with RTL support info
- `currency` - Supported currencies with exchange rates
- `system-locale` - Language-currency locale combinations

#### Single Types (One instance per language)

- `navigation` - Navigation menus, language/theme selectors
- `footer` - Footer links, contact info
- `homepage`, `about`, `contact` - Page content
- `privacy`, `term` - Legal pages
- `error-404`, `error-410` - Error pages

### Adding New Languages (Scalable Approach)

To add French without changing backend code:

1. **Update `cms/scripts/seed.ts`** - Add seeding functions for the new language

2. **Run the seed script** - Seeds both database and makes API calls to Strapi:

```bash
cd cms
npm run seed
```

Or let it happen automatically on first Strapi bootstrap during `make build` or `docker-compose up`.

That's it! Backend automatically syncs new language on next startup. **Zero backend code changes required.**

### Critical Requirements

1. **No Frontend → Strapi Direct Access** - All frontend requests must go through backend
2. **All Content Must Be Published** - Draft content returns 404
3. **Single Types Need `publishedAt`** - Required field to be queryable
4. **No Fallback Strings** - Missing content shows "not available" message
5. **Backend Caches Content** - Products synced to database for fast access

---

## 🌍 Internationalization

### Supported Languages

| Code | Language | Direction | Status    |
|------|----------|-----------|-----------|
| `en` | English  | LTR       | ✅ Default |
| `it` | Italian  | LTR       | ✅ Active  |
| `he` | Hebrew   | RTL       | ✅ Active  |

### Supported Currencies

USD, EUR, ILS, GBP, CAD, AUD, JPY, CNY

### Frontend i18n Configuration

- **Framework**: next-intl
- **Route Structure**: `/[lang]/...` (e.g., `/en/products`, `/it/about`, `/he/contact`)
- **Default Locale**: English (root domain `/`)
- **RTL Support**: Automatic layout flip for Hebrew with tailwindcss-rtl

### Content Localization

All content is localized in Strapi CMS:

- Products have localized title, description, and metadata
- Pages have localized content and SEO metadata
- Navigation menus are language-specific
- Translation status tracking for each language

---

## ⚡ Performance & SEO

### Performance Targets

- Page load <3s on 3G connections
- Lighthouse scores >90
- LCP (Largest Contentful Paint) <2.5s
- FCP (First Contentful Paint) <1.8s
- TTFB (Time to First Byte) <600ms

### SEO Features

- ✅ Comprehensive hreflang tags for multi-language support
- ✅ Schema markup (Product, BreadcrumbList, Organization)
- ✅ Sitemaps (en, it, he) with proper URLs
- ✅ Breadcrumb navigation at page level
- ✅ SEO-friendly slugs in content
- ✅ Meta tags (title, description, keywords)
- ✅ OG tags for social sharing
- ✅ Image optimization (lazy loading, WebP, responsive)
- ✅ Critical CSS inlined
- ✅ Pagination instead of infinite scroll

### Optimization Techniques

- **Static Site Generation (SSG)**: Pre-render pages at build time
- **Incremental Static Regeneration (ISR)**: Update static pages without full rebuild
- **Image Optimization**: Next.js Image component with automatic optimization
- **Code Splitting**: Automatic route-based code splitting
- **Caching Strategy**:
  - Backend caches products in Redis
  - Browser cache headers configured
  - CDN-friendly response structure
- **Compression**: Gzip compression for all text responses

---

## 🤝 Contributing

### Development Workflow

1. **Feature Specifications** (specs/)

- Write feature spec defining **what** and **why**
- Implementation plan defining **how** (technical design)
- Task list defining **step-by-step** execution

2. **Before Implementation**

- Create tests FIRST (TDD)
- Tests should FAIL initially (red phase)
- User approval on tests before implementation

3. **Implementation**

- Implement minimum code to pass tests (green phase)
- Refactor while keeping tests green
- Ensure code adheres to constitution principles

4. **Code Review Gates**

- Constitution compliance verification
- SOLID principles adherence check
- Test coverage validation (80%+)
- Performance impact assessment
- Security review for user-facing features

### Contribution Guidelines

- Follow the [Constitution](`.specify/memory/constitution.md`) principles
- Maintain SOLID principles and Clean Architecture
- Write tests BEFORE implementation (TDD)
- Keep test coverage above 80% (per module)
- Document public APIs (JSDoc, Python docstrings)
- Follow code style guides (Black, Prettier, Ruff, ESLint)
- Use pre-commit hooks to catch issues early
- Create meaningful commit messages

#### Backend Contribution Guidelines

When adding new backend features:

1. **Follow Clean Architecture pattern**

- Create repository interface in `domain/repositories/`
- Implement in `infrastructure/`
- Use dependency injection in routes

2. **Leverage Generic Use Cases**

- Use `StrapiProxyGetUseCase` for all GET requests
- Use `StrapiProxyMutateUseCase` for POST/PUT/DELETE
- No need to create individual use case classes

3. **Implement Proper Caching**

- Set appropriate TTL based on data stability
- Use cache keys that support invalidation
- Test cache behavior in unit tests

4. **Write Comprehensive Tests**

- Unit tests for use cases and routes
- Mock all external dependencies (Strapi, Redis, PostgreSQL)
- Test both cache hit and miss scenarios
- Test error paths (400, 404, 502)

### Documentation Requirements

- Maintain API contracts in OpenAPI format
- Document data models and entity relationships
- Provide component usage examples
- Include quickstart guides for common scenarios
- In-code documentation (JSDoc, docstrings) with full coverage

---

## 📚 Additional Documentation

### Feature Specifications

- [Feature Specifications](./specs/)
- [Core Platform Setup](./specs/001-core-platform-setup/)
- [Testing Strategy](./specs/003-comprehensive-testing-strategy/)

### Quick References

- [Constitution & Principles](.specify/memory/constitution.md)
- [Testing Quick Start](specs/003-comprehensive-testing-strategy/quickstart.md)

---

## 🛠️ Quick Commands Reference

### Development

```bash
make help                      # Show all available commands
make setup                     # Complete first-time setup (tools + dependencies + hooks)
make dev                       # Start all services (Docker + Frontend + CMS)
make start                     # Start only Docker services
make stop                      # Stop Docker services
make restart                   # Restart Docker services
make logs                      # View all service logs
make logs-backend              # View backend logs only
```

### Testing

```bash
make test              # All tests with coverage
make test-parallel     # Tests in parallel (faster)
make test-backend      # Backend tests only
make test-frontend     # Frontend tests only
make test-cms          # CMS tests only
```

### Code Quality

```bash
make lint              # Check all code style
make lint-fix          # Auto-fix linting issues
make format            # Format all code
make format-check      # Check formatting without changes
```

### Utilities

```bash
make ps                # Show running containers
make health            # Check backend health
make clean             # Clean up everything
make build             # Build for production
```

---

## 🔧 Troubleshooting

### macOS (Colima)

**Issue**: Colima not starting

```bash
colima status         # Check status
colima stop           # Stop
colima start          # Start
docker ps             # Verify Docker connection
```

### Port Conflicts

**Issue**: Port already in use (5432, 6379, 8000, 3000, 1337)

```bash
lsof -i :5432         # Find process using port
kill -9 <PID>         # Kill process
# OR change port in docker-compose.yaml
```

### Database Connection Issues

**Issue**: Backend can't connect to PostgreSQL

```bash
docker compose ps     # Check container status
docker compose logs postgres  # View PostgreSQL logs
```

### Strapi Won't Start

```bash
docker-compose logs strapi
docker-compose down
docker volume rm affilibuster_strapi_uploads
docker-compose up strapi
```

### Permission Issues

```bash
chmod +x scripts/*.sh
```

### Backend-Specific Issues

**ImportError: cannot import name 'X' from 'infrastructure.api.models'**

**Cause**: Model not in OpenAPI spec or auto-generated models
**Solution**: Define custom model in route file or add to spec

**502 Bad Gateway**

**Cause**: Strapi is unreachable
**Solution**: Check STRAPI_URL and STRAPI_API_TOKEN in .env, verify Strapi is running

**Cache Not Working**

**Cause**: Redis connection failed
**Solution**: Check REDIS_URL, verify Redis is running

**Type Errors from Mypy**

**Solution**: Add type guards or use `.get()` method instead of direct indexing

---

## 🔗 Links

- [Backend API Documentation](http://localhost:8000/docs)
- [Backend Repository](./backend)
- [Frontend Repository](./frontend)
- [CMS Repository](./cms)
- [Feature Specifications](./specs/)
- [Constitution & Principles](.specify/memory/constitution.md)

---

<div align="center">

Made with ❤️ by the Affilibuster Team

</div>
