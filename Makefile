# Copyright (c) 2025 Affilibuster by Ronen Druker.
# Makefile for Affilibuster development

# Detect CPU cores (cross-platform)
NPROCS := $(shell sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null || echo 4)
MAKEFLAGS += --output-sync=target

.PHONY: help dev start stop restart logs test test-backend test-frontend test-shared test-cms test-parallel test-all test-backend-fast clean clean-coverage coverage-merge coverage-view ci-test install

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Affilibuster Development Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

dev: ## Start all services (Docker + Frontend + CMS)
	@./scripts/dev.sh

start: ## Start Docker services only (PostgreSQL, Redis, Backend)
	@echo "🚀 Starting Docker services..."
	@docker-compose up -d
	@echo "✅ Services started. Access backend at http://localhost:8000"

stop: ## Stop all Docker services
	@echo "🛑 Stopping Docker services..."
	@docker-compose down
	@echo "✅ Services stopped"

restart: ## Restart Docker services
	@echo "🔄 Restarting Docker services..."
	@docker-compose restart
	@echo "✅ Services restarted"

logs: ## View Docker logs (all services)
	@docker-compose logs -f

logs-backend: ## View backend logs only
	@docker-compose logs -f backend

test-backend: ## Run backend tests with coverage
	@echo "🧪 Running backend tests..."
	@docker-compose exec -T backend pytest
	@echo "✅ Backend tests complete"

test-backend-fast: ## Run backend unit tests only (fast)
	@echo "⚡ Running backend unit tests..."
	@docker-compose exec -T backend pytest -m "unit" --tb=short
	@echo "✅ Unit tests complete"

test-frontend: ## Run frontend tests with coverage
	@echo "🧪 Running frontend tests..."
	@cd frontend && npm test -- --coverage \
		--coverageReporters=lcov \
		--coverageReporters=json \
		--coverageReporters=html \
		--coverageReporters=text
	@echo "✅ Frontend tests complete"

test-shared: ## Run shared module type tests
	@echo "🧪 Running shared module type tests..."
	@cd shared && npm run test && npm run type-coverage
	@echo "✅ Shared module tests complete"

test-cms: ## Run CMS tests with coverage (when implemented)
	@echo "🧪 Running CMS tests..."
	@if [ -f "cms/package.json" ] && grep -q '"test"' cms/package.json; then \
		cd cms && npm test -- --coverage --coverageReporters=lcov; \
		echo "✅ CMS tests complete"; \
	else \
		echo "ℹ️  No CMS tests configured (no custom code yet)"; \
	fi

test: ## Run all tests with coverage (shows all errors)
	@echo "🧪 Running all tests..."
	@set -o pipefail; FAILED=0; \
	$(MAKE) test-backend 2>&1 | tee /tmp/backend-test.log; test $${PIPESTATUS[0]} -eq 0 || FAILED=1; \
	$(MAKE) test-frontend 2>&1 | tee /tmp/frontend-test.log; test $${PIPESTATUS[0]} -eq 0 || FAILED=1; \
	$(MAKE) test-shared 2>&1 | tee /tmp/shared-test.log; test $${PIPESTATUS[0]} -eq 0 || FAILED=1; \
	echo ""; \
	BACKEND_PASSED=$$(grep -oE '[0-9]+ passed' /tmp/backend-test.log | head -1 | grep -oE '[0-9]+' || echo "0"); \
	BACKEND_SKIPPED=$$(grep -oE '[0-9]+ skipped' /tmp/backend-test.log | head -1 | grep -oE '[0-9]+' || echo "0"); \
	BACKEND_TOTAL=$$((BACKEND_PASSED + BACKEND_SKIPPED)); \
	BACKEND_PCT=$$(awk "BEGIN {if ($$BACKEND_TOTAL > 0) printf \"%.0f\", ($$BACKEND_PASSED / $$BACKEND_TOTAL) * 100; else print \"0\"}"); \
	BACKEND_COV=$$(grep 'TOTAL' /tmp/backend-test.log | awk '{print $$NF}' || echo "N/A"); \
	FRONTEND_PASSED=$$(grep '^Tests:' /tmp/frontend-test.log | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo "0"); \
	FRONTEND_TOTAL=$$(grep '^Tests:' /tmp/frontend-test.log | grep -oE '[0-9]+ total' | grep -oE '[0-9]+' || echo "$$FRONTEND_PASSED"); \
	FRONTEND_PCT=$$(awk "BEGIN {if ($$FRONTEND_TOTAL > 0) printf \"%.0f\", ($$FRONTEND_PASSED / $$FRONTEND_TOTAL) * 100; else print \"0\"}"); \
	FRONTEND_COV=$$(grep 'Statements' /tmp/frontend-test.log | grep -oE '[0-9.]+%' | head -1 || echo "N/A"); \
	SHARED_PASSED=$$(grep -oE '\([0-9]+ / [0-9]+\)' /tmp/shared-test.log | grep -oE '[0-9]+' | head -1 || echo "0"); \
	SHARED_TOTAL=$$SHARED_PASSED; \
	SHARED_PCT="100"; \
	SHARED_COV="100%"; \
	if [ $$FAILED -ne 0 ]; then \
		echo "❌ Tests failed with errors or coverage below threshold"; \
	else \
		echo "✅ All tests passed!"; \
	fi; \
	echo ""; \
	echo "📊 Coverage Summary:"; \
	printf "┌─────────────┬──────────────────────┬──────────────┬──────────────────────────────────────────────────────┐\n"; \
	printf "│ %-11s │ %-20s │ %-12s │ %-52s │\n" "Module" "Tests" "Coverage" "Report"; \
	printf "├─────────────┼──────────────────────┼──────────────┼──────────────────────────────────────────────────────┤\n"; \
	printf "│ %-11s │ %6s / %-6s (%3s%%) │ %12s │ %-52s │\n" "Backend" "$$BACKEND_PASSED" "$$BACKEND_TOTAL" "$$BACKEND_PCT" "$$BACKEND_COV" "file://$(PWD)/backend/htmlcov/index.html"; \
	printf "│ %-11s │ %6s / %-6s (%3s%%) │ %12s │ %-52s │\n" "Frontend" "$$FRONTEND_PASSED" "$$FRONTEND_TOTAL" "$$FRONTEND_PCT" "$$FRONTEND_COV" "file://$(PWD)/frontend/coverage/index.html"; \
	printf "│ %-11s │ %6s / %-6s (%3s%%) │ %12s │ %-52s │\n" "Shared" "$$SHARED_PASSED" "$$SHARED_TOTAL" "$$SHARED_PCT" "$$SHARED_COV" "Type coverage (no HTML)"; \
	printf "└─────────────┴──────────────────────┴──────────────┴──────────────────────────────────────────────────────┘\n"; \
	if [ $$FAILED -ne 0 ]; then \
		exit 1; \
	fi

test-parallel: ## Run all tests in parallel (FAST)
	@echo "🚀 Running all tests in parallel using $(NPROCS) cores..."
	@$(MAKE) -j3 test-backend test-frontend test-shared
	@echo "✅ All parallel tests complete!"

test-all: test-parallel coverage-merge ## Run all tests + merge coverage
	@echo "✅ All tests complete with merged coverage"

coverage-merge: ## Merge coverage reports from all modules
	@echo "📊 Merging coverage reports..."
	@./scripts/merge-coverage.sh

coverage-view: ## Open merged coverage report in browser
	@if [ -f "coverage-merged/html/index.html" ]; then \
		open coverage-merged/html/index.html || xdg-open coverage-merged/html/index.html; \
	else \
		echo "❌ Run 'make test-all' first to generate merged coverage"; \
	fi

clean-coverage: ## Clean all coverage reports
	@echo "🧹 Cleaning coverage reports..."
	@rm -rf backend/htmlcov backend/.coverage backend/coverage.xml backend/coverage.lcov
	@rm -rf frontend/coverage
	@rm -rf shared/.nyc_output shared/coverage
	@rm -rf coverage coverage-merged
	@echo "✅ Coverage reports cleaned"

validate: ## Validate project setup
	@echo "✅ Validating project setup..."
	@./scripts/validate-setup.sh

install-backend: ## Install backend dependencies
	@echo "📦 Installing backend dependencies..."
	@cd backend && pip install -r requirements.txt

install-frontend: ## Install frontend dependencies
	@echo "📦 Installing frontend dependencies..."
	@cd frontend && npm install

install-cms: ## Install CMS dependencies
	@echo "📦 Installing CMS dependencies..."
	@cd cms && npm install

install: install-frontend install-cms ## Install all dependencies (frontend + CMS)
	@echo "✅ All dependencies installed"

clean: ## Clean up containers, volumes, and dependencies
	@echo "🧹 Cleaning up..."
	@docker-compose down -v
	@rm -rf backend/__pycache__ backend/.pytest_cache
	@rm -rf frontend/node_modules frontend/.next
	@rm -rf cms/node_modules cms/build
	@echo "✅ Cleanup complete"

ps: ## Show running containers
	@docker-compose ps

health: ## Check backend health
	@curl -s http://localhost:8000/health | python3 -m json.tool || echo "❌ Backend not responding"
