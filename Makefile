# Copyright (c) 2025 Affilibuster by Ronen Druker.
# Makefile for Affilibuster development

# Detect CPU cores (cross-platform)
NPROCS := $(shell sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null || echo 4)
MAKEFLAGS += --output-sync=target

.PHONY: help all dev build start stop restart logs lint lint-check lint-python lint-python-check lint-typescript lint-typescript-check lint-shell lint-shell-check format format-check format-python format-python-check format-typescript format-typescript-check format-shell format-shell-check format-makefile format-makefile-check test test-backend test-frontend test-parallel test-all test-backend-fast audit clean clean-coverage coverage-merge coverage-view ci-test install install-backend install-frontend install-cms setup upgrade upgrade-cms upgrade-frontend upgrade-backend ps pre-commit

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Affilibuster Development Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

all: clean install pre-commit start test ## Run complete workflow: clean, install, pre-commit, build, test

# Linting & Formatting

pre-commit: ## Run pre-commit hooks on all files
	@echo "🔍 Running pre-commit on all files..."
	@pre-commit run --all-files
	@echo "✅ Pre-commit checks complete"

# Individual linters - check only
lint-python-check: ## Check Python code linting (Ruff)
	@bash scripts/lint.sh python check

lint-typescript-check: ## Check TypeScript/JavaScript linting (ESLint)
	@bash scripts/lint.sh typescript check

lint-shell-check: ## Check shell script linting (shellcheck)
	@bash scripts/lint.sh shell check

# Individual linters - auto-fix
lint-python: ## Lint and fix Python code (Ruff)
	@bash scripts/lint.sh python

lint-typescript: ## Lint and fix TypeScript/JavaScript (ESLint)
	@bash scripts/lint.sh typescript

lint-shell: ## Lint shell scripts (shellcheck - check only, no auto-fix)
	@bash scripts/lint.sh shell

# All linters
lint-check: ## Check all linting without fixing
	@bash scripts/lint.sh all check

lint: ## Lint and fix all code
	@bash scripts/lint.sh all

format-python: ## Format Python code (Ruff)
	@bash scripts/format.sh python

format-python-check: ## Check Python formatting without making changes
	@bash scripts/format.sh python check

format-typescript: ## Format TypeScript/JavaScript (Prettier)
	@bash scripts/format.sh typescript

format-typescript-check: ## Check TypeScript/JavaScript formatting without making changes
	@bash scripts/format.sh typescript check

format-shell: ## Format shell scripts (shfmt)
	@bash scripts/format.sh shell

format-shell-check: ## Check shell script formatting without making changes
	@bash scripts/format.sh shell check

format-makefile: ## Format Makefile (checkmake validation)
	@bash scripts/format.sh makefile

format-makefile-check: ## Check Makefile format without making changes
	@bash scripts/format.sh makefile check

format: ## Format all code (Python, JS/TS, Shell, Makefile)
	@bash scripts/format.sh all

format-check: ## Check all code formatting without making changes
	@bash scripts/format.sh all check

dev: format lint ## Start all services
	@echo "🚀 Starting Affilibuster Development Environment..."
	@./scripts/build.sh
	@docker compose logs -f 2>&1 | "./scripts/log.sh"

build: format lint ## Build frontend (with linting and formatting)
	@./scripts/build.sh --build

start: ## Start Docker services only
	@echo "🚀 Starting Docker services..."
	@docker compose up -d frontend
	@echo "✅ Services started."

stop: ## Stop all Docker services
	@echo "🛑 Stopping Docker services..."
	@docker compose down
	@echo "✅ Services stopped"

restart: ## Restart Docker services
	@echo "🔄 Restarting Docker services..."
	@docker compose restart
	@echo "✅ Services restarted"

logs: ## View Docker logs (all services)
	@docker compose logs -f

logs-backend: ## View backend logs only
	@docker compose logs -f backend

test-backend: ## Run backend tests with coverage
	@bash scripts/test.sh backend

test-backend-fast: ## Run backend unit tests only (fast)
	@bash scripts/test.sh backend-fast

test-frontend: ## Run frontend tests with coverage
	@bash scripts/test.sh frontend

test: ## Run all tests with coverage (shows all errors)
	@bash scripts/test.sh

test-parallel: ## Run all tests in parallel (FAST)
	@bash scripts/test.sh parallel

test-all: ## Run all tests + merge coverage
	@bash scripts/test.sh merge

coverage-merge: ## Merge coverage reports
	@bash scripts/test.sh merge-only

coverage-view: ## Open merged coverage report in browser
	@if [ -f "coverage-merged/html/index.html" ]; then \
		open coverage-merged/html/index.html || xdg-open coverage-merged/html/index.html; \
	else \
		echo "❌ Run 'make test-all' first to generate merged coverage"; \
	fi

clean-coverage: ## Clean all coverage reports
	@bash scripts/clean.sh coverage

audit: ## Run Lighthouse performance audits
	@bash scripts/audit.sh

install-backend: ## Install backend dependencies
	@echo "📦 Installing backend dependencies..."
	@cd backend && uv sync --all-extras

install-frontend: ## Install frontend dependencies
	@echo "📦 Installing frontend dependencies..."
	@cd frontend && npm install --include=optional

install-cms: ## Install CMS dependencies
	@echo "📦 Installing CMS dependencies..."
	@cd cms && npm install --include=optional

install: install-backend install-frontend install-cms ## Install all dependencies (backend + frontend + CMS)
	@echo "✅ All dependencies installed"

setup: ## Complete development environment setup (installs all tools and dependencies)
	@bash scripts/setup.sh

upgrade: ## Update all dependencies to latest
	@./scripts/upgrade.sh all

upgrade-cms: ## Update CMS dependencies only
	@./scripts/upgrade.sh cms

upgrade-frontend: ## Update frontend dependencies only
	@./scripts/upgrade.sh frontend

upgrade-backend: ## Update backend dependencies only
	@./scripts/upgrade.sh backend

clean: ## Clean up containers, volumes, and all build artifacts (zero state)
	@bash scripts/clean.sh

ps: ## Show running containers
	@docker compose ps
