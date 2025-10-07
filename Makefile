# Copyright (c) 2025 Affilibuster by Ronen Druker.
# Makefile for Affilibuster development

.PHONY: help dev start stop restart logs test clean install

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

test: ## Run all backend tests with coverage
	@echo "🧪 Running backend tests with coverage..."
	@docker-compose exec -T backend pytest -v --cov=src --cov-report=term-missing --cov-report=html --tb=short
	@echo ""
	@echo "✅ Tests complete!"
	@echo "📊 Coverage report: backend/htmlcov/index.html"

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
