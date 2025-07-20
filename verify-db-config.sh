#!/bin/bash
# Verify database configuration after updates

echo "🔍 Verifying Database Configuration Updates"
echo "==========================================="

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
echo "🔍 Checking .env file (Docker configuration)..."
if [ -f ".env" ]; then
    print_status "SUCCESS" ".env file found"
    
    # Check each variable
    db_host=$(grep "^DB_HOST=" .env | cut -d'=' -f2)
    db_user=$(grep "^DB_USER=" .env | cut -d'=' -f2)
    db_password=$(grep "^DB_PASSWORD=" .env | cut -d'=' -f2)
    db_name=$(grep "^DB_NAME=" .env | cut -d'=' -f2)
    db_root_password=$(grep "^DB_ROOT_PASSWORD=" .env | cut -d'=' -f2)
    
    print_status "INFO" "DB_HOST: $db_host"
    print_status "INFO" "DB_USER: $db_user"
    print_status "INFO" "DB_PASSWORD: $db_password"
    print_status "INFO" "DB_NAME: $db_name"
    print_status "INFO" "DB_ROOT_PASSWORD: $db_root_password"
    
    # Validate values
    if [ "$db_host" = "database" ]; then
        print_status "SUCCESS" "DB_HOST correctly set for Docker"
    else
        print_status "ERROR" "DB_HOST should be 'database' for Docker"
    fi
    
    if [ "$db_user" = "root" ]; then
        print_status "SUCCESS" "DB_USER correctly set to root"
    else
        print_status "WARNING" "DB_USER is not root: $db_user"
    fi
    
    if [ "$db_password" = "TVU@842004" ]; then
        print_status "SUCCESS" "DB_PASSWORD matches your database"
    else
        print_status "ERROR" "DB_PASSWORD doesn't match expected value"
    fi
    
else
    print_status "ERROR" ".env file not found"
fi

echo ""
echo "🔍 Checking .env.local file (Local development)..."
if [ -f ".env.local" ]; then
    print_status "SUCCESS" ".env.local file found for local development"
    
    local_host=$(grep "^DB_HOST=" .env.local | cut -d'=' -f2)
    if [ "$local_host" = "127.0.0.1" ]; then
        print_status "SUCCESS" "Local DB_HOST correctly set to 127.0.0.1"
    fi
else
    print_status "INFO" ".env.local file not found (optional)"
fi

echo ""
echo "🔍 Checking docker-compose.yml..."
if [ -f "docker-compose.yml" ]; then
    print_status "SUCCESS" "docker-compose.yml found"
    
    # Check MySQL environment variables
    if grep -q "MYSQL_USER.*root" docker-compose.yml; then
        print_status "SUCCESS" "MySQL user set to root in docker-compose.yml"
    else
        print_status "WARNING" "MySQL user may not be set to root"
    fi
    
    if grep -q "TVU@842004" docker-compose.yml; then
        print_status "SUCCESS" "Password TVU@842004 found in docker-compose.yml"
    else
        print_status "ERROR" "Password TVU@842004 not found in docker-compose.yml"
    fi
    
else
    print_status "ERROR" "docker-compose.yml not found"
fi

echo ""
echo "🔍 Checking backend configuration..."
if [ -f "backend/config/database.js" ]; then
    print_status "SUCCESS" "Backend database config found"
    
    # Check default values
    if grep -q "TVU@842004" backend/config/database.js; then
        print_status "SUCCESS" "Backend has correct default password"
    else
        print_status "ERROR" "Backend default password doesn't match"
    fi
    
    if grep -q "process.env.DB_HOST" backend/config/database.js; then
        print_status "SUCCESS" "Backend uses environment variables"
    else
        print_status "ERROR" "Backend doesn't use environment variables"
    fi
    
else
    print_status "ERROR" "Backend database config not found"
fi

echo ""
echo "📊 Configuration Summary"
echo "========================"

expected_config="
Docker Environment (.env):
  DB_HOST=database
  DB_USER=root
  DB_PASSWORD=TVU@842004
  DB_NAME=QuanLyNhaHang

Local Development (.env.local):
  DB_HOST=127.0.0.1
  DB_USER=root
  DB_PASSWORD=TVU@842004
  DB_NAME=QuanLyNhaHang
"

print_status "INFO" "Expected configuration:$expected_config"

echo ""
echo "🚀 Usage Instructions:"
echo ""
echo "📦 For Docker deployment:"
echo "   docker-compose up -d"
echo "   # Uses .env file with DB_HOST=database"
echo ""
echo "💻 For local development:"
echo "   cp .env.local .env"
echo "   cd backend && npm install && npm start"
echo "   # Uses DB_HOST=127.0.0.1 to connect to local MySQL"
echo ""
echo "🔄 To switch back to Docker:"
echo "   cp .env.example .env"
echo "   # Edit .env with Docker settings"
echo ""
echo "🔍 Test database connection:"
echo "   # In Docker:"
echo "   docker-compose exec database mysql -u root -pTVU@842004 QuanLyNhaHang"
echo ""
echo "   # Local MySQL:"
echo "   mysql -u root -pTVU@842004 QuanLyNhaHang"
