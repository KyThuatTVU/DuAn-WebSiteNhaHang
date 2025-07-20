#!/bin/bash
# Start script for Website Nhà Hàng Backend

set -e

echo "🚀 Starting Website Nhà Hàng Backend..."

# Function to wait for database
wait_for_db() {
    echo "⏳ Waiting for database connection..."
    
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" >/dev/null 2>&1; then
            echo "✅ Database connection established!"
            return 0
        fi
        
        echo "🔄 Attempt $attempt/$max_attempts - Database not ready, waiting 2 seconds..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ Failed to connect to database after $max_attempts attempts"
    exit 1
}

# Function to initialize database
init_database() {
    echo "🗄️ Initializing database..."
    
    # Check if database exists and has tables
    table_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -D"$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | wc -l)
    
    if [ "$table_count" -eq 0 ]; then
        echo "📥 Database is empty, importing initial data..."
        if [ -f "/app/database/CNPM_QuanLyNhaHang.sql" ]; then
            mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < /app/database/CNPM_QuanLyNhaHang.sql
            echo "✅ Database initialized successfully!"
        else
            echo "⚠️ No SQL file found, skipping database initialization"
        fi
    else
        echo "ℹ️ Database already contains tables, skipping initialization"
    fi
}

# Function to run health check
health_check() {
    echo "🏥 Running health check..."
    
    # Check if Node.js app is responding
    timeout=30
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
            echo "✅ Application health check passed!"
            return 0
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    echo "❌ Application health check failed!"
    return 1
}

# Function to setup logging
setup_logging() {
    echo "📝 Setting up logging..."
    
    # Create logs directory if it doesn't exist
    mkdir -p /app/backend/logs
    
    # Set proper permissions
    chmod 755 /app/backend/logs
    
    echo "✅ Logging setup complete!"
}

# Function to validate environment
validate_environment() {
    echo "🔍 Validating environment variables..."
    
    required_vars=(
        "DB_HOST"
        "DB_PORT" 
        "DB_USER"
        "DB_PASSWORD"
        "DB_NAME"
        "JWT_SECRET"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo "❌ Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        exit 1
    fi
    
    echo "✅ Environment validation passed!"
}

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    # Kill any background processes
    jobs -p | xargs -r kill
    echo "👋 Cleanup complete!"
}

# Set trap for cleanup
trap cleanup EXIT INT TERM

# Main execution
main() {
    echo "🎯 Starting main execution..."
    
    # Validate environment
    validate_environment
    
    # Setup logging
    setup_logging
    
    # Wait for database
    wait_for_db
    
    # Initialize database
    init_database
    
    # Change to backend directory
    cd /app/backend
    
    # Start the application
    echo "🚀 Starting Node.js application..."
    exec node server.js
}

# Run main function
main "$@"
