#!/usr/bin/env bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

# Get the action (full|coverage, default is full)
ACTION="${1:-full}"

if [[ "${ACTION}" = "coverage" ]]; then
  # Clean only coverage reports
  echo "🧹 Cleaning coverage reports..."
  rm -rf backend/htmlcov backend/.coverage backend/coverage.xml backend/coverage.lcov
  rm -rf coverage coverage-merged
  echo "✅ Coverage reports cleaned"

else
  # Full cleanup
  echo "🧹 Cleaning up..."

  echo "  🐳 Stopping Docker services..."
  docker-compose down -v

  echo "  🖼️ Removing Docker images..."
  docker rmi -f \
    affilibuster-strapi:latest \
    affilibuster-frontend:latest \
    affilibuster-backend:latest \
    2>/dev/null || true

  echo "  🗑️ Removing cms artifacts..."
  cd cms && npm run --silent clean
  cd ..

  echo "  🗑️ Removing backend artifacts..."
  find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
  find backend -type f -name "*.pyc" -delete 2>/dev/null || true
  rm -rf backend/.pytest_cache backend/.coverage backend/htmlcov backend/.mypy_cache backend/coverage.lcov backend/coverage.xml
  rm -rf backend/venv backend/.venv
  rm -rf backend/src/infrastructure/api/models/generated

  echo "  🗑️ Removing frontend artifacts..."
  cd frontend && npm run --silent clean
  cd ..

  echo "  🗑️ Removing build artifacts..."
  rm -rf .playwright-mcp
  find . -name "*.bak" -type f -delete 2>/dev/null || true
  find . -name "*.log" -type f -delete 2>/dev/null || true

  echo "✅ Project restored to zero state"
  echo "💡 Run 'make build' to regenerate everything"
fi
