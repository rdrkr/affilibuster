#!/bin/bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

# Create databases for the platform
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Main application database (already created by POSTGRES_DB)
    -- Additional setup for affilibuster database

    -- Create CMS database
    CREATE DATABASE affilibuster_cms;
    GRANT ALL PRIVILEGES ON DATABASE affilibuster_cms TO affilibuster;

    -- Extensions for main database
    \c affilibuster
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Extensions for CMS database
    \c affilibuster_cms
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL

echo "Databases initialized successfully!"
