#!/usr/bin/env bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

# Track if any linter failed
LINT_FAILED=0

# Get the lint type (python|typescript|shell|openapi|all) and action (check or fix)
LINT_TYPE="${1:-all}"
ACTION="${2:-}"

# Convert type to lowercase
LINT_TYPE=$(echo "${LINT_TYPE}" | tr '[:upper:]' '[:lower:]')

# Lint Python code
lint_python() {
  cd backend
  uv sync --quiet --all-extras || LINT_FAILED=$?

  if [[ "${ACTION}" = "check" ]]; then
    echo "  📋 Checking Python code (Ruff)..."
    uv run task lint || LINT_FAILED=$?
  else
    echo "  🔧 Fixing Python code (Ruff)..."
    uv run task lint-fix || LINT_FAILED=$?
  fi
  cd ..
}

# Lint TypeScript/JavaScript
lint_typescript() {
  if [[ "${ACTION}" = "check" ]]; then
    echo "  📋 Checking TypeScript (Frontend ESLint)..."
    cd frontend
    npm install --silent || LINT_FAILED=$?
    npm run lint || LINT_FAILED=$?
    cd ..

    echo "  📋 Checking TypeScript (CMS ESLint)..."
    cd cms
    npm install --silent || LINT_FAILED=$?
    npm run lint || LINT_FAILED=$?
    cd ..
  else
    echo "  🔧 Fixing TypeScript (Frontend)..."
    cd frontend
    npm install --silent || LINT_FAILED=$?
    npm run lint:fix || LINT_FAILED=$?
    cd ..

    echo "  🔧 Fixing TypeScript (CMS)..."
    cd cms
    npm install --silent || LINT_FAILED=$?
    npm run lint:fix || LINT_FAILED=$?
    cd ..
  fi
}

# Lint Shell scripts
lint_shell() {
  if [[ "${ACTION}" = "check" ]]; then
    echo "  📋 Checking shell scripts (shellcheck)..."
  else
    echo "  🔧 Checking shell scripts (shellcheck)..."
  fi

  if command -v shellcheck >/dev/null 2>&1; then
    shell_files=$(find . -type f \( -name "*.sh" -o -name "*.bash" \) \
      ! -path "./.specify/*" \
      ! -path "./specs/*" \
      ! -path "*/generated/*" \
      ! -path "*/node_modules/*" \
      ! -path "*/.git/*" \
      ! -path "*/dist/*" \
      ! -path "*/.strapi/*" \
      ! -path "*/venv/*" \
      ! -path "*/.venv/*" 2>/dev/null)
    if [[ -n "${shell_files}" ]]; then
      echo "${shell_files}" | xargs shellcheck || LINT_FAILED=$?
    fi
  else
    echo "  ⚠️ shellcheck not installed"
  fi
}

# Main logic based on lint type
echo "🔍 Starting linting: ${LINT_TYPE} (action: ${ACTION:-fix})"

case "${LINT_TYPE}" in
python)
  lint_python
  ;;

typescript)
  lint_typescript
  ;;

shell)
  lint_shell
  ;;

all)
  lint_python
  lint_typescript
  lint_shell
  ;;

*)
  echo "Usage: $0 {python|typescript|shell|all} [check]"
  echo ""
  echo "Examples:"
  echo "  $0 python              # Fix Python linting issues"
  echo "  $0 python check        # Check Python linting only"
  echo "  $0 all                 # Fix all linting issues"
  echo "  $0 all check           # Check all linting only"
  exit 1
  ;;
esac

# Print result
if [[ ${LINT_FAILED} -ne 0 ]]; then
  echo "  ❌ Linting failed"
  exit "${LINT_FAILED}"
fi

if [[ "${ACTION}" = "check" ]]; then
  echo "  ✅ Linting complete"
else
  echo "  ✅ All auto-fixes complete"
fi
