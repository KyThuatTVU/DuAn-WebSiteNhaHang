#!/bin/bash
# Complete setup test for Website Nhà Hàng Docker

echo "🧪 Complete Setup Test - Website Nhà Hàng"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_status() {
    case $1 in
        "SUCCESS") echo -e "${GREEN}✅ $2${NC}" ;;
        "ERROR") echo -e "${RED}❌ $2${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️  $2${NC}" ;;
        "STEP") echo -e "${PURPLE}🔧 $2${NC}" ;;
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo ""
print_status "STEP" "Step 1: Checking system requirements..."

# Check OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    print_status "INFO" "Operating System: $PRETTY_NAME"
else
    print_status "WARNING" "Cannot detect OS version"
fi

# Check architecture
ARCH=$(uname -m)
print_status "INFO" "Architecture: $ARCH"

echo ""
print_status "STEP" "Step 2: Checking required software..."

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "SUCCESS" "Node.js is installed: $NODE_VERSION"
else
    print_status "ERROR" "Node.js is not installed"
    echo "   Install: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "           sudo apt-get install -y nodejs"
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_status "SUCCESS" "npm is installed: $NPM_VERSION"
else
    print_status "ERROR" "npm is not installed"
    echo "   Usually comes with Node.js installation"
fi

# Check Docker
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    print_status "SUCCESS" "Docker is installed: $DOCKER_VERSION"
    
    # Check if Docker daemon is running
    if docker info >/dev/null 2>&1; then
        print_status "SUCCESS" "Docker daemon is running"
    else
        print_status "ERROR" "Docker daemon is not running"
        echo "   Start: sudo systemctl start docker"
    fi
else
    print_status "ERROR" "Docker is not installed"
    echo "   Install: sudo apt update && sudo apt install docker.io"
fi

# Check Docker Compose
if command_exists docker-compose; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_status "SUCCESS" "Docker Compose is installed: $COMPOSE_VERSION"
elif docker compose version >/dev/null 2>&1; then
    COMPOSE_VERSION=$(docker compose version)
    print_status "SUCCESS" "Docker Compose (plugin) is installed: $COMPOSE_VERSION"
else
    print_status "ERROR" "Docker Compose is not installed"
    echo "   Install: sudo apt install docker-compose"
fi

echo ""
print_status "STEP" "Step 3: Checking project files..."

# Check all required files
required_files=(
    "Dockerfile"
    "docker-compose.yml"
    "docker-compose.dev.yml"
    ".env"
    ".dockerignore"
    "backend/package.json"
    "backend/server.js"
    "backend/app.js"
    "frontend/Index-new.html"
    "QuanLyDBWeb/CNPM_QuanLyNhaHang.sql"
)

all_files_present=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "SUCCESS" "Found: $file"
    else
        print_status "ERROR" "Missing: $file"
        all_files_present=false
    fi
done

echo ""
print_status "STEP" "Step 4: Checking Docker configuration..."

if [ -f "docker-compose.yml" ]; then
    # Check if docker-compose config is valid (if docker-compose is available)
    if command_exists docker-compose; then
        if docker-compose config >/dev/null 2>&1; then
            print_status "SUCCESS" "Docker Compose configuration is valid"
        else
            print_status "ERROR" "Docker Compose configuration has errors"
        fi
    elif command_exists docker && docker compose version >/dev/null 2>&1; then
        if docker compose config >/dev/null 2>&1; then
            print_status "SUCCESS" "Docker Compose configuration is valid"
        else
            print_status "ERROR" "Docker Compose configuration has errors"
        fi
    else
        print_status "WARNING" "Cannot validate Docker Compose config (Docker not available)"
    fi
fi

echo ""
print_status "STEP" "Step 5: Checking ports..."

ports_to_check=(3000 8080 3306 6379)
for port in "${ports_to_check[@]}"; do
    if command_exists netstat; then
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            print_status "WARNING" "Port $port is already in use"
        else
            print_status "SUCCESS" "Port $port is available"
        fi
    elif command_exists ss; then
        if ss -tuln 2>/dev/null | grep -q ":$port "; then
            print_status "WARNING" "Port $port is already in use"
        else
            print_status "SUCCESS" "Port $port is available"
        fi
    else
        print_status "INFO" "Cannot check port $port (netstat/ss not available)"
    fi
done

echo ""
print_status "STEP" "Step 6: Checking disk space..."

available_space=$(df . | awk 'NR==2 {print $4}')
required_space=2097152  # 2GB in KB

if [ "$available_space" -gt "$required_space" ]; then
    space_gb=$((available_space / 1024 / 1024))
    print_status "SUCCESS" "Sufficient disk space: ${space_gb}GB available"
else
    space_gb=$((available_space / 1024 / 1024))
    print_status "WARNING" "Low disk space: ${space_gb}GB available (2GB+ recommended)"
fi

echo ""
echo "📊 Test Results Summary"
echo "======================="

# Overall status
if command_exists docker && command_exists node && [ "$all_files_present" = true ]; then
    print_status "SUCCESS" "System is ready for Docker deployment!"
    
    echo ""
    echo "🚀 Ready to deploy! Run these commands:"
    echo ""
    echo "   # Production deployment:"
    echo "   docker-compose up -d"
    echo ""
    echo "   # Development deployment:"
    echo "   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d"
    echo ""
    echo "   # Check status:"
    echo "   docker-compose ps"
    echo ""
    echo "   # View logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "   # Access points:"
    echo "   • Frontend: http://localhost:8080"
    echo "   • Backend API: http://localhost:3000/api"
    echo "   • Health Check: http://localhost:3000/api/health"
    echo "   • API Docs: http://localhost:3000/api-docs"
    
elif [ "$all_files_present" = true ]; then
    print_status "WARNING" "Project files are ready, but system requirements not met"
    
    echo ""
    echo "🔧 Installation needed:"
    
    if ! command_exists docker; then
        echo ""
        echo "📦 Install Docker:"
        echo "   sudo apt update"
        echo "   sudo apt install docker.io docker-compose"
        echo "   sudo systemctl start docker"
        echo "   sudo systemctl enable docker"
        echo "   sudo usermod -aG docker \$USER"
        echo "   # Logout and login again"
    fi
    
    if ! command_exists node; then
        echo ""
        echo "📦 Install Node.js:"
        echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "   sudo apt-get install -y nodejs"
    fi
    
else
    print_status "ERROR" "Project setup incomplete"
    echo ""
    echo "❌ Missing files or system requirements"
    echo "   Please ensure all Docker files are created and system requirements are met"
fi

echo ""
echo "📚 For detailed help:"
echo "   • Docker setup: docker/README.md"
echo "   • Project docs: README.md"
echo "   • Configuration test: ./test-config.sh"
