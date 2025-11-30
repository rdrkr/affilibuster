#!/bin/sh
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

echo "🚀 Backend startup script..."
cd /app || exit 1

if [ -f /app/.env ]; then
  echo "  🔐 Loading environment variables..."
  #shellcheck disable=SC1091
  . /app/.env
fi

echo "  🔄 Installing dependencies (including dev)..."
uv sync --quiet
#shellcheck disable=SC1091
. .venv/bin/activate

echo "  🔧 Generating Python models from OpenAPI specification..."
uv run task openapi-generate

echo "  📝 Generating CMS API code..."
uv run task generate-cms-api

# Function to wait for database
wait_for_db() {
  echo "  ⏳ Waiting for PostgreSQL to be ready..."
  # shellcheck disable=SC2154
  until pg_isready -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"; do
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
uv run alembic upgrade head || {
  echo "❌️ Database migrations failed"
  exit 1
}

# Seed database with initial data (required in non-production)
#shellcheck disable=SC2154
if [ "${NODE_ENV}" = "production" ]; then
  echo "  ⏭️  Skipping database seeding (production environment)"
else
  echo "  🌱 Seeding database..."
  uv run task seed || {
    echo "❌️ Database seeding failed"
    exit 1
  }
fi

echo "✅ Backend startup complete, starting application..."

# Build SSL flags if HTTPS is enabled
SSL_FLAGS=""
# shellcheck disable=SC2154
if [ "${BACKEND_PROTOCOL}" = "https" ]; then
  echo "  🔒 HTTPS enabled - adding SSL certificates"
  SSL_FLAGS="--ssl-keyfile ${SSL_KEY_PATH} --ssl-certfile ${SSL_CERT_PATH}"
fi

# Check if arguments are passed to the script
if [ "$#" -gt 0 ]; then
  # Execute the passed command
  exec "$@"
else
  # Start the application from src directory for proper module imports
  # Bind to 0.0.0.0 to accept connections from all interfaces (required for healthchecks and Docker networking)
  # INTERNAL_BACKEND_HOST is for inter-container communication URLs, not binding
  # shellcheck disable=SC2154
  # shellcheck disable=SC2086
  uv run task start --host 0.0.0.0 --port "${BACKEND_PORT}" ${SSL_FLAGS}
fi
