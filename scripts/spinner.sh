#!/bin/bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

## Usage
#start_spinner "Building container" &
#SPIN_PID=$!
#
## Your actual command here
#sleep 3
#
#stop_spinner

start_spinner() {
  local message="$1"
  local spinstr
  spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'

  printf "%s " "${message}"
  tput civis # Hide cursor

  while true; do
    for i in $(seq 0 9); do
      printf "%s\b" "${spinstr:${i}:1}"
      sleep 0.1
    done
  done
}

stop_spinner() {
  # shellcheck disable=SC2154
  kill "${SPIN_PID}" 2>/dev/null
  wait "${SPIN_PID}" 2>/dev/null
  tput cnorm # Show cursor
  printf " ✓\n"
}
