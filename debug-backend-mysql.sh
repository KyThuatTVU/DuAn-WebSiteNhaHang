#!/bin/bash

echo "🔍 Backend-MySQL Connection Debug"
echo "================================="

# Function to check containers
check_containers() {
    echo "📊 Container Status:"
    echo "==================="
    docker-compose ps
    echo ""
    
    # Check if containers are running
    if docker ps | grep restaurant_mysql > /dev/null; then
        echo "✅ MySQL container is running"
    else
        echo "❌ MySQL container is NOT running"
    fi
    
    if docker ps | grep restaurant_backend > /dev/null; then
        echo "✅ Backend container is running"
    else
        echo "❌ Backend container is NOT running"
    fi
    echo ""
}

# Function to check backend environment
check_backend_env() {
    echo "🔧 Backend Environment Variables:"
    echo "================================="
    
    if docker ps | grep restaurant_backend > /dev/null; then
        echo "Backend DB configuration:"
        docker-compose exec backend env | grep -E "DB_|NODE_ENV|PORT" | sort
        echo ""
        
        # Check if .env is loaded
        echo "Environment loading test:"
        docker-compose exec backend node -e "
            require('dotenv').config();
            console.log('DB_HOST:', process.env.DB_HOST);
            console.log('DB_PORT:', process.env.DB_PORT);
            console.log('DB_USER:', process.env.DB_USER);
            console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
            console.log('DB_NAME:', process.env.DB_NAME);
        " 2>/dev/null || echo "❌ Cannot run Node.js test"
        echo ""
    else
        echo "❌ Backend container not running"
    fi
}

# Function to test network connectivity
test_network() {
    echo "🌐 Network Connectivity Test:"
    echo "============================="
    
    if docker ps | grep restaurant_backend > /dev/null; then
        # Test DNS resolution
        echo "DNS resolution test:"
        if docker-compose exec backend nslookup mysql 2>/dev/null; then
            echo "✅ Backend can resolve 'mysql' hostname"
        else
            echo "❌ Backend cannot resolve 'mysql' hostname"
        fi
        echo ""
        
        # Test ping
        echo "Ping test:"
        if docker-compose exec backend ping -c 2 mysql 2>/dev/null; then
            echo "✅ Backend can ping MySQL"
        else
            echo "❌ Backend cannot ping MySQL"
        fi
        echo ""
        
        # Test port connectivity
        echo "Port connectivity test:"
        if docker-compose exec backend nc -zv mysql 3306 2>/dev/null; then
            echo "✅ Backend can connect to MySQL port 3306"
        else
            echo "❌ Backend cannot connect to MySQL port 3306"
        fi
        echo ""
        
        # Test with telnet alternative
        echo "Alternative port test:"
        if docker-compose exec backend timeout 5 bash -c "</dev/tcp/mysql/3306" 2>/dev/null; then
            echo "✅ Port 3306 is open on MySQL container"
        else
            echo "❌ Port 3306 is not accessible on MySQL container"
        fi
        echo ""
    else
        echo "❌ Backend container not running"
    fi
}

# Function to test MySQL directly
test_mysql_direct() {
    echo "🗄️  MySQL Direct Test:"
    echo "======================"
    
    if docker ps | grep restaurant_mysql > /dev/null; then
        # Test MySQL ping
        echo "MySQL ping test:"
        if docker-compose exec mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
            echo "✅ MySQL is responding to ping"
        else
            echo "❌ MySQL is not responding to ping"
        fi
        echo ""
        
        # Test MySQL login
        echo "MySQL login test:"
        if docker-compose exec mysql mysql -u root -pTVU@842004 -e "SELECT 'Login successful' as status;" 2>/dev/null; then
            echo "✅ MySQL login successful"
            
            # Test database
            echo ""
            echo "Database test:"
            if docker-compose exec mysql mysql -u root -pTVU@842004 -e "USE QuanLyNhaHang; SELECT 'Database exists' as status;" 2>/dev/null; then
                echo "✅ QuanLyNhaHang database exists"
                
                # Show tables
                echo ""
                echo "Tables in QuanLyNhaHang:"
                docker-compose exec mysql mysql -u root -pTVU@842004 -e "USE QuanLyNhaHang; SHOW TABLES;" 2>/dev/null
            else
                echo "❌ QuanLyNhaHang database not found"
            fi
        else
            echo "❌ MySQL login failed"
        fi
        echo ""
        
        # Test external connection
        echo "External connection test (port 3307):"
        if command -v mysql >/dev/null 2>&1; then
            if mysql -h localhost -P 3307 -u root -pTVU@842004 -e "SELECT 'External connection OK' as status;" 2>/dev/null; then
                echo "✅ External MySQL connection successful"
            else
                echo "❌ External MySQL connection failed"
            fi
        else
            echo "⚠️  MySQL client not installed on host"
        fi
        echo ""
    else
        echo "❌ MySQL container not running"
    fi
}

# Function to test backend API
test_backend_api() {
    echo "🔧 Backend API Test:"
    echo "==================="
    
    # Test basic connection
    echo "Basic HTTP test:"
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Backend HTTP is accessible"
        
        # Test API endpoints
        echo ""
        echo "API endpoints test:"
        
        # Test foods endpoint
        echo "Testing /api/foods:"
        response=$(curl -s http://localhost:3000/api/foods 2>/dev/null)
        if [ $? -eq 0 ] && [ -n "$response" ]; then
            echo "✅ /api/foods endpoint working"
            echo "Response preview: $(echo "$response" | head -c 100)..."
        else
            echo "❌ /api/foods endpoint failed"
        fi
        
        # Test categories endpoint
        echo ""
        echo "Testing /api/categories:"
        response=$(curl -s http://localhost:3000/api/categories 2>/dev/null)
        if [ $? -eq 0 ] && [ -n "$response" ]; then
            echo "✅ /api/categories endpoint working"
            echo "Response preview: $(echo "$response" | head -c 100)..."
        else
            echo "❌ /api/categories endpoint failed"
        fi
        
    else
        echo "❌ Backend HTTP is not accessible"
    fi
    echo ""
}

# Function to check backend logs for errors
check_backend_logs() {
    echo "📝 Backend Logs Analysis:"
    echo "========================="
    
    echo "Recent backend logs:"
    docker-compose logs --tail=20 backend
    echo ""
    
    echo "Database-related errors:"
    docker-compose logs backend | grep -i -E "database|mysql|connection|error" | tail -10
    echo ""
    
    echo "MySQL logs:"
    docker-compose logs --tail=10 mysql
    echo ""
}

# Function to show port mappings
check_port_mappings() {
    echo "🔌 Port Mappings:"
    echo "================="
    
    echo "Docker port mappings:"
    docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -E "restaurant_|NAMES"
    echo ""
    
    echo "Host port usage:"
    netstat -ano | findstr ":80 \|:3000 \|:3307 " 2>/dev/null || echo "No relevant ports found"
    echo ""
}

# Function to suggest fixes
suggest_fixes() {
    echo "🔧 Suggested Fixes:"
    echo "=================="
    
    echo "1. Restart containers in correct order:"
    echo "   docker-compose down"
    echo "   docker-compose up -d mysql"
    echo "   sleep 60"
    echo "   docker-compose up -d backend"
    echo "   docker-compose up -d frontend"
    echo ""
    
    echo "2. Check backend database connection code:"
    echo "   docker-compose exec backend cat /app/config/database.js"
    echo ""
    
    echo "3. Test database connection manually:"
    echo "   docker-compose exec backend node -e \"require('./config/database').testConnection()\""
    echo ""
    
    echo "4. Recreate containers:"
    echo "   docker-compose down -v"
    echo "   docker-compose up --build -d"
    echo ""
    
    echo "5. Check if database is initialized:"
    echo "   docker-compose exec mysql mysql -u root -pTVU@842004 -e 'USE QuanLyNhaHang; SHOW TABLES;'"
    echo ""
}

# Main execution
main() {
    case "$1" in
        "containers")
            check_containers
            ;;
        "env")
            check_backend_env
            ;;
        "network")
            test_network
            ;;
        "mysql")
            test_mysql_direct
            ;;
        "api")
            test_backend_api
            ;;
        "logs")
            check_backend_logs
            ;;
        "ports")
            check_port_mappings
            ;;
        "fixes")
            suggest_fixes
            ;;
        "all"|"")
            check_containers
            check_backend_env
            test_network
            test_mysql_direct
            test_backend_api
            check_port_mappings
            check_backend_logs
            suggest_fixes
            ;;
        *)
            echo "Usage: $0 {containers|env|network|mysql|api|logs|ports|fixes|all}"
            echo ""
            echo "Commands:"
            echo "  containers - Check container status"
            echo "  env        - Check backend environment"
            echo "  network    - Test network connectivity"
            echo "  mysql      - Test MySQL directly"
            echo "  api        - Test backend API"
            echo "  logs       - Check logs for errors"
            echo "  ports      - Check port mappings"
            echo "  fixes      - Show suggested fixes"
            echo "  all        - Run all checks (default)"
            ;;
    esac
}

main "$@"
