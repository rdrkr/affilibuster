#!/bin/bash

# Copyright (c) 2025 Affilibuster by Ronen Druker.

# Start all Affilibuster services via docker compose
# Usage:
#   ./scripts/build.sh          - Start all services
#   ./scripts/build.sh --build  - Rebuild and start all services

set -e

# Load environment variables from .env if available
if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  . .env
fi

# shellcheck disable=SC2154
CMS_URL="${CMS_PROTOCOL}://${CMS_HOST}:${CMS_PORT}"
# shellcheck disable=SC2154
BACKEND_URL="${BACKEND_PROTOCOL}://${BACKEND_HOST}:${BACKEND_PORT}"
# shellcheck disable=SC2154
THE_GREEN_BROTHER_URL="${THE_GREEN_BROTHER_PROTOCOL}://${THE_GREEN_BROTHER_HOST}:${THE_GREEN_BROTHER_PORT}"

# Parse arguments
BUILD_FLAG=""
if [[ "$1" = "--build" ]]; then
  BUILD_FLAG="--build"
  echo "🔨 Build mode enabled (will rebuild containers)"
fi

echo "🚀 Starting Affilibuster Services..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${PROJECT_ROOT}"

# Cleanup function
cleanup() {
  echo ""
  echo "🛑 Shutting down services..."
  docker compose down
  echo "✅ All services stopped"
  exit 0
}

if [[ "${BUILD_FLAG}" == "--build" ]]; then
  # Register cleanup function for Ctrl+C and script exit (normal mode)
  trap cleanup SIGINT SIGTERM EXIT
else
  # Register cleanup function only for Ctrl+C (build mode - don't cleanup on exit)
  trap cleanup SIGINT SIGTERM
fi

# Kill any processes using our ports
kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti :"${port}" 2>/dev/null || true)

  if [[ -n "${pids}" ]]; then
    echo "🔧 Killing existing process on port ${port}..."
    echo "${pids}" | xargs kill 2>/dev/null || true
    sleep 1
  fi
}

# Kill existing instances on our ports
echo "🔍 Checking for existing instances..."
# shellcheck disable=SC2154
kill_port "${THE_GREEN_BROTHER_PORT}" # TheGreenBrother
# shellcheck disable=SC2154
kill_port "${BACKEND_PORT}" # Backend
# shellcheck disable=SC2154
kill_port "${CMS_PORT}" # Strapi

# Start all services via the-green-brother (docker compose dependency chain handles startup order)
# HTTPS mode (default): strapi-proxy runs for SSL termination
# HTTP mode (CI): uses docker-compose.ci.yaml override to bypass strapi-proxy
COMPOSE_FILES="-f docker-compose.yaml"
if [[ "${CMS_PROTOCOL}" == "https" ]]; then
  echo "🔒 HTTPS mode - using strapi-proxy for SSL termination"
else
  COMPOSE_FILES="${COMPOSE_FILES} -f docker-compose.ci.yaml"
  echo "🔓 HTTP mode - connecting directly to strapi (no SSL proxy)"
fi

# shellcheck disable=SC2248,SC2086
docker compose ${COMPOSE_FILES} up ${BUILD_FLAG} -d the-green-brother

echo ""
echo "✅ Services started (containers initializing, may take 30-60 seconds)!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Access your applications:"
echo "  🌿 TheGreenBrother:       ${THE_GREEN_BROTHER_URL}"
echo "  🔌 Backend API:    ${BACKEND_URL}"
echo "  📚 API Docs:       ${BACKEND_URL}/docs"
echo "  🎨 CMS Admin:      ${CMS_URL}/admin"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Service Status:"
# shellcheck disable=SC2154
echo "  - PostgreSQL:      Running (port ${POSTGRES_PORT})"
# shellcheck disable=SC2154
echo "  - Redis:           Running (port ${REDIS_PORT})"
# shellcheck disable=SC2154
echo "  - Backend API:     Running (port ${BACKEND_PORT})"
# shellcheck disable=SC2154
echo "  - Strapi CMS:      Running (port ${CMS_PORT})"
# shellcheck disable=SC2154
echo "  - TheGreenBrother:        Running (port ${THE_GREEN_BROTHER_PORT})"
echo ""
echo "💡 Tips:"
echo "  - View logs: docker compose logs -f [service]"
echo "  - Stop services: docker compose down"
echo "  - Run tests: make test"
echo ""
