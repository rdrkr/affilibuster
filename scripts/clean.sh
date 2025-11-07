#!/usr/bin/env bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

echo "🧹 Cleaning up..."

echo "  🐳 Stopping Docker services..."
docker compose down -v

echo "  🖼️ Removing Docker images..."
docker rmi -f \
  affilibuster-strapi:latest \
  affilibuster-frontend:latest \
  affilibuster-backend:latest \
  2>/dev/null || true

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
