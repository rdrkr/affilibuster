# Research: Comprehensive Testing Strategy

**Date**: 2025-10-16
**Feature**: 003-comprehensive-testing-strategy

## Overview

This document consolidates research findings for implementing unified testing infrastructure across the Affilibuster monorepo. Three key areas were investigated:

1. **Strapi CMS Testing** - How to test Strapi 5.x and whether 80% coverage is realistic
2. **TypeScript Type Library Testing** - Best practices for testing type-only packages
3. **Test Parallelization** - Strategies for running tests efficiently across multiple modules

---

## 1. Strapi CMS Testing Strategy

### Key Findings

**Recommended Framework**: Jest + Supertest + SQLite3

**80% Coverage Verdict**: **NOT REALISTIC** for current CMS implementation

### Rationale

The Affilibuster CMS currently contains only **54 lines of Strapi boilerplate code**:

- All files use `createCoreController()` and `createCoreService()` factory functions
- Zero custom business logic
- Testing framework code provides no value

**Community Consensus** (from Strapi forums):
> "The out-of-the-box CRUD operations provided by Strapi are already tested by the framework itself."

### What Should Be Tested

**✅ Test When Implemented:**

- Custom controllers with business logic
- Custom services beyond CRUD
- Lifecycle hooks with data transformations
- Custom API endpoints
- Third-party integrations (Amazon affiliate API, etc.)
- Custom plugins
- Authorization logic

**❌ Don't Test:**

- Default CRUD operations (framework-tested)
- Content type schemas (configuration, not code)
- Database connections (Strapi infrastructure)
- Admin panel UI (unless customized)
- Generated routes (framework-tested)

### Realistic Coverage Targets

| Scenario | Realistic Coverage | Recommendation |
|----------|-------------------|----------------|
| **Current Affilibuster CMS** | 0-10% | Exclude from coverage requirements |
| **Minimal Custom Logic** | 40-60% | Test only custom endpoints |
| **Moderate Customization** | 60-75% | Focus on business logic |
| **Heavily Customized** | 70-85% | Achievable with effort |

### Setup Infrastructure (For Future Use)

```bash
# Install test dependencies
cd cms
npm install --save-dev jest supertest sqlite3
```

**Directory Structure:**

```
cms/
├── tests/
│   ├── helpers/
│   │   └── strapi.js          # Strapi instance helper
│   ├── api/                   # API endpoint tests
│   └── integration/           # Integration tests
├── config/
│   └── env/
│       └── test/
│           └── database.js    # SQLite test database
├── jest.config.js
└── package.json
```

### Decision

**EXCLUDE CMS from 80% coverage requirement** until custom code is added. Set up test infrastructure now for future use.

---

## 2. TypeScript Type Library Testing

### Key Findings

**Answer**: YES, type-only packages need tests, but not traditional runtime tests

**Recommended Tool**: **tsd** (used by DefinitelyTyped)

### Why Type Testing Matters

1. **Types are API contracts** between frontend/backend
2. **Catch regressions early** before they reach consumers
3. **Documentation** - type tests show intended usage
4. **Industry standard** - DefinitelyTyped requires type tests for all 40,000+ packages

### Testing Approach: Type Assertion Testing

**Tool**: tsd (compile-time type validation)

```typescript
// shared/types/api.test-d.ts
import { expectType, expectError, expectAssignable } from 'tsd';
import type { Language, LanguageCode, ContentResponse } from './api';

// Test valid language codes
expectType<LanguageCode>('en');
expectType<LanguageCode>('it');
expectType<LanguageCode>('he');

// Test invalid codes are rejected
expectError<LanguageCode>('fr');

// Test interface structure
const lang: Language = {
  code: 'en',
  displayName: 'English',
  // ... other fields
};
expectType<Language>(lang);
```

### How to Measure "Coverage" for Types

**Primary Metric**: Type Coverage Percentage

```bash
# Measures: (Identifiers without 'any') / (Total Identifiers)
npx type-coverage --at-least 95
```

**Secondary Metrics**:

- Type test count (how many type scenarios tested)
- Compilation success (tsc --noEmit)
- Zero TypeScript errors

### Alternative Approaches Considered

| Approach | When to Use | Trade-offs |
|----------|-------------|------------|
| **tsd** (recommended) | Type-only packages, .d.ts files | ✅ Purpose-built, ✅ DefinitelyTyped standard, ❌ Separate test files |
| **Zod schemas** | API boundaries, runtime validation | ✅ Single source of truth, ✅ Runtime validation, ❌ More code to maintain |
| **Vitest expectTypeOf** | Projects already using Vitest | ✅ All-in-one testing, ❌ Requires Vitest setup |
| **tsc --noEmit** (minimum) | Simple type definitions | ✅ No new tooling, ❌ No assertions, just compilation |

### Decision

**Implement tsd for type testing** in the shared module:

```json
// shared/package.json
{
  "scripts": {
    "test": "tsd",
    "type-check": "tsc --noEmit",
    "type-coverage": "type-coverage --at-least 95"
  }
}
```

**Coverage Reporting Strategy**:

- Type Safety Coverage: 95%+ (via type-coverage)
- Type Tests: All exported types tested (via tsd)
- Compilation: Zero errors (via tsc)

---

## 3. Test Parallelization Strategies

### Key Findings

**Recommended Approach**: Multi-level parallelization

1. **Module-level**: Make `-j` flag to run backend/frontend/CMS in parallel
2. **Test-level**: pytest-xdist (Python) + Jest built-in parallelism (JS)
3. **Coverage merging**: LCOV as common format

### Performance Targets

| Metric | Current | Target | Achievable |
|--------|---------|--------|-----------|
| **Total test time** | ~3.5 min (sequential) | < 5 min | ✅ 1-2 min with parallelization |
| **Backend tests** | ~2 min | ~1 min | ✅ With pytest-xdist |
| **Frontend tests** | ~1 min | ~30 sec | ✅ With Jest parallelism |
| **CMS tests** | N/A | ~30 sec | ✅ When implemented |

### Implementation Strategy

**Makefile Enhancement:**

```makefile
# Detect CPU cores
NPROCS := $(shell sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null || echo 4)
MAKEFLAGS += --output-sync=target

# Individual test targets
test-backend:
 @docker-compose exec -T backend pytest -n auto --cov=src --cov-report=lcov

test-frontend:
 @cd frontend && npm test -- --coverage --coverageReporters=lcov

test-cms:
 @cd cms && npm test -- --coverage --coverageReporters=lcov

# Parallel execution
test-parallel:
 @$(MAKE) -j3 test-backend test-frontend test-cms

# With coverage merging
test-all: test-parallel coverage-merge
```

### Coverage Report Merging

**Strategy**: Use LCOV as common format

Both pytest-cov and Jest support LCOV output, making merging straightforward:

```bash
# Backend: pytest.ini
addopts = --cov-report=lcov

# Frontend: jest.config.js
coverageReporters: ['lcov', 'json', 'html']

# Merge with lcov tool
lcov -a backend/coverage.lcov \
     -a frontend/coverage/lcov.info \
     -o coverage-merged/lcov.info
```

**Alternative**: Codecov (already configured) automatically merges reports with flags - no additional setup required.

### Performance Optimizations

**Expected Improvements:**

| Optimization | Expected Speedup | Source |
|-------------|-----------------|---------|
| pytest-xdist parallelism | 50-81% | PyPI case study |
| Module-level parallelism (Make -j) | 25-50% | Industry benchmarks |
| Jest built-in parallelism | 30-40% | Default Jest behavior |
| Change-based testing (CI) | 77% (45min → 10min) | Real-world monorepo |

**Backend (pytest.ini):**

```ini
[pytest]
addopts =
    -n auto              # Parallel execution
    --dist worksteal     # Better load balancing
    --cov-report=lcov    # For merging
```

**Frontend (jest.config.js):**

```javascript
{
  maxWorkers: '50%',   // Use 50% of CPU cores
  cache: true,         // Enable caching
  coverageReporters: ['lcov', 'json', 'html']
}
```

### Potential Pitfalls & Solutions

| Pitfall | Solution |
|---------|----------|
| **Test isolation issues** | Use unique test identifiers (UUIDs) for shared resources |
| **Race conditions** | Mark specific tests with `@pytest.mark.serial` |
| **Interleaved output** | Use `MAKEFLAGS += --output-sync=target` |
| **Docker resource contention** | Set resource limits in docker-compose.yml |
| **Coverage path collisions** | Use unique coverage file names per test group |
| **Flaky tests** | Increase timeouts for async operations |
| **Database connection exhaustion** | Increase pool size for testing |

### Decision

**Implement multi-level parallelization**:

1. Add pytest-xdist to backend/pyproject.toml
2. Update Makefile with parallel test targets
3. Configure LCOV output for all modules
4. Create coverage merge script
5. Update CI/CD for parallel job execution

**Expected Result**: Full test suite completes in **1-2 minutes locally**, **2-3 minutes in CI** (well under 5-minute target).

---

## 4. Technology Choices

### Testing Frameworks

| Module | Framework | Rationale |
|--------|-----------|-----------|
| **Backend** | pytest 8.3.4 | Industry standard for Python, excellent async support |
| **Frontend** | Jest 30.2.0 | Standard for React/Next.js, excellent TypeScript support |
| **CMS** | Jest (when needed) | Strapi community standard |
| **Shared** | tsd 0.31.0 | Purpose-built for type testing, DefinitelyTyped standard |

### Coverage Tools

| Tool | Purpose | Module |
|------|---------|--------|
| **pytest-cov 6.0.0** | Python coverage | Backend |
| **Jest built-in coverage** | JavaScript coverage | Frontend, CMS |
| **type-coverage 2.29.0** | TypeScript type coverage | Shared |
| **lcov** | Coverage report merging | All modules |
| **Codecov** | CI coverage reporting | All modules |

### Parallelization Tools

| Tool | Purpose | Benefit |
|------|---------|---------|
| **pytest-xdist** | Python test parallelization | 50-81% speedup |
| **Make -j flag** | Module-level parallelism | Run modules concurrently |
| **Jest built-in** | JavaScript test parallelism | 30-40% speedup |
| **lcov** | Coverage merging | Single unified report |

---

## 5. Alternatives Considered

### Alternative 1: 80% Coverage for All Modules

**Rejected** because:

- CMS has only boilerplate code (nothing to test)
- Shared module is types-only (no runtime code)
- Would require testing framework code (waste of effort)
- Industry consensus: Don't test framework code

### Alternative 2: Separate Testing Tools

**Considered**: Mocha, Vitest, Playwright for different modules

**Rejected** because:

- pytest and Jest are already configured and working
- No compelling reason to introduce new tools
- Consistency is valuable in monorepos
- Migration effort not justified

### Alternative 3: Turborepo/Nx for Caching

**Considered**: Advanced monorepo tools with distributed caching

**Deferred** because:

- Current approach achieves <5 minute target
- Adds complexity and learning curve
- Can be added later if needed
- Make is simpler and sufficient for now

### Alternative 4: Runtime Validation with Zod

**Considered**: Use Zod schemas for both types and runtime validation

**Deferred** because:

- Types are currently generated from OpenAPI (single source of truth)
- Adds maintenance overhead
- Type testing with tsd is sufficient for now
- Can be added at API boundaries if needed later

---

## 6. Open Questions Resolution

### From spec.md Open Questions

**Q1: Should CMS module tests be required for initial release?**

**RESOLVED**: No. CMS has only Strapi boilerplate code with no custom logic. Exclude from 80% coverage requirement. Set up test infrastructure, but only add tests when custom controllers/services are implemented.

**Q2: Should coverage include integration and e2e tests, or only unit tests?**

**RESOLVED**: Yes, include all test types. Backend already has unit, integration, contract, and performance tests. Frontend has unit and e2e tests. All contribute to coverage metrics.

**Q3: Do we need a combined coverage report, or are individual module reports sufficient?**

**RESOLVED**: Both. Individual module reports for development (HTML reports per module). Combined report for project-level metrics (via lcov merging or Codecov in CI).

**Q4: Should performance tests run on every `make test`, or only in CI/CD?**

**RESOLVED**: Include in standard test run. Backend performance tests are already in the suite. They're marked with `@pytest.mark.performance` so can be excluded with `pytest -m "not performance"` if needed.

**Q5: What is an acceptable test execution time for the full suite?**

**RESOLVED**: < 5 minutes total (spec requirement). Achievable with parallelization: 1-2 minutes locally, 2-3 minutes in CI.

---

## 7. Risk Assessment

### Risk 1: Insufficient Backend Test Coverage

**Status**: Medium Risk

**Current State**: Backend pytest.ini has `--cov-fail-under=50`

**Action Required**: Need to increase from 50% to 80% and write additional tests

**Mitigation**:

- Phase implementation: Update threshold gradually
- Focus on untested modules first
- Prioritize business logic over infrastructure code

### Risk 2: Frontend Test Creation

**Status**: Low Risk

**Current State**: Frontend has Jest configured with 80% thresholds but may not have many tests yet

**Action Required**: Verify current coverage and write tests for gaps

**Mitigation**:

- Frontend structure is component-based (easier to test)
- React Testing Library makes component tests straightforward
- E2E tests with Playwright can cover user flows

### Risk 3: Test Execution Time

**Status**: Low Risk

**Target**: < 5 minutes total

**Expected**: 1-2 minutes with parallelization

**Mitigation**: If tests become slow, implement:

- Change-based testing (only test affected modules)
- Test splitting across CI jobs
- Caching strategies (Turborepo/Nx)

### Risk 4: CMS Testing Complexity

**Status**: Resolved

**Decision**: Exclude CMS from 80% requirement until custom code is added

**Future Mitigation**: When custom code is added, target 60-70% coverage of custom code only (not boilerplate)

---

## 8. Dependencies

### New Dependencies Required

**Backend**:

```toml
# backend/pyproject.toml [tool.poetry.group.dev.dependencies]
pytest-xdist = "^3.6.1"  # For parallel test execution
```

**Shared**:

```json
// shared/package.json
{
  "devDependencies": {
    "tsd": "^0.31.0",
    "type-coverage": "^2.29.0"
  }
}
```

**System** (for coverage merging):

```bash
# macOS
brew install lcov

# Ubuntu/Debian
sudo apt-get install lcov
```

### Existing Dependencies (No Changes)

- Backend: pytest 8.3.4, pytest-cov 6.0.0, pytest-asyncio 0.24.0 ✅
- Frontend: Jest 30.2.0, @testing-library/react 16.1.0 ✅
- CMS: No test dependencies yet (will add Jest/Supertest when needed)

---

## 9. Best Practices

### From Research

1. **Don't test framework code** - Focus on custom business logic only
2. **Use type tests for type libraries** - Industry standard (DefinitelyTyped)
3. **Parallelize at multiple levels** - Module-level (Make) + test-level (pytest-xdist/Jest)
4. **LCOV for coverage merging** - Common format across Python and JavaScript
5. **Isolate parallel tests** - Use unique identifiers for shared resources
6. **Set realistic coverage targets** - 80% for modules with custom code, exclude boilerplate

### Affilibuster-Specific

1. **Backend**: Focus coverage efforts on domain/ and infrastructure/ layers (business logic)
2. **Frontend**: Test components, hooks, and user flows
3. **Shared**: Use type tests, not runtime tests
4. **CMS**: Wait for custom code before testing
5. **CI/CD**: Use Codecov flags for automatic merging

---

## 10. Next Steps (Implementation Planning Phase)

Based on research findings, Phase 1 (Design & Contracts) should produce:

### data-model.md

**Contents**:

- Test configuration entities (pytest markers, Jest config, coverage thresholds)
- Test infrastructure entities (test helpers, fixtures, mock data)
- Coverage report entities (LCOV format, HTML reports, merged reports)

### contracts/

**API Contracts**: None required (testing infrastructure, not API features)

**Configuration Contracts**:

- `pytest.ini` updates (coverage thresholds, markers, parallelism)
- `jest.config.js` updates (coverage reporters, thresholds)
- `Makefile` test targets (signatures, parallel execution)
- `tsd` configuration for shared module

### quickstart.md

**Developer Quickstart**:

- How to run tests (`make test`, `make test-parallel`)
- How to run individual module tests
- How to view coverage reports
- How to write tests for each module
- How to debug failing tests

---

## 11. References

### Official Documentation

- [Strapi 5 Testing Guide](https://docs.strapi.io/cms/testing)
- [pytest-xdist Documentation](https://pytest-xdist.readthedocs.io/)
- [Jest Parallelization](https://jestjs.io/docs/cli#--maxworkersnumstring)
- [tsd Type Testing](https://github.com/tsdjs/tsd)
- [LCOV Coverage Format](http://ltp.sourceforge.net/coverage/lcov.php)

### Community Resources

- [Strapi Automated Testing Guide](https://strapi.io/blog/automated-testing-for-strapi-api-with-jest-and-supertest)
- [DefinitelyTyped Testing Standards](https://github.com/DefinitelyTyped/DefinitelyTyped)
- [Monorepo Testing Best Practices](https://turborepo.org/docs/core-concepts/monorepos/running-tasks)
- [pytest-xdist Performance Case Study](https://pypi.org/project/pytest-xdist/) (50-81% speedup)

### Case Studies

- **PyPI Warehouse**: 50-81% speedup with pytest-xdist
- **Real-world monorepo**: 77% reduction (45min → 10min) with change-based testing
- **Daily.dev**: ~70% reduction with distributed caching (Nx/Turborepo)

---

**Document Status**: Complete
**Phase**: Phase 0 Research
**Next Phase**: Phase 1 Design & Contracts
