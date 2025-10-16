<!-- Copyright (c) 2025 Affilibuster by Ronen Druker. -->

# Affilibuster - Affiliate Platform

A modern, multi-language affiliate platform built with Next.js, FastAPI, and Strapi.

## 🌍 Features

- **Multi-Language Support**: English, Italian, and Hebrew with automatic RTL layout
- **Dynamic Currency**: Support for multiple currencies with user preferences
- **SEO Optimized**: Comprehensive hreflang tags, schema markup, and sitemaps
- **Performance**: SSG/ISR with <3s load times and Lighthouse scores >90
- **Clean Architecture**: Domain-driven design with clear separation of concerns

## 🏗️ Architecture

### Monorepo Structure

```
affilibuster/
├── backend/          # FastAPI backend (Python 3.11+)
├── frontend/         # Next.js 14 frontend (TypeScript)
├── cms/              # Strapi headless CMS
├── shared/           # Shared types and contracts
├── specs/            # Feature specifications and design docs
└── docker-compose.yml # Local development environment
```

### Tech Stack

#### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS with RTL support
- **i18n**: next-intl
- **Testing**: Jest, React Testing Library, Playwright

#### Backend

- **Framework**: FastAPI 0.104+
- **Language**: Python 3.11+
- **Database**: PostgreSQL 15+ (via SQLAlchemy)
- **Cache**: Redis
- **Testing**: pytest, httpx

#### CMS

- **Platform**: Strapi 4.x
- **Database**: PostgreSQL
- **Plugins**: i18n for multi-language content

## 🚀 Quick Start

### Prerequisites

#### macOS

```bash
# Install Docker Desktop (Option 1)
# Download from: https://www.docker.com/products/docker-desktop

# OR Install Colima + Docker CLI (Option 2 - lighter alternative)
brew install colima docker docker-compose docker-buildx
colima start
```

#### Linux

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt-get install docker-compose-plugin
```

#### Windows

```bash
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop
```

### One-Command Startup ⚡

Start **everything** (Docker + Backend + Frontend + CMS) with one command:

```bash
make dev
```

This single command:

- ✅ Checks Docker is running
- ✅ Starts PostgreSQL + Redis + Backend + Strapi (Docker)
- ✅ Auto-installs frontend dependencies (if needed)
- ✅ Starts Next.js frontend
- ✅ Shows all service logs in one place
- ✅ Handles cleanup on Ctrl+C

**Wait ~30 seconds** for all services to be ready.

### Access Your Applications

| Service         | URL                                                 |
|-----------------|-----------------------------------------------------|
| **Frontend**    | http://localhost:3000                               |
| **Backend API** | http://localhost:8000                               |
| **API Docs**    | http://localhost:8000/docs                          |
| **CMS Admin**   | http://localhost:1337/admin (takes ~60s first time) |

### Stopping Services

Press **Ctrl+C** in the terminal or run `make stop`

### Development Setup with Docker (Step by Step)

1. **Clone the repository**
   ```bash
   git clone https://github.com/rdrkr/affilibuster.git
   cd affilibuster
   ```

2. **Start Docker services only**
   ```bash
   # Using Make
   make start

   # Or using docker-compose
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - Backend API (port 8000)

3. **Verify services are running**
   ```bash
   docker-compose ps
   # Or
   make ps
   ```

   All services should show "healthy" status.

4. **View logs** (optional)
   ```bash
   # All services
   make logs

   # Backend only
   make logs-backend

   # Or with docker-compose
   docker-compose logs -f backend
   ```

5. **Access the applications**
   - Backend API: http://localhost:8000
   - Backend API Docs: http://localhost:8000/docs
   - Health check: http://localhost:8000/health (or `make health`)

### Frontend & CMS Setup (Separate)

The frontend and CMS are not included in Docker Compose and run separately:

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Access at: http://localhost:3000

#### CMS

```bash
cd cms
npm install
cp .env.example .env
npm run develop
```

Access at: http://localhost:1337/admin

### Local Development (without Docker)

If you prefer to run services locally without Docker:

#### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your PostgreSQL and Redis credentials

# Run migrations (once models are created)
alembic upgrade head

# Start server
uvicorn src.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

#### CMS

```bash
cd cms
npm install
cp .env.example .env
npm run develop
```

## 📚 Documentation

### Component Documentation

- [Backend Documentation](./backend/README.md) - FastAPI backend API
- [Frontend Documentation](./frontend/README.md) - Next.js frontend
- [CMS Documentation](./cms/README.md) - Strapi headless CMS

### Feature Specifications

- [Feature Specification](./specs/001-core-platform-setup/spec.md)
- [Implementation Plan](./specs/001-core-platform-setup/plan.md)
- [Data Model](./specs/001-core-platform-setup/data-model.md)
- [Research & Decisions](./specs/001-core-platform-setup/research.md)
- [Task List](./specs/001-core-platform-setup/tasks.md)

## 🌐 Supported Languages

- 🇬🇧 English (default, root domain)
- 🇮🇹 Italian (`/it`)
- 🇮🇱 Hebrew (`/il` with RTL layout)

## 💱 Supported Currencies

- USD, EUR, ILS, GBP, CAD, AUD, JPY, CNY

## 🛠️ Quick Commands

The project includes a Makefile with convenient commands:

```bash
# Get help (list all commands)
make help

# Development
make dev               # Start all services (Docker + Frontend + CMS)
make start             # Start only Docker services
make stop              # Stop Docker services
make restart           # Restart Docker services

# View logs
make logs              # All services
make logs-backend      # Backend only

# Testing
make test              # All backend tests with coverage
                       # Status: 79/80 passing (98.75%)
                       # Coverage report: backend/htmlcov/index.html

# Utilities
make ps                # Show running containers
make health            # Check backend health
make clean             # Clean up everything
```

## 🧪 Testing

Comprehensive testing infrastructure with 80% coverage requirements across all modules.

### Quick Commands

```bash
# Run all tests (sequential)
make test

# Run all tests in parallel (faster)
make test-parallel

# Run tests + merge coverage
make test-all

# Individual modules
make test-backend          # Backend (pytest)
make test-backend-fast     # Backend unit tests only
make test-frontend         # Frontend (Jest)
make test-shared           # Type tests (tsd)
make test-cms              # CMS (when custom code added)

# Coverage
make coverage-merge        # Merge all module reports
make coverage-view         # Open merged HTML report
make clean-coverage        # Clean all coverage files
```

### Test Categories (Backend)

```bash
# Filter by category using pytest markers
docker-compose exec backend pytest -m "unit"           # Unit tests only
docker-compose exec backend pytest -m "integration"    # Integration tests
docker-compose exec backend pytest -m "contract"       # API contract tests
docker-compose exec backend pytest -m "not slow"       # Skip slow tests
```

### Coverage Requirements

- **Backend**: 80% (pytest + coverage.py)
- **Frontend**: 80% (Jest)
- **Shared**: 95% type coverage (tsd + type-coverage)
- **CMS**: 60% (lower due to Strapi framework boilerplate)

### Error Handling

⚠️ **Important**: `make test` will **FAIL** (exit code ≠ 0) if:

- Any test fails
- Coverage falls below the required thresholds
- Any module encounters errors

The test suite runs **all modules** even when failures occur, allowing you to see all errors at once. The final exit
code indicates whether all tests passed.

```bash
# Example: Tests fail due to low coverage
make test
# Output: ❌ Tests failed with errors or coverage below threshold
# Exit code: 2 (non-zero = failure)

# Use in CI/CD pipelines
make test && echo "Deploy" || echo "Build failed"
```

### Documentation

📖 **Full Testing Guide
**: [specs/003-comprehensive-testing-strategy/quickstart.md](specs/003-comprehensive-testing-strategy/quickstart.md)

Covers:

- Test infrastructure setup
- Running tests locally and in CI
- Writing new tests
- Coverage reporting and merging
- Troubleshooting

### Component-Specific Guides

- [Backend Testing](./backend/README.md#testing)
- [Frontend Testing](./frontend/README.md#testing)
- [CMS Testing](./cms/README.md#testing-strategy)

## 📦 Building for Production

### Frontend

```bash
cd frontend
npm run build
npm start
```

### Backend

```bash
cd backend
# Production deployment typically uses Docker or serverless platforms
```

## 🔧 Development Tools

- **Linting**: ESLint (frontend), Ruff (backend)
- **Formatting**: Prettier (frontend), Black (backend)
- **Type Checking**: TypeScript (frontend), MyPy (backend)
- **API Documentation**: OpenAPI/Swagger (auto-generated)

## 📈 Performance Targets

- Page load <3s on 3G
- Lighthouse scores >90
- LCP <2.5s, FCP <1.8s
- TTFB <600ms

## 🔍 Troubleshooting

### macOS Specific (Colima)

**Issue**: Colima not starting

```bash
# Check status
colima status

# Restart
colima stop
colima start

# Check Docker connection
docker ps
```

**Issue**: Volume mounting issues with Colima

```bash
# Ensure your project is in your home directory or add volume mount
colima start --mount /path/to/project:w
```

### Port Conflicts

**Issue**: Port already in use (5432, 6379, 8000, 3000, 1337)

```bash
# Find process using port
lsof -i :5432  # or any other port

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Connection Issues

**Issue**: Backend can't connect to PostgreSQL

- **Solution**: Ensure PostgreSQL container is healthy:
  ```bash
  docker compose ps
  docker compose logs postgres
  ```

### Permission Issues

**Issue**: Permission denied on scripts

```bash
chmod +x scripts/init-db.sh
```

## 🤝 Contributing

This project follows Clean Architecture principles and TDD approach:

1. Design documents first (specs/)
2. Contracts and tests before implementation
3. Domain logic isolated from frameworks
4. Dependency injection for all external services

## 📄 License

[Your License Here]

## 🔗 Links

- [Backend API Documentation](http://localhost:8000/docs)
- [Frontend Repository](./frontend)
- [Backend Repository](./backend)
- [CMS Repository](./cms)

---

Built with ❤️ using Clean Architecture principles
