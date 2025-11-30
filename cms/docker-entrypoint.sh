#!/bin/sh
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

echo "🚀 Strapi CMS startup script..."

echo "  📦 Installing dependencies..."
npm install --silent --optional

#shellcheck disable=SC2154
if [ "${NODE_ENV}" = "production" ]; then
  echo "🚀 Starting Strapi CMS in production mode..."
  npm run start &
  STRAPI_PID=$!
else
  echo "🚀 Starting Strapi CMS in development mode..."
  npm run dev &
  STRAPI_PID=$!
fi

echo "⏳ Waiting for Strapi to be ready..."
MAX_RETRIES=120
RETRY_COUNT=0
while [ "${RETRY_COUNT}" -lt "${MAX_RETRIES}" ]; do
  #shellcheck disable=SC2154
  if curl -k -s -f "http://${CMS_HOST}:${CMS_PORT}/admin" >/dev/null 2>&1; then
    echo "✅ Strapi is ready!"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  sleep 2
done

if [ "${RETRY_COUNT}" -eq "${MAX_RETRIES}" ]; then
  echo "❌ Strapi failed to start within timeout"
  kill "${STRAPI_PID}" 2>/dev/null || true
  exit 1
fi

#shellcheck disable=SC2154
if [ "${NODE_ENV}" = "production" ]; then
  echo "⏭️  Skipping seed data import (production environment)"
else
  echo "📦 Checking for seed data to import..."

  if [ -f "/data/metadata.json" ] || [ -f "../data/metadata.json" ]; then
    echo "  📥 Importing seed data..."

    if [ -f "/data/metadata.json" ]; then
      DATA_PATH="/data"
    else
      DATA_PATH="../data"
    fi

    tar -cf "${DATA_PATH}/export.tar" -C "${DATA_PATH}" assets entities schemas configuration links metadata.json
    npm run data:import -- --force --file "${DATA_PATH}/export.tar"
    rm -f "${DATA_PATH}/export.tar"

    echo "  ✅ Seed data imported successfully"

    # Restart Strapi to regenerate API token (bootstrap runs again)
    echo "🔄 Restarting Strapi to regenerate API token..."
    kill "${STRAPI_PID}" 2>/dev/null || true
    wait "${STRAPI_PID}" 2>/dev/null || true

    echo "🚀 Starting Strapi after seed import..."
    npm run strapi develop &
    STRAPI_PID=$!

    echo "⏳ Waiting for Strapi to be ready..."
    RETRY_COUNT=0
    while [ "${RETRY_COUNT}" -lt "${MAX_RETRIES}" ]; do
      if curl -k -s -f "http://${CMS_HOST}:${CMS_PORT}/admin" >/dev/null 2>&1; then
        echo "✅ Strapi is ready!"
        break
      fi
      RETRY_COUNT=$((RETRY_COUNT + 1))
      sleep 2
    done

    if [ "${RETRY_COUNT}" -eq "${MAX_RETRIES}" ]; then
      echo "❌ Strapi failed to start within timeout"
      kill "${STRAPI_PID}" 2>/dev/null || true
      exit 1
    fi
  else
    echo "  ℹ️  No seed data found, skipping import"
  fi
fi

echo "✅ Strapi initialization complete"

# Create marker file to signal initialization complete
# Used by healthcheck to ensure entrypoint script finished
touch /tmp/strapi_ready

wait "${STRAPI_PID}"
