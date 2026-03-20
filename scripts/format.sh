#!/usr/bin/env bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

# Get the format type (python|typescript|shell|makefile|all)
FORMAT_TYPE="${1:-all}"
CHECK_ONLY="${2:-}"

# Format Python
format_python() {
  cd backend
  if [[ "${CHECK_ONLY}" = "check" ]]; then
    echo "  ✨ Checking Python formatting..."
    uv run task format
  else
    echo "✨ Formatting Python..."
    uv run task format-fix
  fi
  cd ..
}

# Format TypeScript/JavaScript
format_typescript() {
  if [[ "${CHECK_ONLY}" = "check" ]]; then
    echo "  ✨ Checking TypeScript/JavaScript formatting..."
    cd the-green-brother && npm run format
    cd ..
    cd gentle-hawk && npm run format
    cd ..
    cd cms && npm run format
    cd ..
  else
    echo "  ✨ Formatting TypeScript/JavaScript..."
    cd the-green-brother && npm run format:fix
    cd ..
    cd gentle-hawk && npm run format:fix
    cd ..
    cd cms && npm run format:fix
    cd ..
  fi
}

# Format Shell scripts
format_shell() {
  if command -v shfmt >/dev/null 2>&1; then
    # Find all shell scripts excluding generated directories
    shell_files=$(find . -type f \( -name "*.sh" -o -name "*.bash" \) \
      ! -path "*/specs/*" \
      ! -path "*/generated/*" \
      ! -path "*/node_modules/*" \
      ! -path "*/.git/*" \
      ! -path "*/dist/*" \
      ! -path "*/.strapi/*" \
      ! -path "*/venv/*" \
      ! -path "*/.venv/*" \
      ! -path "*/.claude/skills/*" 2>/dev/null)

    if [[ "${CHECK_ONLY}" = "check" ]]; then
      echo "  ✨ Checking shell script formatting..."
      echo "${shell_files}" | xargs shfmt --list --diff
    else
      echo "  ✨ Formatting shell scripts..."
      echo "${shell_files}" | xargs shfmt --list -write
    fi
  else
    echo "  ⚠️ shfmt not installed. Install it with: brew install shfmt"
    exit 1
  fi
}

# Format Makefile
format_makefile() {
  if command -v checkmake >/dev/null 2>&1; then
    echo "  ✨ Checking Makefile format..."

    # checkmake warns about missing "all" target, but we use .DEFAULT_GOAL := help
    # which is a valid alternative, so we ignore this specific warning
    checkmake --config=checkmake.ini Makefile
  else
    echo "  ⚠️ checkmake not installed. Install it with: brew install checkmake"
    exit 1
  fi
}

# Main logic
echo "🧹Starting code formatting..."

case "${FORMAT_TYPE}" in
python)
  format_python
  ;;
typescript)
  format_typescript
  ;;
shell)
  format_shell
  ;;
makefile)
  format_makefile
  ;;
all)
  format_python
  format_typescript
  format_shell
  format_makefile
  ;;
*)
  echo "Usage: $0 {python|typescript|shell|makefile|all} [check]"
  exit 1
  ;;
esac

if [[ "${CHECK_ONLY}" = "check" ]]; then
  echo "✅ Format check complete"
else
  echo "✅ Formatting complete"
fi
