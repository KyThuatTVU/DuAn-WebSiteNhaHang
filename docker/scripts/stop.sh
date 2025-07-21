#!/bin/bash
# 🍽️ Restaurant Management System - Docker Stop Script

set -e

echo "🛑 Stopping Restaurant Management System..."

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed."
    exit 1
fi

# Stop services gracefully
print_status "Stopping services gracefully..."
docker-compose stop

# Remove containers (optional)
read -p "Remove containers? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Removing containers..."
    docker-compose down
    print_success "Containers removed"
else
    print_status "Containers stopped but not removed"
fi

# Remove volumes (optional)
read -p "Remove volumes (WARNING: This will delete all data)? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Removing volumes and all data..."
    docker-compose down -v
    print_success "Volumes removed"
fi

# Clean up unused Docker resources (optional)
read -p "Clean up unused Docker resources? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Cleaning up unused Docker resources..."
    docker system prune -f
    print_success "Docker cleanup completed"
fi

print_success "🎉 Restaurant Management System stopped successfully!"
