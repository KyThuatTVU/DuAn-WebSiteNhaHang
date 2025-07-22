#!/bin/bash

# Script to switch between Docker and Local development environments

show_help() {
    echo "🔧 Environment Switcher for Restaurant Management System"
    echo ""
    echo "Usage: $0 [docker|local|status]"
    echo ""
    echo "Commands:"
    echo "  docker  - Switch to Docker environment (DB_HOST=mysql)"
    echo "  local   - Switch to Local environment (DB_HOST=127.0.0.1)"
    echo "  status  - Show current environment configuration"
    echo "  help    - Show this help message"
    echo ""
}

show_status() {
    if [ -f ".env" ]; then
        echo "📋 Current .env configuration:"
        echo "================================"
        grep "DB_HOST=" .env
        grep "DB_USER=" .env
        grep "DB_NAME=" .env
        echo "================================"
        
        DB_HOST=$(grep "DB_HOST=" .env | cut -d'=' -f2)
        if [ "$DB_HOST" = "mysql" ]; then
            echo "🐳 Currently configured for: DOCKER"
        elif [ "$DB_HOST" = "127.0.0.1" ] || [ "$DB_HOST" = "localhost" ]; then
            echo "💻 Currently configured for: LOCAL"
        else
            echo "❓ Unknown configuration: $DB_HOST"
        fi
    else
        echo "❌ .env file not found!"
    fi
}

switch_to_docker() {
    echo "🐳 Switching to Docker environment..."
    
    # Backup current .env
    cp .env .env.backup
    
    # Update DB_HOST to mysql for Docker
    sed -i 's/DB_HOST=127\.0\.0\.1/DB_HOST=mysql/' .env
    sed -i 's/DB_HOST=localhost/DB_HOST=mysql/' .env
    
    echo "✅ Switched to Docker environment"
    echo "📝 Backup saved as .env.backup"
    echo "🚀 You can now run: docker-compose up --build -d"
}

switch_to_local() {
    echo "💻 Switching to Local environment..."
    
    # Backup current .env
    cp .env .env.backup
    
    # Update DB_HOST to localhost for local development
    sed -i 's/DB_HOST=mysql/DB_HOST=127.0.0.1/' .env
    
    echo "✅ Switched to Local environment"
    echo "📝 Backup saved as .env.backup"
    echo "🚀 Make sure MySQL is running locally on port 3306"
}

# Main script logic
case "$1" in
    "docker")
        switch_to_docker
        show_status
        ;;
    "local")
        switch_to_local
        show_status
        ;;
    "status")
        show_status
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        echo "❌ No command specified"
        show_help
        exit 1
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac
