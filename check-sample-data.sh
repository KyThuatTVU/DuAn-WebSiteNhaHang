#!/bin/bash

# ==============================================
# SAMPLE DATA CHECKER SCRIPT
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

# Function to check sample data
check_sample_data() {
    print_info "Checking sample data in database..."
    
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
    
    print_info "Connecting to database: $database"
    echo
    
    # Check if mysql client is available
    if ! command -v mysql >/dev/null 2>&1; then
        print_error "MySQL client not found!"
        print_info "Install with: sudo apt-get install mysql-client"
        return 1
    fi
    
    # Test connection and show data
    if mysql -h "$host" -P "$port" -u "$user" -p"$password" "$database" -e "SELECT 1;" >/dev/null 2>&1; then
        print_success "✅ Connected to database successfully!"
        echo
        
        # Show table counts
        print_info "📊 Table Statistics:"
        mysql -h "$host" -P "$port" -u "$user" -p"$password" "$database" -e "
            SELECT 
                'khach_hang' as table_name, 
                COUNT(*) as record_count,
                'Customer accounts' as description
            FROM khach_hang
            UNION ALL
            SELECT 
                'loai_mon' as table_name, 
                COUNT(*) as record_count,
                'Food categories' as description
            FROM loai_mon
            UNION ALL
            SELECT 
                'mon_an' as table_name, 
                COUNT(*) as record_count,
                'Food items' as description
            FROM mon_an
            UNION ALL
            SELECT 
                'dat_ban' as table_name, 
                COUNT(*) as record_count,
                'Table reservations' as description
            FROM dat_ban
            UNION ALL
            SELECT 
                'hoa_don' as table_name, 
                COUNT(*) as record_count,
                'Orders/Invoices' as description
            FROM hoa_don
            UNION ALL
            SELECT 
                'admin_login' as table_name, 
                COUNT(*) as record_count,
                'Admin accounts' as description
            FROM admin_login
            UNION ALL
            SELECT 
                'nhan_vien' as table_name, 
                COUNT(*) as record_count,
                'Staff accounts' as description
            FROM nhan_vien;
        "
        
        echo
        print_info "🍽️  Sample Food Items:"
        mysql -h "$host" -P "$port" -u "$user" -p"$password" "$database" -e "
            SELECT 
                m.ten_mon as 'Food Name',
                l.ten_loai as 'Category',
                m.gia as 'Price (VND)',
                m.trang_thai as 'Status'
            FROM mon_an m
            JOIN loai_mon l ON m.id_loai = l.id_loai
            ORDER BY m.gia DESC
            LIMIT 10;
        "
        
        echo
        print_info "👥 Sample Customers:"
        mysql -h "$host" -P "$port" -u "$user" -p"$password" "$database" -e "
            SELECT 
                full_name as 'Customer Name',
                email as 'Email',
                phone as 'Phone',
                DATE(created_at) as 'Registered Date'
            FROM khach_hang
            ORDER BY created_at DESC
            LIMIT 5;
        "
        
        echo
        print_info "📅 Recent Reservations:"
        mysql -h "$host" -P "$port" -u "$user" -p"$password" "$database" -e "
            SELECT 
                ten_khach as 'Customer Name',
                sdt as 'Phone',
                DATE(ngay) as 'Date',
                TIME(gio) as 'Time',
                so_luong_khach as 'Guests',
                trang_thai as 'Status'
            FROM dat_ban
            ORDER BY created_at DESC
            LIMIT 5;
        "
        
        echo
        print_info "🔐 Admin Accounts:"
        mysql -h "$host" -P "$port" -u "$user" -p"$password" "$database" -e "
            SELECT 
                username as 'Username',
                full_name as 'Full Name',
                DATE(created_at) as 'Created Date'
            FROM admin_login;
        "
        
        echo
        print_success "✅ Sample data loaded successfully!"
        
    else
        print_error "❌ Failed to connect to database!"
        print_info "Make sure Docker containers are running: make up"
        return 1
    fi
}

# Function to show data summary
show_data_summary() {
    echo "=============================================="
    echo "📋 Database Sample Data Summary"
    echo "=============================================="
    echo
    
    print_info "The database contains the following sample data:"
    echo
    echo "🏪 Restaurant Categories:"
    echo "  • Món Chính - Main dishes"
    echo "  • Món Lẩu - Hot pot dishes"  
    echo "  • Món Đặc Biệt - Special dishes"
    echo
    echo "🍽️  Food Items (~29 dishes):"
    echo "  • Vietnamese traditional dishes"
    echo "  • Regional specialties"
    echo "  • Hot pot varieties"
    echo "  • Prices range: 60,000 - 280,000 VND"
    echo
    echo "👥 Customer Accounts (~15 customers):"
    echo "  • Sample customer registrations"
    echo "  • Encrypted passwords"
    echo "  • Contact information"
    echo
    echo "📅 Table Reservations (~18 reservations):"
    echo "  • Sample booking data"
    echo "  • Different status types"
    echo "  • Customer contact details"
    echo
    echo "🔐 Admin Accounts:"
    echo "  • admin - Main administrator"
    echo "  • viewer01 - Report viewer"
    echo
    echo "👨‍💼 Staff Accounts:"
    echo "  • Manager account"
    echo "  • Cashier account"
    echo "  • Staff account"
}

# Main function
main() {
    case "${1:-}" in
        "check")
            check_sample_data
            ;;
        "summary")
            show_data_summary
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [check|summary]"
            echo ""
            echo "Commands:"
            echo "  check   - Check and display sample data from database"
            echo "  summary - Show summary of available sample data"
            ;;
        "")
            show_data_summary
            echo
            check_sample_data
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
