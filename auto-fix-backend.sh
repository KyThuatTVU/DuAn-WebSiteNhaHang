#!/bin/bash

echo "🔧 Auto Fix Backend-MySQL Connection"
echo "===================================="

# Function to check and fix containers
fix_containers() {
    echo "1️⃣ Checking and fixing containers..."
    
    # Stop all containers first
    echo "Stopping all containers..."
    docker-compose down 2>/dev/null || true
    
    # Remove any stuck containers
    docker stop $(docker ps -aq) 2>/dev/null || true
    docker rm $(docker ps -aq) 2>/dev/null || true
    
    # Start MySQL first
    echo "Starting MySQL container..."
    docker-compose up -d mysql
    
    # Wait for MySQL to be ready
    echo "Waiting for MySQL to be ready (60 seconds)..."
    sleep 60
    
    # Test MySQL
    for i in {1..10}; do
        if docker-compose exec mysql mysqladmin ping --silent 2>/dev/null; then
            echo "✅ MySQL is ready!"
            break
        else
            echo "⏳ Waiting for MySQL... ($i/10)"
            sleep 10
        fi
    done
    
    # Initialize database
    echo "Initializing database..."
    docker-compose exec mysql mysql -u root -pTVU@842004 -e "CREATE DATABASE IF NOT EXISTS QuanLyNhaHang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
    
    # Import SQL file
    docker cp ./QuanLyDBWeb/CNPM_QuanLyNhaHang.sql restaurant_mysql:/tmp/init.sql 2>/dev/null
    docker-compose exec mysql mysql -u root -pTVU@842004 QuanLyNhaHang -e "source /tmp/init.sql" 2>/dev/null
    
    echo "✅ MySQL setup complete"
}

# Function to fix backend
fix_backend() {
    echo "2️⃣ Starting and fixing backend..."
    
    # Start backend
    docker-compose up -d backend
    
    # Wait for backend
    echo "Waiting for backend to start (45 seconds)..."
    sleep 45
    
    # Test backend connection
    for i in {1..5}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ Backend is responding!"
            break
        else
            echo "⏳ Waiting for backend... ($i/5)"
            sleep 10
        fi
    done
    
    # Test database connection from backend
    echo "Testing backend database connection..."
    docker-compose exec backend node -e "
        require('dotenv').config();
        const mysql = require('mysql2/promise');
        
        async function testDB() {
            try {
                const connection = await mysql.createConnection({
                    host: process.env.DB_HOST || 'mysql',
                    port: process.env.DB_PORT || 3306,
                    user: process.env.DB_USER || 'root',
                    password: process.env.DB_PASSWORD || 'TVU@842004',
                    database: process.env.DB_NAME || 'QuanLyNhaHang'
                });
                
                const [rows] = await connection.execute('SELECT COUNT(*) as count FROM mon_an');
                console.log('✅ Database connection successful! Found', rows[0].count, 'dishes');
                await connection.end();
            } catch (error) {
                console.log('❌ Database connection failed:', error.message);
            }
        }
        
        testDB();
    " 2>/dev/null || echo "❌ Backend database test failed"
    
    echo "✅ Backend setup complete"
}

# Function to fix frontend
fix_frontend() {
    echo "3️⃣ Starting frontend..."
    
    docker-compose up -d frontend
    
    echo "Waiting for frontend (15 seconds)..."
    sleep 15
    
    if curl -s http://localhost > /dev/null 2>&1; then
        echo "✅ Frontend is ready!"
    else
        echo "⚠️  Frontend might need more time"
    fi
}

# Function to test all endpoints
test_endpoints() {
    echo "4️⃣ Testing all endpoints..."
    
    # Test backend health
    echo "Testing backend health..."
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Backend HTTP: OK"
    else
        echo "❌ Backend HTTP: Failed"
    fi
    
    # Test API endpoints
    echo "Testing API endpoints..."
    
    # Test foods endpoint
    response=$(curl -s http://localhost:3000/api/foods 2>/dev/null)
    if [ $? -eq 0 ] && echo "$response" | grep -q "id\|ten_mon" 2>/dev/null; then
        echo "✅ /api/foods: OK ($(echo "$response" | grep -o "id" | wc -l) items)"
    else
        echo "❌ /api/foods: Failed"
        echo "Response: $response"
    fi
    
    # Test categories endpoint
    response=$(curl -s http://localhost:3000/api/categories 2>/dev/null)
    if [ $? -eq 0 ] && echo "$response" | grep -q "id\|ten_loai" 2>/dev/null; then
        echo "✅ /api/categories: OK"
    else
        echo "❌ /api/categories: Failed"
    fi
    
    # Test frontend
    if curl -s http://localhost > /dev/null 2>&1; then
        echo "✅ Frontend: OK"
    else
        echo "❌ Frontend: Failed"
    fi
}

# Function to show final status
show_final_status() {
    echo ""
    echo "📊 Final Status Report"
    echo "====================="
    
    # Show containers
    echo "🐳 Running containers:"
    docker-compose ps
    echo ""
    
    # Show access URLs
    echo "🌐 Access URLs:"
    echo "  Frontend:  http://localhost"
    echo "  Backend:   http://localhost:3000"
    echo "  API Docs:  http://localhost:3000/api-docs"
    echo "  MySQL:     localhost:3307"
    echo ""
    
    # Show useful commands
    echo "🔧 Useful commands:"
    echo "  docker-compose logs -f          # View all logs"
    echo "  docker-compose logs backend     # View backend logs"
    echo "  docker-compose restart backend  # Restart backend"
    echo "  curl http://localhost:3000/api/foods  # Test API"
    echo ""
    
    # Final test
    echo "🧪 Quick connectivity test:"
    if curl -s http://localhost:3000/api/foods | grep -q "id" 2>/dev/null; then
        echo "🎉 SUCCESS! Backend can fetch data from MySQL!"
        echo "✅ You can now use the application at http://localhost"
    else
        echo "⚠️  Backend might still have issues connecting to MySQL"
        echo "📝 Check logs: docker-compose logs backend"
    fi
}

# Function to show logs if there are issues
show_debug_logs() {
    echo ""
    echo "📝 Debug Information"
    echo "==================="
    
    echo "Backend logs (last 10 lines):"
    docker-compose logs --tail=10 backend
    echo ""
    
    echo "MySQL logs (last 5 lines):"
    docker-compose logs --tail=5 mysql
    echo ""
    
    echo "Backend environment:"
    docker-compose exec backend env | grep DB_ 2>/dev/null || echo "Cannot access backend environment"
    echo ""
}

# Main execution
main() {
    echo "🚀 Starting automatic fix process..."
    echo ""
    
    fix_containers
    echo ""
    
    fix_backend
    echo ""
    
    fix_frontend
    echo ""
    
    test_endpoints
    echo ""
    
    show_final_status
    
    # If there are still issues, show debug info
    if ! curl -s http://localhost:3000/api/foods | grep -q "id" 2>/dev/null; then
        show_debug_logs
    fi
}

# Run main function
main
