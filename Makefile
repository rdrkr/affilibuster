# Copyright (c) 2025 Affilibuster by Ronen Druker.
# Makefile for Affilibuster development

# Detect CPU cores (cross-platform)
NPROCS := $(shell sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null || echo 4)
MAKEFLAGS += --output-sync=target

.PHONY: help all all-fast dev build start stop restart logs lint lint-check lint-python lint-python-check lint-typescript lint-typescript-check lint-shell lint-shell-check format format-check format-python format-python-check format-typescript format-typescript-check format-shell format-shell-check format-makefile format-makefile-check test test-backend test-backend-unit test-backend-integration test-the-green-brother test-the-green-brother-unit test-performance test-all-unit test-all-integration test-parallel test-fast test-all audit clean clean-coverage coverage-merge coverage-view playwright-report ci-test install install-backend install-cms setup upgrade upgrade-cms upgrade-backend ps pre-commit export import export-docker import-docker

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Affilibuster Development Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

all: clean setup pre-commit start test ## Run complete workflow

all-fast: clean setup pre-commit start test-fast ## Run complete workflow with faster tests (backend + the-green-brother unit only)

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

build: format lint ## Build (with linting and formatting)
	@./scripts/build.sh --build

start: ## Start Docker services only
	@./scripts/build.sh

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

logs-the-green-brother: ## View the-green-brother logs only
	@docker compose logs -f the-green-brother

test-backend-unit: ## Run backend unit tests only
	@bash scripts/test.sh backend-unit

test-backend-integration: ## Run backend integration tests only
	@bash scripts/test.sh backend-integration

test-backend: ## Run all backend tests (unit + integration)
	@bash scripts/test.sh backend

test-the-green-brother-unit: ## Run the-green-brother unit tests only (Jest)
	@bash scripts/test.sh the-green-brother-unit

test-the-green-brother-integration: ## Run the-green-brother integration tests only (Playwright E2E)
	@bash scripts/test.sh the-green-brother-integration $(BROWSER)

test-the-green-brother: ## Run all the-green-brother tests (unit + integration)
	@bash scripts/test.sh the-green-brother

test-performance: ## Run performance tests only
	@bash scripts/test.sh performance $(BROWSER)

test-all-unit: ## Run all unit tests (backend + the-green-brother)
	@bash scripts/test.sh all-unit

test-all-integration: ## Run all integration tests (backend + the-green-brother)
	@bash scripts/test.sh all-integration

test: ## Run all tests with coverage (shows all errors)
	@bash scripts/test.sh

test-parallel: ## Run all tests in parallel (FAST)
	@bash scripts/test.sh parallel

test-fast: ## Run fast tests only (backend + the-green-brother unit)
	@echo "🧪 Running fast tests (backend + the-green-brother unit)..."
	@$(MAKE) test-backend
	@$(MAKE) test-the-green-brother-unit
	@echo "✅ Fast tests complete"

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

playwright-report: ## View Playwright E2E test report in browser
	@if [ -d "the-green-brother/playwright-report" ]; then \
		echo "📊 Starting Playwright report server..."; \
		echo "   Open http://localhost:$${PLAYWRIGHT_REPORT_PORT:-9323} in your browser"; \
		echo "   Press Ctrl+C to stop the server"; \
		docker compose exec test-runner sh -c 'cd /app && npx playwright show-report --port $${PLAYWRIGHT_REPORT_PORT:-9323} --host 0.0.0.0'; \
	else \
		echo "❌ No Playwright report found"; \
		echo "   Run 'make test-the-green-brother' or 'make test' first to generate E2E test reports"; \
	fi

audit: ## Run Lighthouse performance audits
	@bash scripts/audit.sh

install-backend: ## Install backend dependencies
	@echo "📦 Installing backend dependencies..."
	@cd backend && uv sync

install-the-green-brother: ## Install the-green-brother dependencies
	@echo "📦 Installing the-green-brother dependencies..."
	@cd the-green-brother && npm install

install-cms: ## Install CMS dependencies
	@echo "📦 Installing CMS dependencies..."
	@cd cms && npm install

install: install-backend install-the-green-brother install-cms ## Install all dependencies
	@echo "✅ All dependencies installed"

setup: ## Complete development environment setup (installs all tools and dependencies)
	@bash scripts/setup.sh

upgrade: ## Update all dependencies to latest
	@./scripts/upgrade.sh all

upgrade-cms: ## Update CMS dependencies only
	@./scripts/upgrade.sh cms

upgrade-the-green-brother: ## Update the-green-brother dependencies only
	@./scripts/upgrade.sh the-green-brother

upgrade-backend: ## Update backend dependencies only
	@./scripts/upgrade.sh backend

clean: ## Clean up containers, volumes, and all build artifacts (zero state)
	@bash scripts/clean.sh

ps: ## Show running containers
	@docker compose ps

export: ## Export strapi cms data (local)
	@echo "💽 Exporting strapi cms data (local)..."
	@cd cms && npm run data:export
	@echo "✅ Strapi cms data exported"

import: ## Import strapi cms data (local)
	@echo "💽 Importing strapi cms data (local)..."
	@tar -cf data/export.tar -C "data" assets entities schemas configuration links metadata.json
	@cd cms && npm run data:import -- --force --file "../data/export.tar"
	@rm data/export.tar
	@echo "✅ Strapi cms data imported"

export-docker: ## Export strapi cms data (via Docker)
	@echo "💽 Exporting strapi cms data (Docker)..."
	@docker compose exec strapi sh -c 'npm run data:export'
	@echo "✅ Strapi cms data exported"

import-docker: ## Import strapi cms data (via Docker)
	@echo "💽 Importing strapi cms data (Docker)..."
	@tar -cf data/export.tar -C "data" assets entities schemas configuration links metadata.json
	@docker compose exec strapi sh -c 'npm run data:import -- --force --file "/data/export.tar"'
	@rm data/export.tar
	@echo "✅ Strapi cms data imported"
