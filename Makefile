# ==============================================
# RESTAURANT MANAGEMENT SYSTEM - DOCKER COMMANDS
# ==============================================

.PHONY: help build up down logs clean dev prod restart status

# Default target
help: ## Show this help message
	@echo "Restaurant Management System - Docker Commands"
	@echo "=============================================="
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ==============================================
# PRODUCTION COMMANDS
# ==============================================

build: ## Build all Docker images for production
	@echo "Building production images..."
	docker-compose build --no-cache

up: ## Start all services in production mode
	@echo "Starting production services..."
	docker-compose up -d

down: ## Stop all services
	@echo "Stopping all services..."
	docker-compose down

restart: ## Restart all services
	@echo "Restarting all services..."
	docker-compose restart

# ==============================================
# DEVELOPMENT COMMANDS
# ==============================================

dev-build: ## Build all Docker images for development
	@echo "Building development images..."
	docker-compose -f docker-compose.dev.yml build --no-cache

dev-up: ## Start all services in development mode
	@echo "Starting development services..."
	docker-compose -f docker-compose.dev.yml up -d

dev-down: ## Stop development services
	@echo "Stopping development services..."
	docker-compose -f docker-compose.dev.yml down

dev-restart: ## Restart development services
	@echo "Restarting development services..."
	docker-compose -f docker-compose.dev.yml restart

dev-logs: ## Show development logs
	docker-compose -f docker-compose.dev.yml logs -f

# ==============================================
# UTILITY COMMANDS
# ==============================================

logs: ## Show logs for all services
	docker-compose logs -f

logs-backend: ## Show backend logs only
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs only
	docker-compose logs -f frontend

logs-db: ## Show database logs only
	docker-compose logs -f database

status: ## Show status of all containers
	@echo "Container Status:"
	@echo "=================="
	docker-compose ps

# ==============================================
# DATABASE COMMANDS
# ==============================================

db-shell: ## Access MySQL shell
	docker-compose exec database mysql -u nhahang_user -p QuanLyNhaHang

db-backup: ## Backup database
	@echo "Creating database backup..."
	docker-compose exec database mysqldump -u nhahang_user -p QuanLyNhaHang > backup_$(shell date +%Y%m%d_%H%M%S).sql

db-restore: ## Restore database from backup (usage: make db-restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then echo "Usage: make db-restore FILE=backup.sql"; exit 1; fi
	docker-compose exec -T database mysql -u nhahang_user -p QuanLyNhaHang < $(FILE)

db-test: ## Test database connection
	@echo "Testing database connection..."
	./test-db-connection.sh all

db-test-host: ## Test database connection from host
	./test-db-connection.sh host

db-test-container: ## Test database connection from container
	./test-db-connection.sh container

db-status: ## Show database status
	./test-db-connection.sh status

db-sample: ## Check sample data in database
	@echo "Checking sample data..."
	./check-sample-data.sh check

db-summary: ## Show sample data summary
	./check-sample-data.sh summary

# ==============================================
# API & CORS TESTING
# ==============================================

test-cors: ## Test CORS configuration
	@echo "Testing CORS configuration..."
	./test-cors.sh

test-api: ## Test API endpoints
	@echo "Testing API endpoints..."
	@curl -s http://localhost:3000/api/health | jq . || echo "API not responding or jq not installed"

test-frontend: ## Test frontend to backend connection
	@echo "Testing frontend to backend connection..."
	@echo "Open browser and check console at:"
	@echo "  Development: http://localhost:8080"
	@echo "  Production: http://localhost:80"

# ==============================================
# CLEANUP COMMANDS
# ==============================================

clean: ## Remove all containers, networks, and volumes
	@echo "Cleaning up Docker resources..."
	docker-compose down -v --remove-orphans
	docker system prune -f

clean-dev: ## Remove development containers, networks, and volumes
	@echo "Cleaning up development Docker resources..."
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans

clean-all: ## Remove everything including images
	@echo "Removing all Docker resources..."
	docker-compose down -v --remove-orphans --rmi all
	docker system prune -af

# ==============================================
# ENVIRONMENT MANAGEMENT
# ==============================================

env-dev: ## Switch to development environment
	@echo "Switching to development environment..."
	./switch-env.sh dev

env-prod: ## Switch to production environment
	@echo "Switching to production environment..."
	./switch-env.sh prod

env-status: ## Show current environment status
	@echo "Current environment status:"
	./switch-env.sh status

# ==============================================
# SETUP COMMANDS
# ==============================================

setup: ## Initial setup - copy env files and build
	@echo "Setting up project..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "Created .env file"; fi
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env; echo "Created backend/.env file"; fi
	@echo "Please edit .env files with your configuration"
	@echo "Then run: make build && make up"

init-dev: ## Initialize development environment
	@echo "Initializing development environment..."
	./switch-env.sh dev
	make dev-build
	make dev-up
	@echo "Development environment is ready!"
	@echo "Frontend: http://localhost:8080"
	@echo "Backend API: http://localhost:3000"
	@echo "phpMyAdmin: http://localhost:8081"

init-prod: ## Initialize production environment
	@echo "Initializing production environment..."
	./switch-env.sh prod
	@echo "Please review and update .env files with production values"
	@echo "Then run: make build && make up"

# ==============================================
# MONITORING COMMANDS
# ==============================================

health: ## Check health of all services
	@echo "Checking service health..."
	@docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

monitor: ## Monitor resource usage
	docker stats $(shell docker-compose ps -q)
