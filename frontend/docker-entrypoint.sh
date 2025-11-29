#!/bin/sh
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

echo "🚀 Frontend startup script..."

echo "  🔐 Loading environment variables..."
#shellcheck disable=SC1091
. /app/.env

echo "  📦 Installing frontend dependencies and generating client..."
npm install --silent

echo "🚀 Starting frontend in development mode..."
npm run dev
