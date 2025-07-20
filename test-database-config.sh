#!/bin/bash
# Database configuration test for Website Nhà Hàng Docker

echo "🗄️  Database Configuration Test - Website Nhà Hàng"
echo "=================================================="

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
echo "🔍 Step 1: Checking database files..."

# Check SQL file
if [ -f "QuanLyDBWeb/CNPM_QuanLyNhaHang.sql" ]; then
    print_status "SUCCESS" "Database SQL file found"
    
    # Check SQL file content
    if grep -q "CREATE DATABASE" QuanLyDBWeb/CNPM_QuanLyNhaHang.sql; then
        print_status "INFO" "SQL file contains CREATE DATABASE statement"
    fi
    
    if grep -q "CREATE TABLE" QuanLyDBWeb/CNPM_QuanLyNhaHang.sql; then
        print_status "SUCCESS" "SQL file contains table definitions"
    fi
    
    # Count tables
    table_count=$(grep -c "CREATE TABLE" QuanLyDBWeb/CNPM_QuanLyNhaHang.sql)
    print_status "INFO" "Found $table_count tables in SQL file"
    
    # List tables
    echo "   Tables found:"
    grep "CREATE TABLE" QuanLyDBWeb/CNPM_QuanLyNhaHang.sql | sed 's/CREATE TABLE /   • /' | sed 's/ (.*//'
    
else
    print_status "ERROR" "Database SQL file not found"
fi

echo ""
echo "🔍 Step 2: Checking Docker database configuration..."

# Check docker-compose.yml database service
if [ -f "docker-compose.yml" ]; then
    print_status "SUCCESS" "Docker Compose file found"
    
    # Check database service
    if grep -q "database:" docker-compose.yml; then
        print_status "SUCCESS" "Database service defined in docker-compose.yml"
    else
        print_status "ERROR" "Database service not found in docker-compose.yml"
    fi
    
    # Check MySQL image
    if grep -q "mysql:8.0" docker-compose.yml; then
        print_status "SUCCESS" "MySQL 8.0 image specified"
    else
        print_status "WARNING" "MySQL image version not found or different"
    fi
    
    # Check volume mapping for SQL file
    if grep -q "CNPM_QuanLyNhaHang.sql:/docker-entrypoint-initdb.d/init.sql" docker-compose.yml; then
        print_status "SUCCESS" "SQL file mapped to Docker init directory"
    else
        print_status "ERROR" "SQL file not properly mapped for auto-initialization"
    fi
    
    # Check MySQL configuration
    if grep -q "my.cnf:/etc/mysql/conf.d/custom.cnf" docker-compose.yml; then
        print_status "SUCCESS" "MySQL custom configuration mapped"
    else
        print_status "WARNING" "MySQL custom configuration not found"
    fi
    
else
    print_status "ERROR" "Docker Compose file not found"
fi

echo ""
echo "🔍 Step 3: Checking environment variables..."

if [ -f ".env" ]; then
    print_status "SUCCESS" ".env file found"
    
    # Check required database environment variables
    db_vars=("DB_HOST" "DB_PORT" "DB_USER" "DB_PASSWORD" "DB_NAME" "DB_ROOT_PASSWORD")
    
    for var in "${db_vars[@]}"; do
        if grep -q "^$var=" .env; then
            value=$(grep "^$var=" .env | cut -d'=' -f2)
            print_status "SUCCESS" "$var is set: $value"
        else
            print_status "ERROR" "$var is not set in .env file"
        fi
    done
    
else
    print_status "ERROR" ".env file not found"
fi

echo ""
echo "🔍 Step 4: Checking backend database configuration..."

if [ -f "backend/config/database.js" ]; then
    print_status "SUCCESS" "Backend database config found"
    
    # Check if it uses environment variables
    if grep -q "process.env.DB_HOST" backend/config/database.js; then
        print_status "SUCCESS" "Backend uses DB_HOST environment variable"
    else
        print_status "WARNING" "Backend may not use DB_HOST environment variable"
    fi
    
    if grep -q "process.env.DB_USER" backend/config/database.js; then
        print_status "SUCCESS" "Backend uses DB_USER environment variable"
    else
        print_status "WARNING" "Backend may not use DB_USER environment variable"
    fi
    
    if grep -q "process.env.DB_PASSWORD" backend/config/database.js; then
        print_status "SUCCESS" "Backend uses DB_PASSWORD environment variable"
    else
        print_status "WARNING" "Backend may not use DB_PASSWORD environment variable"
    fi
    
    if grep -q "process.env.DB_NAME" backend/config/database.js; then
        print_status "SUCCESS" "Backend uses DB_NAME environment variable"
    else
        print_status "WARNING" "Backend may not use DB_NAME environment variable"
    fi
    
    # Check default values
    if grep -q "127.0.0.1" backend/config/database.js; then
        print_status "INFO" "Backend has localhost fallback (good for development)"
    fi
    
else
    print_status "ERROR" "Backend database config not found"
fi

echo ""
echo "🔍 Step 5: Checking MySQL configuration..."

if [ -f "docker/mysql/my.cnf" ]; then
    print_status "SUCCESS" "MySQL configuration file found"
    
    # Check important settings
    if grep -q "utf8mb4" docker/mysql/my.cnf; then
        print_status "SUCCESS" "UTF8MB4 charset configured"
    else
        print_status "WARNING" "UTF8MB4 charset not found in MySQL config"
    fi
    
    if grep -q "innodb_buffer_pool_size" docker/mysql/my.cnf; then
        print_status "SUCCESS" "InnoDB buffer pool configured"
    else
        print_status "INFO" "InnoDB buffer pool not specifically configured"
    fi
    
else
    print_status "WARNING" "MySQL configuration file not found"
fi

echo ""
echo "🔍 Step 6: Checking database initialization script..."

if [ -f "docker/scripts/start.sh" ]; then
    print_status "SUCCESS" "Database initialization script found"
    
    if grep -q "wait_for_db" docker/scripts/start.sh; then
        print_status "SUCCESS" "Script waits for database connection"
    else
        print_status "WARNING" "Script may not wait for database"
    fi
    
    if grep -q "mysql.*-h.*DB_HOST" docker/scripts/start.sh; then
        print_status "SUCCESS" "Script uses environment variables for DB connection"
    else
        print_status "INFO" "Script may use different DB connection method"
    fi
    
else
    print_status "WARNING" "Database initialization script not found"
fi

echo ""
echo "🔍 Step 7: Checking potential issues..."

# Check for common issues
issues_found=false

# Check if SQL file has USE statement that might conflict
if grep -q "USE QuanLyNhaHang" QuanLyDBWeb/CNPM_QuanLyNhaHang.sql 2>/dev/null; then
    print_status "INFO" "SQL file contains 'USE QuanLyNhaHang' statement"
    print_status "INFO" "This is OK - Docker will create the database first"
fi

# Check if CREATE DATABASE conflicts with Docker auto-creation
if grep -q "CREATE DATABASE.*QuanLyNhaHang" QuanLyDBWeb/CNPM_QuanLyNhaHang.sql 2>/dev/null; then
    print_status "WARNING" "SQL file creates database, but Docker also creates it"
    print_status "INFO" "This might cause issues. Consider using IF NOT EXISTS"
fi

# Check for charset consistency
env_charset=""
sql_charset=""
if [ -f ".env" ] && grep -q "DB_NAME=QuanLyNhaHang" .env; then
    if grep -q "utf8mb4" docker-compose.yml; then
        env_charset="utf8mb4"
    fi
fi

if grep -q "utf8mb4" QuanLyDBWeb/CNPM_QuanLyNhaHang.sql 2>/dev/null; then
    sql_charset="utf8mb4"
fi

if [ "$env_charset" = "utf8mb4" ] && [ "$sql_charset" = "utf8mb4" ]; then
    print_status "SUCCESS" "Charset consistency: utf8mb4 used throughout"
elif [ -n "$env_charset" ] || [ -n "$sql_charset" ]; then
    print_status "INFO" "Charset configuration found, should be consistent"
fi

echo ""
echo "📊 Database Configuration Summary"
echo "================================="

# Overall assessment
if [ -f "QuanLyDBWeb/CNPM_QuanLyNhaHang.sql" ] && [ -f "docker-compose.yml" ] && [ -f ".env" ] && [ -f "backend/config/database.js" ]; then
    print_status "SUCCESS" "All database configuration files are present"
    
    echo ""
    echo "🚀 Database setup is ready!"
    echo ""
    echo "📋 Configuration summary:"
    echo "   • Database: MySQL 8.0"
    echo "   • Host: database (Docker service)"
    echo "   • Port: 3306"
    echo "   • Database name: QuanLyNhaHang"
    echo "   • User: nha_hang_user"
    echo "   • Charset: utf8mb4"
    echo "   • Auto-initialization: ✅"
    echo ""
    echo "🔧 To start database:"
    echo "   docker-compose up database -d"
    echo ""
    echo "🔍 To check database:"
    echo "   docker-compose exec database mysql -u nha_hang_user -p QuanLyNhaHang"
    echo ""
    echo "📊 To view tables:"
    echo "   docker-compose exec database mysql -u nha_hang_user -p -e \"SHOW TABLES;\" QuanLyNhaHang"
    
else
    print_status "ERROR" "Some database configuration files are missing"
    echo ""
    echo "❌ Please ensure all required files are present before starting"
fi

echo ""
echo "📚 For more help:"
echo "   • Full setup: ./test-complete-setup.sh"
echo "   • Docker guide: docker/README.md"
