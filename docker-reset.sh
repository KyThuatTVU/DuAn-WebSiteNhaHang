#!/bin/bash

echo "🔥 Docker Reset & Fresh Start Script"
echo "===================================="

# Function to confirm action
confirm_reset() {
    echo "⚠️  WARNING: This will:"
    echo "   • Stop all Docker containers"
    echo "   • Remove all Docker images"
    echo "   • Delete all Docker volumes (DATABASE DATA WILL BE LOST)"
    echo "   • Clean all Docker cache"
    echo ""
    read -p "🤔 Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operation cancelled"
        exit 1
    fi
}

# Function to stop all containers
stop_all_containers() {
    echo "🛑 Stopping all containers..."
    
    # Stop with different compose files
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.alt-port.yml down 2>/dev/null || true
    docker-compose -f docker-compose.mariadb.yml down 2>/dev/null || true
    docker compose down 2>/dev/null || true
    docker compose -f docker-compose.alt-port.yml down 2>/dev/null || true
    docker compose -f docker-compose.mariadb.yml down 2>/dev/null || true
    
    # Stop all running containers
    if [ "$(docker ps -q)" ]; then
        docker stop $(docker ps -q) 2>/dev/null || true
    fi
    
    echo "✅ All containers stopped"
}

# Function to remove volumes
remove_volumes() {
    echo "🗑️  Removing volumes..."
    
    # Remove specific project volumes
    docker volume rm duanbaocaoweb_mysql_data 2>/dev/null || true
    docker volume rm restaurant_mysql_data 2>/dev/null || true
    
    # Remove all unused volumes
    docker volume prune -f
    
    echo "✅ Volumes removed"
}

# Function to clean system
clean_system() {
    echo "🧹 Cleaning Docker system..."
    
    # Remove all unused containers, networks, images
    docker system prune -a -f
    
    # Remove all unused images
    docker image prune -a -f
    
    # Remove build cache
    docker builder prune -f
    
    echo "✅ System cleaned"
}

# Function to show disk space saved
show_space_saved() {
    echo "💾 Docker disk usage after cleanup:"
    docker system df
}

# Function to start fresh
start_fresh() {
    echo ""
    echo "🚀 Starting fresh Docker setup..."
    echo "================================="
    
    # Check which method to use
    echo "🔍 Detecting best startup method..."
    
    # Method 1: Try alternative port (3307)
    echo "📝 Method 1: Starting with MySQL on port 3307..."
    if docker-compose -f docker-compose.alt-port.yml up --build -d; then
        echo "✅ Started successfully with MySQL on port 3307"
        
        # Wait for services
        echo "⏳ Waiting for services to start..."
        sleep 15
        
        # Check status
        echo "📊 Service Status:"
        docker-compose -f docker-compose.alt-port.yml ps
        
        echo ""
        echo "🎉 SUCCESS! Application is running:"
        echo "   🌐 Frontend: http://localhost"
        echo "   🔧 Backend: http://localhost:3000"
        echo "   📚 API Docs: http://localhost:3000/api-docs"
        echo "   🗄️ MySQL: localhost:3307"
        
        return 0
    fi
    
    # Method 2: Try MariaDB
    echo "📝 Method 2: Starting with MariaDB..."
    if docker-compose -f docker-compose.mariadb.yml up --build -d; then
        echo "✅ Started successfully with MariaDB"
        
        # Wait for services
        echo "⏳ Waiting for services to start..."
        sleep 15
        
        # Check status
        echo "📊 Service Status:"
        docker-compose -f docker-compose.mariadb.yml ps
        
        echo ""
        echo "🎉 SUCCESS! Application is running:"
        echo "   🌐 Frontend: http://localhost"
        echo "   🔧 Backend: http://localhost:3000"
        echo "   📚 API Docs: http://localhost:3000/api-docs"
        echo "   🗄️ MariaDB: localhost:3306"
        
        return 0
    fi
    
    # Method 3: Try standard compose
    echo "📝 Method 3: Starting with standard MySQL..."
    if docker-compose up --build -d; then
        echo "✅ Started successfully with standard MySQL"
        
        # Wait for services
        echo "⏳ Waiting for services to start..."
        sleep 15
        
        # Check status
        echo "📊 Service Status:"
        docker-compose ps
        
        echo ""
        echo "🎉 SUCCESS! Application is running:"
        echo "   🌐 Frontend: http://localhost"
        echo "   🔧 Backend: http://localhost:3000"
        echo "   📚 API Docs: http://localhost:3000/api-docs"
        echo "   🗄️ MySQL: localhost:3306"
        
        return 0
    fi
    
    echo "❌ All startup methods failed"
    echo "💡 Try running manually:"
    echo "   docker-compose -f docker-compose.alt-port.yml up --build -d"
    return 1
}

# Function to show logs
show_logs() {
    echo ""
    echo "📝 Recent logs:"
    echo "==============="
    
    # Try to show logs from any running compose
    if docker-compose -f docker-compose.alt-port.yml ps | grep -q "Up"; then
        docker-compose -f docker-compose.alt-port.yml logs --tail=10
    elif docker-compose -f docker-compose.mariadb.yml ps | grep -q "Up"; then
        docker-compose -f docker-compose.mariadb.yml logs --tail=10
    elif docker-compose ps | grep -q "Up"; then
        docker-compose logs --tail=10
    else
        echo "No running services found"
    fi
}

# Main execution
main() {
    case "$1" in
        "reset")
            confirm_reset
            stop_all_containers
            remove_volumes
            clean_system
            show_space_saved
            ;;
        "start")
            start_fresh
            ;;
        "full")
            confirm_reset
            stop_all_containers
            remove_volumes
            clean_system
            show_space_saved
            start_fresh
            show_logs
            ;;
        "logs")
            show_logs
            ;;
        *)
            echo "Usage: $0 {reset|start|full|logs}"
            echo ""
            echo "Commands:"
            echo "  reset - Stop and clean all Docker resources"
            echo "  start - Start fresh Docker setup"
            echo "  full  - Complete reset and restart"
            echo "  logs  - Show recent logs"
            echo ""
            echo "🎯 Quick Commands:"
            echo "  ./docker-reset.sh full    # Complete reset and restart"
            echo "  ./docker-reset.sh reset   # Just clean up"
            echo "  ./docker-reset.sh start   # Just start fresh"
            ;;
    esac
}

main "$@"
