# Quickstart: Comprehensive Testing Strategy

**Date**: 2025-10-16
**Feature**: 003-comprehensive-testing-strategy
**Target Audience**: Developers

## Overview

This guide shows you how to run tests, write new tests, and work with the comprehensive testing infrastructure in Affilibuster.

---

## Running Tests

### Run All Tests (Sequential - Safe)

```bash
make test
```

This runs:
1. Backend tests (pytest)
2. Frontend tests (Jest)
3. CMS tests (when implemented)
4. Shared module type tests (tsd)

**Expected time**: ~3-4 minutes

### Run All Tests (Parallel - Fast)

```bash
make test-parallel
```

Runs all module tests concurrently using available CPU cores.

**Expected time**: ~1-2 minutes

### Run Individual Module Tests

```bash
# Backend only
make test-backend

# Frontend only
make test-frontend

# CMS only (when implemented)
make test-cms

# Shared types only
make test-shared
```

### Run Tests with Coverage Merging

```bash
make test-all
```

Runs all tests in parallel and merges coverage reports into a single unified report.

**View merged coverage**:
```bash
make coverage-view
```

### Run Fast Tests Only (Backend Unit Tests)

```bash
make test-backend-fast
```

Skips slow integration and contract tests for quick feedback during development.

**Expected time**: ~30 seconds

---

## Understanding Coverage Reports

### Backend Coverage

**Location**: `backend/htmlcov/index.html`

```bash
open backend/htmlcov/index.html
```

**Threshold**: 80% minimum (enforced)

**What's measured**:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

### Frontend Coverage

**Location**: `frontend/coverage/index.html`

```bash
open frontend/coverage/index.html
```

**Threshold**: 80% minimum (enforced)

**What's measured**:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

### Merged Coverage

**Location**: `coverage-merged/html/index.html`

```bash
make coverage-view
# Or manually:
open coverage-merged/html/index.html
```

**Shows**: Combined coverage across all modules

---

## Writing Tests

### Backend Tests (Python/pytest)

#### File Locations

```
backend/tests/
├── unit/                # Fast, isolated tests
│   └── test_something.py
├── integration/         # Tests with DB/Redis
│   └── test_flow.py
├── contract/           # API contract tests
│   └── test_api_schema.py
└── performance/        # Performance tests
    └── test_benchmarks.py
```

#### Example Unit Test

```python
# backend/tests/unit/test_example.py

def test_basic_function():
    """Test description"""
    result = my_function(input_value)
    assert result == expected_value
```

#### Example Integration Test

```python
# backend/tests/integration/test_example.py
import pytest

@pytest.mark.integration
@pytest.mark.requires_db
async def test_database_operation(db_session):
    """Test with database"""
    result = await repository.create(db_session, data)
    assert result.id is not None
```

#### Example Async Test

```python
# backend/tests/unit/test_async.py
import pytest

@pytest.mark.asyncio
async def test_async_function():
    """Test async code"""
    result = await async_operation()
    assert result is not None
```

#### Running Specific Test Markers

```bash
# Unit tests only
cd backend
pytest -m "unit"

# Integration tests only
cd backend
pytest -m "integration"

# Contract tests only
cd backend
pytest -m "contract"

# Everything except slow tests
cd backend
pytest -m "not slow"
```

### Frontend Tests (TypeScript/Jest)

#### File Locations

```
frontend/
├── src/
│   └── components/
│       ├── Button.tsx
│       └── Button.test.tsx     # Colocated test
└── tests/
    ├── components/             # Component tests
    ├── e2e/                   # End-to-end tests
    └── performance/           # Performance tests
```

#### Example Component Test

```typescript
// frontend/src/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Example Hook Test

```typescript
// frontend/src/hooks/useExample.test.ts
import { renderHook, act } from '@testing-library/react';
import { useExample } from './useExample';

describe('useExample', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useExample());
    expect(result.current.value).toBe(0);
  });

  it('updates state', () => {
    const { result } = renderHook(() => useExample());

    act(() => {
      result.current.increment();
    });

    expect(result.current.value).toBe(1);
  });
});
```

#### Running Specific Tests

```bash
cd frontend

# Run tests matching pattern
npm test -- Button

# Run tests in specific file
npm test -- src/components/Button.test.tsx

# Run with coverage
npm test -- --coverage

# Watch mode for TDD
npm test -- --watch
```

### Shared Module Type Tests (TypeScript/tsd)

#### File Locations

```
shared/
└── types/
    ├── api.ts           # Type definitions
    └── api.test-d.ts    # Type tests
```

#### Example Type Test

```typescript
// shared/types/api.test-d.ts
import { expectType, expectError, expectAssignable } from 'tsd';
import type { LanguageCode, Language } from './api';

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
  nativeName: 'English',
  direction: 'ltr',
  urlPrefix: '/en',
  defaultCurrency: 'USD',
  localeCode: 'en-US',
  isDefault: true,
  isActive: true,
  sortOrder: 1
};
expectType<Language>(lang);

// Test direction constraint
expectError<Language>({
  ...lang,
  direction: 'invalid'  // Must be 'ltr' | 'rtl'
});
```

#### Running Type Tests

```bash
cd shared

# Run type tests
npm test

# Type check
npm run type-check

# Type coverage
npm run type-coverage
```

---

## Debugging Failing Tests

### Backend Test Failures

#### View Detailed Output

```bash
cd backend
pytest -v tests/path/to/test.py::test_name
```

#### Run Single Test

```bash
cd backend
pytest tests/unit/test_example.py::test_specific_function -v
```

#### Debug with pdb

```python
def test_something():
    result = my_function()
    import pdb; pdb.set_trace()  # Debugger starts here
    assert result == expected
```

#### Check Coverage for Specific Module

```bash
cd backend
pytest --cov=src.domain.specific_module --cov-report=term-missing
```

### Frontend Test Failures

#### View Detailed Output

```bash
cd frontend
npm test -- --verbose
```

#### Run Single Test

```bash
cd frontend
npm test -- Button.test.tsx -t "specific test name"
```

#### Debug with Console

```typescript
it('test name', () => {
  const result = myFunction();
  console.log('Result:', result);  // Will appear in test output
  expect(result).toBe(expected);
});
```

#### Check Coverage for Specific File

```bash
cd frontend
npm test -- Button.test.tsx --coverage --collectCoverageFrom="src/components/Button.tsx"
```

---

## Common Testing Patterns

### Backend: Test with Database Fixture

```python
@pytest.mark.integration
@pytest.mark.requires_db
async def test_with_db(db_session):
    """db_session fixture automatically rolls back after test"""
    result = await service.create(db_session, data)
    assert result.id is not None
```

### Backend: Test with Redis Fixture

```python
@pytest.mark.integration
@pytest.mark.requires_redis
async def test_with_redis(redis_client, unique_redis_key):
    """unique_redis_key ensures no collision in parallel tests"""
    await redis_client.set(unique_redis_key, value)
    result = await redis_client.get(unique_redis_key)
    assert result == value
```

### Backend: Test API Endpoint

```python
@pytest.mark.contract
async def test_api_endpoint(http_client):
    """http_client is FastAPI TestClient"""
    response = await http_client.get("/api/endpoint")
    assert response.status_code == 200
    assert response.json()["key"] == expected_value
```

### Frontend: Test with Mock

```typescript
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';

jest.mock('next/router');

it('uses router', () => {
  const push = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push });

  render(<Component />);
  screen.getByText('Navigate').click();

  expect(push).toHaveBeenCalledWith('/destination');
});
```

### Frontend: Test Async Component

```typescript
import { render, screen, waitFor } from '@testing-library/react';

it('loads data', async () => {
  render(<AsyncComponent />);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

---

## Test Markers Reference

### Backend (pytest)

| Marker | Purpose | Example |
|--------|---------|---------|
| `@pytest.mark.unit` | Fast, isolated tests | `@pytest.mark.unit` |
| `@pytest.mark.integration` | Tests with DB/Redis | `@pytest.mark.integration` |
| `@pytest.mark.contract` | API contract validation | `@pytest.mark.contract` |
| `@pytest.mark.performance` | Performance tests | `@pytest.mark.performance` |
| `@pytest.mark.slow` | Slow tests (>1s) | `@pytest.mark.slow` |
| `@pytest.mark.requires_db` | Needs database | `@pytest.mark.requires_db` |
| `@pytest.mark.requires_redis` | Needs Redis | `@pytest.mark.requires_redis` |
| `@pytest.mark.serial` | Must run serially | `@pytest.mark.serial` |
| `@pytest.mark.asyncio` | Async test | `@pytest.mark.asyncio` |

### Frontend (Jest)

Jest doesn't use decorators, but you can use `describe.skip()` and `it.only()`:

```typescript
describe.skip('Feature', () => {
  // Skipped tests
});

it.only('runs only this test', () => {
  // Only this test runs
});
```

---

## CI/CD Integration

Tests automatically run in GitHub Actions on every push and pull request.

### View CI Test Results

1. Go to GitHub repository
2. Click "Actions" tab
3. Select workflow run
4. View test results for each module

### CI Test Stages

1. **Lint** (parallel) - Backend lint, Frontend lint, CMS lint
2. **Test** (parallel) - Backend tests, Frontend tests
3. **Coverage** - Upload to Codecov with module flags

### Codecov Reports

View merged coverage at: `https://codecov.io/gh/your-org/affilibuster`

---

## Troubleshooting

### Tests Fail with "Module Not Found"

**Backend**:
```bash
cd backend
uv sync
```

**Frontend**:
```bash
cd frontend
npm install
```

### Coverage Below 80%

**Identify uncovered lines**:
```bash
# Backend
make test-backend
open backend/htmlcov/index.html

# Frontend
cd frontend
npm test -- --coverage
open coverage/index.html
```

Then write tests for red (uncovered) lines.

### Tests Hang or Timeout

**Backend**: Check for deadlocks in database tests
```python
# Increase timeout
@pytest.mark.asyncio
async def test_slow_operation():
    await asyncio.wait_for(operation(), timeout=30.0)
```

**Frontend**: Check for unresolved promises
```typescript
// Ensure waitFor completes
await waitFor(() => expect(element).toBeInTheDocument(), {
  timeout: 5000
});
```

### Parallel Test Failures (Pass Individually, Fail in Parallel)

**Backend**: Use unique identifiers
```python
import uuid

def test_with_shared_resource(redis_client):
    key = f"test:{uuid.uuid4()}"  # Unique per test
    # Test code
```

**Frontend**: Reset mocks between tests
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Coverage Merge Fails

**Check lcov installation**:
```bash
# macOS
brew install lcov

# Ubuntu/Debian
sudo apt-get install lcov
```

**Verify coverage files exist**:
```bash
ls -l backend/coverage.lcov
ls -l frontend/coverage/lcov.info
```

---

## Best Practices

### Do

✅ Write tests before implementation (TDD)
✅ Use descriptive test names
✅ Test edge cases and error conditions
✅ Keep tests isolated and independent
✅ Use fixtures/mocks for external dependencies
✅ Aim for 80%+ coverage
✅ Run tests before committing

### Don't

❌ Test framework code (e.g., Strapi boilerplate)
❌ Test third-party libraries
❌ Write tests that depend on execution order
❌ Share state between tests
❌ Skip tests without good reason
❌ Commit failing tests
❌ Focus on coverage percentage over test quality

---

## Quick Reference

### Common Commands

```bash
# Run all tests
make test

# Run tests in parallel
make test-parallel

# Run with coverage merge
make test-all

# View merged coverage
make coverage-view

# Run backend tests only
make test-backend

# Run frontend tests only
make test-frontend

# Run fast backend tests
make test-backend-fast

# Clean coverage reports
make clean-coverage

# CI test simulation
make ci-test
```

### File Paths

| Module | Test Directory | Coverage Report |
|--------|---------------|-----------------|
| Backend | `backend/tests/` | `backend/htmlcov/index.html` |
| Frontend | `frontend/tests/` or `frontend/src/**/*.test.tsx` | `frontend/coverage/index.html` |
| Shared | `shared/types/*.test-d.ts` | N/A (type tests) |
| Merged | N/A | `coverage-merged/html/index.html` |

### Coverage Thresholds

| Module | Threshold | Enforced |
|--------|-----------|----------|
| Backend | 80% | ✅ Yes |
| Frontend | 80% | ✅ Yes |
| Shared | 95% (type coverage) | ✅ Yes |
| CMS | 60% (future) | ✅ Yes (when implemented) |

---

## Getting Help

- **Documentation**: See [spec.md](./spec.md) for feature overview
- **Architecture**: See [data-model.md](./data-model.md) for configuration details
- **Research**: See [research.md](./research.md) for technical decisions
- **Contracts**: See [contracts/](./contracts/) for configuration references

---

**Last Updated**: 2025-10-16
