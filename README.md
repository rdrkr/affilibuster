<!-- Copyright (c) 2025 Affilibuster by Ronen Druker. -->

# Affilibuster - Multi-Language Affiliate Platform

<!--suppress HtmlDeprecatedAttribute -->
<div align="center">

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Python 3.13+](https://img.shields.io/badge/python-3.13%2B-blue)](https://www.python.org/)
[![Node.js 22+](https://img.shields.io/badge/node.js-22%2B-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.7%2B-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/react-19%2B-blue)](https://reactjs.org/)
[![Next.js 16+](https://img.shields.io/badge/next.js-16%2B-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.120%2B-teal)](https://fastapi.tiangolo.com/)
[![Strapi 5+](https://img.shields.io/badge/strapi-5%2B-purple)](https://strapi.io/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15%2B-336791)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)

**A modern, production-ready affiliate platform with multi-language support, performance optimization, and clean
architecture.**

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Development](#-development) • [Testing](#-testing)

</div>

---

## ✨ Features

- **🌍 Multi-Language Support**: English (default), Italian, and Hebrew with automatic RTL layout
- **💱 Dynamic Currency**: Support for multiple currencies (USD, EUR, ILS, GBP, CAD, AUD, JPY, CNY) with user preferences
- **🔍 SEO Optimized**: Comprehensive hreflang tags, schema markup, sitemaps, and breadcrumbs
- **⚡ High Performance**: Static Site Generation (SSG) / Incremental Static Regeneration (ISR) with <3s load times and
  Lighthouse scores >90
- **🏗️ Clean Architecture**: Domain-driven design with clear separation of concerns and SOLID principles
- **🧪 Test-First Development**: Comprehensive testing infrastructure
- **🔐 Secure**: Affiliate link generation, GDPR compliance, secure credential management
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS
- **🎨 Headless CMS**: Strapi integration with full content management capabilities

---

## 🚀 Quick Start

### Prerequisites

#### Required Software

**Docker** - Install for your platform:

- **macOS**: Docker Desktop or `brew install colima docker docker-compose docker-buildx`
- **Linux**: `curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh`
- **Windows**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop)

**mkcert** - For HTTPS development certificates:

- **macOS**: `brew install mkcert`
- **Linux**: `sudo apt install mkcert` or build from [source](https://github.com/FiloSottile/mkcert)
- **Windows**: `choco install mkcert` or download from [releases](https://github.com/FiloSottile/mkcert/releases)

### One-Command Setup ⚡

```bash
# Clone and setup
git clone https://github.com/rdrkr/affilibuster.git
cd affilibuster

# Complete first-time setup (installs tools, dependencies, certificates, and hooks)
make setup

# Start all services
make dev
```

**⏱️ Wait ~30 seconds** for all services to be ready.

### Access Your Applications

| Service           | URL                            | Notes                      |
|-------------------|--------------------------------|----------------------------|
| **Frontend**      | <https://localhost:3000>       | Next.js (English, default) |
| **Frontend (IT)** | <https://localhost:3000/it>    | Italian locale             |
| **Frontend (HE)** | <https://localhost:3000/he>    | Hebrew locale (RTL)        |
| **Backend API**   | <https://localhost:8000>       | FastAPI REST API           |
| **API Docs**      | <https://localhost:8000/docs>  | Swagger UI                 |
| **CMS Admin**     | <https://localhost:1337/admin> | Strapi admin panel         |
| **Test Runner**   | (Internal)                     | Isolated E2E test executor |

**Note**: All services run on HTTPS with mkcert certificates. Your browser should trust them automatically after running
`mkcert -install`.

### Stop Services

```bash
make stop
```

---

## 🏗️ Architecture

### System Design

Affilibuster follows a **single source of truth** architecture where all content originates from Strapi CMS and flows
through the backend to the frontend:

```
Frontend (Next.js 16, React 19, TypeScript)
  ↓ (API calls only)
Backend API (FastAPI, Python 3.13)
  ↓ (syncs from)
Strapi CMS (Headless, PostgreSQL)
```

**Key Rule**: Frontend NEVER talks to Strapi directly. All content flows through the backend API.

### Project Structure

```
affilibuster/                          # Monorepo root
├── backend/                           # FastAPI backend
│   ├── src/affilibuster_backend/
│   │   ├── config/                    # Configuration & settings
│   │   ├── domain/                    # Business logic (Clean Architecture)
│   │   │   ├── entities/              # Domain models
│   │   │   ├── repositories/          # Repository interfaces
│   │   │   └── use_cases/             # Business logic
│   │   ├── infrastructure/            # External integrations
│   │   │   ├── api/                   # FastAPI routes, models, middleware
│   │   │   │   └── routes/            # API endpoints
│   │   │   ├── cache/                 # Redis implementation
│   │   │   ├── cms/                   # Strapi HTTP client
│   │   │   ├── database/              # SQLAlchemy setup & models
│   │   │   │   ├── alembic/           # Database migrations
│   │   │   │   ├── models/            # Database models
│   │   │   │   └── repositories/      # Repository implementations
│   │   │   ├── middleware/            # Custom middleware
│   │   │   └── dependencies.py        # Dependency injection
│   │   └── main.py                    # Application entry point
│   └── tests/
│       ├── fixtures/                  # Test data and helpers
│       ├── integration/               # Integration tests
│       │   └── infrastructure/        # Infrastructure integration tests
│       └── unit/                      # Unit tests
│           ├── config/                # Configuration tests
│           ├── domain/                # Domain layer tests
│           └── infrastructure/        # Infrastructure layer tests
│
├── frontend/                          # Next.js 16 frontend
│   ├── src/
│   │   ├── app/                       # Next.js App Router pages
│   │   │   ├── [lang]/                # Language-specific routes
│   │   │   │   ├── [slug]/            # Dynamic product pages
│   │   │   │   ├── about/             # About page
│   │   │   │   ├── contact/           # Contact page
│   │   │   │   ├── privacy/           # Privacy policy
│   │   │   │   ├── products/          # Products listing
│   │   │   │   └── terms/             # Terms of service
│   │   │   ├── api/                   # API routes (sitemaps)
│   │   │   └── globals.css            # Global styles
│   │   ├── components/                # React components
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── i18n/                      # Internationalization config
│   │   ├── lib/                       # Utilities, API clients, transformers
│   │   ├── styles/                    # CSS modules and themes
│   │   ├── i18n.ts                    # i18n configuration
│   │   └── proxy.ts                   # Development proxy
│   ├── tests/                         # Test files (component, e2e, performance)
│   ├── Dockerfile                     # Frontend dev server container
│   └── Dockerfile.test-runner         # Lightweight Playwright test container
│
├── cms/                               # Strapi 5 headless CMS
│   ├── config/                        # Strapi configuration files
│   ├── src/
│   │   ├── api/                       # Custom content types and APIs
│   │   │   ├── about/                 # About page content
│   │   │   ├── contact/               # Contact page content
│   │   │   ├── currency/              # Currency configuration
│   │   │   ├── footer/                # Footer content
│   │   │   ├── homepage/              # Homepage content
│   │   │   ├── navigation/            # Navigation structure
│   │   │   ├── product/               # Product content type
│   │   │   └── [other content types]  # Additional content types
│   │   ├── components/                # UI component schemas
│   │   ├── index.ts                   # Strapi entry point
│   │   └── seed.ts                    # Database seeding script
│   └── scripts/                       # Build and utility scripts
│
├── contracts/                         # OpenAPI specifications (source of truth)
│   ├── template.openapi.yaml          # Backend API specification
│   ├── strapi.openapi.yaml            # Strapi content types (auto-generated)
│   └── affilibuster.openapi.yaml      # Merged specification (auto-generated)
│
├── specs/                             # Feature specifications & designs
├── scripts/                           # Development & deployment scripts
│   ├── audit.sh                       # Security audit
│   ├── build.sh                       # Build all services
│   ├── clean.sh                       # Clean build artifacts
│   ├── format.sh                      # Format code
│   ├── lint.sh                        # Lint code
│   ├── setup.sh                       # Development setup
│   ├── test.sh                        # Run tests
│   └── upgrade.sh                     # Upgrade dependencies
│
├── .specify/                          # SpecKit project configuration
│   ├── memory/constitution.md         # Project constitution & principles
│   ├── scripts/                       # SpecKit automation scripts
│   └── templates/                     # Documentation templates
│
├── .claude/                           # Claude AI configuration
│   └── commands/                       # Custom AI commands
│
├── data/                              # Static data files
│   └── seed-data.json                 # Initial data for seeding
│
├── docs/                              # Project documentation
│   └── eco-friendly-affiliate-website-prd.md
│
└── docker-compose.yaml                # Local development environment

```

### 🛠️ Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5.7+, Tailwind CSS 4, next-intl
- **Backend**: FastAPI 0.120+, Python 3.13+, PostgreSQL 15+, Redis, Alembic
- **CMS**: Strapi 5+, PostgreSQL 15+, i18n plugin
- **Infrastructure**: Docker & Docker Compose

---

## 🎯 Design Principles

The project follows these core principles documented in [
`.specify/memory/constitution.md`](.specify/memory/constitution.md):

- **Clean Architecture**: Business logic isolated from framework dependencies
- **SOLID Principles**: Single responsibility, open/closed, Liskov substitution, interface segregation, dependency
  inversion
- **Test-First Development**: Tests written before implementation (TDD)
- **API-First Design**: OpenAPI specifications as source of truth
- **Modular Architecture**: Reusable components across affiliate sites
- **Performance & SEO Standards**: <3s load times, Lighthouse scores >90
- **Strong Typing**: Strict type safety with explicit annotations and generated model usage

---

### Clean Architecture Layers

Affilibuster implements **Clean Architecture** with strict dependency rules to ensure business logic remains isolated
from external concerns:

```
┌─────────────────────────────────────────────────────┐
│                Frameworks & Drivers                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Next.js     │  │ FastAPI     │  │ Strapi      │  │
│  │ React       │  │ PostgreSQL  │  │ Redis       │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                 Interface Adapters                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Routes      │  │ Controllers │  │Repositories │  │
│  │ Views       │  │ Presenters  │  │ Gateways    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────┐
│                      Use Cases                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Business    │  │ Application │  │ Domain      │  │
│  │ Rules       │  │ Services    │  │ Logic       │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────┐
│                        Entities                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Product     │  │ User        │  │ Language    │  │
│  │ Currency    │  │ Locale      │  │ Config      │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### Layer Responsibilities

**Entities (Innermost Circle)**

- Core business objects and enterprise-wide business rules
- Pure domain models with no framework dependencies
- Examples: `Product`, `User`, `Language`, `Currency` entities

**Use Cases**

- Application-specific business rules
- Orchestrate data flow between entities and interface adapters
- Contain the application's use case logic

**Interface Adapters**

- Convert data from/to external formats
- Presenters, controllers, repositories, gateways
- Interface between use cases and frameworks
- Examples: FastAPI routes, React components, repository implementations

**Frameworks & Drivers (Outermost Circle)**

- UI frameworks, databases, external APIs
- All technical infrastructure details
- Examples: Next.js, FastAPI, PostgreSQL, Strapi, Redis

#### Dependency Flow

**Critical Rule**: Dependencies point **inward only** - outer layers depend on inner layers, never the reverse:

```
Frameworks → Interface Adapters → Use Cases → Entities
```

This ensures:

- **Business logic isolation** - no framework dependencies in domain layer
- **Testability** - inner layers can be tested independently
- **Flexibility** - frameworks can be replaced without affecting business logic
- **Maintainability** - clear separation of concerns

## 🛠️ Development

### Getting Started

```bash
# Show all available commands
make help

# Complete first-time setup
make setup

# Start all services (Docker + Frontend + CMS)
make dev

# Start only Docker services
make start

# Stop services
make stop

# Restart services
make restart

# View logs
make logs                # All services
make logs-backend        # Backend only

# Check service status
make ps
make health
```

### Development Workflow

1. **Environment Setup**: `make setup` handles all prerequisites
2. **Start Development**: `make dev` starts everything you need
3. **Code Changes**: Edit files in your preferred editor
4. **Testing**: Run `make test` to ensure quality
5. **Code Quality**: Use `make lint` and `make format` to maintain standards
6. **Deployment**: Use `make build` for production builds

### Database Migrations

Affilibuster uses **Alembic** for database schema migrations in the backend.

#### Migration Commands

```bash
# Run migrations (apply pending migrations)
cd backend
uv run task migrate

# Create a new migration (auto-generate from model changes)
uv run task migrate-create "description of changes"

# View migration history
uv run task migrate-history

# Check current migration version
uv run task migrate-current

# Rollback one migration
uv run task migrate-downgrade
```

#### How It Works

- **Models First**: Define your SQLAlchemy models in `backend/src/affilibuster_backend/infrastructure/database/models/`
- **Auto-Generate**: Alembic detects model changes and generates migration files
- **Version Control**: Migration files in `backend/alembic/versions/` are committed to git
- **Docker Integration**: Migrations run automatically on `make dev` via `docker-entrypoint.sh`

#### Configuration

- **Migration Config**: `backend/alembic.ini` (required by Alembic)
- **Task Commands**: Defined in `backend/pyproject.toml` under `[tool.taskipy.tasks]`
- **Database URL**: Loaded from `affilibuster_backend.config.settings` in `alembic/env.py`

#### Important Notes

- **Never delete migrations** - they're part of your schema history
- **Always test migrations** before committing (up and down)
- **Review auto-generated migrations** - Alembic may miss some changes
- **Docker handles migrations** - no manual `migrate` needed when using `make dev`

---

## 🧪 Testing

### Test Philosophy

Affilibuster tests are divided into two distinct categories with different purposes:

#### E2E Tests (Correctness)

- **Purpose**: Verify that features work correctly
- **NO explicit timeouts** - tests use global timeout (5 minutes)
- **NO `waitForTimeout()` calls** - wait for elements/states, not arbitrary time
- **Tests should pass regardless of system load**
- **Focus on "Does it work?" not "Is it fast?"**

#### Performance Tests (Timing)

- **Purpose**: Verify performance requirements are met
- **Production builds only** - skip on development builds
- **Strict timing thresholds** - defined in `tests/config/performance-thresholds.ts`
- **Network throttling** - simulate real-world conditions (3G)
- **Focus on "Is it fast enough?"**

### Test Architecture

Affilibuster uses a **dedicated test-runner container** for all Playwright E2E and performance tests, providing:

- **Lightweight Container**: Uses `Dockerfile.test-runner` - only Playwright dependencies, no Next.js build
- **Resource Isolation**: Tests run in a separate container from the dev server, eliminating resource contention
- **Dedicated Resources**: 4 CPU cores and 4GB RAM allocated specifically for test execution
- **Improved Stability**: Webkit tests no longer timeout due to system load from dev server hot-reload/compilation
- **Better Performance**: Tests can run in parallel without degrading the dev server
- **Persistent Browser Cache**: Playwright browsers are installed once and cached across test runs

**Architecture**:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   test-runner   │────▶│    frontend     │────▶│     backend     │
│ (Playwright)    │     │  (Dev Server)   │     │   (FastAPI)     │
│  4 CPU / 4GB    │     │   1 CPU         │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

Tests execute in `test-runner`, hitting the `frontend` dev server, which calls the `backend` API.

### Quick Commands

```bash
# Run all tests with coverage
make test

# Run tests in parallel (faster)
make test-parallel

# Individual modules
make test-backend          # Backend (pytest)
make test-frontend         # Frontend (Jest)
make test-cms              # CMS (when custom code added)

# E2E tests with specific browser
make test-frontend-integration BROWSER=webkit
make test-frontend-integration BROWSER=chromium
make test-frontend-integration BROWSER=firefox

# Performance tests
make test-performance BROWSER=chromium

# Coverage reports
make coverage-merge        # Merge all module reports
make coverage-view         # Open merged HTML report
```

---

## 🎨 Code Quality

### Quick Commands

```bash
# Check code style
make lint              # Check all code style
make lint-fix          # Auto-fix linting issues

# Format code
make format            # Format all code
make format-check      # Check formatting without changes

# Specific modules
make lint-python            # Check Python code
make lint-typescript        # Check TypeScript/JavaScript
make lint-openapi           # Validate OpenAPI specs
```

### Tools & Standards

- **Python**: Ruff (linter/formatter), MyPy (type checker)
- **TypeScript**: ESLint (linter), Prettier (formatter)
- **OpenAPI**: Redocly (validation)
- **Pre-commit hooks**: Automatically installed with `make setup`

---

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

### Interactive Documentation

- **Swagger UI**: <https://localhost:8000/docs>
- **ReDoc**: <https://localhost:8000/redoc>
- **OpenAPI JSON**: <https://localhost:8000/openapi.json>

### OpenAPI Architecture

Affilibuster uses a **layered OpenAPI architecture** with auto-generated types:

- **Layer 1**: Strapi content schemas (auto-generated)
- **Layer 2**: Backend API contracts (extends Strapi types)
- **Generated Code**: TypeScript and Python models from merged spec

### Key Commands

```bash
# Validate OpenAPI specifications
make lint-openapi

# Regenerate Strapi OpenAPI (when content types change)
cd cms && npm run openapi:generate
```

---

## 🌐 Content Architecture

### Single Source of Truth: Strapi CMS

All user-facing content originates from Strapi CMS, ensuring consistency and scalability.

### Content Types

- **Collection Types**: Products, languages, currencies, locales
- **Single Types**: Navigation, footer, homepage, about, contact, legal pages

### Adding New Languages

1. Update `cms/scripts/seed.ts` with new language seeding
2. Run `make seed` or let it happen automatically on startup
3. **Zero backend code changes required**

---

## ⚡ Performance & SEO

### Performance Targets

- Page load <3s on 3G connections
- Lighthouse scores >90
- LCP <2.5s, FCP <1.8s, TTFB <600ms

### SEO Features

- Comprehensive hreflang tags for multi-language support
- Schema markup (Product, BreadcrumbList, Organization)
- Sitemaps for each language
- Meta tags, OG tags, image optimization
- Critical CSS inlined, pagination instead of infinite scroll

---

## 📚 Acknowledgments

Affilibuster is built on the shoulders of giants. We are deeply grateful to the open-source community and the
maintainers of the following projects:

### Core Frameworks

- **[Next.js](https://nextjs.org/)** ([MIT](https://github.com/vercel/next.js/blob/canary/license.md)) - React framework
  for production
- **[React](https://reactjs.org/)** ([MIT](https://github.com/facebook/react/blob/main/LICENSE)) - JavaScript library
  for building user interfaces
- **[FastAPI](https://fastapi.tiangolo.com/)** ([MIT](https://github.com/tiangolo/fastapi/blob/master/LICENSE)) - Modern
  Python web framework
- **[Strapi](https://strapi.io/)** ([MIT](https://github.com/strapi/strapi/blob/master/LICENSE)) - Headless CMS
- **[Python](https://www.python.org/)** ([PSF](https://docs.python.org/3/license.html)) - Programming language
- **[Node.js](https://nodejs.org/)** ([MIT](https://github.com/nodejs/node/blob/main/LICENSE)) - JavaScript runtime

### Databases & Infrastructure

- **[PostgreSQL](https://www.postgresql.org/)** ([PostgreSQL License](https://www.postgresql.org/about/licence/)) -
  Advanced open-source database
- **[Redis](https://redis.io/)** ([BSD-3-Clause](https://github.com/redis/redis/blob/unstable/COPYING)) - In-memory data
  structure store
- **[Docker](https://www.docker.com/)** ([Apache 2.0](https://github.com/docker/docker/blob/master/LICENSE)) -
  Containerization platform

### Backend Dependencies (Python)

- **[Uvicorn](https://www.uvicorn.org/)** ([BSD-3-Clause](https://github.com/encode/uvicorn/blob/master/LICENSE.md)) -
  ASGI server
- **[SQLAlchemy](https://www.sqlalchemy.org/)** ([MIT](https://github.com/sqlalchemy/sqlalchemy/blob/main/LICENSE)) -
  Python SQL toolkit and ORM
- **[Alembic](https://alembic.sqlalchemy.org/)** ([MIT](https://github.com/sqlalchemy/alembic/blob/main/LICENSE)) -
  Database migration tool
- **[Pydantic](https://pydantic-docs.helpmanual.io/)** ([MIT](https://github.com/pydantic/pydantic/blob/main/LICENSE)) -
  Data validation using Python type annotations
- **[asyncpg](https://github.com/MagicStack/asyncpg)
  ** ([Apache 2.0](https://github.com/MagicStack/asyncpg/blob/master/LICENSE)) - Fast PostgreSQL client library
- **[HTTPX](https://www.python-httpx.org/)** ([BSD-3-Clause](https://github.com/encode/httpx/blob/master/LICENSE.md)) -
  HTTP client for Python
- **[python-jose](https://github.com/mpdavis/python-jose)
  ** ([MIT](https://github.com/mpdavis/python-jose/blob/master/LICENSE)) - JavaScript Object Signing and Encryption (
  JOSE) for Python
- **[Passlib](https://passlib.readthedocs.io/)** ([BSD](https://github.com/glic3rinu/passlib/blob/master/LICENSE)) -
  Password hashing library

### Frontend Dependencies (TypeScript/JavaScript)

- **[TypeScript](https://www.typescriptlang.org/)
  ** ([Apache 2.0](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt)) - Typed superset of JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)
  ** ([MIT](https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE)) - Utility-first CSS framework
- **[next-intl](https://next-intl.dev/)** ([MIT](https://github.com/amannn/next-intl/blob/main/LICENSE)) -
  Internationalization for Next.js
- **[next-seo](https://github.com/garmeeh/next-seo)** ([MIT](https://github.com/garmeeh/next-seo/blob/master/LICENSE)) -
  SEO plugin for Next.js

### Development & Testing Tools

- **[pytest](https://pytest.org/)** ([MIT](https://github.com/pytest-dev/pytest/blob/main/LICENSE)) - Python testing
  framework
- **[Jest](https://jestjs.io/)** ([MIT](https://github.com/jestjs/jest/blob/main/LICENSE)) - JavaScript testing
  framework
- **[Playwright](https://playwright.dev/)** ([Apache 2.0](https://github.com/microsoft/playwright/blob/main/LICENSE)) -
  End-to-end testing framework
- **[Testing Library](https://testing-library.com/)
  ** ([MIT](https://github.com/testing-library/react-testing-library/blob/main/LICENSE)) - Testing utilities for React
- **[Ruff](https://docs.astral.sh/ruff/)** ([MIT](https://github.com/astral-sh/ruff/blob/main/LICENSE)) - Extremely fast
  Python linter and formatter
- **[ESLint](https://eslint.org/)** ([MIT](https://github.com/eslint/eslint/blob/main/LICENSE)) - JavaScript/TypeScript
  linter
- **[Prettier](https://prettier.io/)** ([MIT](https://github.com/prettier/prettier/blob/main/LICENSE)) - Code formatter
- **[MyPy](https://mypy-lang.org/)** ([MIT](https://github.com/python/mypy/blob/master/LICENSE)) - Static type checker
  for Python
- **[uv](https://docs.astral.sh/uv/)** ([MIT/Apache 2.0](https://github.com/astral-sh/uv/blob/main/LICENSE-MIT)) -
  Extremely fast Python package manager
- **[pre-commit](https://pre-commit.com/)** ([MIT](https://github.com/pre-commit/pre-commit/blob/main/LICENSE)) - Git
  hooks framework

### Code Generation & API Tools

- **[@hey-api/openapi-ts](https://heyapi.dev/)** ([MIT](https://github.com/hey-api/openapi-ts/blob/main/LICENSE)) -
  OpenAPI TypeScript code generator
- **[datamodel-code-generator](https://github.com/koxudaxi/datamodel-code-generator)
  ** ([MIT](https://github.com/koxudaxi/datamodel-code-generator/blob/main/LICENSE)) - Pydantic model generator from
  OpenAPI
- **[Redocly CLI](https://redocly.com/)** ([MIT](https://github.com/Redocly/redocly-cli/blob/main/LICENSE)) - OpenAPI
  validation and bundling

### Security & Quality

- **[Gitleaks](https://gitleaks.io/)** ([MIT](https://github.com/gitleaks/gitleaks/blob/master/LICENSE)) - Secrets
  scanning tool
- **[Axe-core](https://www.deque.com/axe/)** ([MPL-2.0](https://github.com/dequelabs/axe-core/blob/develop/LICENSE)) -
  Accessibility testing engine

### GitHub Actions

- **[actions/checkout](https://github.com/actions/checkout)
  ** ([MIT](https://github.com/actions/checkout/blob/main/LICENSE)) - Checkout repository code
- **[actions/setup-python](https://github.com/actions/setup-python)
  ** ([MIT](https://github.com/actions/setup-python/blob/main/LICENSE)) - Set up Python environment
- **[actions/setup-node](https://github.com/actions/setup-node)
  ** ([MIT](https://github.com/actions/setup-node/blob/main/LICENSE)) - Set up Node.js environment
- **[astral-sh/setup-uv](https://github.com/astral-sh/setup-uv)
  ** ([MIT](https://github.com/astral-sh/setup-uv/blob/main/LICENSE)) - Set up uv package manager
- **[docker/setup-buildx-action](https://github.com/docker/setup-buildx-action)
  ** ([Apache 2.0](https://github.com/docker/setup-buildx-action/blob/master/LICENSE)) - Set up Docker Buildx
- **[actions/upload-artifact](https://github.com/actions/upload-artifact)
  ** ([MIT](https://github.com/actions/upload-artifact/blob/main/LICENSE)) - Upload build artifacts
- **[actions/cache](https://github.com/actions/cache)** ([MIT](https://github.com/actions/cache/blob/main/LICENSE)) -
  Cache dependencies

### Additional Libraries

For a complete list of all dependencies, please see:

- Backend: [`backend/pyproject.toml`](backend/pyproject.toml)
- Frontend: [`frontend/package.json`](frontend/package.json)
- CMS: [`cms/package.json`](cms/package.json)

We are grateful to all the maintainers and contributors of these projects. Without their dedication and hard work,
Affilibuster would not be possible. Thank you! 🙏

---

<div align="center">

Made with ❤️ by the Affilibuster Team

</div>
