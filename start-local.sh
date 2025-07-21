#!/bin/bash
# 🍽️ Restaurant Management System - Local Startup Script

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🍽️ Starting Restaurant Management System (Local Mode)..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check MySQL
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL command not found. Make sure MySQL is installed and running."
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Setup backend
print_status "Setting up backend..."
cd backend

# Create .env if not exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_success ".env file created. Please review and update the configuration."
    print_warning "Don't forget to update database credentials in .env file!"
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
    print_success "Backend dependencies installed"
else
    print_status "Backend dependencies already installed"
fi

# Create necessary directories
mkdir -p logs images

# Test database connection
print_status "Testing database connection..."
if node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'QuanLyNhaHang'
};
mysql.createConnection(config).then(() => {
  console.log('✅ Database connection successful');
  process.exit(0);
}).catch(err => {
  console.log('❌ Database connection failed:', err.message);
  process.exit(1);
});
" 2>/dev/null; then
    print_success "Database connection successful"
else
    print_error "Database connection failed. Please check your database configuration in .env file."
    print_warning "Make sure MySQL is running and credentials are correct."
    exit 1
fi

# Start backend server
print_status "Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Test backend health
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Backend server is running at http://localhost:3000"
else
    print_error "Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Go back to root directory
cd ..

# Start frontend server
print_status "Starting frontend server..."

# Check for available HTTP server
if command -v python3 &> /dev/null; then
    print_status "Using Python 3 HTTP server..."
    cd frontend
    python3 -m http.server 8080 &
    FRONTEND_PID=$!
elif command -v python &> /dev/null; then
    print_status "Using Python HTTP server..."
    cd frontend
    python -m http.server 8080 &
    FRONTEND_PID=$!
elif command -v http-server &> /dev/null; then
    print_status "Using Node.js http-server..."
    cd frontend
    http-server -p 8080 &
    FRONTEND_PID=$!
elif command -v php &> /dev/null; then
    print_status "Using PHP built-in server..."
    cd frontend
    php -S localhost:8080 &
    FRONTEND_PID=$!
else
    print_warning "No HTTP server found. Please install one of the following:"
    echo "  - Python: python -m http.server 8080"
    echo "  - Node.js http-server: npm install -g http-server"
    echo "  - PHP: php -S localhost:8080"
    echo "  - Or use VS Code Live Server extension"
    FRONTEND_PID=""
fi

# Wait for frontend to start
if [ ! -z "$FRONTEND_PID" ]; then
    sleep 3
    if curl -f http://localhost:8080 > /dev/null 2>&1; then
        print_success "Frontend server is running at http://localhost:8080"
    else
        print_warning "Frontend server may not be ready yet"
    fi
fi

# Display success message
echo ""
print_success "🎉 Restaurant Management System is running!"
echo ""
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend API: http://localhost:3000/api"
echo "📚 API Documentation: http://localhost:3000/api/docs"
echo "🏥 Health Check: http://localhost:3000/api/health"
echo ""
echo "📊 Process IDs:"
echo "  Backend PID: $BACKEND_PID"
if [ ! -z "$FRONTEND_PID" ]; then
    echo "  Frontend PID: $FRONTEND_PID"
fi
echo ""
print_status "Press Ctrl+C to stop all servers"

# Create stop script
cat > stop-local.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Restaurant Management System..."

# Kill backend (Node.js)
pkill -f "node.*server.js"
pkill -f "nodemon.*server.js"

# Kill frontend servers
pkill -f "python.*http.server"
pkill -f "python3.*http.server"
pkill -f "http-server"
pkill -f "php.*-S.*localhost:8080"

echo "✅ All servers stopped"
EOF

chmod +x stop-local.sh
print_status "Created stop-local.sh script to stop all servers"

# Wait for user interrupt
trap 'echo ""; print_status "Stopping servers..."; ./stop-local.sh; exit 0' INT

# Keep script running
while true; do
    sleep 1
done
