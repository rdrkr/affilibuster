#!/usr/bin/env bash
# Copyright (c) 2026 Affilibuster by Ronen Druker.
#
# Daily automated backup script for Hetzner VPS.
# Combines Strapi CMS data export + PostgreSQL database dump.
#
# Setup:
#   Installed automatically by setup-vps.sh, or manually:
#   crontab -e
#   0 3 * * * /home/deploy/affilibuster/scripts/backup.sh >> /var/log/affilibuster-backup.log 2>&1
#
# Requirements:
#   - Docker running with all production services
#   - /mnt/backups/postgres directory (or it will be created)

set -euo pipefail

# Ensure tools installed in user-local bin are available
# (non-interactive SSH sessions don't source .bashrc/.profile)
export PATH="${HOME}/.local/bin:${PATH}"

# Configuration
PROJECT_DIR="/home/deploy/affilibuster"
ENV_FILE="${PROJECT_DIR}/.env.prod"
BACKUP_BRANCH="develop"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Load environment for credentials (export for child processes)
if [[ -f "${ENV_FILE}" ]]; then
  set +u
  set -a
  # shellcheck disable=SC1090
  . "${ENV_FILE}"
  set +a
  set -u
fi

# Default optional vars

# Error handler
on_error() {
  echo "[${TIMESTAMP}] ERROR: Backup failed!"
  exit 1
}
trap on_error ERR

echo "============================================"
echo "[${TIMESTAMP}] Starting daily backup..."
echo "============================================"

# ---------------------------------------------------
# Step 1: Strapi CMS data export
# ---------------------------------------------------
echo "[${TIMESTAMP}] Step 1: Exporting Strapi CMS data..."

cd "${PROJECT_DIR}"
make export-prod

STRAPI_SIZE=$(du -sh "${PROJECT_DIR}/data" | cut -f1)
echo "[${TIMESTAMP}] Strapi data exported (${STRAPI_SIZE})"

# ---------------------------------------------------
# Step 2: PostgreSQL database dump
# ---------------------------------------------------
echo "[${TIMESTAMP}] Step 2: Running PostgreSQL backup..."

bash "${PROJECT_DIR}/scripts/backup-db.sh"

# Get latest PG dump size
PG_BACKUP_DIR="/mnt/backups/postgres"
LATEST_DUMP=$(find "${PG_BACKUP_DIR}" -name "*.dump" -type f -printf '%T+ %p\n' 2>/dev/null | sort -r | head -1 | cut -d' ' -f2)
if [[ -n "${LATEST_DUMP}" ]]; then
  PG_SIZE=$(du -h "${LATEST_DUMP}" | cut -f1)
else
  PG_SIZE="unknown"
fi
echo "[${TIMESTAMP}] PostgreSQL backup complete (${PG_SIZE})"

# ---------------------------------------------------
# Step 3: Commit & push Strapi data to git
# ---------------------------------------------------
echo "[${TIMESTAMP}] Step 3: Pushing Strapi data to git (${BACKUP_BRANCH})..."

cd "${PROJECT_DIR}"

# Configure git for the backup commit
git config user.name "Affilibuster Backup"
git config user.email "backup@affilibuster.com"

# Stage only the data/ directory
git add data/

# Check if there are changes to commit
if git diff --cached --quiet; then
  echo "[${TIMESTAMP}] No changes in Strapi data, skipping git push"
  GIT_STATUS="No changes"
else
  git commit -m "backup :: daily Strapi data export (${TIMESTAMP})"

  # Fetch and integrate remote changes before pushing to avoid rejection
  git pull --rebase origin "${BACKUP_BRANCH}"

  git push origin "HEAD:${BACKUP_BRANCH}"
  echo "[${TIMESTAMP}] Strapi data pushed to ${BACKUP_BRANCH}"
  GIT_STATUS="Pushed to ${BACKUP_BRANCH}"
fi

# ---------------------------------------------------
# Step 4: Summary Output
# ---------------------------------------------------
PG_DUMP_COUNT=$(find "${PG_BACKUP_DIR}" -name "*.dump" -type f 2>/dev/null | wc -l | tr -d ' ')

echo "============================================"
echo "[${TIMESTAMP}] Daily backup complete!"
echo "  Strapi data: ${STRAPI_SIZE}"
echo "  PG dump: ${PG_SIZE}"
echo "  PG dumps on disk: ${PG_DUMP_COUNT}"
echo "  Git: ${GIT_STATUS}"
echo "============================================"

# Write stats for GitHub Actions to read
cat >"${PROJECT_DIR}/.backup_stats" <<EOF
STRAPI_SIZE="${STRAPI_SIZE}"
PG_SIZE="${PG_SIZE}"
PG_DUMP_COUNT="${PG_DUMP_COUNT}"
GIT_STATUS="${GIT_STATUS}"
EOF
