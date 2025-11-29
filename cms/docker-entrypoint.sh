#!/bin/sh
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

echo "🚀 Strapi CMS startup script..."

echo "  🔐 Loading environment variables..."
#shellcheck disable=SC1091
. /app/.env

echo "  📦 Installing dependencies..."
npm install --silent

echo "🚀 Starting Strapi CMS in development mode..."
npm run dev
