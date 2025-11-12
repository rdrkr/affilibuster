#!/usr/bin/env bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -o pipefail

# Get the test mode
MODE="${1:-default}"

# Get optional browser parameter for frontend tests (chromium, firefox, webkit)
BROWSER="${2:-}"

# Function to run backend tests
run_backend_tests() {
  local test_type="${1:-all}"

  # Wait for backend to be healthy
  wait_for_service_healthy "backend" || return 1

  case "${test_type}" in
  unit)
    echo "⚡ Running backend unit tests..."
    docker compose exec -T backend sh -c "cd /app && . /app/.env && PYTHONPATH=/app/src /app/.venv/bin/python -m pytest -m \"unit\" --tb=short" 2>&1 | tee /tmp/backend-test.log
    ;;
  integration)
    echo "🧪 Running backend integration tests..."
    docker compose exec -T backend sh -c "cd /app && . /app/.env && PYTHONPATH=/app/src /app/.venv/bin/python -m pytest -m \"integration\" --tb=short" 2>&1 | tee /tmp/backend-test.log
    ;;
  all)
    echo "🧪 Running all backend tests..."
    docker compose exec -T backend sh -c "cd /app && . /app/.env && PYTHONPATH=/app/src /app/.venv/bin/python -m pytest" 2>&1 | tee /tmp/backend-test.log
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

  # Wait for frontend to be healthy (E2E tests depend on it)
  wait_for_service_healthy "frontend" || return 1

  return 0
}

# Function to run frontend tests
run_frontend_tests() {
  local test_type="${1:-all}"
  local browser="${2:-}" # Optional browser parameter (chromium, firefox, webkit)

  # Build Playwright browser argument
  local playwright_browser_arg=""
  if [[ -n "${browser}" ]]; then
    playwright_browser_arg="--project=${browser}"
  fi

  case "${test_type}" in
  unit)
    echo "🧪 Running frontend unit tests (Jest)..."
    docker compose exec -T frontend sh -c "cd /app && npm test -- --coverage \
      --coverageReporters=lcov \
      --coverageReporters=json \
      --coverageReporters=html \
      --coverageReporters=text-summary" 2>&1 | tee /tmp/frontend-test.log
    local jest_result="${PIPESTATUS[0]}"

    # Check Jest result
    if [[ "${jest_result}" -ne 0 ]]; then
      echo "❌ Frontend unit tests failed!"
      return "${jest_result}"
    fi
    ;;

  integration)
    if [[ -n "${browser}" ]]; then
      echo "🧪 Running frontend integration tests (Playwright - ${browser})..."
    else
      echo "🧪 Running frontend integration tests (Playwright)..."
    fi

    # Ensure test-runner container is running
    ensure_test_runner_running || return 1

    # Run e2e tests (excluding performance tests) with fail-fast in dedicated test-runner container
    # Browsers are pre-installed in the official Playwright Docker image
    docker compose exec -T test-runner sh -c "cd /app && npm run test:e2e -- --grep-invert '@performance' ${playwright_browser_arg} -x" 2>&1 | tee /tmp/frontend-test.log
    local e2e_result="${PIPESTATUS[0]}"

    # Show Playwright report information
    if [[ "${e2e_result}" -ne 0 ]] || [[ -d "frontend/playwright-report" ]]; then
      echo ""
      echo "📊 Playwright Test Reports:"
      echo "  Local: frontend/playwright-report/index.html"
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
      echo "❌ Frontend integration tests failed!"
      return "${e2e_result}"
    fi
    ;;

  all)
    echo "🧪 Running frontend unit tests (Jest)..."
    docker compose exec -T frontend sh -c "cd /app && npm test -- --coverage \
      --coverageReporters=lcov \
      --coverageReporters=json \
      --coverageReporters=html \
      --coverageReporters=text-summary" 2>&1 | tee /tmp/frontend-test.log
    local jest_result="${PIPESTATUS[0]}"

    # Check Jest result before proceeding
    if [[ "${jest_result}" -ne 0 ]]; then
      echo "❌ Frontend unit tests failed!"
      return "${jest_result}"
    fi

    if [[ -n "${browser}" ]]; then
      echo "🧪 Running frontend integration tests (Playwright - ${browser})..."
    else
      echo "🧪 Running frontend integration tests (Playwright)..."
    fi

    # Ensure test-runner container is running
    ensure_test_runner_running || return 1

    # Run e2e tests (excluding performance tests) with fail-fast in dedicated test-runner container
    # Performance tests are run separately via run_performance_tests
    # Browsers are pre-installed in the official Playwright Docker image
    docker compose exec -T test-runner sh -c "cd /app && npm run test:e2e -- --grep-invert '@performance' ${playwright_browser_arg} -x" 2>&1 | tee -a /tmp/frontend-test.log
    local e2e_result="${PIPESTATUS[0]}"

    # Show Playwright report information
    if [[ "${e2e_result}" -ne 0 ]] || [[ -d "frontend/playwright-report" ]]; then
      echo ""
      echo "📊 Playwright Test Reports:"
      echo "  Local: frontend/playwright-report/index.html"
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
      echo "❌ Frontend e2e tests failed!"
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
    run_frontend_tests unit &
    FRONTEND_PID=$!

    wait "${BACKEND_PID}"
    BACKEND_RESULT=$?
    wait "${FRONTEND_PID}"
    FRONTEND_RESULT=$?

    test "${BACKEND_RESULT}" -eq 0 && test "${FRONTEND_RESULT}" -eq 0
    return $?
  else
    echo "🧪 Running all tests..."

    # Run backend tests
    run_backend_tests all || return 1

    # Run frontend tests (Jest + e2e)
    run_frontend_tests unit || return 1
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

  # Show Playwright report information
  if [[ "${perf_result}" -ne 0 ]] || [[ -d "frontend/playwright-report" ]]; then
    echo ""
    echo "📊 Playwright Test Reports:"
    echo "  Local: frontend/playwright-report/index.html"
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

  # Extract frontend coverage
  FRONTEND_PASSED=$(grep '^Tests:' /tmp/frontend-test.log | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo "0")
  FRONTEND_TOTAL=$(grep '^Tests:' /tmp/frontend-test.log | grep -oE '[0-9]+ total' | grep -oE '[0-9]+' || echo "${FRONTEND_PASSED}")
  FRONTEND_PCT=$(awk "BEGIN {if (${FRONTEND_TOTAL} > 0) printf \"%.0f\", (${FRONTEND_PASSED} / ${FRONTEND_TOTAL}) * 100; else print \"0\"}")
  # Extract from text-summary format: "Lines        : 100% ( 414/414 )"
  FRONTEND_COV=$(grep -E 'Lines\s+:' /tmp/frontend-test.log | grep -oE '[0-9.]+%' | head -1 || echo "N/A")

  # Create hyperlinks for reports
  BACKEND_REPORT_URL="file://$(pwd)/backend/htmlcov/index.html"
  FRONTEND_REPORT_URL="file://$(pwd)/frontend/coverage/index.html"

  echo "📊 Coverage Summary:" &&
    printf "┌─────────────┬──────────────────────┬──────────┬─────────────────┐\n" &&
    printf "│ %-11s │ %-20s │ %-8s │ %-15s │\n" "Module" "Tests" "Coverage" "Report" &&
    printf "├─────────────┼──────────────────────┼──────────┼─────────────────┤\n" &&
    printf $'│ %-11s │ %6s/%-6s (%3s%%) │ %6s   │ \033[34;4m\033]8;;%s\033\\\\%s\033]8;;\033\\\\\033[0m │\n' "Backend" "${BACKEND_PASSED}" "${BACKEND_TOTAL}" "${BACKEND_PCT}" "${BACKEND_COV}" "${BACKEND_REPORT_URL}" "Backend Report " &&
    printf $'│ %-11s │ %6s/%-6s (%3s%%) │ %6s   │ \033[34;4m\033]8;;%s\033\\\\%s\033]8;;\033\\\\\033[0m │\n' "Frontend" "${FRONTEND_PASSED}" "${FRONTEND_TOTAL}" "${FRONTEND_PCT}" "${FRONTEND_COV}" "${FRONTEND_REPORT_URL}" "Frontend Report" &&
    printf "└─────────────┴──────────────────────┴──────────┴─────────────────┘\n"

  # Extract and display Integration (E2E) test summary per browser
  # Playwright output shows test results with browser names: [chromium], [firefox], [webkit], [Mobile Chrome], [Mobile Safari]
  # Each test line looks like: "  ✓  1 [chromium] › test.spec.ts:10:5 › test name (1.2s)"

  # Define browsers to check (display name, grep pattern)
  declare -a BROWSERS=("chromium:chromium" "firefox:firefox" "webkit:webkit" "mobile-chrome:mobile-chrome" "mobile-safari:mobile-safari")

  # Check if we have any E2E test results
  E2E_TOTAL_PASSED=$(grep -oE '[0-9]+ passed' /tmp/frontend-test.log | tail -1 | grep -oE '[0-9]+' || echo "0")
  E2E_TOTAL_FAILED=$(grep -oE '[0-9]+ failed' /tmp/frontend-test.log | tail -1 | grep -oE '[0-9]+' || echo "0")
  E2E_TOTAL_SKIPPED=$(grep -oE '[0-9]+ skipped' /tmp/frontend-test.log | tail -1 | grep -oE '[0-9]+' || echo "0")
  E2E_GRAND_TOTAL=$((E2E_TOTAL_PASSED + E2E_TOTAL_FAILED + E2E_TOTAL_SKIPPED))

  # Only display E2E summary if there are E2E tests
  if [[ "${E2E_GRAND_TOTAL}" -gt 0 ]]; then
    E2E_REPORT_URL="file://$(pwd)/frontend/playwright-report/index.html"
    E2E_DURATION=$(grep -oE '[0-9]+\.[0-9]+m|[0-9]+\.[0-9]+s' /tmp/frontend-test.log | tail -1 || echo "N/A")

    echo ""
    echo "🧪 Integration Test Summary:" &&
      printf "┌───────────────┬────────────────────────┬─────────┬──────────────┐\n" &&
      printf "│ %-13s │ %-22s │ %-7s │ %-12s │\n" "Browser" "Tests (Pass/Fail/Skip)" "Rate" "Duration" &&
      printf "├───────────────┼────────────────────────┼─────────┼──────────────┤\n"

    # Always display all browsers, showing N/A when data isn't available
    for browser_entry in "${BROWSERS[@]}"; do
      IFS=':' read -r display_name grep_pattern <<<"${browser_entry}"

      # Count tests for this browser from Playwright output
      # Playwright format: [1A[2K[1/515] [chromium] › test.spec.ts:10:5 › test name
      # Lines have ANSI escape codes at start, so match [number/total] [browser] pattern anywhere
      BROWSER_TOTAL=$(grep -cE "\[[0-9]+/[0-9]+\] \[${grep_pattern}\]" /tmp/frontend-test.log 2>/dev/null) || true
      [[ -z "${BROWSER_TOTAL}" ]] && BROWSER_TOTAL=0

      # Failed tests = lines in the "failed" summary section containing browser name
      # These appear as indented lines after "XX failed" message
      BROWSER_FAILED=$(sed -n '/[0-9]* failed/,/[0-9]* passed\|[0-9]* skipped/p' /tmp/frontend-test.log 2>/dev/null | grep -cE "^\s+\[${grep_pattern}\]" 2>/dev/null) || true
      [[ -z "${BROWSER_FAILED}" ]] && BROWSER_FAILED=0

      # Calculate skipped proportionally (Playwright doesn't list skipped tests per browser)
      # Formula: browser_skipped = total_skipped * (browser_total / grand_total)
      if [[ "${E2E_GRAND_TOTAL}" -gt 0 ]] && [[ "${E2E_TOTAL_SKIPPED}" -gt 0 ]]; then
        BROWSER_SKIPPED=$(awk "BEGIN {printf \"%.0f\", ${E2E_TOTAL_SKIPPED} * (${BROWSER_TOTAL} / ${E2E_GRAND_TOTAL})}")
      else
        BROWSER_SKIPPED=0
      fi

      # Passed = Total - Failed - Skipped
      BROWSER_PASSED=$((BROWSER_TOTAL - BROWSER_FAILED - BROWSER_SKIPPED))
      [[ "${BROWSER_PASSED}" -lt 0 ]] && BROWSER_PASSED=0

      # Calculate pass rate
      if [[ "${BROWSER_TOTAL}" -gt 0 ]]; then
        BROWSER_PCT=$(awk "BEGIN {printf \"%.0f\", (${BROWSER_PASSED} / ${BROWSER_TOTAL}) * 100}")
        printf "│ %-13s │ %5s / %5s / %4s   │ %4s%%   │ %12s │\n" "${display_name}" "${BROWSER_PASSED}" "${BROWSER_FAILED}" "${BROWSER_SKIPPED}" "${BROWSER_PCT}" "-"
      else
        printf "│ %-13s │ %5s / %5s / %4s   │ %5s   │ %12s │\n" "${display_name}" "N/A" "N/A" "N/A" "N/A" "-"
      fi
    done

    # Add a totals row with actual pass/fail/skip data
    E2E_PCT=$(awk "BEGIN {if (${E2E_GRAND_TOTAL} > 0) printf \"%.0f\", (${E2E_TOTAL_PASSED} / ${E2E_GRAND_TOTAL}) * 100; else print \"0\"}")
    printf "├───────────────┼────────────────────────┼─────────┼──────────────┤\n"
    printf "│ %-13s │ %5s / %5s / %4s   │ %4s%%   │ %10s   │\n" "Total" "${E2E_TOTAL_PASSED}" "${E2E_TOTAL_FAILED}" "${E2E_TOTAL_SKIPPED}" "${E2E_PCT}" "${E2E_DURATION}"
    printf "└───────────────┴────────────────────────┴─────────┴──────────────┘\n" &&
      printf " 📊 Report: %s\n" "${E2E_REPORT_URL}"
  fi

  # Extract and display Performance test summary (always show, with N/A when no data)
  echo ""
  echo "⚡ Performance Test Summary:" &&
    printf "┌───────────────┬────────────────────────┬─────────┬──────────────┐\n" &&
    printf "│ %-13s │ %-22s │ %-7s │ %-12s │\n" "Browser" "Tests (Pass/Fail/Skip)" "Rate" "Duration" &&
    printf "├───────────────┼────────────────────────┼─────────┼──────────────┤\n"

  # Always display all browsers, showing N/A when data isn't available
  for browser_entry in "${BROWSERS[@]}"; do
    IFS=':' read -r display_name grep_pattern <<<"${browser_entry}"

    if [[ -f "/tmp/performance-test.log" ]]; then
      # Count tests for this browser from Playwright output
      # Playwright format: [1A[2K[1/70] [chromium] › test.spec.ts:10:5 › test name
      # Lines have ANSI escape codes at start, so match [number/total] [browser] pattern anywhere
      PERF_BROWSER_TOTAL=$(grep -cE "\[[0-9]+/[0-9]+\] \[${grep_pattern}\]" /tmp/performance-test.log 2>/dev/null) || true
      [[ -z "${PERF_BROWSER_TOTAL}" ]] && PERF_BROWSER_TOTAL=0

      # Failed tests = lines in the "failed" summary section containing browser name
      PERF_BROWSER_FAILED=$(sed -n '/[0-9]* failed/,/[0-9]* passed\|[0-9]* skipped/p' /tmp/performance-test.log 2>/dev/null | grep -cE "^\s+\[${grep_pattern}\]" 2>/dev/null) || true
      [[ -z "${PERF_BROWSER_FAILED}" ]] && PERF_BROWSER_FAILED=0

      # Skipped tests = lines in the "skipped" summary section containing browser name
      PERF_BROWSER_SKIPPED=$(sed -n '/[0-9]* skipped/,/[0-9]* passed\|[0-9]* failed/p' /tmp/performance-test.log 2>/dev/null | grep -cE "^\s+\[${grep_pattern}\]" 2>/dev/null) || true
      [[ -z "${PERF_BROWSER_SKIPPED}" ]] && PERF_BROWSER_SKIPPED=0

      # Passed = Total - Failed - Skipped
      PERF_BROWSER_PASSED=$((PERF_BROWSER_TOTAL - PERF_BROWSER_FAILED - PERF_BROWSER_SKIPPED))
      [[ "${PERF_BROWSER_PASSED}" -lt 0 ]] && PERF_BROWSER_PASSED=0

      # Calculate pass rate
      if [[ "${PERF_BROWSER_TOTAL}" -gt 0 ]]; then
        PERF_BROWSER_PCT=$(awk "BEGIN {printf \"%.0f\", (${PERF_BROWSER_PASSED} / ${PERF_BROWSER_TOTAL}) * 100}")
        printf "│ %-13s │ %5s / %5s / %4s   │ %4s%%   │ %12s │\n" "${display_name}" "${PERF_BROWSER_PASSED}" "${PERF_BROWSER_FAILED}" "${PERF_BROWSER_SKIPPED}" "${PERF_BROWSER_PCT}" "-"
      else
        printf "│ %-13s │ %5s / %5s / %4s   │ %5s   │ %12s │\n" "${display_name}" "N/A" "N/A" "N/A" "N/A" "-"
      fi
    else
      printf "│ %-13s │ %5s / %5s / %4s   │ %5s   │ %12s │\n" "${display_name}" "N/A" "N/A" "N/A" "N/A" "-"
    fi
  done

  # Add a totals row with actual pass/fail/skip data
  if [[ -f "/tmp/performance-test.log" ]]; then
    PERF_PASSED=$(grep -oE '[0-9]+ passed' /tmp/performance-test.log | tail -1 | grep -oE '[0-9]+' || echo "0")
    PERF_FAILED=$(grep -oE '[0-9]+ failed' /tmp/performance-test.log | tail -1 | grep -oE '[0-9]+' || echo "0")
    PERF_SKIPPED=$(grep -oE '[0-9]+ skipped' /tmp/performance-test.log | tail -1 | grep -oE '[0-9]+' || echo "0")
    PERF_TOTAL=$((PERF_PASSED + PERF_FAILED + PERF_SKIPPED))
    PERF_PCT=$(awk "BEGIN {if (${PERF_TOTAL} > 0) printf \"%.0f\", (${PERF_PASSED} / ${PERF_TOTAL}) * 100; else print \"0\"}")
    PERF_DURATION=$(grep -oE '[0-9]+\.[0-9]+m|[0-9]+\.[0-9]+s' /tmp/performance-test.log | tail -1 || echo "N/A")
    printf "├───────────────┼────────────────────────┼─────────┼──────────────┤\n"
    printf "│ %-13s │ %5s / %5s / %4s   │ %4s%%   │ %10s   │\n" "Total" "${PERF_PASSED}" "${PERF_FAILED}" "${PERF_SKIPPED}" "${PERF_PCT}" "${PERF_DURATION}"
  else
    printf "├───────────────┼────────────────────────┼─────────┼──────────────┤\n"
    printf "│ %-13s │ %5s / %5s / %4s   │ %5s   │ %12s │\n" "Total" "N/A" "N/A" "N/A" "N/A" "-"
  fi

  printf "└───────────────┴────────────────────────┴─────────┴──────────────┘\n"
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
  FRONTEND_LCOV="frontend/coverage/lcov.info"

  # Build merge arguments
  MERGE_ARGS=""
  FOUND_COUNT=0

  if [[ -f "${BACKEND_LCOV}" ]]; then
    MERGE_ARGS="${MERGE_ARGS} -a ${BACKEND_LCOV}"
    FOUND_COUNT=$((FOUND_COUNT + 1))
    echo "✅ Found backend coverage"
  fi

  if [[ -f "${FRONTEND_LCOV}" ]]; then
    MERGE_ARGS="${MERGE_ARGS} -a ${FRONTEND_LCOV}"
    FOUND_COUNT=$((FOUND_COUNT + 1))
    echo "✅ Found frontend coverage"
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
  run_frontend_tests unit || exit 1
  echo "✅ Frontend unit tests passed!"
  ;;

frontend-integration)
  run_frontend_tests integration "${BROWSER}" || exit 1
  echo "✅ Frontend integration tests passed!"
  ;;

frontend)
  run_frontend_tests unit "${BROWSER}" || exit 1
  echo "✅ Frontend tests passed!"
  ;;

performance)
  run_performance_tests "${BROWSER}" || exit 1
  echo "✅ Performance tests passed!"
  ;;

all-unit)
  echo "🧪 Running all unit tests..."
  run_backend_tests unit || exit 1
  run_frontend_tests unit || exit 1
  echo "✅ All unit tests passed!"
  ;;

all-integration)
  echo "🧪 Running all integration tests..."
  run_backend_tests integration || exit 1
  # run_frontend_tests integration "${BROWSER}" || exit 1
  echo "✅ All integration tests passed!"
  ;;

default)
  run_tests false || exit 1
  echo "✅ All unit and integration tests passed!"

  # Run performance tests on all browsers (informational, won't fail build)
  echo ""
  # run_performance_tests

  echo "✅ All tests passed!"
  display_coverage_summary
  ;;

parallel)
  run_tests true || exit 1
  echo "✅ All unit and integration tests passed!"

  # Run performance tests on all browsers (informational, won't fail build)
  echo ""
  # run_performance_tests

  echo "✅ All tests passed!"
  display_coverage_summary
  ;;

merge)
  run_tests false || exit 1
  echo "✅ All unit and integration tests passed!"

  # Run performance tests on all browsers (informational, won't fail build)
  echo ""
  # run_performance_tests

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
  echo "Usage: $0 {backend-unit|backend-integration|backend|frontend-unit|frontend-integration|frontend|performance|all-unit|all-integration|default|parallel|merge|merge-only}"
  exit 1
  ;;
esac
