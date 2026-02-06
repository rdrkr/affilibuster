#!/bin/sh
# Copyright (c) 2026 Affilibuster by Ronen Druker.

set -e

echo "Backend production startup..."
cd /app || exit 1

# Activate virtual environment
#shellcheck disable=SC1091
. .venv/bin/activate

# Wait for PostgreSQL
echo "  Waiting for PostgreSQL..."
# shellcheck disable=SC2154
until pg_isready -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"; do
  echo "    PostgreSQL not ready, waiting..."
  sleep 2
done
echo "  PostgreSQL is ready"

# Run database migrations
echo "  Running database migrations..."
# shellcheck disable=SC2154
alembic upgrade head || {
  echo "Database migrations failed"
  exit 1
}

echo "Backend startup complete, starting application..."

# Start uvicorn (plain HTTP - Caddy handles SSL termination)
# Bind to 0.0.0.0 for Docker networking and health checks
# shellcheck disable=SC2154
exec python -m uvicorn affilibuster_backend.main:app \
  --host 0.0.0.0 \
  --port "${BACKEND_PORT}" \
  --workers 2 \
  --app-dir src
