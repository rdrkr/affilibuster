#!/bin/sh
# Copyright (c) 2026 Affilibuster by Ronen Druker.
#
# Automated PostgreSQL backup script for Hetzner VPS.
# Designed to run via cron at 3 AM UTC daily.
#
# Setup:
#   crontab -e
#   0 3 * * * /home/deploy/affilibuster/scripts/backup-db.sh >> /var/log/backup-db.log 2>&1
#
# Requirements:
#   - Docker running with postgres container
#   - Backup volume mounted at /mnt/backups (Hetzner Cloud Volume)

set -e

# Configuration
BACKUP_DIR="/mnt/backups/postgres"
RETENTION_DAYS=30
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
COMPOSE_FILE="/home/deploy/affilibuster/docker-compose.prod.yaml"

# Load environment for database credentials
if [ -f /home/deploy/affilibuster/.env.prod ]; then
  # shellcheck disable=SC1091
  . /home/deploy/affilibuster/.env.prod
fi

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Database credentials from environment
DB_NAME="${POSTGRES_DB:-affilibuster_db}"
DB_USER="${POSTGRES_USER:-affilibuster}"

BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.dump"

echo "[$(date)] Starting PostgreSQL backup..."

# Create backup using pg_dump inside the postgres container
docker compose -f "${COMPOSE_FILE}" exec -T postgres \
  pg_dump -U "${DB_USER}" -d "${DB_NAME}" -Fc --no-owner --no-privileges \
  >"${BACKUP_FILE}"

# Verify backup file is not empty
if [ ! -s "${BACKUP_FILE}" ]; then
  echo "[$(date)] ERROR: Backup file is empty!"
  rm -f "${BACKUP_FILE}"
  exit 1
fi

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date)] Backup created: ${BACKUP_FILE} (${BACKUP_SIZE})"

# Clean up old backups beyond retention period
echo "[$(date)] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "*.dump" -type f -mtime +"${RETENTION_DAYS}" -delete

REMAINING=$(find "${BACKUP_DIR}" -name "*.dump" -type f | wc -l | tr -d ' ')
echo "[$(date)] Backup complete. ${REMAINING} backups on disk."
