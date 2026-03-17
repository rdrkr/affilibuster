#!/bin/sh
# Copyright (c) 2026 Affilibuster by Ronen Druker.

set -e

# Shared Docker entrypoint for all frontend applications.
# Handles package resolution, npm install, frontend package linking, and cleanup.
#
# Usage: docker-frontend-entrypoint.sh <APP_NAME>
#   APP_NAME - Display name for log messages (e.g., "TheGreenBrother", "GentleHawk")

APP_NAME="${1:?Usage: docker-frontend-entrypoint.sh <APP_NAME>}"

echo "🚀 ${APP_NAME} startup script..."

if [ -f /app/.env ]; then
  echo "  🔐 Loading environment variables..."
  #shellcheck disable=SC1091
  . /app/.env
fi

echo "  📦 Resolving shared frontend package for Docker..."
cp /app/package.json /tmp/package.json.bak
sed -i 's|"@affilibuster/frontend": "[^"]*"|"@affilibuster/frontend": "file:/frontend"|' /app/package.json

echo "  📦 Installing ${APP_NAME} dependencies..."
npm install --silent

echo "  📦 Restoring original package.json..."
cp /tmp/package.json.bak /app/package.json

echo "  📦 Copying shared frontend package into project scope..."
rm -rf /app/frontend
cp -a /frontend/. /app/frontend/
rm -f /app/node_modules/@affilibuster/frontend
ln -sfn /app/frontend /app/node_modules/@affilibuster/frontend

# Export NODE_PATH so shared configs loaded from /frontend/ (bind mount) can
# resolve app dependencies in /app/node_modules/ (e.g., eslint.config.base.mts
# importing @eslint/js). Cannot symlink because /frontend/ is a bind mount.
export NODE_PATH=/app/node_modules

# Clean up copied frontend directory on container exit (prevents host directory pollution)
cleanup() {
  rm -rf /app/frontend
}
trap cleanup EXIT INT TERM

echo "🚀 Starting ${APP_NAME} in development mode..."
npm run dev
