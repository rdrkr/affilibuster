#!/bin/bash

# Copyright (c) 2025 Affilibuster by Ronen Druker.
# Merge coverage reports from different modules
# Target: scripts/merge-coverage.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
COVERAGE_DIR="$ROOT_DIR/coverage-merged"

echo "📊 Merging coverage reports..."

# Create merged coverage directory
mkdir -p "$COVERAGE_DIR"

# Check if lcov is installed
if ! command -v lcov &>/dev/null; then
  echo "❌ Error: lcov is not installed"
  echo ""
  echo "Install with:"
  echo "  macOS:         brew install lcov"
  echo "  Ubuntu/Debian: sudo apt-get install lcov"
  echo ""
  exit 1
fi

# Find all lcov.info files
BACKEND_LCOV="$ROOT_DIR/backend/coverage.lcov"
THE_GREEN_BROTHER_LCOV="$ROOT_DIR/frontend/coverage/lcov.info"
CMS_LCOV="$ROOT_DIR/cms/coverage/lcov.info"

# Build merge arguments
MERGE_ARGS=""
FOUND_COUNT=0

if [ -f "$BACKEND_LCOV" ]; then
  MERGE_ARGS="$MERGE_ARGS -a $BACKEND_LCOV"
  FOUND_COUNT=$((FOUND_COUNT + 1))
  echo "✅ Found backend coverage"
fi

if [ -f "$THE_GREEN_BROTHER_LCOV" ]; then
  MERGE_ARGS="$MERGE_ARGS -a $THE_GREEN_BROTHER_LCOV"
  FOUND_COUNT=$((FOUND_COUNT + 1))
  echo "✅ Found frontend coverage"
fi

if [ -f "$CMS_LCOV" ]; then
  MERGE_ARGS="$MERGE_ARGS -a $CMS_LCOV"
  FOUND_COUNT=$((FOUND_COUNT + 1))
  echo "✅ Found CMS coverage"
fi

if [ $FOUND_COUNT -eq 0 ]; then
  echo "❌ No coverage files found"
  echo ""
  echo "Run tests first:"
  echo "  make test-all"
  echo ""
  exit 1
fi

echo ""
echo "Merging $FOUND_COUNT coverage report(s)..."

# Merge coverage reports
lcov $MERGE_ARGS -o "$COVERAGE_DIR/lcov.info" 2>&1 | grep -v "geninfo: WARNING" || true

# Generate HTML report
genhtml "$COVERAGE_DIR/lcov.info" \
  -o "$COVERAGE_DIR/html" \
  --title "Affilibuster Coverage" \
  --legend \
  --show-details \
  2>&1 | grep -v "genhtml: WARNING" || true

echo ""
echo "✅ Coverage reports merged successfully!"
echo "📊 View report: $COVERAGE_DIR/html/index.html"
echo ""
echo "To open in browser:"
echo "  make coverage-view"
