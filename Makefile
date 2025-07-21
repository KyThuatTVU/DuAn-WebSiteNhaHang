# 🍽️ Restaurant Management System - Makefile
.PHONY: help start stop restart build logs clean backup restore test

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Variables
COMPOSE_FILE := docker-compose.yml
ENV_FILE := .env

help: ## Show this help message
	@echo "$(BLUE)🍽️ Restaurant Management System - Docker Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(BLUE)Examples:$(NC)"
	@echo "  make start    # Start all services"
	@echo "  make logs     # View logs"
	@echo "  make backup   # Backup database"

setup: ## Initial setup - copy env file and set permissions
	@echo "$(BLUE)Setting up Restaurant Management System...$(NC)"
	@if [ ! -f $(ENV_FILE) ]; then \
		cp .env.docker $(ENV_FILE); \
		echo "$(GREEN)✅ Environment file created$(NC)"; \
	else \
		echo "$(YELLOW)⚠️ Environment file already exists$(NC)"; \
	fi
	@mkdir -p backend/logs backend/images uploads docker/ssl backups
	@chmod +x docker/scripts/*.sh
	@echo "$(GREEN)✅ Setup completed$(NC)"

start: setup ## Start all services
	@echo "$(BLUE)🚀 Starting Restaurant Management System...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✅ Services started$(NC)"
	@echo "$(BLUE)📱 Frontend: http://localhost$(NC)"
	@echo "$(BLUE)🔧 API: http://localhost:3000/api$(NC)"
	@echo "$(BLUE)📚 Docs: http://localhost:3000/api/docs$(NC)"

stop: ## Stop all services
	@echo "$(BLUE)🛑 Stopping services...$(NC)"
	@docker-compose stop
	@echo "$(GREEN)✅ Services stopped$(NC)"

restart: ## Restart all services
	@echo "$(BLUE)🔄 Restarting services...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)✅ Services restarted$(NC)"

build: ## Build all services
	@echo "$(BLUE)🔨 Building services...$(NC)"
	@docker-compose build --no-cache
	@echo "$(GREEN)✅ Build completed$(NC)"

rebuild: ## Rebuild and start services
	@echo "$(BLUE)🔨 Rebuilding and starting services...$(NC)"
	@docker-compose up -d --build
	@echo "$(GREEN)✅ Rebuild completed$(NC)"

logs: ## View logs from all services
	@docker-compose logs -f

logs-backend: ## View backend logs only
	@docker-compose logs -f backend

logs-mysql: ## View MySQL logs only
	@docker-compose logs -f mysql

logs-nginx: ## View Nginx logs only
	@docker-compose logs -f nginx

status: ## Show service status
	@echo "$(BLUE)📊 Service Status:$(NC)"
	@docker-compose ps

health: ## Check service health
	@echo "$(BLUE)🏥 Checking service health...$(NC)"
	@echo "$(YELLOW)API Health:$(NC)"
	@curl -f http://localhost:3000/api/health 2>/dev/null && echo "$(GREEN)✅ API OK$(NC)" || echo "$(RED)❌ API Failed$(NC)"
	@echo "$(YELLOW)Frontend:$(NC)"
	@curl -f http://localhost/ 2>/dev/null >/dev/null && echo "$(GREEN)✅ Frontend OK$(NC)" || echo "$(RED)❌ Frontend Failed$(NC)"
	@echo "$(YELLOW)Database:$(NC)"
	@docker-compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null && echo "$(GREEN)✅ Database OK$(NC)" || echo "$(RED)❌ Database Failed$(NC)"

backup: ## Backup database and images
	@echo "$(BLUE)💾 Creating backup...$(NC)"
	@./docker/scripts/backup.sh

clean: ## Clean up Docker resources
	@echo "$(BLUE)🧹 Cleaning up Docker resources...$(NC)"
	@docker-compose down
	@docker system prune -f
	@echo "$(GREEN)✅ Cleanup completed$(NC)"

clean-all: ## Clean up everything including volumes (⚠️ DESTRUCTIVE)
	@echo "$(RED)⚠️ WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	@docker-compose down -v
	@docker system prune -a -f
	@echo "$(GREEN)✅ Complete cleanup done$(NC)"

shell-backend: ## Access backend container shell
	@docker-compose exec backend sh

shell-mysql: ## Access MySQL container shell
	@docker-compose exec mysql mysql -u restaurant_user -p QuanLyNhaHang

shell-nginx: ## Access Nginx container shell
	@docker-compose exec nginx sh

test: ## Run API tests
	@echo "$(BLUE)🧪 Running API tests...$(NC)"
	@curl -f http://localhost:3000/api/health
	@curl -f http://localhost:3000/api/foods
	@curl -f http://localhost:3000/api/categories
	@echo "$(GREEN)✅ Basic tests passed$(NC)"

dev: ## Start in development mode
	@echo "$(BLUE)🔧 Starting in development mode...$(NC)"
	@docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✅ Development environment started$(NC)"

prod: ## Start in production mode
	@echo "$(BLUE)🚀 Starting in production mode...$(NC)"
	@NODE_ENV=production docker-compose up -d
	@echo "$(GREEN)✅ Production environment started$(NC)"

update: ## Update Docker images
	@echo "$(BLUE)📦 Updating Docker images...$(NC)"
	@docker-compose pull
	@docker-compose up -d
	@echo "$(GREEN)✅ Images updated$(NC)"

monitor: ## Show resource usage
	@echo "$(BLUE)📊 Resource Usage:$(NC)"
	@docker stats --no-stream

network: ## Show network information
	@echo "$(BLUE)🌐 Network Information:$(NC)"
	@docker network ls
	@echo ""
	@docker-compose exec backend ip addr show

volumes: ## Show volume information
	@echo "$(BLUE)💾 Volume Information:$(NC)"
	@docker volume ls

install: setup start ## Complete installation (setup + start)
	@echo "$(GREEN)🎉 Restaurant Management System installed successfully!$(NC)"
	@echo ""
	@echo "$(BLUE)Access your application:$(NC)"
	@echo "  Frontend: http://localhost"
	@echo "  API: http://localhost:3000/api"
	@echo "  Docs: http://localhost:3000/api/docs"
	@echo "  PhpMyAdmin: http://localhost:8080"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Update .env file with your configuration"
	@echo "  2. Run 'make health' to check all services"
	@echo "  3. Run 'make backup' to create your first backup"

uninstall: clean-all ## Complete uninstallation (⚠️ DESTRUCTIVE)
	@echo "$(RED)🗑️ Uninstalling Restaurant Management System...$(NC)"
	@rm -f $(ENV_FILE)
	@echo "$(GREEN)✅ Uninstallation completed$(NC)"
