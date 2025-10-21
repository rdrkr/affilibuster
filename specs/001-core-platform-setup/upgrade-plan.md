# Implementation Plan: Tech Stack Upgrade to Latest Versions

**Branch**: `upgrade/latest-tech-stack`
**Parent Feature**: Core Platform Setup & Multi-Language Infrastructure
**Created**: 2025-10-12
**Status**: Planning Complete

---

## Overview

Upgrade all dependencies, frameworks, and tools to their latest stable versions to ensure:
- Latest security patches
- Improved performance
- Better developer experience
- Modern features and capabilities
- Long-term maintainability

---

## Architecture Decisions

### Decision 1: Incremental Phase-Based Upgrade
**Context**: Multiple breaking changes across frontend, backend, and CMS

**Options Considered**:
1. ❌ **Big Bang**: Upgrade everything at once
2. ✅ **Phased**: Upgrade in logical phases with testing gates
3. ❌ **Selective**: Only upgrade critical dependencies

**Decision**: Phased approach with clear rollback points

**Rationale**:
- Reduces risk of cascading failures
- Allows testing at each stage
- Easier to identify source of issues
- Maintains working system at each checkpoint

### Decision 2: Upgrade to React 19 (Latest)
**Context**: React 19 is now stable with significant improvements

**Options Considered**:
1. ❌ **Stay on 18.3**: Conservative approach
2. ✅ **Upgrade to 19**: Latest with new features
3. ❌ **Wait**: Defer decision

**Decision**: Upgrade to React 19.0.0 and Next.js 15.1.3

**Rationale**:
- React 19 is stable release
- New React Compiler for automatic optimization
- Improved Server Components and Actions
- Better hydration and suspense
- Next.js 15 fully supports React 19
- 53% faster development server (Turbopack stable)
- Future-proof stack

### Decision 3: Python 3.13 (Latest Stable)
**Context**: Python 3.13 released with significant improvements

**Options Considered**:
1. ❌ **Stay on 3.11**: Conservative approach
2. ❌ **Upgrade to 3.12**: Previous stable
3. ✅ **Upgrade to 3.13**: Latest stable

**Decision**: Upgrade to Python 3.13.1

**Rationale**:
- 10-15% performance improvement
- Better error messages
- Security improvements
- Backward compatible with 3.11 code
- Long-term support

### Decision 4: Include Strapi v5 Upgrade
**Context**: Strapi v5 is a major rewrite with significant improvements

**Options Considered**:
1. ❌ **Defer**: Upgrade in separate initiative
2. ✅ **Include**: Do in this phase
3. ❌ **Skip**: Never upgrade

**Decision**: Upgrade to Strapi 5.5.0 in this phase

**Rationale**:
- Complete modernization in single initiative
- New Document Service API is more powerful
- Better performance and developer experience
- TypeScript-first design
- Improved plugin system
- Breaking changes are well-documented
- Will require API client updates but worth the effort

### Decision 5: SQLAlchemy 2.0 (Modern Async)
**Context**: SQLAlchemy 2.0 has better async support and type hints

**Options Considered**:
1. ❌ **Stay on 1.4**: Avoid migration
2. ✅ **Upgrade to 2.0**: Modern patterns

**Decision**: Upgrade to SQLAlchemy 2.0.37

**Rationale**:
- Better async/await support
- Improved type hints
- Performance improvements
- Industry standard
- Required for future FastAPI features

---

## Tech Stack Selection

### Frontend

```json
{
  "next": "^15.1.3",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.7.3",
  "next-intl": "^3.27.2",
  "tailwindcss": "^4.0.0",
  "@tailwindcss/typography": "^0.5.15",
  "tailwindcss-rtl": "^0.9.0",
  "@playwright/test": "^1.49.1",
  "jest": "^29.7.0",
  "@testing-library/react": "^16.1.0",
  "eslint": "^9.18.0",
  "prettier": "^3.4.2",
  "babel-plugin-react-compiler": "^19.0.0"
}
```

**Justification**:
- Next.js 15: Latest with Turbopack, React 19 support
- React 19: Latest with compiler, better performance
- TypeScript 5.7: Latest type system improvements
- Tailwind 4.0: 10x faster engine
- React Compiler: Automatic optimization
- Modern testing tools

### Backend

```toml
[tool.poetry.dependencies]
python = "^3.13"
fastapi = "^0.115.6"
pydantic = "^2.10.5"
sqlalchemy = "^2.0.37"
alembic = "^1.14.0"
uvicorn = {extras = ["standard"], version = "^0.34.0"}
redis = "^5.2.1"
asyncpg = "^0.30.0"
python-jose = {extras = ["cryptography"], version = "^3.3.0"}

[tool.poetry.group.dev.dependencies]
pytest = "^8.3.4"
pytest-asyncio = "^0.24.0"
pytest-cov = "^6.0.0"
httpx = "^0.28.1"
```

**Justification**:
- Python 3.13: Performance and security improvements
- FastAPI 0.115: Latest with Pydantic v2
- SQLAlchemy 2.0: Modern async patterns
- Pydantic v2: 5-10x faster validation

### CMS

```json
{
  "@strapi/strapi": "^5.5.0",
  "@strapi/plugin-users-permissions": "^5.5.0",
  "@strapi/plugin-i18n": "^5.5.0",
  "better-sqlite3": "^11.8.1"
}
```

**Justification**:
- Strapi 5.5: Latest with Document Service API
- TypeScript-first design
- Better performance
- Improved plugin system

### Infrastructure

```yaml
services:
  postgres:
    image: postgres:17-alpine

  redis:
    image: redis:7-alpine

  backend:
    image: python:3.13-slim

  frontend:
    image: node:22-alpine

  cms:
    image: node:22-alpine
    # Strapi 5.5.0 compatible
```

**Justification**:
- PostgreSQL 17: Latest stable with performance improvements
- Redis 7: Modern features and performance
- Node 22 LTS: Long-term support
- Alpine images: Smaller size, faster builds

---

## File Structure Impact

### Files to Modify

#### Frontend
```
frontend/
├── package.json                    # Version bumps
├── package-lock.json              # Regenerate
├── next.config.js                 # Next.js 15 config
├── tsconfig.json                  # TypeScript 5.7 options
├── tailwind.config.js             # Tailwind 4.0 format
├── postcss.config.js              # Tailwind 4.0 PostCSS
├── eslint.config.js               # NEW: Flat config
├── src/middleware.ts              # Verify Next.js 15 compat
├── src/i18n.ts                    # ✅ Already updated
├── src/app/[lang]/layout.tsx      # ✅ Already updated
├── src/app/[lang]/page.tsx        # ✅ Already updated
├── src/app/[lang]/[slug]/page.tsx # ✅ Already updated
└── src/app/[lang]/about/page.tsx  # ✅ Already updated
```

#### Backend
```
backend/
├── pyproject.toml                 # Version bumps
├── poetry.lock                    # Regenerate
├── Dockerfile                     # Python 3.13 image
├── src/domain/entities/           # Pydantic v2 models
├── src/domain/repositories/       # SQLAlchemy 2.0 types
├── src/infrastructure/database/   # SQLAlchemy 2.0 queries
├── src/infrastructure/api/models/ # Pydantic v2 models
└── pytest.ini                     # Pytest 8 config
```

#### Infrastructure
```
.
├── docker-compose.yml             # Update all images
├── Makefile                       # Verify commands work
└── .github/workflows/ci.yml       # Update CI versions
```

---

## Implementation Phases

### Phase 1: Frontend Core Dependencies (Priority 1)

**Goal**: Upgrade Next.js, React 19, TypeScript to latest versions

**Tasks**:

#### 1.1 Update Dependencies
- [ ] Update `package.json` with React 19.0.0
- [ ] Update `package.json` with Next.js 15.1.3
- [ ] Update `package.json` with TypeScript 5.7.3
- [ ] Add `babel-plugin-react-compiler` for React Compiler
- [ ] Regenerate `package-lock.json`
- [ ] Run `npm install`

#### 1.2 React 19 Breaking Changes
- [ ] Update `use()` hook imports (new React 19 hook)
- [ ] Replace `ReactDOM.render` with `createRoot` if any legacy code
- [ ] Update ref forwarding patterns if using old syntax
- [ ] Remove deprecated React APIs (UNSAFE_componentWillMount, etc.)
- [ ] Update Context API usage for new behavior
- [ ] Test Server Components compatibility

#### 1.3 React Compiler Setup
- [ ] Add compiler to Next.js config:
  ```js
  experimental: {
    reactCompiler: true
  }
  ```
- [ ] Create `.eslintrc` for compiler linting
- [ ] Test compiler optimizations work
- [ ] Verify no performance regressions

#### 1.4 Next.js 15 Updates
- [ ] ✅ Verify async params pattern (already done)
- [ ] Update `next.config.js` for v15 options
- [ ] Enable Turbopack: `next dev --turbo`
- [ ] Update middleware for v15 compatibility
- [ ] Test ISR and revalidation behavior
- [ ] Verify image optimization still works

#### 1.5 TypeScript 5.7 Updates
- [ ] Update `tsconfig.json` for new options
- [ ] Fix any new type errors from stricter checking
- [ ] Update type imports to use `type` keyword
- [ ] Test type checking passes: `tsc --noEmit`

#### 1.6 Testing
- [ ] Start dev server: `next dev --turbo`
- [ ] Verify all pages render correctly
- [ ] Run Jest tests: `npm test`
- [ ] Fix any test failures
- [ ] Check for console warnings

**Success Criteria**:
- ✅ Dev server starts with Turbopack
- ✅ React 19 features working
- ✅ All pages render correctly
- ✅ All tests passing
- ✅ TypeScript compiles without errors
- ✅ React Compiler optimizing code

**Estimated Time**: 2 days

### Phase 2: Frontend Styling & Tools (Priority 2)

**Goal**: Upgrade Tailwind CSS v4 and development tools

**Tasks**:

#### 2.1 Tailwind CSS 4.0 Migration
- [ ] Update dependencies:
  ```json
  "tailwindcss": "^4.0.0",
  "@tailwindcss/postcss": "^4.0.0"
  ```
- [ ] Update `postcss.config.js` for v4:
  ```js
  export default {
    plugins: {
      '@tailwindcss/postcss': {}
    }
  }
  ```
- [ ] Convert `tailwind.config.js` to CSS-first config:
  ```css
  @import "tailwindcss";
  @theme {
    /* Config here */
  }
  ```
- [ ] Update RTL plugin for v4 compatibility
- [ ] Remove deprecated v3 syntax from code
- [ ] Test dark mode still works
- [ ] Test responsive breakpoints
- [ ] Verify custom utilities work

#### 2.2 ESLint 9 Flat Config
- [ ] Update `eslint` to 9.18.0
- [ ] Create `eslint.config.js` (flat config):
  ```js
  export default [
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      rules: { /* rules */ }
    }
  ]
  ```
- [ ] Migrate rules from `.eslintrc`
- [ ] Remove old `.eslintrc` file
- [ ] Update VS Code settings for new config
- [ ] Test linting works: `npm run lint`

#### 2.3 Prettier Update
- [ ] Update `prettier` to 3.4.2
- [ ] Update `.prettierrc` if needed
- [ ] Test formatting works: `npm run format`

#### 2.4 Testing Styles
- [ ] Run dev server and check all pages
- [ ] Verify RTL layout for Hebrew (/he)
- [ ] Test dark mode toggle
- [ ] Check responsive design on mobile
- [ ] Verify all Tailwind classes work
- [ ] Run visual regression tests if available

**Success Criteria**:
- ✅ Tailwind 4.0 working (10x faster)
- ✅ All styles render correctly
- ✅ RTL layout functional
- ✅ Dark mode working
- ✅ ESLint 9 passing
- ✅ No console warnings

**Estimated Time**: 1-2 days

### Phase 3: Backend Core Dependencies (Priority 1)

**Goal**: Upgrade Python 3.13, FastAPI, Pydantic v2, SQLAlchemy 2.0

**Tasks**:

#### 3.1 Python 3.13 Upgrade
- [ ] Update `pyproject.toml`: `python = "^3.13"`
- [ ] Update Docker `Dockerfile`: `FROM python:3.13-slim`
- [ ] Update `docker-compose.yml` backend image
- [ ] Rebuild Docker image: `docker-compose build backend`
- [ ] Test Python 3.13 compatibility

#### 3.2 Update Core Dependencies
- [ ] Update `pyproject.toml`:
  ```toml
  fastapi = "^0.115.6"
  pydantic = "^2.10.5"
  sqlalchemy = "^2.0.37"
  alembic = "^1.14.0"
  uvicorn = {extras = ["standard"], version = "^0.34.0"}
  ```
- [ ] Run `poetry lock`
- [ ] Run `poetry install`

#### 3.3 Pydantic v1 → v2 Migration
- [ ] Install migration tool: `pip install bump-pydantic`
- [ ] Run migration: `bump-pydantic src/`
- [ ] Update all model `Config` classes:
  ```python
  # BEFORE (v1)
  class Config:
      orm_mode = True

  # AFTER (v2)
  model_config = ConfigDict(from_attributes=True)
  ```
- [ ] Update validators to v2 syntax:
  ```python
  # BEFORE (v1)
  @validator('field')
  def validate_field(cls, v):
      return v

  # AFTER (v2)
  @field_validator('field')
  @classmethod
  def validate_field(cls, v):
      return v
  ```
- [ ] Update root validators
- [ ] Update custom validators
- [ ] Update serialization aliases
- [ ] Test all API models in `src/infrastructure/api/models/`
- [ ] Test all domain entities in `src/domain/entities/`

#### 3.4 SQLAlchemy 1.4 → 2.0 Migration
- [ ] Update all query patterns to 2.0 style:
  ```python
  # BEFORE (1.4)
  session.query(User).filter(User.name == 'John')

  # AFTER (2.0)
  from sqlalchemy import select
  session.execute(select(User).where(User.name == 'John'))
  ```
- [ ] Update async session handling
- [ ] Replace `Query` objects with `select()`
- [ ] Update relationship loading (selectinload, joinedload)
- [ ] Update all repository implementations in `src/infrastructure/database/repositories/`
- [ ] Test all database models in `src/infrastructure/database/models/`
- [ ] Update type hints for better inference

#### 3.5 FastAPI Updates
- [ ] Verify Pydantic v2 integration
- [ ] Test all endpoints still work
- [ ] Verify OpenAPI docs generation
- [ ] Test request/response validation
- [ ] Update dependency injection if needed

#### 3.6 Alembic Migration Updates
- [ ] Verify Alembic 1.14 with SQLAlchemy 2.0
- [ ] Test migrations run: `alembic upgrade head`
- [ ] Test migration generation: `alembic revision --autogenerate`
- [ ] Verify no issues with existing migrations

#### 3.7 Testing
- [ ] Run full test suite: `pytest -v`
- [ ] Fix failing tests
- [ ] Verify 136 tests passing
- [ ] Check test coverage maintained
- [ ] Test API contracts: `pytest tests/contract/ -v`
- [ ] Test integration: `pytest tests/integration/ -v`

**Success Criteria**:
- ✅ Python 3.13 working
- ✅ Backend starts successfully
- ✅ All API endpoints work
- ✅ Pydantic v2 models working
- ✅ SQLAlchemy 2.0 queries working
- ✅ All 136 tests passing
- ✅ OpenAPI docs generate correctly
- ✅ No performance regressions

**Estimated Time**: 3-4 days

### Phase 4: CMS Upgrade - Strapi v5 (Priority 1)

**Goal**: Upgrade Strapi from v4 to v5 with Document Service API

**Tasks**:

#### 4.1 Backup and Preparation
- [ ] Backup Strapi database
- [ ] Export all content
- [ ] Document current API endpoints
- [ ] List all custom plugins
- [ ] Review Strapi v5 breaking changes

#### 4.2 Update Strapi Dependencies
- [ ] Update `cms/package.json`:
  ```json
  "@strapi/strapi": "^5.5.0",
  "@strapi/plugin-users-permissions": "^5.5.0",
  "@strapi/plugin-i18n": "^5.5.0"
  ```
- [ ] Update Node.js to 22 LTS if needed
- [ ] Run `npm install` in cms directory
- [ ] Resolve any dependency conflicts

#### 4.3 Migrate to Document Service API
- [ ] Update all `strapi.entityService` calls to `strapi.documents`:
  ```js
  // BEFORE (v4 Entity Service)
  await strapi.entityService.findMany('api::product.product')

  // AFTER (v5 Document Service)
  await strapi.documents('api::product.product').findMany()
  ```
- [ ] Update create operations
- [ ] Update update operations
- [ ] Update delete operations
- [ ] Update findOne operations
- [ ] Update findMany with filters

#### 4.4 Update Content Types
- [ ] Review all content type schemas
- [ ] Update for v5 syntax changes
- [ ] Update relationship definitions
- [ ] Update component definitions
- [ ] Test content type creation

#### 4.5 Update i18n Plugin
- [ ] Verify i18n plugin v5 compatibility
- [ ] Update locale configurations
- [ ] Test multi-language content
- [ ] Verify locale switching
- [ ] Test content translations

#### 4.6 Update Custom API Routes
- [ ] Update all custom controllers
- [ ] Update all custom services
- [ ] Update middleware if any
- [ ] Update lifecycle hooks
- [ ] Test custom endpoints

#### 4.7 Frontend API Client Updates
- [ ] Update `frontend/src/lib/api/cms.ts` for v5 API changes
- [ ] Update content fetching logic
- [ ] Update error handling
- [ ] Test frontend CMS integration
- [ ] Verify ISR still works

#### 4.8 Testing
- [ ] Start Strapi: `npm run develop`
- [ ] Test admin panel access
- [ ] Test content creation
- [ ] Test content editing
- [ ] Test content deletion
- [ ] Test API endpoints
- [ ] Test webhooks for ISR
- [ ] Verify frontend fetches content correctly

**Success Criteria**:
- ✅ Strapi v5 starts successfully
- ✅ Admin panel accessible
- ✅ All content types working
- ✅ Document Service API functional
- ✅ i18n plugin working
- ✅ Frontend fetches content correctly
- ✅ ISR webhooks working
- ✅ No data loss

**Estimated Time**: 3-4 days

### Phase 5: Infrastructure Updates (Priority 2)

**Goal**: Update Docker images and infrastructure

**Tasks**:

#### 5.1 Update Docker Images
- [ ] Update `docker-compose.yml`:
  ```yaml
  postgres:
    image: postgres:17-alpine
  redis:
    image: redis:7-alpine
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
  cms:
    build:
      context: ./cms
      dockerfile: Dockerfile
  ```
- [ ] Update all Dockerfiles
- [ ] Test images build: `docker-compose build`

#### 5.2 Update CI/CD
- [ ] Update `.github/workflows/ci.yml` Node version to 22
- [ ] Update Python version to 3.13
- [ ] Update PostgreSQL service to 17
- [ ] Test CI pipeline runs
- [ ] Fix any CI failures

#### 5.3 Testing
- [ ] Stop all containers: `docker-compose down`
- [ ] Rebuild all: `docker-compose build`
- [ ] Start all: `docker-compose up`
- [ ] Verify all services start correctly
- [ ] Test service communication
- [ ] Test database connections
- [ ] Test Redis connections

**Success Criteria**:
- ✅ All containers start
- ✅ Services communicate correctly
- ✅ CI/CD pipeline passes
- ✅ Deployment works
- ✅ PostgreSQL 17 working
- ✅ Redis 7 working

**Estimated Time**: 1 day

### Phase 6: Testing & Validation (Priority 1)

**Goal**: Comprehensive testing of upgraded stack

**Tasks**:
1. Run full backend test suite
2. Run full frontend test suite
3. Run E2E tests with Playwright
4. Run performance tests
5. Run accessibility tests
6. Execute manual validation checklist
7. Run Lighthouse audits
8. Load testing
9. Security scan

**Success Criteria**:
- ✅ 179/179 tasks tests passing
- ✅ E2E tests passing
- ✅ Performance maintained or improved
- ✅ Lighthouse score >90
- ✅ WCAG 2.1 AA compliance maintained
- ✅ No security vulnerabilities

**Estimated Time**: 2 days

---

## Testing Strategy

### Unit Tests
```bash
# Backend
cd backend && pytest -v

# Frontend
cd frontend && npm run test
```

**Expected**: All tests passing (136 backend + component tests)

### Integration Tests
```bash
cd backend && pytest tests/integration/ -v
```

**Expected**: All integration tests passing

### E2E Tests
```bash
cd frontend && npx playwright test
```

**Expected**: All Playwright tests passing

### Performance Tests
```bash
cd backend && pytest tests/performance/ -v
cd frontend && npx playwright test tests/performance/
```

**Expected**: Performance within acceptable thresholds

### Manual Validation
```bash
./scripts/manual-validation.sh
```

**Expected**: All 6 manual tests passing

---

## Rollback Strategy

### If Phase 1 Fails
1. Revert `package.json` changes
2. Run `npm install`
3. Verify old version works
4. Document failure reason

### If Phase 3 Fails
1. Revert `pyproject.toml` changes
2. Run `poetry install`
3. Restore database snapshot if needed
4. Verify old version works
5. Document failure reason

### If Production Issues
1. Activate previous Docker images
2. Rollback database migrations
3. Verify services functional
4. Post-mortem analysis

---

## Constitutional Compliance

### I. Clean Architecture ✅
- Upgrade maintains separation of concerns
- No business logic changes
- Dependency directions preserved
- Framework changes isolated to infrastructure layer

### II. SOLID Principles ✅
- No changes to class responsibilities
- Interface contracts unchanged
- Existing abstractions maintained
- Dependencies remain on abstractions

### III. Test-First Development ✅
- All existing tests must pass
- No new features being added
- Regression testing mandatory
- Test coverage maintained at 56%+

### IV. Modular & Reusable Architecture ✅
- Component boundaries unchanged
- Reusability maintained
- Configuration patterns preserved
- No coupling introduced

### V. Integration Testing Priority ✅
- Integration tests must pass
- API contracts verified
- Service communication tested
- End-to-end flows validated

### VI. API-First Design ✅
- API contracts unchanged
- OpenAPI spec validated
- Endpoint compatibility verified
- Version strategy maintained

### VII. Performance & SEO Standards ✅
- Performance tested and validated
- SEO metadata unchanged
- Lighthouse audits required
- Image optimization preserved
- Caching strategy maintained

---

## Risk Mitigation

### High Risk: Breaking Changes

**Risk**: Pydantic v2 and SQLAlchemy 2.0 have breaking API changes

**Mitigation**:
1. Use official migration tools
2. Comprehensive testing at each step
3. Maintain test coverage
4. Rollback plan ready
5. Staged deployment

### Medium Risk: Performance Regression

**Risk**: New versions might perform worse

**Mitigation**:
1. Performance benchmarks before/after
2. Load testing
3. Monitoring in staging
4. Gradual traffic shift

### Low Risk: Compatibility Issues

**Risk**: Dependencies might conflict

**Mitigation**:
1. Lock file regeneration
2. Dependency resolution testing
3. Clean install testing

---

## Success Metrics

### Performance
- ✅ Page load time ≤3s on 3G
- ✅ API response time ≤200ms
- ✅ TTFB ≤600ms
- ✅ Lighthouse score ≥90

### Quality
- ✅ All tests passing (179/179)
- ✅ Code coverage ≥56%
- ✅ Zero critical security vulnerabilities
- ✅ No console errors or warnings

### Functionality
- ✅ All user flows working
- ✅ Multi-language support functional
- ✅ Currency selection working
- ✅ RTL layout correct
- ✅ SEO metadata correct

---

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Frontend Core | 1 day | None |
| Phase 2: Frontend Tools | 1 day | Phase 1 |
| Phase 3: Backend Core | 2-3 days | None (parallel) |
| Phase 4: Infrastructure | 1 day | Phase 1, 3 |
| Phase 5: Testing | 2 days | All phases |
| **Total** | **7-9 days** | |

---

## Next Steps

1. ✅ Research complete - This document
2. ⏭️ Create upgrade branch: `upgrade/latest-tech-stack`
3. ⏭️ Begin Phase 1: Frontend Core
4. ⏭️ Continue through phases with gates
5. ⏭️ Final validation and deployment

---

**Plan Status**: ✅ COMPLETE
**Ready for Implementation**: YES
**Branch**: `upgrade/latest-tech-stack`
**Estimated Completion**: 7-9 days
