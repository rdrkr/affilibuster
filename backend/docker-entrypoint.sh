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
if [ "${SKIP_MIGRATIONS:-0}" = "1" ]; then
  echo "  ⏭️  Skipping database migrations (SKIP_MIGRATIONS=1)"
else
  echo "  📋 Running database migrations..."
  # shellcheck disable=SC2154
  PYTHONPATH=/app/src:${PYTHONPATH} alembic upgrade head || {
    echo "❌️ Database migrations failed"
    exit 1
  }
fi

# Seed database with initial data
echo "  🌱 Seeding database..."
uv run task seed || {
  echo "❌️ Database seeding failed"
  exit 1
}

echo "✅ Backend startup complete, starting application..."

# Build SSL flags if HTTPS is enabled
SSL_FLAGS=""
# shellcheck disable=SC2154
if [ "${BACKEND_PROTOCOL}" = "https" ]; then
  echo "  🔒 HTTPS enabled - adding SSL certificates"
  SSL_FLAGS="--ssl-keyfile ${SSL_KEY_PATH} --ssl-certfile ${SSL_CERT_PATH}"
fi

# Start the application from src directory for proper module imports
# Bind to 0.0.0.0 to accept connections from all interfaces (required for healthchecks and Docker networking)
# INTERNAL_BACKEND_HOST is for inter-container communication URLs, not binding
# shellcheck disable=SC2154
# shellcheck disable=SC2086
uv run task start --host 0.0.0.0 --port "${BACKEND_PORT}" ${SSL_FLAGS}
