#!/bin/bash

# ==============================================
# CORS TESTING SCRIPT
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

# Function to test CORS preflight
test_cors_preflight() {
    local origin="$1"
    local backend_url="$2"
    
    print_info "Testing CORS preflight from origin: $origin"
    
    # Test OPTIONS request (preflight)
    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X OPTIONS \
        -H "Origin: $origin" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        "$backend_url/api/health" 2>/dev/null || echo "000")
    
    if [[ "$response" == "200" ]]; then
        print_success "✅ Preflight request successful (HTTP $response)"
        
        # Test actual GET request
        local get_response=$(curl -s -o /dev/null -w "%{http_code}" \
            -H "Origin: $origin" \
            "$backend_url/api/health" 2>/dev/null || echo "000")
        
        if [[ "$get_response" == "200" ]]; then
            print_success "✅ GET request successful (HTTP $get_response)"
            return 0
        else
            print_error "❌ GET request failed (HTTP $get_response)"
            return 1
        fi
    else
        print_error "❌ Preflight request failed (HTTP $response)"
        return 1
    fi
}

# Function to test API endpoints
test_api_endpoints() {
    local backend_url="$1"
    local origin="$2"
    
    print_info "Testing API endpoints from origin: $origin"
    
    # Test health endpoint
    print_info "Testing /api/health..."
    local health_response=$(curl -s -H "Origin: $origin" "$backend_url/api/health" 2>/dev/null || echo '{"error":"connection_failed"}')
    
    if echo "$health_response" | grep -q '"status":\s*"OK"'; then
        print_success "✅ Health endpoint working"
    elif echo "$health_response" | grep -q '"success":\s*true'; then
        print_success "✅ Health endpoint working (simple version)"
    else
        print_error "❌ Health endpoint failed"
        echo "Response: $health_response"
    fi
    
    # Test foods endpoint
    print_info "Testing /api/foods..."
    local foods_response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Origin: $origin" \
        "$backend_url/api/foods" 2>/dev/null || echo "000")
    
    if [[ "$foods_response" == "200" ]]; then
        print_success "✅ Foods endpoint accessible (HTTP $foods_response)"
    else
        print_warning "⚠️ Foods endpoint returned HTTP $foods_response"
    fi
    
    # Test categories endpoint
    print_info "Testing /api/categories..."
    local categories_response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Origin: $origin" \
        "$backend_url/api/categories" 2>/dev/null || echo "000")
    
    if [[ "$categories_response" == "200" ]]; then
        print_success "✅ Categories endpoint accessible (HTTP $categories_response)"
    else
        print_warning "⚠️ Categories endpoint returned HTTP $categories_response"
    fi
}

# Function to check backend status
check_backend_status() {
    local backend_url="$1"
    
    print_info "Checking backend status..."
    
    # Check if backend is running
    if curl -s --connect-timeout 5 "$backend_url/api/health" >/dev/null 2>&1; then
        print_success "✅ Backend is running and accessible"
        return 0
    else
        print_error "❌ Backend is not accessible at $backend_url"
        print_info "Make sure Docker containers are running: make up"
        return 1
    fi
}

# Function to show CORS headers
show_cors_headers() {
    local backend_url="$1"
    local origin="$2"
    
    print_info "CORS headers from backend:"
    echo
    
    curl -s -I \
        -X OPTIONS \
        -H "Origin: $origin" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        "$backend_url/api/health" | grep -i "access-control" || echo "No CORS headers found"
    
    echo
}

# Main testing function
main() {
    echo "=============================================="
    echo "🌐 CORS Testing Tool"
    echo "=============================================="
    echo
    
    local backend_url="http://localhost:3000"
    local frontend_origins=(
        "http://localhost"
        "http://localhost:80"
        "http://localhost:8080"
        "http://127.0.0.1"
        "http://127.0.0.1:80"
        "http://127.0.0.1:8080"
    )
    
    # Check backend status first
    if ! check_backend_status "$backend_url"; then
        exit 1
    fi
    
    echo
    
    # Test CORS for each origin
    for origin in "${frontend_origins[@]}"; do
        echo "=============================================="
        print_info "Testing CORS for origin: $origin"
        echo "=============================================="
        
        # Show CORS headers
        show_cors_headers "$backend_url" "$origin"
        
        # Test CORS preflight
        if test_cors_preflight "$origin" "$backend_url"; then
            # Test API endpoints
            test_api_endpoints "$backend_url" "$origin"
        fi
        
        echo
    done
    
    # Summary
    echo "=============================================="
    print_info "CORS Test Summary"
    echo "=============================================="
    echo
    print_info "If you see CORS errors in browser:"
    echo "1. Make sure backend is running: make up"
    echo "2. Check backend logs: make logs-backend"
    echo "3. Restart backend: docker-compose restart backend"
    echo "4. Check CORS configuration in backend/app.js"
    echo
    print_info "Frontend URLs to test:"
    echo "- Development: http://localhost:8080"
    echo "- Production: http://localhost:80"
    echo
    print_info "Backend API URL:"
    echo "- API Base: http://localhost:3000/api"
    echo "- Health Check: http://localhost:3000/api/health"
    echo "- Swagger Docs: http://localhost:3000/api-docs"
}

# Run main function
main "$@"
