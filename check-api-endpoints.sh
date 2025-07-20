#!/bin/bash
# Kiểm tra chi tiết các API endpoints của Website Nhà Hàng

echo "🔍 KIỂM TRA CHI TIẾT CÁC API ENDPOINTS"
echo "====================================="

# Configuration
BASE_URL="http://localhost:3000/api"
SERVER_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_status() {
    case $1 in
        "SUCCESS") echo -e "${GREEN}✅ $2${NC}" ;;
        "ERROR") echo -e "${RED}❌ $2${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️  $2${NC}" ;;
        "TESTING") echo -e "${PURPLE}🧪 $2${NC}" ;;
    esac
}

# Function to test endpoint with detailed output
test_api() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local expected_status=$5
    
    print_status "TESTING" "Testing: $description"
    echo "  📍 $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$endpoint" 2>/dev/null)
    elif [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$endpoint" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$endpoint" 2>/dev/null)
    fi
    
    if [ $? -ne 0 ]; then
        print_status "ERROR" "Connection failed - Server không chạy hoặc không thể kết nối"
        echo "  💡 Hãy chạy: docker-compose up -d"
        return 1
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    # Check if response is valid JSON
    if echo "$body" | jq . >/dev/null 2>&1; then
        success=$(echo "$body" | jq -r '.success // "unknown"')
        message=$(echo "$body" | jq -r '.message // "No message"')
        
        if [ "$http_code" = "${expected_status:-200}" ]; then
            print_status "SUCCESS" "HTTP $http_code - $description"
            echo "  📄 Success: $success"
            echo "  💬 Message: $message"
            
            # Show data preview if available
            if echo "$body" | jq -e '.data' >/dev/null 2>&1; then
                data_count=$(echo "$body" | jq '.data | length // 0')
                echo "  📊 Data items: $data_count"
            fi
        else
            print_status "WARNING" "HTTP $http_code (expected ${expected_status:-200}) - $description"
            echo "  📄 Response: $message"
        fi
    else
        if [ "$http_code" = "${expected_status:-200}" ]; then
            print_status "SUCCESS" "HTTP $http_code - $description"
        else
            print_status "ERROR" "HTTP $http_code - $description"
        fi
        echo "  📄 Response: ${body:0:100}..."
    fi
    
    echo ""
}

# Check if server is running
print_status "INFO" "Kiểm tra server có đang chạy không..."
if curl -s "$SERVER_URL" >/dev/null 2>&1; then
    print_status "SUCCESS" "Server đang chạy tại $SERVER_URL"
else
    print_status "ERROR" "Server không chạy hoặc không thể kết nối"
    echo ""
    echo "🚀 Để khởi động server:"
    echo "   docker-compose up -d"
    echo "   # Hoặc"
    echo "   cd backend && npm start"
    echo ""
    exit 1
fi

echo ""
echo "🏥 === HEALTH & SYSTEM ENDPOINTS ==="

test_api "GET" "$SERVER_URL/" "Root endpoint - Server info"
test_api "GET" "$BASE_URL/health" "Health check"
test_api "GET" "$BASE_URL/test" "API test"
test_api "GET" "$BASE_URL/docs" "API documentation"

echo ""
echo "🍽️ === CATEGORIES ENDPOINTS ==="

test_api "GET" "$BASE_URL/categories" "Get all categories"
test_api "GET" "$BASE_URL/categories/1" "Get category by ID" "" "200"
test_api "GET" "$BASE_URL/categories/999" "Get non-existent category" "" "404"
test_api "GET" "$BASE_URL/categories/1/foods" "Get foods by category"

echo ""
echo "🍜 === FOODS ENDPOINTS ==="

test_api "GET" "$BASE_URL/foods" "Get all foods"
test_api "GET" "$BASE_URL/foods?limit=5" "Get foods with limit"
test_api "GET" "$BASE_URL/foods?search=phở" "Search foods"
test_api "GET" "$BASE_URL/foods/1" "Get food by ID"
test_api "GET" "$BASE_URL/foods/999" "Get non-existent food" "" "404"
test_api "GET" "$BASE_URL/foods/stats" "Get food statistics"

echo ""
echo "👥 === CUSTOMER MANAGEMENT ==="

test_api "GET" "$BASE_URL/khachhang" "Get all customers"
test_api "GET" "$BASE_URL/khachhang/1" "Get customer by ID"

# Test customer login
customer_login='{
  "email": "nguyenvana@email.com",
  "phone": "0987654321"
}'
test_api "POST" "$BASE_URL/khachhang/login" "Simple customer login" "$customer_login"

echo ""
echo "🔐 === AUTHENTICATION ENDPOINTS ==="

# Test register
register_data='{
  "ho_ten": "Test User",
  "email": "test@example.com",
  "mat_khau": "password123",
  "so_dien_thoai": "0987654321"
}'
test_api "POST" "$BASE_URL/khach_hang/register" "Register new user" "$register_data" "201"

# Test login
login_data='{
  "email": "test@example.com",
  "password": "password123"
}'
test_api "POST" "$BASE_URL/khach_hang/login" "Login user" "$login_data"

echo ""
echo "📅 === BOOKING ENDPOINTS ==="

test_api "GET" "$BASE_URL/datban" "Get all reservations"
test_api "GET" "$BASE_URL/datban?status=cho_xac_nhan" "Get pending reservations"
test_api "GET" "$BASE_URL/datban?limit=5" "Get reservations with limit"

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
test_api "POST" "$BASE_URL/datban" "Create new reservation" "$reservation_data" "201"

test_api "GET" "$BASE_URL/datban/1" "Get reservation by ID"
test_api "GET" "$BASE_URL/datban/999" "Get non-existent reservation" "" "404"

echo ""
echo "🤖 === AI CHAT ENDPOINTS ==="

test_api "GET" "$BASE_URL/chat/health" "Chat health check"
test_api "GET" "$BASE_URL/chat/status" "Chat status"

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
test_api "POST" "$BASE_URL/chat" "Send chat message" "$chat_data"

echo ""
echo "📁 === FILE ENDPOINTS ==="

test_api "GET" "$SERVER_URL/images/sample.jpg" "Get sample image" "" "404"

echo ""
echo "📊 === SUMMARY ==="
print_status "INFO" "API endpoint testing completed!"

echo ""
echo "🎯 Các API chính đã được kiểm tra:"
echo "   ✅ Health & System (4 endpoints)"
echo "   ✅ Categories (4 endpoints)"  
echo "   ✅ Foods (6 endpoints)"
echo "   ✅ Customer Management (3 endpoints)"
echo "   ✅ Authentication (2 endpoints)"
echo "   ✅ Booking Management (5 endpoints)"
echo "   ✅ AI Chat (3 endpoints)"
echo "   ✅ File Handling (1 endpoint)"

echo ""
echo "📚 Tài liệu API:"
echo "   • Swagger UI: $SERVER_URL/api-docs"
echo "   • API Docs: $BASE_URL/docs"
echo "   • Postman Collections: ./postman/"

echo ""
echo "🔧 Nếu có lỗi:"
echo "   • Kiểm tra server: docker-compose ps"
echo "   • Xem logs: docker-compose logs -f backend"
echo "   • Restart: docker-compose restart"
