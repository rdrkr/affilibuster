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
#   - .env.prod with UPTIME_KUMA_TELEGRAM_BOT_TOKEN and UPTIME_KUMA_TELEGRAM_CHAT_ID (optional, for notifications)
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

# Default optional vars (Telegram notifications)
UPTIME_KUMA_TELEGRAM_BOT_TOKEN="${UPTIME_KUMA_TELEGRAM_BOT_TOKEN:-}"
UPTIME_KUMA_TELEGRAM_CHAT_ID="${UPTIME_KUMA_TELEGRAM_CHAT_ID:-}"

# Telegram notification helper
send_telegram() {
  message="$1"
  if [[ -n "${UPTIME_KUMA_TELEGRAM_BOT_TOKEN}" ]] && [[ -n "${UPTIME_KUMA_TELEGRAM_CHAT_ID}" ]]; then
    curl -sf -X POST \
      "https://api.telegram.org/bot${UPTIME_KUMA_TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${UPTIME_KUMA_TELEGRAM_CHAT_ID}" \
      -d "text=${message}" \
      -d "parse_mode=HTML" \
      >/dev/null 2>&1 || echo "[${TIMESTAMP}] WARNING: Failed to send Telegram notification"
  fi
}

# Error handler — notify on failure
on_error() {
  echo "[${TIMESTAMP}] ERROR: Backup failed!"
  send_telegram "❌ <b>Affilibuster Backup Failed</b>
🕐 ${TIMESTAMP}
⚠️ Check /var/log/affilibuster-backup.log for details"
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
  git push origin "HEAD:${BACKUP_BRANCH}"
  echo "[${TIMESTAMP}] Strapi data pushed to ${BACKUP_BRANCH}"
  GIT_STATUS="Pushed to ${BACKUP_BRANCH}"
fi

# ---------------------------------------------------
# Step 4: Send success notification
# ---------------------------------------------------
PG_DUMP_COUNT=$(find "${PG_BACKUP_DIR}" -name "*.dump" -type f 2>/dev/null | wc -l | tr -d ' ')

send_telegram "✅ <b>Affilibuster Backup Complete</b>
🕐 ${TIMESTAMP}

📦 <b>Strapi CMS:</b> ${STRAPI_SIZE}
🗄 <b>PostgreSQL:</b> ${PG_SIZE}
📁 <b>PG dumps on disk:</b> ${PG_DUMP_COUNT}
🔀 <b>Git:</b> ${GIT_STATUS}"

echo "============================================"
echo "[${TIMESTAMP}] Daily backup complete!"
echo "  Strapi data: ${STRAPI_SIZE}"
echo "  PG dump: ${PG_SIZE}"
echo "  PG dumps on disk: ${PG_DUMP_COUNT}"
echo "  Git: ${GIT_STATUS}"
echo "============================================"
