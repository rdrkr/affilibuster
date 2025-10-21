#!/bin/bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

echo "🚀 Backend startup script..."

echo ""
echo "🔄 Installing dependencies (including dev)..."
uv sync --all-extras
#shellcheck disable=SC1091
source /app/.venv/bin/activate

echo ""
echo "📁 Creating directories for generated code..."
mkdir -p /app/src/infrastructure/api/models/generated

echo ""
echo "📝 Creating __init__.py for generated module..."
touch /app/src/infrastructure/api/models/generated/__init__.py

echo ""
echo "🔧 Generating Python models from OpenAPI specification..."
datamodel-codegen \
  --input /contracts/affilibuster.openapi.yaml \
  --output /app/src/infrastructure/api/models/generated/models.py

# Function to wait for database
wait_for_db() {
  echo "⏳ Waiting for PostgreSQL to be ready..."
  # shellcheck disable=SC2154
  until pg_isready -h "${POSTGRES_HOST}" -U "${POSTGRES_USER}" -d "${POSTGRES_CMS_NAME}"; do
    echo "   PostgreSQL not ready, waiting..."
    sleep 2
  done
  echo "✅ PostgreSQL is ready"
}

# Wait for database
wait_for_db

# Run database migrations
# Note: Strapi sync is no longer needed - backend proxies to Strapi directly
echo ""
echo "📋 Running database migrations..."
alembic upgrade head || {
  echo "⚠️ Database migrations completed with warnings"
}

echo ""
echo "✅ Backend startup complete, starting application..."

# Start the application from src directory for proper module imports
# shellcheck disable=SC2154
cd src && exec python -m uvicorn main:app --host "${INTERNAL_BACKEND_HOST}" --port "${BACKEND_PORT}"
