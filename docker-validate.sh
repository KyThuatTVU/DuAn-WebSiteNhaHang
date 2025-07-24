#!/bin/bash

# ==============================================
# DOCKER SETUP VALIDATION SCRIPT
# ==============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Docker installation
check_docker() {
    print_status "Checking Docker installation..."
    
    if command_exists docker; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker found: $DOCKER_VERSION"
    else
        print_error "Docker is not installed!"
        echo "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if command_exists docker-compose; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_success "Docker Compose found: $COMPOSE_VERSION"
    else
        print_error "Docker Compose is not installed!"
        echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
}

# Function to check Docker daemon
check_docker_daemon() {
    print_status "Checking Docker daemon..."
    
    if docker info >/dev/null 2>&1; then
        print_success "Docker daemon is running"
    else
        print_error "Docker daemon is not running!"
        echo "Please start Docker daemon"
        exit 1
    fi
}

# Function to check required files
check_files() {
    print_status "Checking required files..."
    
    REQUIRED_FILES=(
        "docker-compose.yml"
        "docker-compose.dev.yml"
        "backend/Dockerfile"
        "frontend/Dockerfile"
        "backend/package.json"
        "QuanLyDBWeb/CNPM_QuanLyNhaHang.sql"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [[ -f "$file" ]]; then
            print_success "Found: $file"
        else
            print_error "Missing: $file"
            exit 1
        fi
    done
}

# Function to check environment files
check_env_files() {
    print_status "Checking environment files..."
    
    if [[ -f ".env" ]]; then
        print_success "Found: .env"
    else
        print_warning "Missing: .env (will use defaults)"
        if [[ -f ".env.example" ]]; then
            print_status "Copying .env.example to .env"
            cp .env.example .env
            print_success "Created .env from template"
        fi
    fi
    
    if [[ -f "backend/.env" ]]; then
        print_success "Found: backend/.env"
    else
        print_warning "Missing: backend/.env (will use defaults)"
        if [[ -f "backend/.env.example" ]]; then
            print_status "Copying backend/.env.example to backend/.env"
            cp backend/.env.example backend/.env
            print_success "Created backend/.env from template"
        fi
    fi
}

# Function to check ports
check_ports() {
    print_status "Checking port availability..."
    
    PORTS=(3000 80 3307)
    
    for port in "${PORTS[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $port is already in use"
            echo "You may need to change the port in .env file or stop the service using this port"
        else
            print_success "Port $port is available"
        fi
    done
}

# Function to validate Docker Compose files
validate_compose() {
    print_status "Validating Docker Compose files..."
    
    if docker-compose config >/dev/null 2>&1; then
        print_success "docker-compose.yml is valid"
    else
        print_error "docker-compose.yml has syntax errors"
        docker-compose config
        exit 1
    fi
    
    if docker-compose -f docker-compose.dev.yml config >/dev/null 2>&1; then
        print_success "docker-compose.dev.yml is valid"
    else
        print_error "docker-compose.dev.yml has syntax errors"
        docker-compose -f docker-compose.dev.yml config
        exit 1
    fi
}

# Function to check system resources
check_resources() {
    print_status "Checking system resources..."
    
    # Check available memory (in MB)
    AVAILABLE_MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [[ $AVAILABLE_MEMORY -lt 1024 ]]; then
        print_warning "Available memory is less than 1GB ($AVAILABLE_MEMORY MB)"
        echo "Docker containers may run slowly"
    else
        print_success "Available memory: ${AVAILABLE_MEMORY}MB"
    fi
    
    # Check available disk space (in GB)
    AVAILABLE_DISK=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//')
    if [[ $AVAILABLE_DISK -lt 5 ]]; then
        print_warning "Available disk space is less than 5GB (${AVAILABLE_DISK}GB)"
        echo "You may need more space for Docker images and volumes"
    else
        print_success "Available disk space: ${AVAILABLE_DISK}GB"
    fi
}

# Function to test Docker build
test_build() {
    print_status "Testing Docker build (this may take a while)..."
    
    if docker-compose build --no-cache >/dev/null 2>&1; then
        print_success "Docker build completed successfully"
    else
        print_error "Docker build failed"
        echo "Run 'docker-compose build' to see detailed error messages"
        exit 1
    fi
}

# Main validation function
main() {
    echo "=============================================="
    echo "🐳 Docker Setup Validation"
    echo "=============================================="
    echo
    
    check_docker
    echo
    
    check_docker_daemon
    echo
    
    check_files
    echo
    
    check_env_files
    echo
    
    check_ports
    echo
    
    validate_compose
    echo
    
    check_resources
    echo
    
    # Ask user if they want to test build
    read -p "Do you want to test Docker build? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        test_build
        echo
    fi
    
    echo "=============================================="
    print_success "✅ Validation completed!"
    echo "=============================================="
    echo
    echo "Next steps:"
    echo "1. Review and edit .env files if needed"
    echo "2. Run 'make dev-up' for development"
    echo "3. Run 'make up' for production"
    echo "4. Check 'make help' for more commands"
}

# Run main function
main "$@"
