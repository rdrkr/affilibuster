#!/bin/bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

##
# Log Formatter for Affilibuster
# Aggregates logs from all services with consistent formatting
# Format: [TIMESTAMP] [COMPONENT] [LEVEL] Message
##

# Get color code for a log level
get_color() {
  case "$1" in
  ERROR) echo -e "\033[31m" ;; # Red
  WARN) echo -e "\033[33m" ;;  # Yellow
  *) echo -e "\033[37m" ;;     # White (default)
  esac
}

RESET=$(echo -e "\033[0m")

# Detect log level from message
detect_level() {
  local message="$1"
  # Remove URL paths before checking
  local cleaned
  cleaned=$(echo "${message}" | sed 's|/[^ ]*||g')

  if echo "${cleaned}" | grep -qi "error"; then
    echo "ERROR"
  elif echo "${cleaned}" | grep -qi "warning"; then
    echo "WARN"
  elif echo "${cleaned}" | grep -qi "debug"; then
    echo "DEBUG"
  else
    echo "INFO"
  fi
}

# Strip Strapi timestamp prefix: [YYYY-MM-DD HH:MM:SS.mmm]
strip_strapi_timestamp() {
  local message="$1"
  # Remove pattern: [YYYY-MM-DD HH:MM:SS.mmm] from start of message
  echo "${message}" | sed 's/^\[[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\} [0-9]\{2\}:[0-9]\{2\}:[0-9]\{2\}\.[0-9]\{3\}\] //'
}

# Format and print a log line
print_log() {
  local component="$1"
  local message="$2"
  local timestamp="$3"

  # Use current timestamp if not provided
  if [[ -z "${timestamp}" ]]; then
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  fi

  # Detect level
  local level
  level=$(detect_level "${message}")

  # Get color
  local color
  color=$(get_color "${level}")

  # Format: [TIMESTAMP] [COMPONENT] [LEVEL] Message
  printf "%s[%s] [%s] [%s] %s%s\n" \
    "${color}" "${timestamp}" "${component}" "${level}" "${message}" "${RESET}"
}

# Process input lines
while IFS= read -r line; do
  # Skip empty lines
  [[ -z "${line}" ]] && continue

  component=""
  message=""

  # Parse Docker compose lines: "service-name | message"
  if echo "${line}" | grep -q "^affilibuster-"; then
    # Extract component name and message
    component=$(echo "${line}" | sed 's/^affilibuster-\([a-z- ]]*\).*/\1/')
    message=$(echo "${line}" | sed 's/^affilibuster-[a-z- ]]*[[:space:]]*|[[:space:]]*//')

    # Normalize component names
    case "${component}" in
    backend) component="BACKEND" ;;
    strapi)
      component="STRAPI"
      # Strip Strapi's built-in timestamp prefix
      message=$(strip_strapi_timestamp "${message}")
      ;;
    postgres) component="POSTGRES" ;;
    redis) component="REDIS" ;;
    *) component=$(echo "${component}" | tr '[:lower:]' '[:upper:]') ;;
    esac

  # Parse frontend logs: "[FRONTEND] message"
  elif echo "${line}" | grep -q "^\[FRONTEND\]"; then
    component="FRONTEND"
    # Remove [FRONTEND] prefix to get the message
    message=$(echo "${line}" | sed 's/^\[FRONTEND\][[:space:]]*//')

    # Skip empty lines after removing prefix
    [[ -z "${message}" ]] && continue
  # Pass through other lines as-is
  else
    # shellcheck disable=SC2250
    message="$line"
  fi

  message=$(echo "${message}" | sed 's/^[[:space:]]*//')
  print_log "${component}" "${message}"
done
