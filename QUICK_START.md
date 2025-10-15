# Quick Start Guide

**Status**: ✅ Implementation Complete - Ready for Validation
**Feature**: Core Platform Setup & Multi-Language Infrastructure

---

## Prerequisites Check

Run the validation script to ensure all prerequisites are met:

```bash
./scripts/validate-setup.sh
```

Required:
- ✅ Node.js 18+
- ✅ Python 3.11+
- ✅ PostgreSQL 15+
- ✅ Redis
- ✅ Git

---

## Installation (First Time Setup)

### 1. Install Dependencies

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Frontend
cd frontend
npm install
cd ..

# CMS
cd cms
npm install
cd ..
```

### 2. Configure Environment Variables

Copy the example files and update as needed:

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database and Redis URLs

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with API URL

# CMS
cp cms/.env.example cms/.env
# Edit cms/.env with database credentials
```

### 3. Setup Databases

```bash
# Create PostgreSQL databases
createdb affilibuster
createdb affilibuster_cms

# Run migrations
cd backend
alembic upgrade head

# Seed initial data (languages, currencies, locales)
python scripts/seed.py
cd ..
```

---

## Starting the Application

### Option 1: Docker Compose (Recommended)

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 8000)
- Frontend (port 3000)
- CMS (port 1337)

### Option 2: Manual Start

Open 3-5 terminal windows:

```bash
# Terminal 1: Backend API
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
poetry run uvicorn src.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: CMS
cd cms
npm run develop

# Terminal 4: Redis (if not in Docker)
redis-server

# Terminal 5: PostgreSQL (if not in Docker)
# Usually already running as a service
```

---

## Verify Installation

### 1. Check Services

Open these URLs in your browser:

- **Frontend**: http://localhost:3000
  - Should show language selection prompt (if browser is non-English)

- **Backend API Docs**: http://localhost:8000/docs
  - Should show Swagger UI with all 8 endpoints

- **CMS Admin**: http://localhost:1337/admin
  - Create admin account on first visit

### 2. Test API Endpoints

```bash
# Get languages
curl http://localhost:8000/v1/languages | jq

# Expected: Array with 3 languages [en, it, he]

# Detect language (Italian)
curl -X POST http://localhost:8000/v1/languages/detect \
  -H "Content-Type: application/json" \
  -d '{"acceptLanguage": "it-IT,it;q=0.9"}' | jq

# Expected: {"detectedLanguage": "it", "confidence": 0.9, "shouldPrompt": true}

# Get currencies
curl http://localhost:8000/v1/currencies | jq

# Expected: Array with 8 currencies
```

### 3. Test Frontend

1. **Language Detection**:
   - Set browser language to Italian
   - Open http://localhost:3000
   - Verify language prompt appears in Italian
   - Click "Sì" to switch to Italian version

2. **Language Switcher**:
   - Click language selector in navigation
   - Verify 3 languages shown: English, Italiano, עברית
   - Switch to Hebrew
   - Verify RTL layout (text right-aligned)

3. **Currency Selection**:
   - Open currency selector
   - Select EUR
   - Verify prices update to Euro format
   - Switch to Hebrew language
   - Verify currency persists (still EUR)

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=src --cov-report=html

# Run specific test suites
poetry run pytest tests/contract/      # Contract tests
poetry run pytest tests/integration/   # Integration tests
poetry run pytest tests/unit/          # Unit tests

# Run tests matching a pattern
poetry run pytest -k "test_language"
```

### Frontend Tests

```bash
cd frontend

# Component tests (Jest)
npm run test

# E2E tests (Playwright) - requires services running
npx playwright test

# Run specific test file
npx playwright test tests/e2e/language-detection.spec.ts
```

---

## Manual Validation Tests

Follow the complete test scenarios in:
**`specs/001-core-platform-setup/quickstart.md`**

Quick summary:

1. **Test 1**: Language Detection & Prompt
   - Set browser to Italian → Verify prompt appears

2. **Test 2**: Manual Language Switching
   - Switch between en/it/he → Verify URLs and layout change

3. **Test 3**: Currency Selection & Persistence
   - Select EUR → Verify prices update → Switch language → Verify EUR persists

4. **Test 4**: SEO Meta Tags & hreflang
   - View page source → Verify hreflang tags, canonical URL, schema markup

5. **Test 5**: URL Redirects (301 & 410)
   - Change slug in CMS → Verify 301 redirect
   - Delete content → Verify 410 Gone page

6. **Test 6**: Content Fallback to English
   - Create English-only content → Access in Italian → Verify fallback notice

---

## Performance Testing

### Lighthouse Audits

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Audit all language versions
lighthouse http://localhost:3000 --view
lighthouse http://localhost:3000/it --view
lighthouse http://localhost:3000/il --view
```

**Target Scores (all >90)**:
- Performance
- Accessibility
- Best Practices
- SEO

### Web Vitals

Check in Chrome DevTools:
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Run "Performance" audit
4. Verify:
   - LCP <2.5s
   - FCP <1.8s
   - CLS <0.1
   - TTFB <600ms

---

## Common Issues & Fixes

### Issue: "Port already in use"

```bash
# Find and kill process using port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn src.main:app --port 8001
```

### Issue: "Redis connection failed"

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Start Redis if not running
redis-server
```

### Issue: "Database connection failed"

```bash
# Check if PostgreSQL is running
pg_isready
# Should return: accepting connections

# Check if databases exist
psql -l | grep affilibuster
```

### Issue: "Language prompt not showing"

- Browser language must be non-English (it or he)
- Clear browser cache and cookies
- Check session storage for `dismissedLanguagePrompt`
- Must visit root URL (http://localhost:3000), not language-specific URL

### Issue: "RTL not working for Hebrew"

- Check HTML source for `dir="rtl"` attribute
- Verify Tailwind RTL plugin installed: `npm ls tailwindcss-rtl`
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

---

## Project Structure Overview

```
affilibuster/
├── backend/          # FastAPI REST API
│   ├── src/
│   │   ├── domain/          # Entities, Use Cases, Repositories
│   │   └── infrastructure/  # API Routes, DB Models, Cache, CMS
│   └── tests/               # Contract, Integration, Unit tests
├── frontend/         # Next.js 14 App Router
│   ├── src/
│   │   ├── app/[lang]/      # Language-based routing
│   │   ├── components/      # React components
│   │   └── lib/             # API clients, utils
│   └── messages/            # Translation files (en, it, he)
├── cms/              # Strapi CMS
│   └── src/api/             # Product, Page content types
├── shared/           # Shared TypeScript types
└── specs/            # Design docs, contracts, tasks
```

---

## Next Steps

1. ✅ **Verify Installation**: Run `./scripts/validate-setup.sh`
2. ✅ **Start Services**: Use Docker Compose or manual start
3. ⏳ **Run Manual Tests**: Follow quickstart.md validation tests
4. ⏳ **Run Lighthouse Audits**: Verify >90 scores for all languages
5. ⏳ **Create Sample Content**: Add products/pages in Strapi CMS
6. ⏳ **Deploy to Production**: Push to Vercel (frontend) and production servers

---

## Useful Commands

```bash
# Validation
./scripts/validate-setup.sh          # Check all prerequisites

# Backend
cd backend
alembic upgrade head                 # Run migrations
alembic downgrade -1                 # Rollback one migration
python scripts/seed.py               # Seed database
poetry run pytest                    # Run all tests
poetry run uvicorn src.main:app --reload  # Start dev server

# Frontend
cd frontend
npm run dev                          # Start dev server
npm run build                        # Build for production
npm run start                        # Start production server
npm run test                         # Run component tests
npx playwright test                  # Run E2E tests

# CMS
cd cms
npm run develop                      # Start dev server
npm run build                        # Build admin panel
npm run start                        # Start production server

# Docker
docker-compose up -d                 # Start all services
docker-compose down                  # Stop all services
docker-compose logs -f backend       # View backend logs
```

---

## Documentation Links

- **Implementation Plan**: `specs/001-core-platform-setup/plan.md`
- **Data Model**: `specs/001-core-platform-setup/data-model.md`
- **API Contract**: `specs/001-core-platform-setup/contracts/api-v1.yaml`
- **Technical Decisions**: `specs/001-core-platform-setup/research.md`
- **Validation Tests**: `specs/001-core-platform-setup/quickstart.md`
- **Task List**: `specs/001-core-platform-setup/tasks.md`
- **Implementation Report**: `IMPLEMENTATION_REPORT.md`

---

## Support

For issues or questions:
1. Check `specs/001-core-platform-setup/quickstart.md` for troubleshooting
2. Review `IMPLEMENTATION_REPORT.md` for feature status
3. Check backend logs: `docker-compose logs -f backend`
4. Check frontend logs: `docker-compose logs -f frontend`

---

**Last Updated**: 2025-10-11
**Status**: ✅ Ready for Validation
