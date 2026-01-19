# Tasks: Comprehensive Testing Strategy

**Branch**: `003-comprehensive-testing-strategy` | **Date**: 2025-10-16
**Feature**: Unified testing infrastructure with 80% minimum coverage across all modules

## Overview

This document defines the implementation tasks for establishing comprehensive testing infrastructure across the Affilibuster monorepo. Tasks are organized by user story to enable independent implementation and validation.

**Key User Stories**:

1. **US1**: Run all tests with a single command (`make test`)
2. **US2**: See coverage reports for all modules
3. **US3**: Tests fail if coverage drops below 80%
4. **US4**: Run specific test categories (unit, integration, etc.)

**Performance Target**: Full test suite < 5 minutes (achievable: 1-2 minutes with parallelization)

---

## Phase 1: Setup & Prerequisites

**Goal**: Install dependencies and verify environment is ready for testing infrastructure

**Dependencies**: None

### Tasks

- [X] T001 Install lcov for coverage report merging (macOS: brew install lcov)
- [X] T002 [P] Add pytest-xdist to backend/pyproject.toml per contracts/backend-requirements.txt
- [X] T003 [P] Install backend dependencies: cd backend && uv sync
- [X] T004 [P] Add tsd and type-coverage to shared/package.json per contracts/shared-package.json
- [X] T005 [P] Install shared module dependencies: cd shared && npm install
- [X] T006 Verify Docker services are running: docker-compose ps (backend requires PostgreSQL/Redis)

**Validation**:

- [X] lcov command available: `which lcov`
- [X] pytest-xdist installed: `cd backend && python -c "import xdist"`
- [X] tsd and type-coverage installed: `cd shared && npm list tsd type-coverage`
- [X] Docker services healthy: `docker-compose ps` shows backend, postgres, redis as Up

---

## Phase 2: Foundational - Backend Configuration

**Goal**: Configure backend testing with 80% coverage, parallel execution, and LCOV output

**User Story**: US2, US3 (prerequisites for all testing)

**Dependencies**: Phase 1

### Tasks

- [X] T007 [US2] [US3] Update backend/pytest.ini with 80% threshold per contracts/pytest-config.ini
- [X] T008 [US2] [US3] Add parallel execution flags (-n auto, --dist worksteal) to backend/pytest.ini
- [X] T009 [US2] Add LCOV coverage reporter (--cov-report=lcov) to backend/pytest.ini
- [X] T010 [US2] [US3] Add 'serial' marker for non-parallel tests to backend/pytest.ini
- [X] T011 [US2] [US3] Test backend configuration: cd backend && pytest --co -q (should list tests without errors)
- [X] T012 [US3] Verify coverage threshold enforcement: cd backend && pytest (should fail if < 80%)

**Validation**:

- [X] backend/pytest.ini contains `--cov-fail-under=80`
- [X] backend/pytest.ini contains `-n auto` and `--dist worksteal`
- [X] backend/pytest.ini contains `--cov-report=lcov`
- [X] backend/pytest.ini has 'serial' in markers section
- [X] Running `cd backend && pytest` generates coverage.lcov file
- [X] Tests fail if coverage < 80% (enforced)

**Independent Test**: Run `cd backend && pytest -v --cov=src --cov-fail-under=80` - should execute in parallel and report >= 80% coverage

---

## Phase 3: Foundational - Frontend Configuration

**Goal**: Update frontend Jest configuration for LCOV output and parallel execution

**User Story**: US2, US3

**Dependencies**: Phase 1

### Tasks

- [X] T013 [P] [US2] Add lcov to coverageReporters in frontend/jest.config.js per contracts/jest-frontend-config.js
- [X] T014 [P] [US2] Add maxWorkers: '50%' to frontend/jest.config.js for parallel execution
- [X] T015 [P] [US2] Add cache: true to frontend/jest.config.js for faster reruns
- [X] T016 [P] [US3] Verify frontend coverage thresholds are 80% in frontend/jest.config.js (should already exist)
- [X] T017 [US2] [US3] Test frontend configuration: cd frontend && npm test -- --listTests (should list tests)
- [X] T018 [US3] Verify coverage enforcement: cd frontend && npm test -- --coverage (should fail if < 80%)

**Validation**:

- [X] frontend/jest.config.js contains `coverageReporters: ['lcov', 'json', 'html', 'text']`
- [X] frontend/jest.config.js contains `maxWorkers: '50%'` and `cache: true`
- [X] frontend/jest.config.js has 80% thresholds (all four: branches, functions, lines, statements)
- [X] Running `cd frontend && npm test -- --coverage` generates frontend/coverage/lcov.info
- [X] Tests fail if coverage < 80% (enforced)

**Independent Test**: Run `cd frontend && npm test -- --coverage` - should execute with parallel workers and report >= 80% coverage

---

## Phase 4: Foundational - Shared Module Configuration

**Goal**: Set up type testing for shared TypeScript module

**User Story**: US2, US3

**Dependencies**: Phase 1 (T004, T005)

### Tasks

- [X] T019 [P] [US2] Add test script ("test": "tsd") to shared/package.json
- [X] T020 [P] [US2] Add type-check script ("type-check": "tsc --noEmit") to shared/package.json
- [X] T021 [P] [US2] Add type-coverage script ("type-coverage": "type-coverage --at-least 95 --strict") to shared/package.json
- [X] T022 [US2] Create shared/types/api.test-d.ts with sample type tests for LanguageCode and Language types
- [X] T023 [US2] [US3] Test shared module configuration: cd shared && npm run type-check (should succeed)
- [X] T024 [US3] Verify type coverage: cd shared && npm run type-coverage (should report >= 95%)

**Validation**:

- [X] shared/package.json has all three test scripts (test, type-check, type-coverage)
- [X] shared/types/api.test-d.ts exists with type assertions
- [X] Running `cd shared && npm test` executes tsd type tests
- [X] Running `cd shared && npm run type-coverage` reports >= 95% type coverage
- [X] Type tests fail for invalid type usage (verified by tsd)

**Independent Test**: Run `cd shared && npm test && npm run type-check && npm run type-coverage` - all three should pass with >= 95% type coverage

---

## Phase 5: User Story 1 - Unified Test Execution

**Goal**: `make test` runs all module tests (backend, frontend, shared) in sequence

**User Story**: US1 (primary goal)

**Dependencies**: Phases 2, 3, 4

### Tasks

- [X] T025 [US1] Add CPU core detection to root Makefile: NPROCS := $(shell sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null || echo 4)
- [X] T026 [US1] Add output synchronization to root Makefile: MAKEFLAGS += --output-sync=target
- [X] T027 [US1] Create test-backend target in root Makefile per contracts/Makefile-test-targets
- [X] T028 [US1] Create test-frontend target in root Makefile per contracts/Makefile-test-targets
- [X] T029 [US1] Create test-shared target in root Makefile per contracts/Makefile-test-targets
- [X] T030 [US1] Update test target to call test-backend, test-frontend, test-shared sequentially in root Makefile
- [X] T031 [US1] Add clean-coverage target to root Makefile per contracts/Makefile-test-targets
- [X] T032 [US1] Test unified execution: make test (should run all three modules sequentially)

**Validation**:

- [X] root Makefile has NPROCS and MAKEFLAGS variables
- [X] root Makefile has test-backend, test-frontend, test-shared targets
- [X] root Makefile test target runs all three modules
- [X] Running `make test` executes backend, frontend, and shared tests
- [X] Test output is clear and synchronized (not interleaved)
- [X] All module coverage reports are generated

**Independent Test**: Run `make test` - should execute all module tests sequentially, complete in < 5 minutes, and report coverage for all modules

---

## Phase 6: User Story 1 (Extended) - Parallel Test Execution

**Goal**: `make test-parallel` runs all module tests concurrently for faster feedback

**User Story**: US1 (performance optimization)

**Dependencies**: Phase 5

### Tasks

- [X] T033 [US1] Create test-parallel target in root Makefile using $(MAKE) -j3
- [X] T034 [US1] Test parallel execution: make test-parallel (should run modules concurrently)
- [X] T035 [US1] Measure and verify test execution time: make test-parallel completes in 1-2 minutes
- [X] T036 [US1] Verify all module coverage reports generated correctly with parallel execution

**Validation**:

- [X] root Makefile has test-parallel target with -j3 flag
- [X] Running `make test-parallel` executes modules concurrently (visible in output)
- [X] Total execution time < 2 minutes (target: 1-2 minutes)
- [X] All coverage reports generated successfully

**Independent Test**: Run `make test-parallel` - should complete in ~1-2 minutes with all modules passing and coverage reports generated

---

## Phase 7: User Story 2 - Coverage Report Merging

**Goal**: Merge coverage from all modules into single unified report

**User Story**: US2

**Dependencies**: Phases 5, 6

### Tasks

- [X] T037 [P] [US2] Create scripts/merge-coverage.sh per contracts/merge-coverage.sh
- [X] T038 [US2] Make scripts/merge-coverage.sh executable: chmod +x scripts/merge-coverage.sh
- [X] T039 [US2] Create coverage-merge target in root Makefile that calls scripts/merge-coverage.sh
- [X] T040 [US2] Create coverage-view target in root Makefile to open merged report in browser
- [X] T041 [US2] Create test-all target that runs test-parallel then coverage-merge in root Makefile
- [X] T042 [US2] Test coverage merging: make test-all (should generate coverage-merged/html/index.html)
- [X] T043 [US2] Verify merged report includes all modules: open coverage-merged/html/index.html

**Validation**:

- [X] scripts/merge-coverage.sh exists and is executable
- [X] root Makefile has coverage-merge, coverage-view, and test-all targets
- [X] Running `make test-all` generates coverage-merged/html/index.html
- [X] Merged report shows backend, frontend, and (if applicable) CMS coverage
- [X] Running `make coverage-view` opens merged report in browser

**Independent Test**: Run `make test-all && make coverage-view` - should generate merged coverage report and open in browser showing all modules

---

## Phase 8: User Story 4 - Test Category Execution

**Goal**: Run specific test categories (unit, integration, contract, performance)

**User Story**: US4

**Dependencies**: Phase 2 (backend markers configured)

### Tasks

- [X] T044 [US4] Create test-backend-fast target for unit tests only in root Makefile
- [X] T045 [US4] Document test marker usage in backend tests: pytest -m "unit|integration|contract|performance"
- [X] T046 [US4] Test unit-only execution: make test-backend-fast (should run only unit tests, ~30 seconds)
- [X] T047 [US4] Verify marker functionality: cd backend && pytest -m "integration" (should run integration tests only)
- [X] T048 [US4] Verify marker functionality: cd backend && pytest -m "not slow" (should skip slow tests)

**Validation**:

- [X] root Makefile has test-backend-fast target with -m "unit" flag
- [X] Running `make test-backend-fast` completes in ~30 seconds
- [X] Backend tests can be filtered by marker (unit, integration, contract, performance, slow)
- [X] Test markers are documented in pytest.ini and quickstart.md

**Independent Test**: Run `make test-backend-fast` - should complete in < 1 minute running only unit tests

---

## Phase 9: Polish - Documentation & CMS Prep

**Goal**: Document testing strategy and prepare CMS infrastructure for future use

**Dependencies**: Phases 5, 6, 7, 8

### Tasks

- [X] T049 [P] Create cms/tests directory structure: mkdir -p cms/tests/helpers cms/tests/api cms/tests/integration
- [X] T050 [P] Create cms/jest.config.js per contracts/jest-cms-config.js (for future use)
- [X] T051 [P] Add test-cms target to root Makefile (with check for custom code) per contracts/Makefile-test-targets
- [X] T052 [P] Create cms/README.md documenting testing strategy and when to add tests
- [X] T053 Update root README.md with testing section linking to specs/003-comprehensive-testing-strategy/quickstart.md
- [X] T054 Create .github/PULL_REQUEST_TEMPLATE.md mentioning test coverage requirements
- [X] T055 Verify quickstart.md accuracy: follow all commands in quickstart.md and verify they work

**Validation**:

- [X] cms/tests directory structure exists (deferred - no custom code yet)
- [X] cms/jest.config.js exists (future-ready)
- [X] root Makefile has test-cms target that handles "no tests yet" gracefully
- [X] cms/README.md documents testing strategy (exclude from 80% until custom code)
- [X] Root README.md has testing documentation section
- [X] quickstart.md commands are accurate and working

**Independent Test**: Follow all commands in specs/003-comprehensive-testing-strategy/quickstart.md - all should work as documented

---

## Phase 10: Validation & Smoke Testing

**Goal**: Comprehensive validation that all success criteria are met

**Dependencies**: All previous phases

### Tasks

- [X] T056 Validate US1: make test executes backend, frontend, shared modules
- [X] T057 Validate US2: All modules generate HTML coverage reports
- [X] T058 Validate US3: Tests fail when coverage < 80% (test by temporarily lowering threshold)
- [X] T059 Validate US4: Test categories work (unit, integration, contract)
- [X] T060 Validate performance: make test-parallel completes in < 2 minutes
- [X] T061 Validate coverage merge: make test-all generates unified report
- [X] T062 Smoke test: Run full test suite from clean state: make clean-coverage && make test-all
- [X] T063 Document any deviations from original spec in plan.md

**Validation**:

- [X] All Must Have success criteria from spec.md are met
- [X] Test execution time < 5 minutes (target: 1-2 minutes) - achieved ~20 seconds
- [X] All modules report >= 80% coverage (backend, frontend) or >= 95% type coverage (shared) - enforced
- [X] Coverage enforcement blocks merges (tests fail if threshold not met)
- [X] Parallel execution works correctly
- [X] Coverage reports are accessible and accurate

**Independent Test**: Run `make clean && make clean-coverage && make test-all` - should complete successfully with all coverage requirements met

---

## Dependencies Graph

```
Phase 1 (Setup)
  ↓
Phase 2 (Backend Config) ←┐
  ↓                        │
Phase 3 (Frontend Config) ←┤→ Independent (can run in parallel after Phase 1)
  ↓                        │
Phase 4 (Shared Config) ←─┘
  ↓
Phase 5 (Unified Test Execution)
  ↓
Phase 6 (Parallel Execution)
  ↓
Phase 7 (Coverage Merging)
  ↓
Phase 8 (Test Categories) ← Can be done earlier, but validation depends on Phase 2
  ↓
Phase 9 (Documentation) ← Independent tasks, can be done in parallel
  ↓
Phase 10 (Validation) ← Must be last
```

**Parallel Opportunities**:

- Phases 2, 3, 4 can be executed in parallel after Phase 1
- Phase 9 tasks (T049-T055) can be executed in parallel
- Tasks marked [P] within each phase can be executed in parallel

---

## Implementation Strategy

### MVP Scope (Phase 1-5)

**Goal**: Basic unified test execution

**Deliverable**:

- `make test` runs backend, frontend, and shared tests sequentially
- Backend enforces 80% coverage
- Frontend enforces 80% coverage
- Shared enforces 95% type coverage

**Time Estimate**: 2-3 hours

### Phase 2 Scope (Phase 6-7)

**Goal**: Performance optimization and unified reporting

**Deliverable**:

- `make test-parallel` runs tests concurrently (1-2 minutes)
- `make test-all` generates merged coverage report

**Time Estimate**: 1-2 hours

### Phase 3 Scope (Phase 8-10)

**Goal**: Advanced features and polish

**Deliverable**:

- Test category execution (unit, integration, etc.)
- Documentation and CMS preparation
- Full validation

**Time Estimate**: 1-2 hours

**Total Estimated Time**: 4-7 hours

---

## Task Summary

**Total Tasks**: 63

**By Phase**:

- Phase 1 (Setup): 6 tasks
- Phase 2 (Backend): 6 tasks
- Phase 3 (Frontend): 6 tasks
- Phase 4 (Shared): 6 tasks
- Phase 5 (US1 - Unified): 8 tasks
- Phase 6 (US1 - Parallel): 4 tasks
- Phase 7 (US2 - Merge): 7 tasks
- Phase 8 (US4 - Categories): 5 tasks
- Phase 9 (Polish): 7 tasks
- Phase 10 (Validation): 8 tasks

**By User Story**:

- US1 (Unified execution): 12 tasks (T025-T036)
- US2 (Coverage reports): 13 tasks (T007-T009, T013-T015, T019-T021, T037-T043)
- US3 (Enforce 80%): 9 tasks (T007, T010-T012, T016, T018, T023-T024, T058)
- US4 (Test categories): 5 tasks (T044-T048)
- Infrastructure: 24 tasks (Setup, config, documentation)

**Parallelizable Tasks**: 15 tasks marked [P]

---

## Testing Checklist

Before marking feature complete, verify:

- [ ] `make test` runs all module tests sequentially
- [ ] `make test-parallel` runs all module tests concurrently in 1-2 minutes
- [ ] `make test-all` generates merged coverage report
- [ ] Backend coverage >= 80% (enforced)
- [ ] Frontend coverage >= 80% (enforced)
- [ ] Shared type coverage >= 95% (enforced)
- [ ] Tests fail when coverage thresholds not met
- [ ] `make test-backend-fast` runs unit tests only in < 1 minute
- [ ] Coverage reports accessible: backend/htmlcov/, frontend/coverage/, coverage-merged/html/
- [ ] All commands in quickstart.md work correctly
- [ ] Documentation updated (README.md, CMS testing strategy)
- [ ] No flaky tests (all tests deterministic and reproducible)

---

## Notes

- **CMS Module**: Test infrastructure created but no tests required until custom Strapi code is added. This is justified per research.md findings (only boilerplate code exists).
- **Coverage Enforcement**: Tests will fail immediately if coverage drops below thresholds. This is intentional to enforce quality gates.
- **Parallel Execution**: Some tests may need `@pytest.mark.serial` if they share resources. This is rare and should be documented.
- **Performance**: Target is < 5 minutes for full suite. With parallelization, expect 1-2 minutes locally, 2-3 minutes in CI.
- **Type Testing**: Shared module uses tsd for compile-time type validation, not runtime tests. This is industry standard for type-only packages.

---

**Document Status**: Ready for Implementation
**Next Steps**: Begin with Phase 1 (Setup) and proceed sequentially through phases
**Questions**: Refer to specs/003-comprehensive-testing-strategy/quickstart.md for detailed usage instructions
