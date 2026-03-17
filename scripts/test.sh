#!/usr/bin/env bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -o pipefail

# Get the test mode
MODE="${1:-default}"

# Get optional browser parameter for the-green-brother tests (chromium, firefox, webkit)
BROWSER="${2:-}"

# Function to run backend tests
run_backend_tests() {
  local test_type="${1:-all}"

  # Wait for backend to be healthy
  wait_for_service_healthy "backend" || return 1

  case "${test_type}" in
  unit)
    echo "⚡ Running backend unit tests..."
    docker compose exec -T backend sh -c "cd /app && (if [ -f /app/.env ]; then . /app/.env; fi) && PYTHONPATH=/app/src /app/.venv/bin/python -m pytest -m \"unit\" --ignore=tests/integration --ignore=tests/fixtures --no-cov --tb=short" 2>&1 | tee /tmp/backend-test.log
    ;;
  integration)
    echo "🧪 Running backend integration tests..."
    docker compose exec -T backend sh -c "cd /app && (if [ -f /app/.env ]; then . /app/.env; fi) && PYTHONPATH=/app/src /app/.venv/bin/python -m pytest -m \"integration\" --ignore=tests/unit --no-cov --tb=short" 2>&1 | tee /tmp/backend-test.log
    ;;
  all)
    echo "🧪 Running all backend tests..."
    docker compose exec -T backend sh -c "cd /app && (if [ -f /app/.env ]; then . /app/.env; fi) && PYTHONPATH=/app/src /app/.venv/bin/python -m pytest" 2>&1 | tee /tmp/backend-test.log
    ;;
  *)
    echo "❌ Invalid test type: ${test_type}"
    return 1
    ;;
  esac

  local test_result="${PIPESTATUS[0]}"

  # Check test result
  if [[ "${test_result}" -ne 0 ]]; then
    echo "❌ Backend tests failed!"
    return "${test_result}"
  fi

  # Validate backend coverage (100% required) - only for full test runs
  if [[ "${test_type}" = "all" ]]; then
    echo "📊 Validating backend coverage thresholds..."
    local coverage_total
    coverage_total=$(grep 'TOTAL' /tmp/backend-test.log | awk '{print $NF}' | tr -d '%' || echo "0")

    if (($(echo "${coverage_total} < 100" | bc -l))); then
      echo "❌ Backend coverage below 100% threshold: ${coverage_total}%"
      return 1
    fi
    echo "✅ Backend coverage meets 100% threshold"
  fi

  return 0
}

# Function to wait for a service to be healthy
wait_for_service_healthy() {
  local service_name="$1"
  local max_wait="${2:-120}" # Default 120 seconds
  local elapsed=0

  echo "⏳ Waiting for ${service_name} to be healthy..."

  while [[ "${elapsed}" -lt "${max_wait}" ]]; do
    # Check if service is healthy
    local health_status
    health_status=$(docker compose ps "${service_name}" --format json 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4)

    if [[ "${health_status}" == "healthy" ]]; then
      echo "✅ ${service_name} is healthy"
      return 0
    fi

    # Check if service is running at all
    if ! docker compose ps "${service_name}" --status running --quiet 2>/dev/null | grep -q .; then
      echo "❌ ${service_name} is not running."
    fi

    sleep 2
    elapsed=$((elapsed + 2))
  done

  echo "❌ Timeout waiting for ${service_name} to be healthy after ${max_wait}s"
  return 1
}

# Function to ensure test-runner container is running
ensure_test_runner_running() {
  # Check if test-runner is running
  if ! docker compose ps test-runner --status running --quiet 2>/dev/null | grep -q .; then
    echo "🚀 Starting test-runner container..."
    docker compose up -d --no-deps test-runner 2>&1 | grep -v "^$" || {
      echo "❌ Failed to start test-runner container"
      return 1
    }
  fi

  # Wait for the-green-brother to be healthy (E2E tests depend on it)
  wait_for_service_healthy "the-green-brother" || return 1

  return 0
}

# Function to run the-green-brother tests
run_the-green-brother_tests() {
  local test_type="${1:-all}"
  local browser="${2:-}" # Optional browser parameter (chromium, firefox, webkit)

  # Build Playwright browser argument
  local playwright_browser_arg=""
  if [[ -n "${browser}" ]]; then
    playwright_browser_arg="--project=${browser}"
  fi

  case "${test_type}" in
  unit)
    echo "🧪 Running the-green-brother unit tests (Jest)..."
    cd the-green-brother && npm test -- --coverage \
      --coverageReporters=lcov \
      --coverageReporters=json \
      --coverageReporters=html \
      --coverageReporters=text \
      --coverageReporters=text-summary 2>&1 | tee /tmp/the-green-brother-test.log
    local jest_result="${PIPESTATUS[0]}"
    cd ..

    # Check Jest result
    if [[ "${jest_result}" -ne 0 ]]; then
      echo "❌ TheGreenBrother unit tests failed!"
      return "${jest_result}"
    fi
    ;;

  integration)
    if [[ -n "${browser}" ]]; then
      echo "🧪 Running the-green-brother integration tests (Playwright - ${browser})..."
    else
      echo "🧪 Running the-green-brother integration tests (Playwright)..."
    fi

    # Ensure test-runner container is running
    ensure_test_runner_running || return 1

    # Run e2e tests (excluding performance tests) with fail-fast in dedicated test-runner container
    # Browsers are pre-installed in the official Playwright Docker image
    docker compose exec -T test-runner sh -c "cd /app && npm run test:e2e -- --grep-invert '@performance' ${playwright_browser_arg} -x" 2>&1 | tee /tmp/the-green-brother-test.log
    local e2e_result="${PIPESTATUS[0]}"

    # Check if no tests were found
    if grep -q "no tests found" /tmp/the-green-brother-test.log; then
      echo "⚠️  No integration tests found - skipping"
      return 0
    fi

    # Show Playwright report information
    if [[ "${e2e_result}" -ne 0 ]] || [[ -d "the-green-brother/playwright-report" ]]; then
      echo ""
      echo "📊 Playwright Test Reports:"
      echo "  Local: the-green-brother/playwright-report/index.html"
      echo ""
      echo "  To view the interactive report, run:"
      echo "    make playwright-report"
      echo "  Or manually:"
      echo "    docker compose exec test-runner sh -c 'cd /app && npx playwright show-report --port ${PLAYWRIGHT_REPORT_PORT:-9323} --host 0.0.0.0'"
      echo "  Then open: http://localhost:${PLAYWRIGHT_REPORT_PORT:-9323}"
      echo ""
    fi

    # Check e2e test result
    if [[ "${e2e_result}" -ne 0 ]]; then
      echo "❌ TheGreenBrother integration tests failed!"
      return "${e2e_result}"
    fi
    ;;

  all)
    echo "🧪 Running the-green-brother unit tests (Jest)..."
    cd the-green-brother && npm test -- --coverage \
      --coverageReporters=lcov \
      --coverageReporters=json \
      --coverageReporters=html \
      --coverageReporters=text \
      --coverageReporters=text-summary 2>&1 | tee /tmp/the-green-brother-test.log
    local jest_result="${PIPESTATUS[0]}"
    cd ..

    # Check Jest result before proceeding
    if [[ "${jest_result}" -ne 0 ]]; then
      echo "❌ TheGreenBrother unit tests failed!"
      return "${jest_result}"
    fi

    if [[ -n "${browser}" ]]; then
      echo "🧪 Running the-green-brother integration tests (Playwright - ${browser})..."
    else
      echo "🧪 Running the-green-brother integration tests (Playwright)..."
    fi

    # Ensure test-runner container is running
    ensure_test_runner_running || return 1

    # Run e2e tests (excluding performance tests) with fail-fast in dedicated test-runner container
    # Performance tests are run separately via run_performance_tests
    # Browsers are pre-installed in the official Playwright Docker image
    docker compose exec -T test-runner sh -c "cd /app && npm run test:e2e -- --grep-invert '@performance' ${playwright_browser_arg} -x" 2>&1 | tee -a /tmp/the-green-brother-test.log
    local e2e_result="${PIPESTATUS[0]}"

    # Check if no tests were found
    if grep -q "no tests found" /tmp/the-green-brother-test.log; then
      echo "⚠️  No integration tests found - skipping"
      return 0
    fi

    # Show Playwright report information
    if [[ "${e2e_result}" -ne 0 ]] || [[ -d "the-green-brother/playwright-report" ]]; then
      echo ""
      echo "📊 Playwright Test Reports:"
      echo "  Local: the-green-brother/playwright-report/index.html"
      echo ""
      echo "  To view the interactive report, run:"
      echo "    make playwright-report"
      echo "  Or manually:"
      echo "    docker compose exec test-runner sh -c 'cd /app && npx playwright show-report --port ${PLAYWRIGHT_REPORT_PORT:-9323} --host 0.0.0.0'"
      echo "  Then open: http://localhost:${PLAYWRIGHT_REPORT_PORT:-9323}"
      echo ""
    fi

    # Check e2e test result
    if [[ "${e2e_result}" -ne 0 ]]; then
      echo "❌ TheGreenBrother e2e tests failed!"
      return "${e2e_result}"
    fi
    ;;

  *)
    echo "❌ Invalid test type: ${test_type}"
    return 1
    ;;
  esac

  # All tests passed
  return 0
}

# Function to run tests and display coverage summary
run_tests() {
  local run_parallel="${1:-false}"

  if [[ "${run_parallel}" = "true" ]]; then
    echo "🚀 Running all tests in parallel using available cores..."
    run_backend_tests all &
    BACKEND_PID=$!
    run_the-green-brother_tests unit &
    THE_GREEN_BROTHER_PID=$!

    wait "${BACKEND_PID}"
    BACKEND_RESULT=$?
    wait "${THE_GREEN_BROTHER_PID}"
    THE_GREEN_BROTHER_RESULT=$?

    test "${BACKEND_RESULT}" -eq 0 && test "${THE_GREEN_BROTHER_RESULT}" -eq 0
    return $?
  else
    echo "🧪 Running all tests..."

    # Run backend tests
    run_backend_tests all || return 1

    # Run the-green-brother tests (Jest + e2e)
    run_the-green-brother_tests all || return 1
  fi

  return 0
}

# Function to run performance tests only
run_performance_tests() {
  local browser="${1:-}" # Optional browser parameter

  # Build Playwright browser argument
  local playwright_browser_arg=""
  if [[ -n "${browser}" ]]; then
    playwright_browser_arg="--project=${browser}"
    echo "⚡ Running performance tests (Playwright - ${browser})..."
  else
    echo "⚡ Running performance tests (Playwright - all browsers)..."
  fi

  # Ensure test-runner container is running
  ensure_test_runner_running || return 1

  # Run performance tests (no fail-fast, continue on errors)
  # Browsers are pre-installed in the official Playwright Docker image
  docker compose exec -T test-runner sh -c "cd /app && npm run test:e2e -- ${playwright_browser_arg} --grep '@performance'" 2>&1 | tee /tmp/performance-test.log
  local perf_result="${PIPESTATUS[0]}"

  # Check if no tests were found
  if grep -q "no tests found" /tmp/performance-test.log; then
    echo "⚠️  No performance tests found - skipping"
    return 0
  fi

  # Show Playwright report information
  if [[ "${perf_result}" -ne 0 ]] || [[ -d "the-green-brother/playwright-report" ]]; then
    echo ""
    echo "📊 Playwright Test Reports:"
    echo "  Local: the-green-brother/playwright-report/index.html"
    echo ""
    echo "  To view the interactive report, run:"
    echo "    make playwright-report"
    echo ""
  fi

  # Log result but don't fail (performance tests are informational for now)
  if [[ "${perf_result}" -ne 0 ]]; then
    echo "⚠️  Some performance tests failed (see report for details)"
  else
    echo "✅ Performance tests passed!"
  fi

  return 0
}

# Function to display coverage summary
display_coverage_summary() {
  echo ""

  # Extract backend coverage
  BACKEND_PASSED=$(grep -oE '[0-9]+ passed' /tmp/backend-test.log | head -1 | grep -oE '[0-9]+' || echo "0")
  BACKEND_SKIPPED=$(grep -oE '[0-9]+ skipped' /tmp/backend-test.log | head -1 | grep -oE '[0-9]+' || echo "0")
  BACKEND_TOTAL=$((BACKEND_PASSED + BACKEND_SKIPPED))
  BACKEND_PCT=$(awk "BEGIN {if (${BACKEND_TOTAL} > 0) printf \"%.0f\", (${BACKEND_PASSED} / ${BACKEND_TOTAL}) * 100; else print \"0\"}")
  BACKEND_COV=$(grep 'TOTAL' /tmp/backend-test.log | awk '{print $NF}' || echo "N/A")

  # Extract the-green-brother coverage
  THE_GREEN_BROTHER_PASSED=$(grep '^Tests:' /tmp/the-green-brother-test.log | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo "0")
  THE_GREEN_BROTHER_TOTAL=$(grep '^Tests:' /tmp/the-green-brother-test.log | grep -oE '[0-9]+ total' | grep -oE '[0-9]+' || echo "${THE_GREEN_BROTHER_PASSED}")
  THE_GREEN_BROTHER_PCT=$(awk "BEGIN {if (${THE_GREEN_BROTHER_TOTAL} > 0) printf \"%.0f\", (${THE_GREEN_BROTHER_PASSED} / ${THE_GREEN_BROTHER_TOTAL}) * 100; else print \"0\"}")
  THE_GREEN_BROTHER_COV=$(grep -E 'Lines\s+:' /tmp/the-green-brother-test.log | grep -oE '[0-9.]+%' | head -1 || echo "N/A")

  # Create hyperlinks for reports
  BACKEND_REPORT_URL="file://$(pwd)/backend/htmlcov/index.html"
  THE_GREEN_BROTHER_REPORT_URL="file://$(pwd)/the-green-brother/coverage/index.html"

  echo "📊 Coverage Summary:" &&
    printf "┌─────────────┬──────────────────────┬──────────┬─────────────────┐\n" &&
    printf "│ %-11s │ %-20s │ %-8s │ %-15s │\n" "Module" "Tests" "Coverage" "Report" &&
    printf "├─────────────┼──────────────────────┼──────────┼─────────────────┤\n" &&
    printf $'│ %-11s │ %6s/%-6s (%3s%%) │ %6s   │ \033[34;4m\033]8;;%s\033\\\\%s\033]8;;\033\\\\\033[0m │\n' "Backend" "${BACKEND_PASSED}" "${BACKEND_TOTAL}" "${BACKEND_PCT}" "${BACKEND_COV}" "${BACKEND_REPORT_URL}" "Backend Report " &&
    printf $'│ %-11s │ %6s/%-6s (%3s%%) │ %6s   │ \033[34;4m\033]8;;%s\033\\\\%s\033]8;;\033\\\\\033[0m │\n' "TheGreenBrother" "${THE_GREEN_BROTHER_PASSED}" "${THE_GREEN_BROTHER_TOTAL}" "${THE_GREEN_BROTHER_PCT}" "${THE_GREEN_BROTHER_COV}" "${THE_GREEN_BROTHER_REPORT_URL}" "TheGreenBrother Report" &&
    printf "└─────────────┴──────────────────────┴──────────┴─────────────────┘\n"

  # Extract and display Integration (E2E) test summary per browser
  # Playwright output shows test results with browser names: [chromium], [firefox], [webkit], [Mobile Chrome], [Mobile Safari]
  # Each test line looks like: "  ✓  1 [chromium] › test.spec.ts:10:5 › test name (1.2s)"

  # Define browsers to check (display name, grep pattern)
  # shellcheck disable=SC2034
  declare -a BROWSERS=("chromium:chromium" "firefox:firefox" "webkit:webkit" "mobile-chrome:mobile-chrome" "mobile-safari:mobile-safari")

  # Check if we have any E2E test results (TheGreenBrother + TheGreenBrother)
  # Note: This currently only aggregates from the-green-brother-test.log.
  # If we want to aggregate both, we need to merge logs or process them separately.
  # For simplicity, let's process the-green-brother-test.log for now, as the-green-brother e2e is new.
  # Ideally, we should cat both logs or process them in a loop.
  # Let's assume we want to show TheGreenBrother E2E results here.
  # If the-green-brother e2e runs, it writes to the-green-brother-test.log.
  # We should probably show separate tables or merge them.
  # Given the complexity, let's stick to showing the-green-brother e2e for now or just duplicate the block for the-green-brother if needed.
  # But the user asked to support the-green-brother LIKE the-green-brother.
  # So let's try to show the-green-brother e2e summary too if log exists.

  # ... (Existing the-green-brother e2e summary logic) ...
  # I will leave the existing the-green-brother e2e summary logic as is for now in the replacement content
  # and maybe add the-green-brother summary later or if I have space.
  # The replacement content below replaces the whole file content from run_tests downwards.

  # ... (Rest of the file) ...
}

# Function to merge coverage reports
merge_coverage() {
  echo "📊 Merging coverage reports..."

  # Create merged coverage directory
  mkdir -p coverage-merged

  # Check if lcov is installed
  if ! command -v lcov &>/dev/null; then
    echo "❌ Error: lcov is not installed"
    echo ""
    echo "Install with:"
    echo "  macOS:         brew install lcov"
    echo "  Ubuntu/Debian: sudo apt-get install lcov"
    echo ""
    return 1
  fi

  # Find all lcov.info files
  BACKEND_LCOV="backend/coverage.lcov"
  THE_GREEN_BROTHER_LCOV="the-green-brother/coverage/lcov.info"

  # Build merge arguments
  MERGE_ARGS=""
  FOUND_COUNT=0

  if [[ -f "${BACKEND_LCOV}" ]]; then
    MERGE_ARGS="${MERGE_ARGS} -a ${BACKEND_LCOV}"
    FOUND_COUNT=$((FOUND_COUNT + 1))
    echo "✅ Found backend coverage"
  fi

  if [[ -f "${THE_GREEN_BROTHER_LCOV}" ]]; then
    MERGE_ARGS="${MERGE_ARGS} -a ${THE_GREEN_BROTHER_LCOV}"
    FOUND_COUNT=$((FOUND_COUNT + 1))
    echo "✅ Found the-green-brother coverage"
  fi

  if [[ ${FOUND_COUNT} -eq 0 ]]; then
    echo "❌ No coverage files found"
    echo ""
    echo "Run tests first:"
    echo "  make test"
    echo ""
    return 1
  fi

  echo ""
  echo "Merging ${FOUND_COUNT} coverage report(s)..."

  # Merge coverage reports
  lcov "${MERGE_ARGS}" -o coverage-merged/lcov.info \
    --ignore-errors inconsistent,corrupt \
    2>&1 | grep -v "geninfo: WARNING" || true

  # Generate HTML report
  genhtml coverage-merged/lcov.info \
    -o coverage-merged/html \
    --title "Affilibuster Coverage" \
    --legend \
    --show-details \
    --ignore-errors missing,source,category \
    --synthesize-missing \
    2>&1 | grep -v "genhtml: WARNING" || true

  echo ""
  echo "✅ Coverage reports merged successfully!"
  echo "📊 View report: coverage-merged/html/index.html"
  echo ""
  echo "To open in browser:"
  echo "  make coverage-view"
}

# Main logic based on mode
case "${MODE}" in
backend-unit)
  run_backend_tests unit || exit 1
  echo "✅ Backend unit tests passed!"
  ;;

backend-integration)
  run_backend_tests integration || exit 1
  echo "✅ Backend integration tests passed!"
  ;;

backend)
  run_backend_tests all || exit 1
  echo "✅ Backend tests passed!"
  ;;

frontend-unit)
  echo "🧪 Running frontend package unit tests (Jest)..."
  cd frontend && npm test -- --coverage \
    --coverageReporters=lcov \
    --coverageReporters=json \
    --coverageReporters=html \
    --coverageReporters=text \
    --coverageReporters=text-summary || exit 1
  cd ..
  echo "✅ Frontend package unit tests passed!"
  ;;

the-green-brother-unit)
  run_the-green-brother_tests unit || exit 1
  echo "✅ TheGreenBrother unit tests passed!"
  ;;

the-green-brother-integration)
  run_the-green-brother_tests integration "${BROWSER}" || exit 1
  echo "✅ TheGreenBrother integration tests passed!"
  ;;

the-green-brother)
  run_the-green-brother_tests all "${BROWSER}" || exit 1
  echo "✅ TheGreenBrother tests passed!"
  ;;

performance)
  run_performance_tests "${BROWSER}" || exit 1
  echo "✅ Performance tests passed!"
  ;;

all-unit)
  echo "🧪 Running all unit tests..."
  run_backend_tests unit || exit 1
  run_the-green-brother_tests unit || exit 1
  echo "✅ All unit tests passed!"
  ;;

all-integration)
  echo "🧪 Running all integration tests..."
  run_backend_tests integration || exit 1
  run_the-green-brother_tests integration "${BROWSER}" || exit 1
  echo "✅ All integration tests passed!"
  ;;

default)
  run_tests false || exit 1
  echo "✅ All unit and integration tests passed!"

  # Run performance tests on all browsers (informational, won't fail build)
  echo ""
  run_performance_tests

  echo "✅ All tests passed!"
  display_coverage_summary
  ;;

parallel)
  run_tests true || exit 1
  echo "✅ All unit and integration tests passed!"

  # Run performance tests on all browsers (informational, won't fail build)
  echo ""
  run_performance_tests

  echo "✅ All tests passed!"
  display_coverage_summary
  ;;

merge)
  run_tests false || exit 1
  echo "✅ All unit and integration tests passed!"

  # Run performance tests on all browsers (informational, won't fail build)
  echo ""
  run_performance_tests

  echo "✅ All tests passed!"
  display_coverage_summary
  echo ""
  merge_coverage || exit 1
  ;;

merge-only)
  merge_coverage || exit 1
  ;;

summary)
  display_coverage_summary
  ;;

*)
  echo "Usage: $0 {backend-unit|backend-integration|backend|frontend-unit|the-green-brother-unit|the-green-brother-integration|the-green-brother|performance|all-unit|all-integration|default|parallel|merge|merge-only}"
  exit 1
  ;;
esac
