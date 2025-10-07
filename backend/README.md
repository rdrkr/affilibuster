<!-- Copyright (c) 2025 Affilibuster by Ronen Druker. -->

# Backend - FastAPI

Multi-language affiliate platform backend API.

## Tech Stack

- **Framework**: FastAPI 0.104+
- **Language**: Python 3.11+
- **Database**: PostgreSQL 15+ (via SQLAlchemy)
- **Cache**: Redis
- **Testing**: pytest, httpx

## Structure

```
src/
├── domain/           # Business logic (entities, use cases)
├── infrastructure/   # External integrations (API, database, CMS)
└── config/          # Configuration and settings

tests/
├── contract/        # API contract tests
├── integration/     # Integration tests
└── unit/           # Unit tests
```

## Quick Start

### With Docker (Recommended)

```bash
# From repository root
docker-compose up -d

# View logs
docker-compose logs -f backend

# Access API
curl http://localhost:8000/health
```

### Without Docker

```bash
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

## API Documentation

- Health Check: http://localhost:8000/health
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

## Testing

### With Docker

```bash
# From repository root

# Run all tests
docker-compose exec backend pytest -v

# Run contract tests only
docker-compose exec backend pytest tests/contract/ -v

# Run with coverage
docker-compose exec backend pytest --cov=src --cov-report=term-missing

# Collect tests (verify pytest finds them)
docker-compose exec backend pytest --collect-only

# Run specific test file
docker-compose exec backend pytest tests/contract/test_languages_api.py -v

# Run tests with specific marker
docker-compose exec backend pytest -v -m contract

# Stop on first failure
docker-compose exec backend pytest -x
```

### Without Docker

```bash
# Run all tests
pytest -v

# Run with coverage
pytest --cov=src --cov-report=html

# View coverage report
open htmlcov/index.html  # macOS
```

### Expected Behavior (TDD)

⚠️ **Note**: Currently, all contract tests will **FAIL** with 404 errors because API endpoints haven't been implemented yet. This is correct TDD behavior - tests are written first, implementation follows.
