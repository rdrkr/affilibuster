#!/usr/bin/env bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -o pipefail

# Get the test mode
MODE="${1:-default}"

# Function to run backend tests
run_backend_tests() {
  local fast="${1:-false}"

  if [[ "${fast}" = "true" ]]; then
    echo "⚡ Running backend unit tests..."
    docker-compose exec -T backend bash -c "cd /app && . /app/.env && PYTHONPATH=/app/src /app/.venv/bin/python -m pytest -m \"unit\" --tb=short" 2>&1 | tee /tmp/backend-test.log
  else
    echo "🧪 Running backend tests..."
    docker-compose exec -T backend bash -c "cd /app && . /app/.env && PYTHONPATH=/app/src /app/.venv/bin/python -m pytest" 2>&1 | tee /tmp/backend-test.log
  fi

  return "${PIPESTATUS[0]}"
}

# Function to run frontend tests
run_frontend_tests() {
  echo "🧪 Running frontend tests..."
  cd frontend && npm test -- --coverage \
    --coverageReporters=lcov \
    --coverageReporters=json \
    --coverageReporters=html \
    --coverageReporters=text 2>&1 | tee /tmp/frontend-test.log
  local result="${PIPESTATUS[0]}"
  cd ..
  return "${result}"
}

# Function to run tests and display coverage summary
run_tests() {
  local run_parallel="${1:-false}"

  if [[ "${run_parallel}" = "true" ]]; then
    echo "🚀 Running all tests in parallel using available cores..."
    run_backend_tests false &
    BACKEND_PID=$!
    run_frontend_tests &
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
    run_backend_tests false || return 1

    # Run frontend tests
    run_frontend_tests || return 1
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
  FRONTEND_COV=$(grep 'Statements' /tmp/frontend-test.log | grep -oE '[0-9.]+%' | head -1 || echo "N/A")

  echo "📊 Coverage Summary:"
  printf "┌─────────────┬──────────────────────┬──────────────┬──────────────────────────────────────────────────────┐\n"
  printf "│ %-11s │ %-20s │ %-12s │ %-52s │\n" "Module" "Tests" "Coverage" "Report"
  printf "├─────────────┼──────────────────────┼──────────────┼──────────────────────────────────────────────────────┤\n"
  printf "│ %-11s │ %6s / %-6s (%3s%%) │ %12s │ %-52s │\n" "Backend" "${BACKEND_PASSED}" "${BACKEND_TOTAL}" "${BACKEND_PCT}" "${BACKEND_COV}" "file://$(pwd)/backend/htmlcov/index.html"
  printf "│ %-11s │ %6s / %-6s (%3s%%) │ %12s │ %-52s │\n" "Frontend" "${FRONTEND_PASSED}" "${FRONTEND_TOTAL}" "${FRONTEND_PCT}" "${FRONTEND_COV}" "file://$(pwd)/frontend/coverage/index.html"
  printf "└─────────────┴──────────────────────┴──────────────┴──────────────────────────────────────────────────────┘\n"
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
backend)
  run_backend_tests false || exit 1
  echo "✅ Backend tests passed!"
  ;;

backend-fast)
  run_backend_tests true || exit 1
  echo "✅ Backend unit tests passed!"
  ;;

frontend)
  run_frontend_tests || exit 1
  echo "✅ Frontend tests passed!"
  ;;

default)
  run_tests false || exit 1
  echo "✅ All tests passed!"
  display_coverage_summary
  ;;

parallel)
  run_tests true || exit 1
  echo "✅ All tests passed!"
  display_coverage_summary
  ;;

merge)
  run_tests false || exit 1
  echo "✅ All tests passed!"
  display_coverage_summary
  echo ""
  merge_coverage || exit 1
  ;;

merge-only)
  merge_coverage || exit 1
  ;;

*)
  echo "Usage: $0 {backend|backend-fast|frontend|default|parallel|merge|merge-only}"
  exit 1
  ;;
esac
