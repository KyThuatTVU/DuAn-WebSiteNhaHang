#!/bin/bash
# Database backup script for Website Nhà Hàng

set -e

echo "💾 Starting database backup..."

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="nha_hang_backup_${DATE}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to perform backup
perform_backup() {
    echo "📦 Creating database backup..."
    
    mysqldump \
        -h"$MYSQL_HOST" \
        -u"$MYSQL_USER" \
        -p"$MYSQL_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --add-drop-table \
        --add-locks \
        --create-options \
        --disable-keys \
        --extended-insert \
        --quick \
        --lock-tables=false \
        "$MYSQL_DATABASE" > "$BACKUP_PATH"
    
    if [ $? -eq 0 ]; then
        echo "✅ Database backup created: $BACKUP_FILE"
    else
        echo "❌ Database backup failed!"
        exit 1
    fi
}

# Function to compress backup
compress_backup() {
    echo "🗜️ Compressing backup..."
    
    gzip "$BACKUP_PATH"
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup compressed: ${BACKUP_FILE}.gz"
    else
        echo "⚠️ Backup compression failed, keeping uncompressed file"
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    echo "🧹 Cleaning up old backups..."
    
    # Keep only last 7 backups
    find "$BACKUP_DIR" -name "nha_hang_backup_*.sql.gz" -type f -mtime +7 -delete
    find "$BACKUP_DIR" -name "nha_hang_backup_*.sql" -type f -mtime +7 -delete
    
    echo "✅ Old backups cleaned up"
}

# Function to create backup info
create_backup_info() {
    local info_file="${BACKUP_DIR}/backup_info_${DATE}.json"
    
    cat > "$info_file" << EOF
{
    "timestamp": "$DATE",
    "filename": "${BACKUP_FILE}.gz",
    "database": "$MYSQL_DATABASE",
    "host": "$MYSQL_HOST",
    "size": "$(stat -c%s "${BACKUP_PATH}.gz" 2>/dev/null || echo "unknown")",
    "created_at": "$(date -Iseconds)",
    "status": "completed"
}
EOF
    
    echo "📋 Backup info created: backup_info_${DATE}.json"
}

# Function to verify backup
verify_backup() {
    echo "🔍 Verifying backup..."
    
    if [ -f "${BACKUP_PATH}.gz" ]; then
        # Test if gzip file is valid
        if gzip -t "${BACKUP_PATH}.gz"; then
            echo "✅ Backup file is valid"
        else
            echo "❌ Backup file is corrupted!"
            exit 1
        fi
    elif [ -f "$BACKUP_PATH" ]; then
        # Check if SQL file has content
        if [ -s "$BACKUP_PATH" ]; then
            echo "✅ Backup file is valid"
        else
            echo "❌ Backup file is empty!"
            exit 1
        fi
    else
        echo "❌ Backup file not found!"
        exit 1
    fi
}

# Function to wait for database
wait_for_database() {
    echo "⏳ Waiting for database..."
    
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if mysql -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1" >/dev/null 2>&1; then
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

# Main execution
main() {
    echo "🎯 Starting backup process..."
    
    # Wait for database to be ready
    wait_for_database
    
    # Perform backup
    perform_backup
    
    # Compress backup
    compress_backup
    
    # Verify backup
    verify_backup
    
    # Create backup info
    create_backup_info
    
    # Cleanup old backups
    cleanup_old_backups
    
    echo "🎉 Backup process completed successfully!"
    echo "📁 Backup location: ${BACKUP_DIR}/${BACKUP_FILE}.gz"
}

# Run main function
main "$@"
