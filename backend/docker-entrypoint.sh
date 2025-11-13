#!/bin/sh
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

echo "🚀 Backend startup script..."
cd /app || exit 1

echo "  🔐 Loading environment variables..."
#shellcheck disable=SC1091
. /app/.env

echo "  🔄 Installing dependencies (including dev)..."
uv sync --quiet --all-extras
#shellcheck disable=SC1091
. .venv/bin/activate

echo "  🔧 Generating Python models from OpenAPI specification..."
uv run task openapi-generate

# Function to wait for database
wait_for_db() {
  echo "  ⏳ Waiting for PostgreSQL to be ready..."
  # shellcheck disable=SC2154
  until pg_isready -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_CMS_NAME}"; do
    echo "    PostgreSQL not ready, waiting..."
    sleep 2
  done
  echo "  ✅ PostgreSQL is ready"
}

# Wait for database
wait_for_db

# Run database migrations
echo "  📋 Running database migrations..."
# shellcheck disable=SC2154
PYTHONPATH=/app/src:${PYTHONPATH} alembic upgrade head || {
  echo "❌️ Database migrations completed with warnings"
  exit 1
}

echo "✅ Backend startup complete, starting application..."

# Start the application from src directory for proper module imports
# shellcheck disable=SC2154
uv run task start --host "${INTERNAL_BACKEND_HOST}" --port "${BACKEND_PORT}"
