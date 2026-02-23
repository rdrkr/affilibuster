#!/usr/bin/env bash
# Copyright (c) 2026 Affilibuster by Ronen Druker.
#
# Generate Environment Configuration
# ===================================
#
# This script generates environment configuration files for Affilibuster.
#
# Modes:
#   1. production (default): Generates .env.prod with VPS settings (https, domains)
#   2. development: Generates .env with local settings (localhost, http/https)
#
# Usage:
#   bash scripts/generate-env.sh [mode] [options]
#
#   Modes:
#     development   Generate .env for local/CI use
#     production    Generate .env.prod for VPS deployment
#
#   Options:
#     -n NAME       Cloudinary Name
#     -k KEY        Cloudinary Key
#     -s SECRET     Cloudinary Secret
#     -u USER       Uptime Kuma User
#     -p PASS       Uptime Kuma Password
#     -b TOKEN      Uptime Kuma Telegram Bot Token
#     -c CHAT_ID    Uptime Kuma Telegram Chat ID
#     -g GA_ID      Google Analytics ID
#     -t GTM_ID     Google Tag Manager ID
#     -h            Show help

# Show help message
show_help() {
  cat <<'HELP'
Usage: generate-env.sh [mode] [OPTIONS]

Generate environment configuration (.env or .env.prod) for Affilibuster.

MODES:
  development   Generate .env for local development or CI
  production    Generate .env.prod for VPS deployment (default)

OPTIONS:
  -h, --help     Show this help message and exit
  -n NAME        Cloudinary Cloud Name
  -k KEY         Cloudinary API Key
  -s SECRET      Cloudinary API Secret
  -u USER        Uptime Kuma Username
  -p PASS        Uptime Kuma Password
  -b TOKEN       Uptime Kuma Telegram Bot Token
  -c CHAT_ID     Uptime Kuma Telegram Chat ID
  -g GA_ID       Google Analytics ID
  -t GTM_ID      Google Tag Manager ID

EXAMPLES:
  # Generate .env for CI (automated)
  ./scripts/generate-env.sh development -n "cloud" -k "123" -s "abc" ...

  # Generate .env.prod (interactive)
  ./scripts/generate-env.sh production

  # Show help
  ./scripts/generate-env.sh --help

HELP
  exit 0
}

# Default mode
MODE="production"

# Parse args
# If first arg is a mode, capture it and shift
if [[ "$1" == "development" || "$1" == "production" ]]; then
  MODE="$1"
  shift
fi

# Initialize variables to avoid unbound variable errors with set -u
CLOUDINARY_NAME=""
CLOUDINARY_KEY=""
CLOUDINARY_SECRET=""
UPTIME_KUMA_USER=""
UPTIME_KUMA_PASS=""
UPTIME_KUMA_TELEGRAM_BOT_TOKEN=""
UPTIME_KUMA_TELEGRAM_CHAT_ID=""
GA_ID=""
GTM_ID=""

# Parse flags
OPTIND=1
while getopts "n:k:s:u:p:b:c:g:t:h" opt; do
  case ${opt} in
  n) CLOUDINARY_NAME="${OPTARG}" ;;
  k) CLOUDINARY_KEY="${OPTARG}" ;;
  s) CLOUDINARY_SECRET="${OPTARG}" ;;
  u) UPTIME_KUMA_USER="${OPTARG}" ;;
  p) UPTIME_KUMA_PASS="${OPTARG}" ;;
  b) UPTIME_KUMA_TELEGRAM_BOT_TOKEN="${OPTARG}" ;;
  c) UPTIME_KUMA_TELEGRAM_CHAT_ID="${OPTARG}" ;;
  g) GA_ID="${OPTARG}" ;;
  t) GTM_ID="${OPTARG}" ;;
  h) show_help ;;
  *) show_help ;;
  esac
done
shift $((OPTIND - 1))

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging
log_info() { echo -e "${BLUE}[INFO]${NC} $1" >&2; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1" >&2; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1" >&2; }
log_prompt() { echo -e -n "${CYAN}[INPUT]${NC} $1 " >&2; }

# Generators
generate_secret() { openssl rand -base64 32 | tr -d '\n'; }
generate_password() { openssl rand -base64 24 | tr -d '\n'; }

# Prompts
prompt_required() {
  local prompt_text="$1"
  local current_value="${2:-}"
  local value=""

  if [[ -n "${current_value}" ]]; then
    echo "${current_value}"
    return
  fi

  # Check if we have a TTY for interactive input
  if [[ -t 0 ]]; then
    while [[ -z "${value}" ]]; do
      log_prompt "${prompt_text}"
      read -r value </dev/tty
      if [[ -z "${value}" ]]; then echo -e "${RED}Required.${NC}" >&2; fi
    done
  else
    # Non-interactive: cannot prompt
    echo -e "${RED}Error: Non-interactive mode and variable not provided via flag.${NC}" >&2
    exit 1
  fi
  echo "${value}"
}

prompt_optional() {
  local prompt_text="$1"
  local default="$2"
  local current_value="${3:-}"

  if [[ -n "${current_value}" ]]; then
    echo "${current_value}"
    return
  fi

  # Check if we have a TTY for interactive input
  if [[ -t 0 ]]; then
    log_prompt "${prompt_text} [default: ${default}]"
    read -r value </dev/tty
    echo "${value:-${default}}"
  else
    # Non-interactive: use default
    echo "${default}"
  fi
}

main() {
  echo ""
  echo "=========================================="
  echo "Affilibuster Environment Setup: ${MODE^^}"
  echo "=========================================="
  echo ""

  # Determine Output File
  if [[ "${MODE}" == "production" ]]; then
    OUTPUT_FILE=".env.prod"
  else
    OUTPUT_FILE=".env"
  fi

  if [[ -f "${OUTPUT_FILE}" ]]; then
    log_warn "${OUTPUT_FILE} already exists!"
    # Only prompt if we are likely interactive (stdin is tty), otherwise overwrite (CI/Automation)
    if [[ -t 0 ]]; then
      log_prompt "Overwrite? (y/N)"
      read -r confirm
      if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
        echo "Aborted."
        exit 0
      fi
    else
      log_info "Non-interactive mode detected. Overwriting..."
    fi
  fi

  log_info "Generating secrets..."

  # Helper to retrieve existing secret from file
  get_existing_secret() {
    local key="$1"
    local file="$2"
    if [[ -f "${file}" ]]; then
      grep "^${key}=" "${file}" | cut -d'=' -f2-
    fi
  }

  # Try to read existing secrets if file exists
  EXISTING_POSTGRES_PASSWORD=$(get_existing_secret "POSTGRES_PASSWORD" "${OUTPUT_FILE}")
  EXISTING_ADMIN_JWT_SECRET=$(get_existing_secret "ADMIN_JWT_SECRET" "${OUTPUT_FILE}")
  EXISTING_API_TOKEN_SALT=$(get_existing_secret "API_TOKEN_SALT" "${OUTPUT_FILE}")
  EXISTING_API_TOKEN_ENCRYPTION_KEY=$(get_existing_secret "API_TOKEN_ENCRYPTION_KEY" "${OUTPUT_FILE}")
  EXISTING_TRANSFER_TOKEN_SALT=$(get_existing_secret "TRANSFER_TOKEN_SALT" "${OUTPUT_FILE}")
  EXISTING_APP_KEYS=$(get_existing_secret "APP_KEYS" "${OUTPUT_FILE}")
  EXISTING_JWT_SECRET=$(get_existing_secret "JWT_SECRET" "${OUTPUT_FILE}")
  EXISTING_REVALIDATE_SECRET=$(get_existing_secret "REVALIDATE_SECRET" "${OUTPUT_FILE}")
  EXISTING_PREVIEW_SECRET=$(get_existing_secret "PREVIEW_SECRET" "${OUTPUT_FILE}")

  # Use existing or generate new
  POSTGRES_PASSWORD=${EXISTING_POSTGRES_PASSWORD:-$(generate_password)}
  ADMIN_JWT_SECRET=${EXISTING_ADMIN_JWT_SECRET:-$(generate_secret)}
  API_TOKEN_SALT=${EXISTING_API_TOKEN_SALT:-$(generate_secret)}
  API_TOKEN_ENCRYPTION_KEY=${EXISTING_API_TOKEN_ENCRYPTION_KEY:-$(generate_secret)}
  TRANSFER_TOKEN_SALT=${EXISTING_TRANSFER_TOKEN_SALT:-$(generate_secret)}
  APP_KEYS=${EXISTING_APP_KEYS:-$(generate_secret)}
  JWT_SECRET=${EXISTING_JWT_SECRET:-$(generate_secret)}
  REVALIDATE_SECRET=${EXISTING_REVALIDATE_SECRET:-$(generate_secret)}
  PREVIEW_SECRET=${EXISTING_PREVIEW_SECRET:-$(generate_secret)}

  if [[ -n "${EXISTING_POSTGRES_PASSWORD}" ]]; then
    log_info "Reusing existing secrets from ${OUTPUT_FILE}"
  else
    log_success "New secrets generated"
  fi

  echo ""
  echo "Cloudinary Configuration"
  CLOUDINARY_NAME=$(prompt_required "Cloud Name:" "${CLOUDINARY_NAME}")
  CLOUDINARY_KEY=$(prompt_required "API Key:" "${CLOUDINARY_KEY}")
  CLOUDINARY_SECRET=$(prompt_required "API Secret:" "${CLOUDINARY_SECRET}")

  echo ""
  echo "Optional Analytics"
  GA_ID=$(prompt_optional "GA4 ID:" "" "${GA_ID}")
  GTM_ID=$(prompt_optional "GTM ID:" "" "${GTM_ID}")

  echo ""
  echo "Uptime Kuma"
  UPTIME_KUMA_USER=$(prompt_required "Admin Username:" "${UPTIME_KUMA_USER}")
  UPTIME_KUMA_PASS=$(prompt_required "Admin Password:" "${UPTIME_KUMA_PASS}")
  UPTIME_KUMA_TELEGRAM_BOT_TOKEN=$(prompt_optional "Telegram Bot Token:" "" "${UPTIME_KUMA_TELEGRAM_BOT_TOKEN}")
  UPTIME_KUMA_TELEGRAM_CHAT_ID=$(prompt_optional "Telegram Chat ID:" "" "${UPTIME_KUMA_TELEGRAM_CHAT_ID}")

  log_info "Creating ${OUTPUT_FILE}..."

  # Define environment-specific variables
  if [[ "${MODE}" == "production" ]]; then
    # PRODUCTION SETTINGS
    APP_ENV_VAL="production"
    NODE_ENV_VAL="production"
    DEBUG_VAL="false"
    LOG_LEVEL_VAL="WARNING"

    # Hosts
    CMS_HOST_VAL="cms.thegreenbrother.com"
    BACKEND_HOST_VAL="thegreenbrother.com"
    FRONTEND_HOST_VAL="thegreenbrother.com"

    # CMS settings
    CMS_PROTOCOL_VAL="http" # Internal Docker communication is plain HTTP (Caddy handles HTTPS)
    CMS_PORT_VAL="1337"
    INTERNAL_CMS_HOST_VAL="strapi" # Internal Docker host

    # Backend settings
    BACKEND_PROTOCOL_VAL="https"
    BACKEND_PORT_VAL="8000"
    INTERNAL_BACKEND_HOST_VAL="backend"

    # URLs
    CMS_URL_PROD_VAL="https://cms.thegreenbrother.com"
    CMS_URL_DEV_VAL="https://cms.thegreenbrother.com"
    BACKEND_URL_PROD_VAL="https://thegreenbrother.com/api/v1"
    BACKEND_URL_DEV_VAL="https://thegreenbrother.com/api/v1"
    NEXT_PUBLIC_API_URL_VAL="https://thegreenbrother.com/api/v1"
    NEXT_PUBLIC_CMS_URL_VAL="https://cms.thegreenbrother.com"
    NEXT_PUBLIC_SITE_URL_VAL="https://thegreenbrother.com"
    NEXT_SERVER_SIDE_API_URL_VAL="http://backend:8000/v1"

    # Uptime
    UPTIME_KUMA_URL_VAL="http://uptime-kuma:3001"

    # SSL
    SSL_CERT_PATH_VAL=""
    SSL_KEY_PATH_VAL=""

  else
    # DEVELOPMENT SETTINGS (Defaulting to Docker standard dev setup)
    APP_ENV_VAL="development"
    NODE_ENV_VAL="development"
    DEBUG_VAL="true"
    LOG_LEVEL_VAL="DEBUG"

    # Hosts
    CMS_HOST_VAL="localhost"
    BACKEND_HOST_VAL="localhost"
    FRONTEND_HOST_VAL="localhost"

    # CMS settings
    CMS_PROTOCOL_VAL="https"
    CMS_PORT_VAL="1337"
    INTERNAL_CMS_HOST_VAL="strapi-proxy" # Nginx proxy in dev

    # Backend settings
    BACKEND_PROTOCOL_VAL="https"
    BACKEND_PORT_VAL="8000"
    INTERNAL_BACKEND_HOST_VAL="backend"

    # URLs
    CMS_URL_PROD_VAL="https://cms.thegreenbrother.com:1337"
    CMS_URL_DEV_VAL="https://localhost:1337"
    BACKEND_URL_PROD_VAL="https://api.thegreenbrother.com:8000/v1"
    BACKEND_URL_DEV_VAL="https://localhost:8000/v1"
    NEXT_PUBLIC_API_URL_VAL="https://localhost:8000/v1"
    NEXT_PUBLIC_CMS_URL_VAL="https://localhost:1337"
    NEXT_PUBLIC_SITE_URL_VAL="https://localhost:3000"
    NEXT_SERVER_SIDE_API_URL_VAL="http://backend:8000/v1" # Or https://localhost:8000/v1 depending on network

    # Uptime
    UPTIME_KUMA_URL_VAL="http://localhost:3001"

    # SSL
    SSL_CERT_PATH_VAL="/certs/localhost.pem"
    SSL_KEY_PATH_VAL="/certs/localhost-key.pem"
  fi

  cat >"${OUTPUT_FILE}" <<EOF
# Copyright (c) 2026 Affilibuster by Ronen Druker.
# Generated by scripts/generate-env.sh on $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# Environment: ${MODE}

# ======================================
# SHARED INFRASTRUCTURE
# ======================================
POSTGRES_PROTOCOL=postgresql
POSTGRES_HOST=localhost
INTERNAL_POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=affilibuster
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=affilibuster_db
POSTGRES_SSL=false
POSTGRES_SSL_REJECT_UNAUTHORIZED=true

REDIS_PROTOCOL=redis
REDIS_HOST=localhost
INTERNAL_REDIS_HOST=redis
REDIS_PORT=6379
REDIS_TTL_PREFERENCES=2592000

# ======================================
# CMS (Strapi 5)
# ======================================
CMS_PROTOCOL=${CMS_PROTOCOL_VAL}
CMS_PORT=${CMS_PORT_VAL}
CMS_HOST=${CMS_HOST_VAL}
INTERNAL_CMS_HOST=${INTERNAL_CMS_HOST_VAL}

SSL_CERT_PATH=${SSL_CERT_PATH_VAL}
SSL_KEY_PATH=${SSL_KEY_PATH_VAL}

CMS_URL_PROD=${CMS_URL_PROD_VAL}
CMS_URL_DEV=${CMS_URL_DEV_VAL}

CLIENT_URL=${NEXT_PUBLIC_SITE_URL_VAL}

CLOUDINARY_NAME=${CLOUDINARY_NAME}
CLOUDINARY_KEY=${CLOUDINARY_KEY}
CLOUDINARY_SECRET=${CLOUDINARY_SECRET}

ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}
API_TOKEN_SALT=${API_TOKEN_SALT}
API_TOKEN_ENCRYPTION_KEY=${API_TOKEN_ENCRYPTION_KEY}
TRANSFER_TOKEN_SALT=${TRANSFER_TOKEN_SALT}
APP_KEYS=${APP_KEYS}

# ======================================
# BACKEND (FastAPI)
# ======================================
APP_ENV=${APP_ENV_VAL}
DEBUG=${DEBUG_VAL}
LOG_LEVEL=${LOG_LEVEL_VAL}

BACKEND_PROTOCOL=${BACKEND_PROTOCOL_VAL}
BACKEND_PORT=${BACKEND_PORT_VAL}
BACKEND_HOST=${BACKEND_HOST_VAL}
INTERNAL_BACKEND_HOST=${INTERNAL_BACKEND_HOST_VAL}

BACKEND_URL_PROD=${BACKEND_URL_PROD_VAL}
BACKEND_URL_DEV=${BACKEND_URL_DEV_VAL}

JWT_SECRET=${JWT_SECRET}

# ======================================
# THE_GREEN_BROTHER (Next.js)
# ======================================
NODE_ENV=${NODE_ENV_VAL}
NODE_EXTRA_CA_CERTS=/certs/rootCA.pem
NEXT_TELEMETRY_DISABLED=1

THE_GREEN_BROTHER_PROTOCOL=https
THE_GREEN_BROTHER_PORT=3000
THE_GREEN_BROTHER_HOST=${FRONTEND_HOST_VAL}
INTERNAL_THE_GREEN_BROTHER_HOST=the-green-brother

NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL_VAL}
NEXT_PUBLIC_CMS_URL=${NEXT_PUBLIC_CMS_URL_VAL}
NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL_VAL}
NEXT_SERVER_SIDE_API_URL=${NEXT_SERVER_SIDE_API_URL_VAL}

REVALIDATE_SECRET=${REVALIDATE_SECRET}
PREVIEW_SECRET=${PREVIEW_SECRET}
NEXT_PUBLIC_GA_ID=${GA_ID}
NEXT_PUBLIC_GTM_ID=${GTM_ID}
PLAYWRIGHT_REPORT_PORT=9323

# ======================================
# UPTIME KUMA
# ======================================
UPTIME_KUMA_URL=${UPTIME_KUMA_URL_VAL}
UPTIME_KUMA_USER=${UPTIME_KUMA_USER}
UPTIME_KUMA_PASS=${UPTIME_KUMA_PASS}
UPTIME_KUMA_TELEGRAM_BOT_TOKEN=${UPTIME_KUMA_TELEGRAM_BOT_TOKEN}
UPTIME_KUMA_TELEGRAM_CHAT_ID=${UPTIME_KUMA_TELEGRAM_CHAT_ID}
EOF

  log_success "${OUTPUT_FILE} created successfully!"
  chmod 600 "${OUTPUT_FILE}"
  log_success "Set permissions to 600 (secure)"
  echo ""
}

main "$@"
