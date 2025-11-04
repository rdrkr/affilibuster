#!/bin/bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

## Spinner Utility for Scripts (Docker-Compose Style)
##
## USAGE:
##   source scripts/spinner.sh
##
## FUNCTIONS:
##
## spinner_exec [OPTIONS] "command"
##   Executes a command with docker-compose style spinner animation.
##   Shows: ⠧ <running_text>       <output>
##   Finishes with ✔ <done_text> for success or ✘ <error_text> for failure.
##   Propagates the command's exit code.
##   If --verbose flag is provided, shows command output in real-time.
##
## OPTIONS:
##   -t, --title TEXT        Title/identifier for the operation
##   -r, --running TEXT      Text to show while running (default: "Processing")
##   -s, --success TEXT      Text to show on success (default: "Completed")
##   -f, --fail TEXT         Text to show on failure (default: "Failed")
##   -v, --verbose           Show command output in real-time
##   -h, --help              Show this help message
##
## EXAMPLES:
##   spinner_exec -t "Build" -r "Building container" -s "Container built" -f "Build failed" "echo 'start' && sleep 3 && echo 'done'"
##   spinner_exec --title "Test" --running "Running tests" --success "Tests passed" --fail "Tests failed" "npm test"
##   spinner_exec -t "Install" -r "Installing dependencies" -s "Dependencies installed" -f "Installation failed" "npm install"
##   spinner_exec -t "Deploy" -r "Deploying to production" -s "Deployment complete" -f "Deployment failed" -v "npm run deploy"

spinner_exec() {
  # Disable job control messages
  set +m

  local verbose="false"
  local title=""
  local running_text="Processing"
  local success_text="Completed"
  local fail_text="Failed"
  local command=""

  # Show help function
  show_help() {
    echo "spinner_exec - Docker-compose style spinner for command execution"
    echo ""
    echo "Usage: spinner_exec [OPTIONS] \"command\""
    echo ""
    echo "OPTIONS:"
    echo "   -t, --title TEXT        Title/identifier for the operation"
    echo "   -r, --running TEXT      Text to show while running (default: \"Processing\")"
    echo "   -s, --success TEXT      Text to show on success (default: \"Completed\")"
    echo "   -f, --fail TEXT         Text to show on failure (default: \"Failed\")"
    echo "   -v, --verbose           Show command output in real-time"
    echo "   -h, --help              Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "   spinner_exec -t \"Build\" -r \"Building container\" -s \"Container built\" -f \"Build failed\" \"echo 'done'\""
    echo "   spinner_exec --title \"Test\" --running \"Running tests\" --success \"Tests passed\" --fail \"Tests failed\" \"npm test\""
    echo "   spinner_exec -t \"Deploy\" -r \"Deploying\" -s \"Deployment complete\" -f \"Deployment failed\" -v \"npm run deploy\""
  }

  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
    -h | --help)
      show_help
      return 0
      ;;
    -v | --verbose)
      verbose="true"
      shift
      ;;
    -t | --title)
      title="$2"
      shift 2
      ;;
    -r | --running)
      running_text="$2"
      shift 2
      ;;
    -s | --success)
      success_text="$2"
      shift 2
      ;;
    -f | --fail)
      fail_text="$2"
      shift 2
      ;;
    -*)
      echo "Error: Unknown option $1" >&2
      echo "Use -h or --help for usage information" >&2
      return 1
      ;;
    *)
      if [[ -z "${command}" ]]; then
        command="$1"
      else
        echo "Error: Too many commands specified" >&2
        return 1
      fi
      shift
      ;;
    esac
  done

  # Validate required arguments
  if [[ -z "${command}" ]]; then
    echo "Error: Missing command" >&2
    echo "Usage: spinner_exec [OPTIONS] \"command\"" >&2
    echo "Use -h or --help for usage information" >&2
    return 1
  fi

  # Set default title if not provided
  if [[ -z "${title}" ]]; then
    title="Task"
  fi

  # Create temporary file for output
  local output_file
  output_file=$(mktemp)

  # Clean up function
  # shellcheck disable=SC2329
  cleanup() {
    # shellcheck disable=SC2317
    rm -f "${output_file}"
  }
  trap cleanup EXIT

  # Execute command in background to get PID
  if [[ "${verbose}" == "true" ]]; then
    # For verbose mode, disable spinner animation and just show output directly
    printf "\r\033[33m%s\033[0m %s    \033[33m%s\033[0m\n" "⠧" "${title}" "${running_text}"

    # Execute command and capture output while displaying it
    eval "${command}" 2>&1 | tee "${output_file}" | while IFS= read -r line; do
      echo "  ${line}"
    done
    local exit_code=${PIPESTATUS[0]}

    # Display final status
    if [[ "${exit_code}" -eq 0 ]]; then
      printf "\033[32m%s\033[0m %s    \033[32m%s\033[0m\n" "✔" "${title}" "${success_text}"
    else
      printf "\033[31m%s\033[0m %s    \033[31m%s\033[0m\n" "✘" "${title}" "${fail_text}"
    fi

    # Display last line of output in verbose mode
    if [[ -s "${output_file}" ]]; then
      local last_line
      last_line=$(tail -n 1 "${output_file}")
      printf "%s\n" "${last_line}"
    fi

    # Re-enable job control
    set -m
    return "${exit_code}"
  else
    eval "${command}" >"${output_file}" 2>&1 &
    cmd_pid=$!
  fi

  # Start spinner animation
  local spin_chars="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
  local delay=0.1
  local i=0

  # Show initial spinner
  printf "  \r\033[33m%s\033[0m %s  \033[33m%s\033[0m\033[K" "${spin_chars:0:1}" "${title}" "${running_text}"

  # Animate while command is running
  while kill -0 "${cmd_pid}" 2>/dev/null; do
    printf "  \r\033[33m%s\033[0m %s  \033[33m%s\033[0m\033[K" "${spin_chars:${i}:1}" "${title}" "${running_text}"
    i=$(((i + 1) % 10))
    sleep "${delay}"
  done

  # Wait for command to finish and get exit code
  wait "${cmd_pid}"
  local exit_code=$?

  # Display final status
  if [[ "${exit_code}" -eq 0 ]]; then
    printf "  \r\033[32m%s\033[0m %s  \033[32m%s\033[0m\033[K\n" "✔" "${title}" "${success_text}"
  else
    printf "  \r\033[31m%s\033[0m %s  \033[31m%s\033[0m\033[K\n" "✘" "${title}" "${fail_text}"
  fi

  # Display command output only on errors or in verbose mode
  if [[ "${exit_code}" -ne 0 ]] || [[ "${verbose}" == "true" ]]; then
    if [[ -s "${output_file}" ]]; then
      local last_line
      last_line=$(tail -n 1 "${output_file}")
      printf "%s\n" "${last_line}"
    fi
  fi

  # Re-enable job control
  set -m

  return "${exit_code}"
}
