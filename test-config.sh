#!/bin/bash
# Configuration test script - Website Nhà Hàng

echo "🧪 Testing Docker Configuration for Website Nhà Hàng"
echo "===================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    case $1 in
        "SUCCESS") echo -e "${GREEN}✅ $2${NC}" ;;
        "ERROR") echo -e "${RED}❌ $2${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️  $2${NC}" ;;
    esac
}

echo ""
echo "🔍 Checking required files..."

# Check Docker files
files=(
    "Dockerfile:Docker build configuration"
    "docker-compose.yml:Main Docker Compose file"
    "docker-compose.dev.yml:Development Docker Compose"
    ".env:Environment variables"
    ".dockerignore:Docker ignore file"
)

for item in "${files[@]}"; do
    file=$(echo $item | cut -d: -f1)
    desc=$(echo $item | cut -d: -f2)
    if [ -f "$file" ]; then
        print_status "SUCCESS" "$desc ($file)"
    else
        print_status "ERROR" "Missing: $desc ($file)"
    fi
done

echo ""
echo "🔍 Checking Docker configuration directories..."

dirs=(
    "docker/scripts:Docker scripts"
    "docker/nginx:Nginx configuration"
    "docker/mysql:MySQL configuration"
    "docker/redis:Redis configuration"
)

for item in "${dirs[@]}"; do
    dir=$(echo $item | cut -d: -f1)
    desc=$(echo $item | cut -d: -f2)
    if [ -d "$dir" ]; then
        print_status "SUCCESS" "$desc ($dir/)"
    else
        print_status "ERROR" "Missing: $desc ($dir/)"
    fi
done

echo ""
echo "🔍 Checking backend files..."

backend_files=(
    "backend/package.json:Backend dependencies"
    "backend/server.js:Backend entry point"
    "backend/app.js:Main application"
    "backend/config/database.js:Database configuration"
)

for item in "${backend_files[@]}"; do
    file=$(echo $item | cut -d: -f1)
    desc=$(echo $item | cut -d: -f2)
    if [ -f "$file" ]; then
        print_status "SUCCESS" "$desc ($file)"
    else
        print_status "ERROR" "Missing: $desc ($file)"
    fi
done

echo ""
echo "🔍 Checking frontend files..."

if [ -d "frontend" ]; then
    print_status "SUCCESS" "Frontend directory exists"
    if [ -f "frontend/Index-new.html" ]; then
        print_status "SUCCESS" "Main frontend file (Index-new.html)"
    else
        print_status "WARNING" "Main frontend file not found"
    fi
else
    print_status "ERROR" "Frontend directory missing"
fi

echo ""
echo "🔍 Checking database files..."

if [ -f "QuanLyDBWeb/CNPM_QuanLyNhaHang.sql" ]; then
    print_status "SUCCESS" "Database SQL file found"
else
    print_status "ERROR" "Database SQL file missing"
fi

echo ""
echo "🔍 Validating .env file..."

if [ -f ".env" ]; then
    required_vars=(
        "NODE_ENV"
        "PORT"
        "DB_HOST"
        "DB_USER"
        "DB_PASSWORD"
        "DB_NAME"
        "JWT_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env; then
            print_status "SUCCESS" "Environment variable: $var"
        else
            print_status "WARNING" "Missing environment variable: $var"
        fi
    done
else
    print_status "ERROR" ".env file not found"
fi

echo ""
echo "🔍 Checking script permissions..."

scripts=(
    "docker/scripts/start.sh"
    "docker/scripts/backup.sh"
    "test-docker-setup.sh"
    "test-config.sh"
)

for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            print_status "SUCCESS" "Executable: $script"
        else
            print_status "WARNING" "Not executable: $script (run: chmod +x $script)"
        fi
    fi
done

echo ""
echo "📊 Configuration Summary"
echo "========================"
print_status "INFO" "Configuration check completed!"

echo ""
echo "🐳 Docker Installation Status:"
if command -v docker >/dev/null 2>&1; then
    print_status "SUCCESS" "Docker is installed"
    if command -v docker-compose >/dev/null 2>&1; then
        print_status "SUCCESS" "Docker Compose is installed"
    else
        print_status "WARNING" "Docker Compose not found"
    fi
else
    print_status "ERROR" "Docker is not installed"
    echo ""
    echo "📦 To install Docker:"
    echo "   Ubuntu/Debian: sudo apt update && sudo apt install docker.io docker-compose"
    echo "   CentOS/RHEL: sudo yum install docker docker-compose"
    echo "   After installation: sudo systemctl start docker && sudo usermod -aG docker \$USER"
fi

echo ""
echo "🚀 Next Steps:"
echo "   1. Install Docker if not already installed"
echo "   2. Run: docker-compose up -d"
echo "   3. Check: docker-compose ps"
echo "   4. Access: http://localhost:8080 (frontend)"
echo "   5. API: http://localhost:3000/api (backend)"
echo ""
echo "📚 For detailed instructions, see: docker/README.md"
