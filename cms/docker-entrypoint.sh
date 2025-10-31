#!/bin/sh
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

echo "🚀 Strapi CMS startup script..."

echo "  🔐 Loading environment variables..."
#shellcheck disable=SC1091
. /app/.env

echo "  📦 Installing dependencies..."
npm install --legacy-peer-deps --include=optional

echo "  🛠 Generating OpenAPI contracts..."
npm run openapi:generate

echo "  🔄 Merging and linting OpenAPI contracts..."
npx tsx ./scripts/merge-openapi.ts

echo "  🔍 Linting OpenAPI contracts..."
npx @redocly/cli lint /contracts/strapi.openapi.yaml
npx @redocly/cli lint /contracts/affilibuster.openapi.yaml

echo "🚀 Starting Strapi CMS in development mode..."
npm run develop
