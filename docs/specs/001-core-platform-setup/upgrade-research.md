# Tech Stack Upgrade Research

**Created**: 2025-10-12
**Purpose**: Upgrade to latest stable versions of all dependencies, frameworks, and tools
**Status**: Planning Phase

---

## Executive Summary

This document outlines the upgrade path from current versions to the latest stable releases across:

- **Frontend**: Next.js, React, TypeScript, and ecosystem
- **Backend**: Python, FastAPI, PostgreSQL, Redis
- **CMS**: Strapi
- **DevOps**: Docker, Node.js, build tools

### Goals

1. ✅ Use latest stable versions for security, performance, and features
2. ✅ Maintain Clean Architecture and SOLID principles
3. ✅ Ensure zero breaking changes to existing functionality
4. ✅ Improve developer experience with modern tooling
5. ✅ Enhance performance and reduce bundle sizes

---

## Current vs. Target Versions

### Frontend Stack

| Package | Current | Latest Stable | Breaking Changes? |
|---------|---------|---------------|-------------------|
| **Next.js** | 14.0.0 | 15.1.3 | Yes - Async params, turbopack |
| **React** | 18.2.0 | 18.3.1 | No - Minor updates |
| **TypeScript** | 5.3.0 | 5.7.3 | No - Incremental improvements |
| **next-intl** | Unknown | 3.27.2 | Yes - Request locale API |
| **Tailwind CSS** | Unknown | 4.0.0 | Yes - New engine, performance |
| **Playwright** | Unknown | 1.49.1 | No - Feature additions |
| **Jest** | 29.0.0 | 29.7.0 | No - Bug fixes |
| **ESLint** | Unknown | 9.18.0 | Yes - Flat config |
| **Prettier** | Unknown | 3.4.2 | No - Formatting improvements |

### Backend Stack

| Package | Current | Latest Stable | Breaking Changes? |
|---------|---------|---------------|-------------------|
| **Python** | 3.11 | 3.13.1 | No - Backward compatible |
| **FastAPI** | Unknown | 0.115.6 | No - Incremental updates |
| **Pydantic** | Unknown | 2.10.5 | Maybe - v1 to v2 migration |
| **SQLAlchemy** | Unknown | 2.0.37 | Yes - 2.0 style |
| **Alembic** | Unknown | 1.14.0 | No - Compatible with SA 2.0 |
| **Pytest** | 7.4.0 | 8.3.4 | No - Feature additions |
| **Uvicorn** | Unknown | 0.34.0 | No - Performance improvements |
| **Redis** | Unknown | 5.2.1 (client) | No - Async improvements |

### CMS Stack

| Package | Current | Latest Stable | Breaking Changes? |
|---------|---------|---------------|-------------------|
| **Strapi** | Unknown | 5.5.0 | Yes - v4 to v5 major changes |
| **Node.js** | Unknown | 22.13.1 LTS | No - Use LTS version |

### Infrastructure

| Component | Current | Latest Stable | Breaking Changes? |
|-----------|---------|---------------|-------------------|
| **PostgreSQL** | Unknown | 17.2 | No - Use stable 17.x |
| **Redis** | Unknown | 7.4.2 | No - Backward compatible |
| **Docker** | Unknown | 27.x | No - Use latest stable |
| **Docker Compose** | Unknown | 2.x | No - v2 is standard |

---

## Upgrade Strategy

### Phase 1: Frontend Core (High Priority)

#### 1.1 Next.js 14.0 → 15.1.3

**Rationale**: Major performance improvements, turbopack stable, improved dev experience

**Key Changes**:

- ✅ **Async Request APIs**: `params`, `searchParams` now return Promises
- ✅ **Turbopack Stable**: 53% faster local server startup
- ✅ **React 19 Support**: Opt-in upgrade path
- ✅ **Improved Caching**: Better ISR and on-demand revalidation
- ✅ **`fetch` Improvements**: Better error handling

**Migration Steps**:

1. Update `package.json`: `"next": "^15.1.3"`
2. Update all `params` access to await: `const { lang } = await params`
3. Update `searchParams`: `const params = await searchParams`
4. Test middleware compatibility
5. Update `next.config.js` for new options
6. Enable turbopack: `next dev --turbo`

**Breaking Changes to Handle**:

```typescript
// BEFORE (Next.js 14)
export default function Page({ params }: { params: { slug: string } }) {
  return <div>{params.slug}</div>
}

// AFTER (Next.js 15)
export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <div>{slug}</div>
}
```

**Files Affected**:

- ✅ `src/app/[lang]/page.tsx` - Already updated
- ✅ `src/app/[lang]/[slug]/page.tsx` - Already updated
- ✅ `src/app/[lang]/about/page.tsx` - Already updated
- ✅ `src/app/[lang]/products/page.tsx` - Already updated
- ✅ `src/app/[lang]/layout.tsx` - Already updated

#### 1.2 React 18.2 → 18.3.1

**Rationale**: Bug fixes, preparation for React 19

**Key Changes**:

- TypeScript improvements
- Bug fixes for Suspense and Server Components
- Better error messages

**Migration Steps**:

1. Update `package.json`: `"react": "^18.3.1"`, `"react-dom": "^18.3.1"`
2. Run tests to ensure compatibility
3. No breaking changes expected

#### 1.3 TypeScript 5.3 → 5.7.3

**Rationale**: Better type inference, performance improvements

**Key Changes**:

- Improved type narrowing
- Better error messages
- Support for Node.js ESM resolution

**Migration Steps**:

1. Update `package.json`: `"typescript": "^5.7.3"`
2. Update `tsconfig.json` if needed for new compiler options
3. Fix any new type errors (should be minimal)

#### 1.4 next-intl → 3.27.2

**Rationale**: Latest i18n features, better async support

**Key Changes**:

- ✅ `await requestLocale` instead of `locale` parameter
- Better server component support
- Improved type safety

**Migration Steps**:

1. Update `package.json`: `"next-intl": "^3.27.2"`
2. ✅ Update `src/i18n.ts` - Already uses `requestLocale`
3. Verify middleware compatibility

#### 1.5 Tailwind CSS → 4.0.0

**Rationale**: Major performance improvements, new features

**Key Changes**:

- New high-performance engine (10x faster)
- Zero-runtime CSS-in-JS
- Improved IntelliSense
- Native cascade layers

**Migration Steps**:

1. Update dependencies:

   ```json
   "tailwindcss": "^4.0.0",
   "@tailwindcss/postcss": "^4.0.0"
   ```

2. Update `tailwind.config.js` to new v4 format
3. Update PostCSS config
4. Test all styles still work
5. Remove legacy v3 syntax

### Phase 2: Backend Core (High Priority)

#### 2.1 Python 3.11 → 3.13.1

**Rationale**: Performance improvements, better type hints, security updates

**Key Changes**:

- 10-15% performance improvement
- Better error messages
- Improved type system
- Security fixes

**Migration Steps**:

1. Update `pyproject.toml`: `python = "^3.13"`
2. Update Docker base image: `FROM python:3.13-slim`
3. Test all code for compatibility
4. Update type hints to use new features

#### 2.2 FastAPI → 0.115.6

**Rationale**: Latest features, performance improvements, Pydantic v2 support

**Key Changes**:

- Native Pydantic v2 support
- Better async performance
- Improved OpenAPI generation
- Enhanced type safety

**Migration Steps**:

1. Update `pyproject.toml`: `fastapi = "^0.115.6"`
2. Update Pydantic to v2 (see next section)
3. Test all endpoints
4. Verify OpenAPI docs still generate correctly

#### 2.3 Pydantic v1 → v2.10.5

**Rationale**: 5-10x performance improvement, better validation

**Key Changes**:

- Complete rewrite in Rust
- Major API changes
- Better error messages
- Improved type safety

**Migration Steps**:

1. Update `pyproject.toml`: `pydantic = "^2.10.5"`
2. Run migration tool: `bump-pydantic`
3. Update model configurations:

   ```python
   # BEFORE (v1)
   class Config:
       orm_mode = True

   # AFTER (v2)
   model_config = ConfigDict(from_attributes=True)
   ```

4. Update validators to use v2 syntax
5. Test all models thoroughly

#### 2.4 SQLAlchemy → 2.0.37

**Rationale**: Modern async support, better type hints, performance

**Key Changes**:

- Full async support
- Better type annotations
- Improved query interface
- Breaking changes from 1.4

**Migration Steps**:

1. Update `pyproject.toml`: `sqlalchemy = "^2.0.37"`
2. Update all queries to 2.0 style
3. Use `select()` instead of `Query`
4. Update async session handling
5. Test all database operations

#### 2.5 Pytest 7.4 → 8.3.4

**Rationale**: Better async support, improved fixtures

**Migration Steps**:

1. Update `pyproject.toml`: `pytest = "^8.3.4"`
2. Update pytest plugins if needed
3. Run full test suite

### Phase 3: CMS Upgrade (Medium Priority)

#### 3.1 Strapi v4 → v5.5.0

**Rationale**: Major improvements, better performance, new features

**Key Changes**:

- New admin panel UI
- Better performance
- Improved plugin system
- Breaking API changes

**Migration Steps**:

1. Review Strapi v5 migration guide
2. Create backup of CMS data
3. Update dependencies
4. Run migration scripts
5. Update API client in frontend
6. Test all CMS operations

**Note**: This is a major upgrade requiring careful planning

### Phase 4: Development Tools (Low Priority)

#### 4.1 ESLint 8.x → 9.18.0

**Rationale**: New flat config, better performance

**Key Changes**:

- Flat config format (no more `.eslintrc`)
- Better performance
- Improved plugin system

**Migration Steps**:

1. Create `eslint.config.js` (flat config)
2. Migrate rules from old config
3. Update CI/CD pipelines
4. Test linting still works

#### 4.2 Docker Images

**Rationale**: Latest stable versions with security patches

**Updates**:

```dockerfile
# Frontend & CMS
FROM node:22-alpine

# Backend
FROM python:3.13-slim

# PostgreSQL
FROM postgres:17-alpine

# Redis
FROM redis:7-alpine
```

---

## Risk Assessment

### High Risk Items

1. **Strapi v4 → v5**: Major version upgrade with breaking changes
   - Mitigation: Thorough testing, staged rollout
2. **Pydantic v1 → v2**: API changes across all models
   - Mitigation: Use migration tool, comprehensive tests
3. **SQLAlchemy 2.0**: Query syntax changes
   - Mitigation: Update incrementally, maintain test coverage

### Medium Risk Items

1. **Next.js 15**: Async params pattern changes
   - ✅ Already addressed in codebase
2. **Tailwind CSS 4.0**: Config format changes
   - Mitigation: Follow official migration guide

### Low Risk Items

1. **React 18.3**: Minor version bump
2. **TypeScript 5.7**: Backward compatible
3. **Python 3.13**: Backward compatible

---

## Testing Strategy

### Before Upgrade

1. ✅ Document current test results (126/126 passing)
2. ✅ Create upgrade branch: `upgrade/latest-tech-stack`
3. ✅ Snapshot current performance metrics

### During Upgrade

1. **Unit Tests**: Must maintain 100% pass rate
2. **Integration Tests**: Must pass after each phase
3. **E2E Tests**: Run full Playwright suite
4. **Performance Tests**: Verify no regressions
5. **Accessibility Tests**: Maintain WCAG 2.1 AA compliance

### After Upgrade

1. Run full test suite: `make test`
2. Performance benchmarks
3. Lighthouse audits (target: >90)
4. Manual validation checklist
5. Load testing if significant changes

---

## Rollout Plan

### Phase 1: Development Environment

1. Create feature branch
2. Upgrade dependencies phase by phase
3. Fix breaking changes
4. Ensure all tests pass

### Phase 2: Staging

1. Deploy to staging environment
2. Run full test suite
3. Performance testing
4. Manual QA

### Phase 3: Production

1. Create deployment plan
2. Schedule maintenance window
3. Deploy with rollback plan
4. Monitor for issues

---

## Success Criteria

✅ All 179 tests passing
✅ Performance improved or maintained
✅ Lighthouse score >90
✅ No breaking changes to user-facing features
✅ Developer experience improved
✅ Security vulnerabilities addressed
✅ Documentation updated

---

## Timeline Estimate

- **Phase 1 (Frontend Core)**: 2-3 days
- **Phase 2 (Backend Core)**: 2-3 days
- **Phase 3 (CMS)**: 3-4 days
- **Phase 4 (Dev Tools)**: 1 day
- **Testing & QA**: 2-3 days

**Total**: ~10-15 days for complete upgrade

---

## References

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [React 18.3 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [Pydantic v2 Migration Guide](https://docs.pydantic.dev/latest/migration/)
- [SQLAlchemy 2.0 Migration](https://docs.sqlalchemy.org/en/20/changelog/migration_20.html)
- [Strapi v5 Migration Guide](https://docs.strapi.io/dev-docs/migration/v4-to-v5)
- [Tailwind CSS v4 Alpha Docs](https://tailwindcss.com/docs/v4-beta)

---

**Last Updated**: 2025-10-12
**Next Review**: After Phase 1 completion
