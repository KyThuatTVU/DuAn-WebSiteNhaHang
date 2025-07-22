#!/bin/bash

echo "🚀 Starting Restaurant Management System with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🔨 Building and starting services..."

# Try different methods
if docker-compose up --build -d 2>/dev/null; then
    echo "✅ Started with docker-compose"
elif docker compose up --build -d 2>/dev/null; then
    echo "✅ Started with docker compose"
elif docker-compose -f docker-compose.mariadb.yml up --build -d 2>/dev/null; then
    echo "✅ Started with MariaDB (fallback)"
elif docker compose -f docker-compose.mariadb.yml up --build -d 2>/dev/null; then
    echo "✅ Started with docker compose + MariaDB (fallback)"
else
    echo "❌ Failed to start services"
    echo "💡 Try running: ./docker-fix.sh fix"
    exit 1
fi

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "✅ Restaurant Management System is starting up!"
echo ""
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:3000"
echo "🗄️  MySQL: localhost:3307"
echo ""
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo ""
