#!/bin/bash

echo "🔧 Fix Docker Database Connection"
echo "================================="

# Function to force cleanup
force_cleanup() {
    echo "🧹 Force cleanup all containers..."
    
    # Stop all containers
    docker stop $(docker ps -aq) 2>/dev/null || true
    docker rm $(docker ps -aq) 2>/dev/null || true
    
    # Remove with compose
    docker-compose down -v 2>/dev/null || true
    
    # Clean system
    docker system prune -f
    docker volume prune -f
    
    echo "✅ Cleanup complete"
}

# Function to start MySQL first
start_mysql_first() {
    echo "🗄️  Starting MySQL container first..."
    
    # Start only MySQL
    docker-compose up -d mysql
    
    echo "⏳ Waiting for MySQL to be ready (60 seconds)..."
    sleep 60
    
    # Test MySQL connection
    for i in {1..10}; do
        if docker-compose exec mysql mysqladmin ping -h localhost -u root -pTVU@842004 --silent 2>/dev/null; then
            echo "✅ MySQL is ready! (attempt $i)"
            return 0
        else
            echo "⏳ MySQL not ready yet (attempt $i/10)"
            sleep 10
        fi
    done
    
    echo "⚠️  MySQL might not be fully ready, but continuing..."
    return 0
}

# Function to initialize database manually
init_database_manually() {
    echo "🛠️  Initializing database manually..."
    
    # Create database
    docker-compose exec mysql mysql -u root -pTVU@842004 -e "CREATE DATABASE IF NOT EXISTS QuanLyNhaHang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
    
    # Import SQL file
    echo "📥 Importing SQL file..."
    docker cp ./QuanLyDBWeb/CNPM_QuanLyNhaHang.sql restaurant_mysql:/tmp/init.sql
    docker-compose exec mysql mysql -u root -pTVU@842004 QuanLyNhaHang -e "source /tmp/init.sql" 2>/dev/null
    
    # Verify tables
    echo "📋 Verifying tables..."
    docker-compose exec mysql mysql -u root -pTVU@842004 -e "USE QuanLyNhaHang; SHOW TABLES;" 2>/dev/null
    
    echo "✅ Database initialized"
}

# Function to start backend with proper delay
start_backend_with_delay() {
    echo "🔧 Starting backend with delay..."
    
    # Start backend (already has 30s delay in docker-compose)
    docker-compose up -d backend
    
    echo "⏳ Waiting for backend to start (45 seconds)..."
    sleep 45
    
    # Test backend
    for i in {1..5}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ Backend is ready! (attempt $i)"
            return 0
        else
            echo "⏳ Backend not ready yet (attempt $i/5)"
            sleep 10
        fi
    done
    
    echo "⚠️  Backend might not be fully ready"
    return 0
}

# Function to start frontend
start_frontend() {
    echo "🌐 Starting frontend..."
    
    docker-compose up -d frontend
    
    echo "⏳ Waiting for frontend (15 seconds)..."
    sleep 15
    
    # Test frontend
    if curl -s http://localhost > /dev/null 2>&1; then
        echo "✅ Frontend is ready!"
    else
        echo "⚠️  Frontend might not be ready yet"
    fi
}

# Function to test all connections
test_all_connections() {
    echo ""
    echo "🧪 Testing All Connections"
    echo "=========================="
    
    # Test MySQL
    echo "🗄️  Testing MySQL..."
    if docker-compose exec mysql mysql -u root -pTVU@842004 -e "SELECT 'MySQL OK' as status;" 2>/dev/null; then
        echo "✅ MySQL: Connection successful"
        
        # Test database
        if docker-compose exec mysql mysql -u root -pTVU@842004 -e "USE QuanLyNhaHang; SELECT COUNT(*) as tables FROM information_schema.tables WHERE table_schema='QuanLyNhaHang';" 2>/dev/null; then
            echo "✅ MySQL: Database QuanLyNhaHang exists"
        else
            echo "❌ MySQL: Database QuanLyNhaHang not found"
        fi
    else
        echo "❌ MySQL: Connection failed"
    fi
    
    # Test Backend
    echo ""
    echo "🔧 Testing Backend..."
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Backend: HTTP connection successful"
        
        # Test API endpoint
        if curl -s http://localhost:3000/api/foods > /dev/null 2>&1; then
            echo "✅ Backend: API endpoints working"
        else
            echo "⚠️  Backend: API endpoints might not be ready"
        fi
    else
        echo "❌ Backend: HTTP connection failed"
    fi
    
    # Test Frontend
    echo ""
    echo "🌐 Testing Frontend..."
    if curl -s http://localhost > /dev/null 2>&1; then
        echo "✅ Frontend: HTTP connection successful"
    else
        echo "❌ Frontend: HTTP connection failed"
    fi
    
    # Test network connectivity
    echo ""
    echo "🌐 Testing Network Connectivity..."
    if docker-compose exec backend ping -c 1 mysql 2>/dev/null; then
        echo "✅ Network: Backend can ping MySQL"
    else
        echo "❌ Network: Backend cannot ping MySQL"
    fi
}

# Function to show logs
show_logs() {
    echo ""
    echo "📝 Recent Logs"
    echo "=============="
    
    echo "🗄️  MySQL logs:"
    docker-compose logs --tail=10 mysql
    
    echo ""
    echo "🔧 Backend logs:"
    docker-compose logs --tail=10 backend
    
    echo ""
    echo "🌐 Frontend logs:"
    docker-compose logs --tail=5 frontend
}

# Function to show final status
show_final_status() {
    echo ""
    echo "📊 Final Status"
    echo "==============="
    
    # Show containers
    echo "🐳 Running containers:"
    docker-compose ps
    
    echo ""
    echo "🌐 Access URLs:"
    echo "  Frontend: http://localhost"
    echo "  Backend:  http://localhost:3000"
    echo "  API Docs: http://localhost:3000/api-docs"
    echo "  MySQL:    localhost:3307"
    
    echo ""
    echo "🔧 Useful commands:"
    echo "  docker-compose logs -f          # View all logs"
    echo "  docker-compose logs -f backend  # View backend logs"
    echo "  docker-compose restart backend  # Restart backend"
    echo "  docker-compose down             # Stop all services"
}

# Main execution
main() {
    case "$1" in
        "cleanup")
            force_cleanup
            ;;
        "mysql")
            start_mysql_first
            init_database_manually
            ;;
        "backend")
            start_backend_with_delay
            ;;
        "frontend")
            start_frontend
            ;;
        "test")
            test_all_connections
            ;;
        "logs")
            show_logs
            ;;
        "status")
            show_final_status
            ;;
        "fix"|"")
            echo "🚀 Starting complete fix process..."
            force_cleanup
            start_mysql_first
            init_database_manually
            start_backend_with_delay
            start_frontend
            test_all_connections
            show_final_status
            ;;
        *)
            echo "Usage: $0 {cleanup|mysql|backend|frontend|test|logs|status|fix}"
            echo ""
            echo "Commands:"
            echo "  cleanup  - Force cleanup all containers"
            echo "  mysql    - Start and initialize MySQL"
            echo "  backend  - Start backend with delay"
            echo "  frontend - Start frontend"
            echo "  test     - Test all connections"
            echo "  logs     - Show recent logs"
            echo "  status   - Show final status"
            echo "  fix      - Complete fix process (default)"
            ;;
    esac
}

main "$@"
