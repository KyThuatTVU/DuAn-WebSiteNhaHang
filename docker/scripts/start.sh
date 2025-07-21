#!/bin/bash
# 🍽️ Restaurant Management System - Docker Start Script

set -e

echo "🍽️ Starting Restaurant Management System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.docker template..."
    cp .env.docker .env
    print_success ".env file created. Please review and update the configuration."
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p backend/logs
mkdir -p backend/images
mkdir -p uploads
mkdir -p docker/ssl
mkdir -p backups

# Set proper permissions
chmod 755 backend/logs
chmod 755 backend/images
chmod 755 uploads

# Pull latest images
print_status "Pulling latest Docker images..."
docker-compose pull

# Build and start services
print_status "Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."

# Check MySQL
if docker-compose exec -T mysql mysqladmin ping -h localhost --silent; then
    print_success "MySQL is ready"
else
    print_warning "MySQL is not ready yet, waiting..."
    sleep 20
fi

# Check Backend API
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Backend API is ready"
else
    print_warning "Backend API is not ready yet, checking logs..."
    docker-compose logs backend
fi

# Check Nginx
if curl -f http://localhost/ > /dev/null 2>&1; then
    print_success "Frontend (Nginx) is ready"
else
    print_warning "Frontend is not ready yet"
fi

# Display service URLs
echo ""
print_success "🎉 Restaurant Management System is running!"
echo ""
echo "📱 Frontend: http://localhost"
echo "🔧 API: http://localhost:3000/api"
echo "📚 API Docs: http://localhost:3000/api/docs"
echo "🗄️ PhpMyAdmin: http://localhost:8080 (if enabled)"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
print_status "To view logs: docker-compose logs -f"
print_status "To stop: docker-compose down"
print_status "To restart: docker-compose restart"

# Optional: Open browser
if command -v xdg-open &> /dev/null; then
    read -p "Open browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open http://localhost
    fi
elif command -v open &> /dev/null; then
    read -p "Open browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost
    fi
fi
