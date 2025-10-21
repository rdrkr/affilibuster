# Configuration Contracts

This directory contains configuration file contracts for the comprehensive testing strategy feature.

## Purpose

These contracts define the exact configuration that will be implemented in the implementation phase (`/speckit.tasks`). They serve as:

1. **Specification** - Precise definition of what will be implemented
2. **Validation** - Reference for code review
3. **Documentation** - Clear intent of each configuration change

## Contracts

### Backend Configuration

**File**: `pytest-config.ini`
**Target**: `backend/pytest.ini`
**Changes**:
- ✅ Add `-n auto` for parallel execution
- ✅ Add `--dist worksteal` for load balancing
- ✅ Add `--cov-report=lcov` for coverage merging
- ✅ Update `--cov-fail-under=80` (from 50%)
- ✅ Add `serial` marker for sequential-only tests

### Frontend Configuration

**File**: `jest-frontend-config.js`
**Target**: `frontend/jest.config.js`
**Changes**:
- ✅ Add `lcov` to `coverageReporters`
- ✅ Add `maxWorkers: '50%'` for performance
- ✅ Add `cache: true` for faster reruns
- ℹ️ Coverage thresholds already set to 80%

### CMS Configuration (Future)

**File**: `jest-cms-config.js`
**Target**: `cms/jest.config.js`
**Status**: TO BE CREATED when custom Strapi code is added
**Changes**:
- Configure Jest for Node environment (not jsdom)
- Exclude Strapi boilerplate from coverage
- Set lower coverage threshold (60%) with justification
- Add LCOV reporter for merging

### Shared Module Configuration

**File**: `shared-package.json`
**Target**: `shared/package.json`
**Changes**:
- ✅ Add `test` script (tsd)
- ✅ Add `type-check` script (tsc --noEmit)
- ✅ Add `type-coverage` script (95% minimum)
- ✅ Add `tsd` and `type-coverage` dependencies

### Makefile Test Targets

**File**: `Makefile-test-targets`
**Target**: Root `Makefile`
**Changes**:
- ✅ Add CPU core detection
- ✅ Add `--output-sync=target` flag
- ✅ Add individual test targets (backend, frontend, cms, shared)
- ✅ Add `test-parallel` target (Make -j3)
- ✅ Add `test-all` target (parallel + merge)
- ✅ Add `coverage-merge` target
- ✅ Add `coverage-view` target
- ✅ Update `test` target to include all modules

### Coverage Merge Script

**File**: `merge-coverage.sh`
**Target**: `scripts/merge-coverage.sh`
**Changes**:
- ✅ Create new script for merging LCOV reports
- ✅ Check for lcov installation
- ✅ Find all module coverage files
- ✅ Merge using lcov tool
- ✅ Generate HTML report with genhtml

### Backend Dependencies

**File**: `backend-pyproject.toml`
**Target**: `backend/pyproject.toml`
**Changes**:
- ✅ Add `pytest-xdist>=3.6.1` for parallel execution

## Implementation Order

When implementing these contracts (during `/speckit.tasks`), follow this order:

1. **Backend configuration** - Update pytest.ini and pyproject.toml
2. **Frontend configuration** - Update jest.config.js
3. **Shared configuration** - Update package.json and install dependencies
4. **Makefile targets** - Add all test orchestration targets
5. **Coverage merge script** - Create merge-coverage.sh and make executable
6. **CMS configuration** - Defer until custom code is added

## Validation

After implementation, validate:

- ✅ `make test-parallel` runs all module tests concurrently
- ✅ Backend coverage reports include LCOV format
- ✅ Frontend coverage reports include LCOV format
- ✅ `make test-all` produces merged coverage report
- ✅ Coverage thresholds are enforced (80% for backend/frontend)
- ✅ Shared module type tests pass
- ✅ Test execution completes in < 5 minutes

## References

- [Comprehensive Testing Strategy Spec](../spec.md)
- [Data Model](../data-model.md)
- [Research Findings](../research.md)
