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
  15%, CMS 60%)
- **🔐 Secure**: Affiliate link generation, GDPR compliance, secure credential management
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS
- **🎨 Headless CMS**: Strapi integration with full content management capabilities

---

## 🚀 Quick Start

### Prerequisites

Install Docker for your platform:

- **macOS**: Docker Desktop or `brew install colima docker docker-compose docker-buildx`
- **Linux**: `curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh`
- **Windows**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop)

### One-Command Setup ⚡

```bash
# Clone and setup
git clone https://github.com/rdrkr/affilibuster.git
cd affilibuster

# Complete first-time setup (installs tools, dependencies, and hooks)
make setup

# Start all services
make dev
```

**⏱️ Wait ~30 seconds** for all services to be ready.

### Access Your Applications

| Service           | URL                         | Notes                      |
|-------------------|-----------------------------|----------------------------|
| **Frontend**      | http://localhost:3000       | Next.js (English, default) |
| **Frontend (IT)** | http://localhost:3000/it    | Italian locale             |
| **Frontend (HE)** | http://localhost:3000/he    | Hebrew locale (RTL)        |
| **Backend API**   | http://localhost:8000       | FastAPI REST API           |
| **API Docs**      | http://localhost:8000/docs  | Swagger UI                 |
| **CMS Admin**     | http://localhost:1337/admin | Strapi admin panel         |

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
│   └── tests/                         # Test files (component, e2e, performance)
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

---

## 🧪 Testing

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

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

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

<div align="center">

Made with ❤️ by the Affilibuster Team

</div>
