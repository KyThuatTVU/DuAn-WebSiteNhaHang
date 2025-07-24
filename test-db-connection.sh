#!/bin/bash

# ==============================================
# DATABASE CONNECTION TEST SCRIPT
# Restaurant Management System
# ==============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if mysql client is available
check_mysql_client() {
    if command -v mysql >/dev/null 2>&1; then
        print_success "MySQL client found"
        return 0
    else
        print_warning "MySQL client not found on host"
        print_info "You can install it with:"
        echo "  Ubuntu/Debian: sudo apt-get install mysql-client"
        echo "  CentOS/RHEL: sudo yum install mysql"
        echo "  macOS: brew install mysql-client"
        return 1
    fi
}

# Function to test database connection from host
test_host_connection() {
    print_info "Testing database connection from host machine..."
    
    # Load environment variables
    if [[ -f ".env" ]]; then
        source .env
    else
        print_error ".env file not found"
        return 1
    fi
    
    local host="localhost"
    local port="${DB_PORT:-3307}"
    local user="${DB_USER:-nhahang_user}"
    local password="${DB_PASSWORD:-nhahang_password}"
    local database="${DB_NAME:-QuanLyNhaHang}"
    
    print_info "Connection details:"
    echo "  Host: $host"
    echo "  Port: $port"
    echo "  User: $user"
    echo "  Database: $database"
    echo
    
    if check_mysql_client; then
        print_info "Attempting to connect..."
        if mysql -h "$host" -P "$port" -u "$user" -p"$password" -e "SELECT 1;" "$database" >/dev/null 2>&1; then
            print_success "✅ Host connection successful!"
            
            # Test some basic queries
            print_info "Testing basic queries and data..."
            mysql -h "$host" -P "$port" -u "$user" -p"$password" "$database" -e "
                SELECT 'Database connection test' as message;
                SHOW TABLES;
                SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = '$database';
                SELECT COUNT(*) as khach_hang_count FROM khach_hang;
                SELECT COUNT(*) as mon_an_count FROM mon_an;
                SELECT COUNT(*) as dat_ban_count FROM dat_ban;
                SELECT 'Sample data loaded successfully!' as status;
            "
        else
            print_error "❌ Host connection failed!"
            print_info "Make sure Docker containers are running: make up"
            return 1
        fi
    fi
}

# Function to test database connection from container
test_container_connection() {
    print_info "Testing database connection from backend container..."
    
    if docker-compose ps backend | grep -q "Up"; then
        print_info "Backend container is running"
        
        # Test connection from backend container
        if docker-compose exec -T backend node -e "
            require('dotenv').config();
            const mysql = require('mysql2/promise');
            
            async function testConnection() {
                try {
                    const connection = await mysql.createConnection({
                        host: process.env.DB_HOST || 'database',
                        port: process.env.DB_PORT || 3306,
                        user: process.env.DB_USER || 'nhahang_user',
                        password: process.env.DB_PASSWORD || 'nhahang_password',
                        database: process.env.DB_NAME || 'QuanLyNhaHang'
                    });
                    
                    await connection.execute('SELECT 1');
                    console.log('✅ Container connection successful!');
                    
                    const [tables] = await connection.execute('SHOW TABLES');
                    console.log('📋 Tables found:', tables.length);

                    // Check sample data
                    const [customers] = await connection.execute('SELECT COUNT(*) as count FROM khach_hang');
                    const [foods] = await connection.execute('SELECT COUNT(*) as count FROM mon_an');
                    const [reservations] = await connection.execute('SELECT COUNT(*) as count FROM dat_ban');

                    console.log('👥 Customers:', customers[0].count);
                    console.log('🍽️  Foods:', foods[0].count);
                    console.log('📅 Reservations:', reservations[0].count);
                    
                    await connection.end();
                    process.exit(0);
                } catch (error) {
                    console.error('❌ Container connection failed:', error.message);
                    process.exit(1);
                }
            }
            
            testConnection();
        " 2>/dev/null; then
            print_success "✅ Container connection successful!"
        else
            print_error "❌ Container connection failed!"
            return 1
        fi
    else
        print_warning "Backend container is not running"
        print_info "Start containers with: make up"
        return 1
    fi
}

# Function to show database status
show_database_status() {
    print_info "Database container status:"
    
    if docker-compose ps database | grep -q "Up"; then
        print_success "Database container is running"
        
        # Show container details
        echo
        print_info "Container details:"
        docker-compose ps database
        
        echo
        print_info "Container logs (last 10 lines):"
        docker-compose logs --tail=10 database
        
    else
        print_warning "Database container is not running"
        print_info "Start containers with: make up"
    fi
}

# Function to show connection commands
show_connection_commands() {
    echo
    print_info "Connection commands:"
    echo
    
    # Load environment variables
    if [[ -f ".env" ]]; then
        source .env
    fi
    
    local port="${DB_PORT:-3307}"
    local user="${DB_USER:-nhahang_user}"
    local database="${DB_NAME:-QuanLyNhaHang}"
    
    echo "📋 MySQL Client (from host):"
    echo "  mysql -h localhost -P $port -u $user -p $database"
    echo
    
    echo "📋 Docker exec (into database container):"
    echo "  docker-compose exec database mysql -u $user -p $database"
    echo
    
    echo "📋 phpMyAdmin (development only):"
    echo "  http://localhost:8081"
    echo
    
    echo "📋 Backend container shell:"
    echo "  docker-compose exec backend bash"
}

# Main function
main() {
    echo "=============================================="
    echo "🗄️  Database Connection Test"
    echo "=============================================="
    echo
    
    case "${1:-}" in
        "host")
            test_host_connection
            ;;
        "container")
            test_container_connection
            ;;
        "status")
            show_database_status
            ;;
        "commands")
            show_connection_commands
            ;;
        "all"|"")
            show_database_status
            echo
            test_host_connection
            echo
            test_container_connection
            echo
            show_connection_commands
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [host|container|status|commands|all]"
            echo ""
            echo "Commands:"
            echo "  host      - Test connection from host machine"
            echo "  container - Test connection from backend container"
            echo "  status    - Show database container status"
            echo "  commands  - Show connection commands"
            echo "  all       - Run all tests (default)"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
