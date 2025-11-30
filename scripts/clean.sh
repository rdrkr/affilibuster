#!/usr/bin/env bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

echo "🧹 Cleaning up..."

# Get the Docker Compose project name (defaults to directory name)
PROJECT_NAME="${COMPOSE_PROJECT_NAME:-$(basename "$(pwd)")}"
echo "  📦 Project: ${PROJECT_NAME}"

echo "  🖼️ Capturing Docker images for removal..."
# Get list of images BEFORE removing containers (docker compose images needs running context)
IMAGES=$(docker compose images -q 2>/dev/null | sort -u)
if [[ -n "${IMAGES}" ]]; then
  echo "    ℹ️ Found $(echo "${IMAGES}" | wc -l | tr -d ' ') image(s) to remove"
else
  echo "    ℹ️ No project images found"
fi

echo "  🐳 Stopping Docker services and removing containers, networks, volumes..."
docker compose down -v --remove-orphans

if [[ -n "${IMAGES}" ]]; then
  echo "  🗑️ Removing Docker images..."
  # shellcheck disable=SC2086
  docker rmi -f ${IMAGES} 2>/dev/null || true
  echo "    ✓ Removed project-specific images"
fi

echo "  🗑️ Removing Docker build cache for this project..."
# Remove build cache associated with this project's images
# This only removes buildx cache for images we just deleted, not global cache
docker builder prune --filter "label=com.docker.compose.project=${PROJECT_NAME}" -f 2>/dev/null || true

echo "  📦 Removing dangling/unused project volumes..."
# Remove only volumes created by this compose project (already removed by -v flag above)
# This command catches any orphaned volumes with our project name
docker volume ls -q --filter "label=com.docker.compose.project=${PROJECT_NAME}" 2>/dev/null | while read -r vol; do
  docker volume rm "${vol}" 2>/dev/null || true
done

echo "  🌐 Removing project-specific networks..."
# Remove networks created by this compose project
docker network ls -q --filter "label=com.docker.compose.project=${PROJECT_NAME}" 2>/dev/null | while read -r net; do
  docker network rm "${net}" 2>/dev/null || true
done

echo "  🗑️ Removing cms artifacts..."
cd cms && npm run --silent clean && cd ..

echo "  🗑️ Removing backend artifacts..."
cd backend && uv run --quiet task clean && cd ..

echo "  🗑️ Removing the-green-brother artifacts..."
cd the-green-brother && npm run --silent clean && cd ..

echo "  🗑️ Removing build artifacts..."
rm -rf .playwright-mcp || true
rm -rf coverage coverage-merged || true
find . -name "*.bak" -type f -delete 2>/dev/null || true
find . -name "*.log" -type f -delete 2>/dev/null || true

echo " ✅ Project restored to zero state"
