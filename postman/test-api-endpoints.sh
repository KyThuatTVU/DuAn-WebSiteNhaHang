#!/bin/bash
# Quick API test script for Website Nhà Hàng

echo "🧪 Testing Website Nhà Hàng API Endpoints"
echo "=========================================="

# Configuration
BASE_URL="http://localhost:3000/api"
SERVER_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    case $1 in
        "SUCCESS") echo -e "${GREEN}✅ $2${NC}" ;;
        "ERROR") echo -e "${RED}❌ $2${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️  $2${NC}" ;;
    esac
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local data=$4
    
    echo ""
    print_status "INFO" "Testing: $description"
    echo "  Method: $method"
    echo "  URL: $url"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    elif [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        print_status "SUCCESS" "HTTP $http_code - $description"
        if [ ${#body} -gt 100 ]; then
            echo "  Response: ${body:0:100}..."
        else
            echo "  Response: $body"
        fi
    else
        print_status "ERROR" "HTTP $http_code - $description"
        echo "  Error: $body"
    fi
}

echo ""
echo "🔍 Step 1: Testing Health & System Endpoints"

test_endpoint "GET" "$BASE_URL/health" "Health Check"
test_endpoint "GET" "$BASE_URL/test" "API Test"
test_endpoint "GET" "$SERVER_URL/" "Root Endpoint"

echo ""
echo "🍽️ Step 2: Testing Categories"

test_endpoint "GET" "$BASE_URL/categories" "Get All Categories"
test_endpoint "GET" "$BASE_URL/categories/1" "Get Category by ID"

echo ""
echo "🍜 Step 3: Testing Foods"

test_endpoint "GET" "$BASE_URL/foods" "Get All Foods"
test_endpoint "GET" "$BASE_URL/foods/1" "Get Food by ID"

echo ""
echo "👥 Step 4: Testing Customer Management"

test_endpoint "GET" "$BASE_URL/khachhang" "Get All Customers"
test_endpoint "GET" "$BASE_URL/khachhang/1" "Get Customer by ID"

# Test customer login
customer_login_data='{
  "email": "nguyenvana@email.com",
  "phone": "0987654321"
}'

test_endpoint "POST" "$BASE_URL/khachhang/login" "Customer Login" "$customer_login_data"

echo ""
echo "📅 Step 5: Testing Booking Management"

test_endpoint "GET" "$BASE_URL/datban" "Get All Reservations"

# Test create reservation
reservation_data='{
  "ten_khach": "Test User",
  "sdt": "0999888777",
  "email": "testuser@example.com",
  "ngay": "2024-12-25",
  "gio": "19:30:00",
  "so_luong_khach": 2,
  "ghi_chu": "API Test Booking"
}'

test_endpoint "POST" "$BASE_URL/datban" "Create Reservation" "$reservation_data"

echo ""
echo "🤖 Step 6: Testing AI Chat"

test_endpoint "GET" "$BASE_URL/chat/health" "Chat Health Check"
test_endpoint "GET" "$BASE_URL/chat/status" "Chat Status"

# Test chat message
chat_data='{
  "messages": [
    {
      "role": "user",
      "content": "Xin chào! Nhà hàng có những món gì ngon?"
    }
  ],
  "options": {
    "useGroq": false,
    "temperature": 0.7
  }
}'

test_endpoint "POST" "$BASE_URL/chat" "Send Chat Message" "$chat_data"

echo ""
echo "📁 Step 7: Testing File Endpoints"

test_endpoint "GET" "$SERVER_URL/images/sample.jpg" "Get Sample Image"

echo ""
echo "📊 Test Summary"
echo "==============="

print_status "INFO" "API testing completed!"

echo ""
echo "🚀 Next Steps:"
echo "   1. Import Postman collections for detailed testing"
echo "   2. Set up authentication tokens for protected endpoints"
echo "   3. Test file upload functionality with actual files"
echo "   4. Configure AI API keys for full chat functionality"

echo ""
echo "📚 Resources:"
echo "   • Postman Collections: ./postman/*.json"
echo "   • API Documentation: $SERVER_URL/api-docs"
echo "   • Health Check: $BASE_URL/health"

echo ""
echo "🔧 Troubleshooting:"
echo "   • If endpoints fail, check if server is running: docker-compose ps"
echo "   • View logs: docker-compose logs -f backend"
echo "   • Restart services: docker-compose restart"
