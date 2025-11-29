#!/bin/sh
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

echo "🚀 Ecopicks startup script..."

echo "  🔐 Loading environment variables..."
#shellcheck disable=SC1091
. /app/.env

echo "  📦 Installing ecopicks dependencies and generating client..."
npm install --silent

echo "🚀 Starting ecopicks in development mode..."
npm run dev
