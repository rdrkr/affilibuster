# Data Model: Comprehensive Testing Strategy

**Date**: 2025-10-16
**Feature**: 003-comprehensive-testing-strategy

## Overview

This document defines the "entities" for the comprehensive testing strategy. Since this is testing infrastructure (not application features), the entities are configuration files, test targets, coverage metrics, and test infrastructure components.

---

## 1. Configuration Entities

### 1.1 Backend Test Configuration

**Entity**: `pytest.ini`

**Location**: `/Users/ronendruker/Development/repos/affilibuster/backend/pytest.ini`

**Purpose**: Configure pytest test discovery, execution, and coverage

**Fields/Settings**:
```ini
[pytest]
# Test discovery
testpaths = tests                    # Where to find tests
python_files = test_*.py             # Test file pattern
python_classes = Test*               # Test class pattern
python_functions = test_*            # Test function pattern

# Execution options
addopts =
    --verbose                        # Detailed output
    --strict-markers                 # Fail on unknown markers
    --tb=short                       # Short traceback format
    -n auto                          # Parallel execution (NEW)
    --dist worksteal                 # Load balancing (NEW)
    --cov=src                        # Coverage source directory
    --cov-report=term-missing        # Terminal report
    --cov-report=html                # HTML report
    --cov-report=xml                 # XML report (for CI)
    --cov-report=lcov                # LCOV report (for merging) (NEW)
    --cov-fail-under=80              # UPDATED: 80% minimum

# Asyncio mode
asyncio_mode = auto

# Test markers
markers =
    unit: Unit tests
    integration: Integration tests
    contract: Contract tests (API schema validation)
    performance: Performance and load tests
    slow: Slow running tests
    requires_db: Tests that require database connection
    requires_redis: Tests that require Redis connection
    serial: Tests that must run serially (not in parallel) (NEW)

[coverage:run]
source = src
omit =
    */tests/*
    */test_*.py
    */__pycache__/*
    */venv/*
    */virtualenv/*

[coverage:report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:
    @abstractmethod
```

**Validation Rules**:
- `--cov-fail-under` must be 80 (NON-NEGOTIABLE per constitution)
- All markers must be defined in `markers` section
- `testpaths` must point to valid directory

**State Transitions**: None (configuration file)

---

### 1.2 Frontend Test Configuration

**Entity**: `jest.config.js`

**Location**: `/Users/ronendruker/Development/repos/affilibuster/frontend/jest.config.js`

**Purpose**: Configure Jest test execution and coverage

**Fields/Settings**:
```javascript
module.exports = {
  // Test environment
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@affilibuster/shared/(.*)$': '<rootDir>/../shared/$1',
  },

  // Test discovery
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Coverage collection
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],

  // Coverage thresholds (ENFORCED)
  coverageThresholds: {
    global: {
      branches: 80,      // NON-NEGOTIABLE
      functions: 80,     // NON-NEGOTIABLE
      lines: 80,         // NON-NEGOTIABLE
      statements: 80,    // NON-NEGOTIABLE
    },
  },

  // Coverage reporters (UPDATED)
  coverageReporters: ['lcov', 'json', 'html', 'text'],  // Added lcov

  // Performance
  maxWorkers: '50%',    // NEW: Use 50% of CPU cores
  cache: true,          // NEW: Enable caching

  // Path ignoring
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
};
```

**Validation Rules**:
- All coverage thresholds must be 80 (NON-NEGOTIABLE)
- `coverageReporters` must include 'lcov' for merging
- `testEnvironment` must be 'jest-environment-jsdom' for React components

**State Transitions**: None (configuration file)

---

### 1.3 CMS Test Configuration (Future)

**Entity**: `jest.config.js`

**Location**: `/Users/ronendruker/Development/repos/affilibuster/cms/jest.config.js`

**Purpose**: Configure Jest for Strapi CMS testing

**Status**: TO BE CREATED when custom code is added

**Fields/Settings**:
```javascript
module.exports = {
  // Test environment
  testEnvironment: 'node',  // Node environment for Strapi

  // Test discovery
  testPathIgnorePatterns: ['/node_modules/', '.tmp', '.cache'],

  // Coverage collection (EXCLUDE BOILERPLATE)
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.schema.{js,json}',    // Exclude schemas
    '!src/**/routes/*.js',            // Exclude route configs
    '!src/**/index.js',               // Exclude boilerplate exports
  ],

  // Coverage thresholds (LOWER than 80% for CMS)
  coverageThresholds: {
    global: {
      branches: 60,      // Lower threshold for CMS
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  // Coverage reporters
  coverageReporters: ['lcov', 'json', 'html', 'text'],

  // Timeouts (Strapi can be slow to start)
  testTimeout: 15000,
};
```

**Validation Rules**:
- Lower threshold (60%) justified by framework boilerplate
- Must exclude schemas and route configs from coverage
- Timeout must be sufficient for Strapi initialization

**State Transitions**: None (configuration file)

---

### 1.4 Shared Module Test Configuration

**Entity**: `package.json` (test scripts)

**Location**: `/Users/ronendruker/Development/repos/affilibuster/shared/package.json`

**Purpose**: Configure type testing for shared module

**Fields/Settings**:
```json
{
  "name": "@affilibuster/shared",
  "version": "0.1.0",
  "description": "Shared types and contracts for Affilibuster platform",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "tsd",                                    // NEW: Type tests
    "type-check": "tsc --noEmit",                    // NEW: Compilation check
    "type-coverage": "type-coverage --at-least 95"   // NEW: Type coverage
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsd": "^0.31.0",             // NEW
    "type-coverage": "^2.29.0"    // NEW
  }
}
```

**Validation Rules**:
- Type coverage must be >= 95%
- All type tests must pass (tsd)
- Compilation must succeed (tsc --noEmit)

**State Transitions**: None (configuration file)

---

## 2. Test Target Entities

### 2.1 Makefile Test Targets

**Entity**: Makefile test targets

**Location**: `/Users/ronendruker/Development/repos/affilibuster/Makefile`

**Purpose**: Orchestrate test execution across all modules

**Targets**:

| Target | Description | Dependencies | Parallelizable |
|--------|-------------|--------------|----------------|
| `test` | Run all tests (sequential, safe) | test-backend, test-frontend | No |
| `test-parallel` | Run all tests in parallel (fast) | test-backend, test-frontend, test-cms | Yes (Make -j3) |
| `test-all` | Run parallel tests + merge coverage | test-parallel, coverage-merge | Partially |
| `test-backend` | Run backend tests with coverage | Docker services | No (calls docker-compose) |
| `test-frontend` | Run frontend tests with coverage | npm dependencies | No (calls npm) |
| `test-cms` | Run CMS tests with coverage | npm dependencies | No (calls npm) |
| `test-backend-fast` | Run only unit tests (no integration) | Docker services | No |
| `coverage-merge` | Merge coverage from all modules | test outputs | No |
| `coverage-view` | Open merged coverage in browser | coverage-merge | No |
| `ci-test` | Run tests as in CI environment | None | Yes |

**Signature**: `<target>: <dependencies>`

**Example**:
```makefile
test-backend: ## Run backend tests with coverage
	@echo "Running backend tests..."
	@docker-compose exec -T backend pytest -n auto --cov=src \
		--cov-report=lcov \
		--cov-report=term-missing \
		--tb=short
	@echo "Backend tests complete"
```

**Validation Rules**:
- All test targets must return exit code 0 on success, non-zero on failure
- Coverage must be generated in LCOV format for merging
- Output must be synchronized (use `MAKEFLAGS += --output-sync=target`)

**State Transitions**: None (targets are stateless)

---

## 3. Coverage Metric Entities

### 3.1 Backend Coverage Metrics

**Entity**: Backend coverage report

**Locations**:
- HTML: `/Users/ronendruker/Development/repos/affilibuster/backend/htmlcov/index.html`
- XML: `/Users/ronendruker/Development/repos/affilibuster/backend/coverage.xml`
- LCOV: `/Users/ronendruker/Development/repos/affilibuster/backend/coverage.lcov`

**Fields**:
```typescript
interface BackendCoverage {
  totalStatements: number;
  coveredStatements: number;
  statementPercentage: number;  // Must be >= 80
  totalBranches: number;
  coveredBranches: number;
  branchPercentage: number;     // Must be >= 80
  totalFunctions: number;
  coveredFunctions: number;
  functionPercentage: number;   // Must be >= 80
  totalLines: number;
  coveredLines: number;
  linePercentage: number;       // Must be >= 80
}
```

**Validation Rules**:
- All percentages must be >= 80
- Reports must be generated after every test run
- LCOV format required for merging

**State Transitions**:
```
[No Coverage] --[run tests]--> [Coverage Generated] --[view report]--> [Coverage Reviewed]
                                                     --[merge]--> [Merged Coverage]
```

---

### 3.2 Frontend Coverage Metrics

**Entity**: Frontend coverage report

**Locations**:
- HTML: `/Users/ronendruker/Development/repos/affilibuster/frontend/coverage/index.html`
- JSON: `/Users/ronendruker/Development/repos/affilibuster/frontend/coverage/coverage-final.json`
- LCOV: `/Users/ronendruker/Development/repos/affilibuster/frontend/coverage/lcov.info`

**Fields**: (Same as Backend Coverage structure)

**Validation Rules**: (Same as Backend)

---

### 3.3 Merged Coverage Metrics

**Entity**: Merged coverage report

**Location**: `/Users/ronendruker/Development/repos/affilibuster/coverage-merged/`

**Structure**:
```
coverage-merged/
├── lcov.info          # Merged LCOV file
└── html/              # Merged HTML report
    └── index.html     # Main report page
```

**Fields**:
```typescript
interface MergedCoverage {
  modules: {
    backend: BackendCoverage;
    frontend: FrontendCoverage;
    cms?: CMSCoverage;
  };
  totalStatementPercentage: number;   // Weighted average
  totalBranchPercentage: number;      // Weighted average
  totalFunctionPercentage: number;    // Weighted average
  totalLinePercentage: number;        // Weighted average
}
```

**Validation Rules**:
- Must include all modules with tests
- Weighted average accounts for module sizes
- Generated by lcov tool

**State Transitions**:
```
[Individual Reports] --[merge-coverage.sh]--> [Merged Report] --[genhtml]--> [HTML Report]
```

---

### 3.4 Type Coverage Metrics

**Entity**: Shared module type coverage

**Location**: `/Users/ronendruker/Development/repos/affilibuster/shared/` (stdout)

**Fields**:
```typescript
interface TypeCoverage {
  totalIdentifiers: number;
  typedIdentifiers: number;
  anyTypeCount: number;
  typeCoveragePercentage: number;  // Must be >= 95
  uncoveredFiles: string[];
}
```

**Validation Rules**:
- Type coverage must be >= 95%
- Any types should be minimized
- All exported types must be tested (tsd)

**State Transitions**:
```
[Code Change] --[tsc]--> [Type Check] --[type-coverage]--> [Type Coverage Report]
```

---

## 4. Test Infrastructure Components

### 4.1 Backend Test Fixtures

**Entity**: pytest fixtures

**Location**: `/Users/ronendruker/Development/repos/affilibuster/backend/tests/conftest.py`

**Purpose**: Shared test fixtures for database, Redis, HTTP client, etc.

**Key Fixtures**:
```python
@pytest.fixture
async def db_session():
    """Provide database session with transaction rollback"""
    # Implementation

@pytest.fixture
async def redis_client():
    """Provide Redis client for testing"""
    # Implementation

@pytest.fixture
async def http_client():
    """Provide FastAPI test client"""
    # Implementation

@pytest.fixture
def unique_redis_key():
    """Generate unique Redis key for parallel test isolation"""
    return f"test:{uuid.uuid4()}"
```

**Validation Rules**:
- Fixtures must clean up resources (transaction rollback, key deletion)
- Fixtures for parallel tests must use unique identifiers
- Fixtures must be scoped appropriately (function, module, session)

---

### 4.2 Frontend Test Utilities

**Entity**: React Testing Library setup

**Location**: `/Users/ronendruker/Development/repos/affilibuster/frontend/jest.setup.js`

**Purpose**: Configure testing environment for React components

**Key Setup**:
```javascript
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => require('next-router-mock'));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'en',
}));

// Global test timeout
jest.setTimeout(10000);
```

**Validation Rules**:
- Must import @testing-library/jest-dom for assertions
- Must mock Next.js dependencies
- Timeout must be reasonable (10 seconds)

---

### 4.3 CMS Test Helpers (Future)

**Entity**: Strapi test helpers

**Location**: `/Users/ronendruker/Development/repos/affilibuster/cms/tests/helpers/strapi.js`

**Purpose**: Initialize and teardown Strapi instance for testing

**Status**: TO BE CREATED

**Key Functions**:
```javascript
async function setupStrapi() {
  // Initialize Strapi with test database
  // Return Strapi instance
}

async function cleanupStrapi() {
  // Destroy Strapi instance
  // Clean up test database
}
```

**Validation Rules**:
- Must use SQLite test database (not production PostgreSQL)
- Must clean up all resources
- Must handle Windows file locking issues

---

### 4.4 Shared Module Type Tests

**Entity**: tsd type test files

**Location**: `/Users/ronendruker/Development/repos/affilibuster/shared/types/*.test-d.ts`

**Purpose**: Validate TypeScript type definitions

**Example Structure**:
```typescript
// shared/types/api.test-d.ts
import { expectType, expectError, expectAssignable } from 'tsd';
import type { Language, LanguageCode } from './api';

// Test valid values
expectType<LanguageCode>('en');
expectType<LanguageCode>('it');
expectType<LanguageCode>('he');

// Test invalid values are rejected
expectError<LanguageCode>('fr');

// Test interface structure
const lang: Language = { /* ... */ };
expectType<Language>(lang);
```

**Validation Rules**:
- Must test all exported types
- Must test valid and invalid cases
- Must use tsd assertion functions

---

## 5. CI/CD Entities

### 5.1 GitHub Actions Workflow

**Entity**: CI test workflow

**Location**: `/Users/ronendruker/Development/repos/affilibuster/.github/workflows/ci.yml`

**Purpose**: Run tests in CI environment

**Key Jobs**:

| Job | Purpose | Parallelizable | Depends On |
|-----|---------|----------------|------------|
| `backend-lint` | Lint Python code | Yes | None |
| `backend-test` | Run backend tests | Yes (matrix strategy) | None |
| `frontend-lint` | Lint TypeScript code | Yes | None |
| `frontend-test` | Run frontend tests | Yes | None |
| `cms-lint` | Lint CMS code | Yes | None |
| `coverage-report` | Aggregate coverage | No | All test jobs |

**Matrix Strategy** (Backend):
```yaml
strategy:
  matrix:
    test-group: [unit, integration, contract]
```

**Validation Rules**:
- All jobs must pass for PR merge
- Coverage must be uploaded to Codecov
- Test results must be visible in PR

**State Transitions**:
```
[Code Push] --[trigger]--> [CI Jobs] --[run tests]--> [Upload Coverage] --[check thresholds]--> [Pass/Fail]
```

---

### 5.2 Codecov Configuration

**Entity**: Codecov settings

**Location**: Project settings on codecov.io

**Purpose**: Merge coverage reports from multiple modules

**Flags**:
- `backend`: Backend Python coverage
- `frontend`: Frontend JavaScript coverage
- `cms`: CMS coverage (future)

**Validation Rules**:
- Each module uploads with unique flag
- Codecov merges automatically
- Coverage must meet threshold (80%)

---

## 6. Dependencies & Versions

### Backend Dependencies

```txt
pytest==8.3.4
pytest-asyncio==0.24.0
pytest-cov==6.0.0
pytest-xdist>=3.6.1  # NEW
```

### Frontend Dependencies

```json
{
  "jest": "^30.2.0",
  "jest-environment-jsdom": "^30.2.0",
  "@testing-library/react": "^16.1.0",
  "@testing-library/jest-dom": "^6.9.1",
  "@playwright/test": "^1.49.1"
}
```

### Shared Dependencies

```json
{
  "tsd": "^0.31.0",           // NEW
  "type-coverage": "^2.29.0"  // NEW
}
```

### System Dependencies

- **lcov**: Coverage report merging (brew install lcov / apt-get install lcov)

---

## 7. Relationships

### Entity Relationship Diagram

```
Makefile Test Targets
  ├── test-backend --> Backend Test Configuration (pytest.ini)
  │                 --> Backend Coverage Metrics
  │
  ├── test-frontend --> Frontend Test Configuration (jest.config.js)
  │                  --> Frontend Coverage Metrics
  │
  ├── test-cms --> CMS Test Configuration (jest.config.js)
  │             --> CMS Coverage Metrics
  │
  └── coverage-merge --> Merged Coverage Metrics
                      <-- Backend Coverage Metrics (LCOV)
                      <-- Frontend Coverage Metrics (LCOV)
                      <-- CMS Coverage Metrics (LCOV)

CI/CD Workflow
  ├── backend-test --> Backend Test Configuration
  │                 --> Codecov (backend flag)
  │
  ├── frontend-test --> Frontend Test Configuration
  │                  --> Codecov (frontend flag)
  │
  └── coverage-report --> Codecov (merged)

Type Testing
  ├── tsd --> Shared Module Type Tests
  └── type-coverage --> Type Coverage Metrics
```

---

## 8. Validation Summary

### Global Validation Rules

1. **80% Coverage Minimum** (NON-NEGOTIABLE for backend and frontend)
2. **LCOV Format Required** for all coverage reports (for merging)
3. **Test Parallelization Enabled** (pytest-xdist, Jest maxWorkers)
4. **Unique Test Identifiers** for parallel test isolation
5. **CI Must Pass** before merge

### Per-Module Validation

| Module | Coverage Threshold | Output Format | Parallel Execution |
|--------|-------------------|---------------|-------------------|
| Backend | 80% | LCOV, HTML, XML | ✅ pytest-xdist |
| Frontend | 80% | LCOV, JSON, HTML | ✅ Jest built-in |
| Shared | 95% type coverage | stdout | N/A (compilation) |
| CMS | 60% (future) | LCOV, HTML | ✅ Jest built-in |

---

**Document Status**: Complete
**Phase**: Phase 1 Design
**Next**: Generate contracts (configuration files)
