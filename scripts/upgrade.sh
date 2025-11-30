#!/bin/bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

##
# Dependency Upgrade Script
# Updates all npm and Python dependencies to latest versions
#
# Usage:
#   ./scripts/upgrade.sh              # Upgrade all dependencies
#   ./scripts/upgrade.sh cms          # Upgrade CMS only
#   ./scripts/upgrade.sh the-green-brother     # Upgrade the-green-brother only
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
UPGRADE_THE_GREEN_BROTHER=false
UPGRADE_BACKEND=false

case "${TARGET}" in
cms)
  UPGRADE_CMS=true
  ;;
the-green-brother)
  UPGRADE_THE_GREEN_BROTHER=true
  ;;
backend)
  UPGRADE_BACKEND=true
  ;;
all)
  UPGRADE_CMS=true
  UPGRADE_THE_GREEN_BROTHER=true
  UPGRADE_BACKEND=true
  ;;
*)
  echo "❌ Unknown target: ${TARGET}"
  echo "Valid targets: cms, the-green-brother, backend, all"
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
    rm -rf dist build node_modules

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

# === TheGreenBrother Upgrade ===
if [[ "${UPGRADE_THE_GREEN_BROTHER}" = true ]]; then
  echo -e "${BLUE}📦 Upgrading TheGreenBrother (Next.js)...${NC}"

  # Run upgrade inside TheGreenBrother container (has correct Node version)
  docker compose exec the-green-brother sh -c "
    # Update dependencies
    echo '  📥 Updating the-green-brother dependencies...'
    npm update || true

    # Clean Next.js cache
    echo '  🧹 Clearing Next.js cache...'
    rm -rf .next
  "

  echo -e "${GREEN}✅ TheGreenBrother upgrade complete${NC}"
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
