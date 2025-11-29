#!/bin/bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

##
# Dependency Upgrade Script
# Updates all npm and Python dependencies to latest versions
#
# Usage:
#   ./scripts/upgrade.sh              # Upgrade all dependencies
#   ./scripts/upgrade.sh cms          # Upgrade CMS only
#   ./scripts/upgrade.sh frontend     # Upgrade frontend only
#   ./scripts/upgrade.sh ecopicks     # Upgrade ecopicks only
#   ./scripts/upgrade.sh backend      # Upgrade backend only
##

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the target to upgrade (default: all)
TARGET="${1:-all}"

# Determine which components to upgrade
UPGRADE_CMS=false
UPGRADE_FRONTEND=false
UPGRADE_ECOPICKS=false
UPGRADE_BACKEND=false

case "${TARGET}" in
cms)
  UPGRADE_CMS=true
  ;;
frontend)
  UPGRADE_FRONTEND=true
  ;;
ecopicks)
  UPGRADE_ECOPICKS=true
  ;;
backend)
  UPGRADE_BACKEND=true
  ;;
all)
  UPGRADE_CMS=true
  UPGRADE_FRONTEND=true
  UPGRADE_ECOPICKS=true
  UPGRADE_BACKEND=true
  ;;
*)
  echo "❌ Unknown target: ${TARGET}"
  echo "Valid targets: cms, frontend, ecopicks, backend, all"
  exit 1
  ;;
esac

echo "🚀 Starting dependency upgrade..."
echo ""

# === CMS Upgrade ===
if [[ "${UPGRADE_CMS}" = true ]]; then
  echo -e "${BLUE}📦 Upgrading CMS (Strapi)...${NC}"

  # Run upgrade inside Strapi container (has correct Node version)
  docker compose exec strapi sh -c "
    # Clean previous build to avoid stale compilation issues
    echo '  🧹 Cleaning previous builds...'
    rm -rf dist build node_modules/.vite node_modules/.esbuild

    # Update dependencies
    echo '  📥 Updating CMS dependencies...'
    npm update || true

    # Clean install to ensure consistency
    echo '  🔄 Running clean install...'
    npm ci

    # Rebuild TypeScript
    echo '  🔨 Rebuilding CMS...'
    npm run build
  "

  echo -e "${GREEN}✅ CMS upgrade complete${NC}"
  echo ""
fi

# === Frontend Upgrade ===
if [[ "${UPGRADE_FRONTEND}" = true ]]; then
  echo -e "${BLUE}📦 Upgrading Frontend (Next.js)...${NC}"

  # Run upgrade inside Frontend container (has correct Node version)
  docker compose exec frontend sh -c "
    # Update dependencies
    echo '  📥 Updating frontend dependencies...'
    npm update || true

    # Clean Next.js cache
    echo '  🧹 Clearing Next.js cache...'
    rm -rf .next
  "

  echo -e "${GREEN}✅ Frontend upgrade complete${NC}"
  echo ""
fi

# === Ecopicks Upgrade ===
if [[ "${UPGRADE_ECOPICKS}" = true ]]; then
  echo -e "${BLUE}📦 Upgrading Ecopicks (Next.js)...${NC}"

  # Run upgrade inside Ecopicks container (has correct Node version)
  docker compose exec ecopicks sh -c "
    # Update dependencies
    echo '  📥 Updating ecopicks dependencies...'
    npm update || true

    # Clean Next.js cache
    echo '  🧹 Clearing Next.js cache...'
    rm -rf .next
  "

  echo -e "${GREEN}✅ Ecopicks upgrade complete${NC}"
  echo ""
fi

# === Backend Upgrade ===
if [[ "${UPGRADE_BACKEND}" = true ]]; then
  echo -e "${BLUE}📦 Upgrading Backend (Python)...${NC}"

  # Run upgrade inside Backend container (has correct Python version)
  docker compose exec backend sh -c "
    echo '  📥 Updating Python dependencies...'
    uv sync --upgrade
    echo '  ℹ️  Dependencies updated successfully'
  "

  echo -e "${GREEN}✅ Backend upgrade complete${NC}"
  echo ""
fi

# === Rebuild Docker Images ===
if [[ "${UPGRADE_CMS}" = true ]] || [[ "${UPGRADE_BACKEND}" = true ]]; then
  echo -e "${YELLOW}⚠️  Docker images may need to be rebuilt${NC}"
  echo "  Run 'docker compose up -d --build' to rebuild with new dependencies"
  echo ""
fi

echo -e "${GREEN}🎉 All dependency upgrades complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff package.json backend/uv.lock"
echo "  2. Test the application: make dev"
echo "  3. Run tests: make test-all"
echo "  4. Commit changes: git add . && git commit -m 'deps: update dependencies'"
