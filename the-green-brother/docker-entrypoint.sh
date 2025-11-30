#!/bin/sh
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

echo "🚀 TheGreenBrother startup script..."

if [ -f /app/.env ]; then
  echo "  🔐 Loading environment variables..."
  #shellcheck disable=SC1091
  . /app/.env
fi

echo "  📦 Installing the-green-brother dependencies and generating client..."
npm install --silent

echo "🚀 Starting the-green-brother in development mode..."
npm run dev
