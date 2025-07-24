#!/bin/bash

# ==============================================
# ENVIRONMENT SWITCHER SCRIPT
# Restaurant Management System
# ==============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [dev|prod]"
    echo ""
    echo "Commands:"
    echo "  dev   - Switch to development environment"
    echo "  prod  - Switch to production environment"
    echo ""
    echo "Examples:"
    echo "  $0 dev    # Switch to development"
    echo "  $0 prod   # Switch to production"
}

# Function to backup current env files
backup_env_files() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    if [[ -f ".env" ]]; then
        cp .env ".env.backup.$timestamp"
        print_info "Backed up .env to .env.backup.$timestamp"
    fi
    
    if [[ -f "backend/.env" ]]; then
        cp backend/.env "backend/.env.backup.$timestamp"
        print_info "Backed up backend/.env to backend/.env.backup.$timestamp"
    fi
}

# Function to switch to development environment
switch_to_dev() {
    print_info "Switching to development environment..."
    
    # Backup current files
    backup_env_files
    
    # Copy development environment files
    if [[ -f ".env.dev" ]]; then
        cp .env.dev .env
        print_success "Copied .env.dev to .env"
    else
        print_error ".env.dev not found!"
        exit 1
    fi
    
    if [[ -f "backend/.env.dev" ]]; then
        cp backend/.env.dev backend/.env
        print_success "Copied backend/.env.dev to backend/.env"
    else
        print_error "backend/.env.dev not found!"
        exit 1
    fi
    
    print_success "✅ Switched to development environment"
    echo ""
    echo "Development settings:"
    echo "- NODE_ENV=development"
    echo "- Frontend: http://localhost:8080"
    echo "- Backend: http://localhost:3000"
    echo "- phpMyAdmin: http://localhost:8081"
    echo "- Debug mode: enabled"
    echo "- Swagger docs: enabled"
    echo ""
    echo "To start development environment:"
    echo "  make dev-up"
}

# Function to switch to production environment
switch_to_prod() {
    print_info "Switching to production environment..."
    
    # Backup current files
    backup_env_files
    
    # Copy production environment files
    if [[ -f ".env.example" ]]; then
        cp .env.example .env
        print_success "Copied .env.example to .env"
    else
        print_error ".env.example not found!"
        exit 1
    fi
    
    if [[ -f "backend/.env.example" ]]; then
        cp backend/.env.example backend/.env
        print_success "Copied backend/.env.example to backend/.env"
    else
        print_error "backend/.env.example not found!"
        exit 1
    fi
    
    print_warning "⚠️  IMPORTANT: Please review and update the following in .env files:"
    echo "- JWT_SECRET (use a strong secret key)"
    echo "- Database passwords"
    echo "- API keys"
    echo "- CORS origins for your domain"
    
    print_success "✅ Switched to production environment"
    echo ""
    echo "Production settings:"
    echo "- NODE_ENV=production"
    echo "- Frontend: http://localhost:80"
    echo "- Backend: http://localhost:3000"
    echo "- Debug mode: disabled"
    echo "- Enhanced security settings"
    echo ""
    echo "To start production environment:"
    echo "  make up"
}

# Function to show current environment
show_current_env() {
    print_info "Current environment configuration:"
    echo ""
    
    if [[ -f ".env" ]]; then
        NODE_ENV=$(grep "^NODE_ENV=" .env | cut -d'=' -f2 || echo "not set")
        FRONTEND_PORT=$(grep "^FRONTEND_PORT=" .env | cut -d'=' -f2 || echo "not set")
        DEBUG=$(grep "^DEBUG=" .env | cut -d'=' -f2 || echo "not set")
        
        echo "Root .env:"
        echo "  NODE_ENV: $NODE_ENV"
        echo "  FRONTEND_PORT: $FRONTEND_PORT"
        echo "  DEBUG: $DEBUG"
    else
        print_warning ".env file not found"
    fi
    
    echo ""
    
    if [[ -f "backend/.env" ]]; then
        BACKEND_NODE_ENV=$(grep "^NODE_ENV=" backend/.env | cut -d'=' -f2 || echo "not set")
        DB_HOST=$(grep "^DB_HOST=" backend/.env | cut -d'=' -f2 || echo "not set")
        
        echo "Backend .env:"
        echo "  NODE_ENV: $BACKEND_NODE_ENV"
        echo "  DB_HOST: $DB_HOST"
    else
        print_warning "backend/.env file not found"
    fi
}

# Main function
main() {
    echo "=============================================="
    echo "🔄 Environment Switcher"
    echo "=============================================="
    echo ""
    
    case "${1:-}" in
        "dev")
            switch_to_dev
            ;;
        "prod")
            switch_to_prod
            ;;
        "status")
            show_current_env
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        "")
            print_error "No command specified"
            echo ""
            show_usage
            exit 1
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
