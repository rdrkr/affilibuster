#!/usr/bin/env bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

echo "🧹 Cleaning up..."

# Get the Docker Compose project name (defaults to directory name)
PROJECT_NAME="${COMPOSE_PROJECT_NAME:-$(basename "$(pwd)")}"
echo "  📦 Project: ${PROJECT_NAME}"

echo "  🐳 Stopping Docker services..."
docker compose down -v

echo "  🖼️ Removing Docker images for this worktree..."
# Get list of images created by this docker-compose project
IMAGES=$(docker compose images -q 2>/dev/null | sort -u)
if [[ -n "${IMAGES}" ]]; then
  # shellcheck disable=SC2086
  docker rmi -f ${IMAGES} 2>/dev/null || true
  echo "    ✓ Removed project-specific images"
else
  echo "    ℹ️ No project images found"
fi

echo "  🗑️ Removing cms artifacts..."
cd cms && npm run --silent clean && cd ..

echo "  🗑️ Removing backend artifacts..."
cd backend && uv run --quiet task clean && cd ..

echo "  🗑️ Removing frontend artifacts..."
cd frontend && npm run --silent clean && cd ..

echo "  🗑️ Removing build artifacts..."
rm -rf .playwright-mcp || true
rm -rf coverage coverage-merged || true
find . -name "*.bak" -type f -delete 2>/dev/null || true
find . -name "*.log" -type f -delete 2>/dev/null || true

echo " ✅ Project restored to zero state"
