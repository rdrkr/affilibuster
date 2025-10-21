#!/usr/bin/env bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

# Get the action (full|coverage, default is full)
ACTION="${1:-full}"

if [[ "${ACTION}" = "coverage" ]]; then
  # Clean only coverage reports
  echo "🧹 Cleaning coverage reports..."
  rm -rf backend/htmlcov backend/.coverage backend/coverage.xml backend/coverage.lcov
  rm -rf frontend/coverage
  rm -rf coverage coverage-merged
  echo "✅ Coverage reports cleaned"

else
  # Full cleanup
  echo "🧹 Cleaning up to zero state..."

  echo "  🐳 Stopping Docker services..."
  docker-compose down -v
  echo "  🖼️ Removing Docker images..."
  # shellcheck disable=SC2046
  docker rmi $(docker images -q) 2>/dev/null || true

  echo "  🗑️ Removing Python artifacts..."
  find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
  find backend -type f -name "*.pyc" -delete 2>/dev/null || true
  rm -rf backend/.pytest_cache backend/.coverage backend/htmlcov backend/.mypy_cache backend/coverage.lcov backend/coverage.xml
  rm -rf backend/venv backend/.venv

  echo "  🗑️ Removing Node.js artifacts..."
  rm -rf frontend/node_modules frontend/.next frontend/coverage frontend/test-results frontend/tsconfig.tsbuildinfo frontend/next-env.d.ts frontend/.swc frontend/playwright-report
  rm -rf cms/node_modules cms/build cms/.tmp cms/.strapi cms/dist cms/public cms/types

  echo "  🗑️ Removing build output..."
  rm -rf .playwright-mcp
  rm -rf dist

  echo "  🗑️ Removing generated code (OpenAPI)..."
  rm -rf backend/src/infrastructure/api/models/generated
  rm -rf backend/src/infrastructure/cms/generated
  rm -f contracts/strapi.openapi.yaml
  rm -f contracts/affilibuster.openapi.yaml
  rm -f contracts/bundled.openapi.yaml
  rm -rf frontend/src/lib/generated

  echo "  🗑️ Removing backup files..."
  find . -name "*.bak" -type f -delete 2>/dev/null || true

  echo "✅ Project restored to zero state"
  echo "💡 Run 'make build' to regenerate everything"
fi
