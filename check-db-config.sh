#!/bin/bash

echo "🔍 Database Configuration Checker"
echo "================================="

# Function to check .env file
check_env_file() {
    echo "📋 .env File Configuration:"
    echo "=========================="
    
    if [ -f ".env" ]; then
        echo "✅ .env file exists"
        echo ""
        echo "Database configuration in .env:"
        grep -E "^DB_" .env | while read line; do
            echo "  $line"
        done
        echo ""
    else
        echo "❌ .env file not found!"
        return 1
    fi
}

# Function to check docker-compose files
check_docker_compose() {
    echo "🐳 Docker Compose Configuration:"
    echo "================================"
    
    local files=("docker-compose.yml" "docker-compose.simple.yml" "docker-compose.fixed.yml")
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            echo "📄 $file:"
            echo "  Backend DB environment:"
            grep -A 10 "environment:" "$file" | grep -E "DB_|mysql" | head -5 | sed 's/^/    /'
            echo ""
        fi
    done
}

# Function to check running container config
check_container_config() {
    echo "🔧 Running Container Configuration:"
    echo "=================================="
    
    # Check if backend container is running
    if docker ps | grep restaurant_backend > /dev/null; then
        echo "✅ Backend container is running"
        echo ""
        echo "Backend environment variables:"
        docker-compose -f docker-compose.simple.yml exec backend env | grep -E "DB_|NODE_ENV" | sort | sed 's/^/  /'
        echo ""
        
        # Test network connectivity
        echo "🌐 Network connectivity test:"
        if docker-compose -f docker-compose.simple.yml exec backend ping -c 1 mysql 2>/dev/null; then
            echo "✅ Backend can ping MySQL container"
        else
            echo "❌ Backend cannot ping MySQL container"
        fi
        echo ""
        
        # Test port connectivity
        echo "🔌 Port connectivity test:"
        if docker-compose -f docker-compose.simple.yml exec backend nc -z mysql 3306 2>/dev/null; then
            echo "✅ Backend can connect to MySQL port 3306"
        else
            echo "❌ Backend cannot connect to MySQL port 3306"
        fi
        echo ""
        
    else
        echo "❌ Backend container is not running"
    fi
}

# Function to check MySQL container
check_mysql_container() {
    echo "🗄️  MySQL Container Configuration:"
    echo "================================="
    
    if docker ps | grep restaurant_mysql > /dev/null; then
        echo "✅ MySQL container is running"
        echo ""
        
        # Check MySQL status
        echo "MySQL status:"
        if docker-compose -f docker-compose.simple.yml exec mysql mysqladmin ping --silent 2>/dev/null; then
            echo "✅ MySQL is responding"
            
            # Test login
            if docker-compose -f docker-compose.simple.yml exec mysql mysql -u root -pTVU@842004 -e "SELECT 'Login successful' as status;" 2>/dev/null; then
                echo "✅ MySQL login successful"
                
                # Check database
                if docker-compose -f docker-compose.simple.yml exec mysql mysql -u root -pTVU@842004 -e "USE QuanLyNhaHang; SELECT 'Database exists' as status;" 2>/dev/null; then
                    echo "✅ QuanLyNhaHang database exists"
                else
                    echo "❌ QuanLyNhaHang database not found"
                fi
            else
                echo "❌ MySQL login failed"
            fi
        else
            echo "❌ MySQL is not responding"
        fi
        echo ""
        
        # Check MySQL port binding
        echo "MySQL port binding:"
        docker port restaurant_mysql 2>/dev/null || echo "No port binding info"
        echo ""
        
    else
        echo "❌ MySQL container is not running"
    fi
}

# Function to validate configuration
validate_config() {
    echo "✅ Configuration Validation:"
    echo "==========================="
    
    local issues=0
    
    # Check .env DB_HOST
    local db_host=$(grep "^DB_HOST=" .env 2>/dev/null | cut -d'=' -f2)
    if [ "$db_host" = "mysql" ]; then
        echo "✅ DB_HOST=mysql (correct for Docker)"
    else
        echo "❌ DB_HOST=$db_host (should be 'mysql' for Docker)"
        issues=$((issues + 1))
    fi
    
    # Check .env DB_PORT
    local db_port=$(grep "^DB_PORT=" .env 2>/dev/null | cut -d'=' -f2)
    if [ "$db_port" = "3306" ]; then
        echo "✅ DB_PORT=3306 (correct for internal Docker communication)"
    else
        echo "❌ DB_PORT=$db_port (should be '3306' for internal Docker communication)"
        issues=$((issues + 1))
    fi
    
    # Check .env DB_USER
    local db_user=$(grep "^DB_USER=" .env 2>/dev/null | cut -d'=' -f2)
    if [ "$db_user" = "root" ]; then
        echo "✅ DB_USER=root"
    else
        echo "⚠️  DB_USER=$db_user (using non-root user)"
    fi
    
    # Check .env DB_PASSWORD
    local db_password=$(grep "^DB_PASSWORD=" .env 2>/dev/null | cut -d'=' -f2)
    if [ -n "$db_password" ]; then
        echo "✅ DB_PASSWORD is set"
    else
        echo "❌ DB_PASSWORD is not set"
        issues=$((issues + 1))
    fi
    
    # Check .env DB_NAME
    local db_name=$(grep "^DB_NAME=" .env 2>/dev/null | cut -d'=' -f2)
    if [ "$db_name" = "QuanLyNhaHang" ]; then
        echo "✅ DB_NAME=QuanLyNhaHang"
    else
        echo "❌ DB_NAME=$db_name (should be 'QuanLyNhaHang')"
        issues=$((issues + 1))
    fi
    
    echo ""
    if [ $issues -eq 0 ]; then
        echo "🎉 Configuration looks good!"
    else
        echo "⚠️  Found $issues configuration issues"
    fi
    echo ""
}

# Function to suggest fixes
suggest_fixes() {
    echo "🔧 Suggested Fixes:"
    echo "=================="
    
    echo "1. Restart containers with correct config:"
    echo "   docker-compose -f docker-compose.simple.yml down"
    echo "   docker-compose -f docker-compose.simple.yml up -d"
    echo ""
    
    echo "2. Test database connection manually:"
    echo "   docker-compose -f docker-compose.simple.yml exec mysql mysql -u root -pTVU@842004"
    echo ""
    
    echo "3. Check backend logs for connection errors:"
    echo "   docker-compose -f docker-compose.simple.yml logs backend | grep -i error"
    echo ""
    
    echo "4. Test backend API:"
    echo "   curl http://localhost:3000"
    echo ""
}

# Function to fix configuration automatically
auto_fix() {
    echo "🔧 Auto-fixing Configuration:"
    echo "============================="
    
    # Backup .env
    cp .env .env.backup
    echo "✅ Backed up .env to .env.backup"
    
    # Fix common issues
    sed -i 's/DB_HOST=127.0.0.1/DB_HOST=mysql/' .env
    sed -i 's/DB_HOST=localhost/DB_HOST=mysql/' .env
    sed -i 's/DB_PORT=3307/DB_PORT=3306/' .env
    
    echo "✅ Fixed .env configuration"
    echo ""
    
    # Restart containers
    echo "🔄 Restarting containers..."
    docker-compose -f docker-compose.simple.yml down
    sleep 5
    docker-compose -f docker-compose.simple.yml up -d
    
    echo "✅ Containers restarted"
}

# Main execution
main() {
    case "$1" in
        "env")
            check_env_file
            ;;
        "compose")
            check_docker_compose
            ;;
        "container")
            check_container_config
            ;;
        "mysql")
            check_mysql_container
            ;;
        "validate")
            validate_config
            ;;
        "fixes")
            suggest_fixes
            ;;
        "autofix")
            auto_fix
            ;;
        "all"|"")
            check_env_file
            check_docker_compose
            check_container_config
            check_mysql_container
            validate_config
            suggest_fixes
            ;;
        *)
            echo "Usage: $0 {env|compose|container|mysql|validate|fixes|autofix|all}"
            echo ""
            echo "Commands:"
            echo "  env       - Check .env file"
            echo "  compose   - Check docker-compose files"
            echo "  container - Check running container config"
            echo "  mysql     - Check MySQL container"
            echo "  validate  - Validate configuration"
            echo "  fixes     - Show suggested fixes"
            echo "  autofix   - Automatically fix common issues"
            echo "  all       - Run all checks (default)"
            ;;
    esac
}

main "$@"
