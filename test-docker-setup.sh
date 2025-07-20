#!/bin/bash
# Test script for Docker setup - Website Nhà Hàng

set -e

echo "🧪 Testing Docker Setup for Website Nhà Hàng"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Test 1: Check Docker installation
echo ""
echo "🔍 Test 1: Checking Docker installation..."
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    print_status "SUCCESS" "Docker is installed: $DOCKER_VERSION"
else
    print_status "ERROR" "Docker is not installed"
    echo ""
    echo "📦 To install Docker on Ubuntu/Debian:"
    echo "   sudo apt update"
    echo "   sudo apt install docker.io docker-compose"
    echo "   sudo systemctl start docker"
    echo "   sudo systemctl enable docker"
    echo "   sudo usermod -aG docker \$USER"
    echo ""
    echo "📦 To install Docker on CentOS/RHEL:"
    echo "   sudo yum install docker docker-compose"
    echo "   sudo systemctl start docker"
    echo "   sudo systemctl enable docker"
    echo "   sudo usermod -aG docker \$USER"
    echo ""
    echo "🔄 After installation, logout and login again, then run this script."
    exit 1
fi

# Test 2: Check Docker Compose
echo ""
echo "🔍 Test 2: Checking Docker Compose..."
if command_exists docker-compose; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_status "SUCCESS" "Docker Compose is installed: $COMPOSE_VERSION"
elif docker compose version >/dev/null 2>&1; then
    COMPOSE_VERSION=$(docker compose version)
    print_status "SUCCESS" "Docker Compose (plugin) is installed: $COMPOSE_VERSION"
    COMPOSE_CMD="docker compose"
else
    print_status "ERROR" "Docker Compose is not installed"
    echo "   Install with: sudo apt install docker-compose"
    exit 1
fi

# Set compose command
COMPOSE_CMD=${COMPOSE_CMD:-"docker-compose"}

# Test 3: Check Docker daemon
echo ""
echo "🔍 Test 3: Checking Docker daemon..."
if docker info >/dev/null 2>&1; then
    print_status "SUCCESS" "Docker daemon is running"
else
    print_status "ERROR" "Docker daemon is not running"
    echo "   Start with: sudo systemctl start docker"
    exit 1
fi

# Test 4: Check required files
echo ""
echo "🔍 Test 4: Checking required files..."
required_files=(
    "Dockerfile"
    "docker-compose.yml"
    ".env"
    "backend/package.json"
    "backend/server.js"
    "QuanLyDBWeb/CNPM_QuanLyNhaHang.sql"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "SUCCESS" "Found: $file"
    else
        print_status "ERROR" "Missing: $file"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    print_status "ERROR" "Missing required files. Please ensure all files are present."
    exit 1
fi

# Test 5: Validate Docker Compose configuration
echo ""
echo "🔍 Test 5: Validating Docker Compose configuration..."
if $COMPOSE_CMD config >/dev/null 2>&1; then
    print_status "SUCCESS" "Docker Compose configuration is valid"
else
    print_status "ERROR" "Docker Compose configuration has errors"
    echo "   Run '$COMPOSE_CMD config' to see details"
    exit 1
fi

# Test 6: Check available ports
echo ""
echo "🔍 Test 6: Checking port availability..."
ports_to_check=(3000 8080 3306 6379)
for port in "${ports_to_check[@]}"; do
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        print_status "WARNING" "Port $port is already in use"
    else
        print_status "SUCCESS" "Port $port is available"
    fi
done

# Test 7: Check disk space
echo ""
echo "🔍 Test 7: Checking disk space..."
available_space=$(df . | awk 'NR==2 {print $4}')
required_space=2097152  # 2GB in KB

if [ "$available_space" -gt "$required_space" ]; then
    print_status "SUCCESS" "Sufficient disk space available"
else
    print_status "WARNING" "Low disk space. At least 2GB recommended"
fi

# Test 8: Test Docker build (dry run)
echo ""
echo "🔍 Test 8: Testing Docker build (syntax check)..."
if docker build --dry-run . >/dev/null 2>&1; then
    print_status "SUCCESS" "Dockerfile syntax is valid"
else
    print_status "WARNING" "Dockerfile may have syntax issues (dry-run not supported on this Docker version)"
fi

# Summary
echo ""
echo "📊 Test Summary"
echo "==============="
print_status "INFO" "All basic checks completed!"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: $COMPOSE_CMD up -d"
echo "   2. Check status: $COMPOSE_CMD ps"
echo "   3. View logs: $COMPOSE_CMD logs -f"
echo "   4. Access frontend: http://localhost:8080"
echo "   5. Access backend API: http://localhost:3000/api"
echo "   6. Health check: http://localhost:3000/api/health"
echo ""
echo "🛠️  Development commands:"
echo "   • Development mode: $COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml up -d"
echo "   • Stop services: $COMPOSE_CMD down"
echo "   • View logs: $COMPOSE_CMD logs -f [service_name]"
echo "   • Rebuild: $COMPOSE_CMD build --no-cache"
echo ""
echo "📚 For more help, see: docker/README.md"
