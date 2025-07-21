#!/bin/bash
# 🍽️ Restaurant Management System - Database Backup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME=${DB_NAME:-QuanLyNhaHang}
DB_USER=${DB_USER:-restaurant_user}
DB_PASSWORD=${DB_PASSWORD:-restaurant_pass}

# Create backup directory
mkdir -p $BACKUP_DIR

print_status "Starting database backup..."

# Check if MySQL container is running
if ! docker-compose ps mysql | grep -q "Up"; then
    print_error "MySQL container is not running. Please start the services first."
    exit 1
fi

# Create database backup
BACKUP_FILE="$BACKUP_DIR/restaurant_db_backup_$DATE.sql"

print_status "Creating database backup: $BACKUP_FILE"

docker-compose exec -T mysql mysqldump \
    -u $DB_USER \
    -p$DB_PASSWORD \
    --single-transaction \
    --routines \
    --triggers \
    --databases $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    print_success "Database backup created successfully: $BACKUP_FILE"
    
    # Compress backup
    print_status "Compressing backup..."
    gzip $BACKUP_FILE
    print_success "Backup compressed: $BACKUP_FILE.gz"
    
    # Get file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    print_status "Backup size: $BACKUP_SIZE"
else
    print_error "Database backup failed"
    exit 1
fi

# Backup uploaded images
print_status "Backing up uploaded images..."
IMAGE_BACKUP="$BACKUP_DIR/images_backup_$DATE.tar.gz"

if [ -d "./backend/images" ]; then
    tar -czf $IMAGE_BACKUP -C ./backend images/
    print_success "Images backup created: $IMAGE_BACKUP"
else
    print_status "No images directory found, skipping image backup"
fi

# Clean up old backups (keep last 7 days)
print_status "Cleaning up old backups (keeping last 7 days)..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
print_success "Old backups cleaned up"

# Display backup summary
echo ""
print_success "🎉 Backup completed successfully!"
echo ""
echo "📁 Backup location: $BACKUP_DIR"
echo "🗄️ Database backup: $(basename $BACKUP_FILE.gz)"
if [ -f "$IMAGE_BACKUP" ]; then
    echo "🖼️ Images backup: $(basename $IMAGE_BACKUP)"
fi
echo "📊 Total backups: $(ls -1 $BACKUP_DIR/*.gz 2>/dev/null | wc -l)"
echo ""

# Optional: Upload to cloud storage
# Uncomment and configure for your cloud provider
# print_status "Uploading to cloud storage..."
# aws s3 cp "$BACKUP_FILE.gz" s3://your-backup-bucket/
# print_success "Backup uploaded to cloud storage"
