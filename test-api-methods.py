#!/usr/bin/env python3
"""
Test script để kiểm tra các phương thức RESTful API
"""

import json
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode

BASE_URL = "http://localhost:3000/api"

def print_status(status, message):
    colors = {
        'SUCCESS': '\033[0;32m✅',
        'ERROR': '\033[0;31m❌', 
        'WARNING': '\033[1;33m⚠️',
        'INFO': '\033[0;34mℹ️',
        'TESTING': '\033[0;35m🧪'
    }
    print(f"{colors.get(status, '')} {message}\033[0m")

def test_api(method, endpoint, description, data=None):
    """Test API endpoint với method cụ thể"""
    print_status('TESTING', f"{method} {endpoint} - {description}")
    
    try:
        url = f"{BASE_URL}{endpoint}" if endpoint.startswith('/') else f"{BASE_URL}/{endpoint}"
        
        # Prepare request
        if data:
            data_bytes = json.dumps(data).encode('utf-8')
            req = Request(url, data=data_bytes, method=method)
            req.add_header('Content-Type', 'application/json')
        else:
            req = Request(url, method=method)
        
        # Send request
        with urlopen(req, timeout=10) as response:
            status_code = response.getcode()
            response_data = response.read().decode('utf-8')
            
            if 200 <= status_code < 300:
                print_status('SUCCESS', f"HTTP {status_code}")
                try:
                    json_data = json.loads(response_data)
                    message = json_data.get('message', 'No message')
                    print(f"  📄 Response: {message}")
                except:
                    print(f"  📄 Response: {response_data[:100]}...")
            else:
                print_status('WARNING', f"HTTP {status_code}")
                
    except HTTPError as e:
        print_status('ERROR', f"HTTP {e.code} - {e.reason}")
        try:
            error_data = json.loads(e.read().decode('utf-8'))
            print(f"  📄 Error: {error_data.get('message', 'Unknown error')}")
        except:
            pass
    except URLError as e:
        print_status('ERROR', f"Connection failed: {e.reason}")
        print("  💡 Hãy chạy server trước: node test-server.js")
    except Exception as e:
        print_status('ERROR', f"Unexpected error: {str(e)}")
    
    print()

def main():
    print("🧪 TESTING RESTful API METHODS")
    print("=" * 50)
    
    # Test server health first
    print("\n🏥 === HEALTH CHECK ===")
    test_api('GET', '/health', 'Server health check')
    
    print("📅 === BOOKING API (datban) ===")
    
    # Test GET methods
    test_api('GET', '/datban', 'List all reservations')
    test_api('GET', '/datban/1', 'Get reservation by ID')
    
    # Test POST method
    booking_data = {
        "ten_khach": "Test User",
        "sdt": "0987654321",
        "email": "test@example.com",
        "ngay": "2024-12-25",
        "gio": "19:00:00",
        "so_luong_khach": 4,
        "ghi_chu": "Test booking from Python"
    }
    test_api('POST', '/datban', 'Create new reservation', booking_data)
    
    # Test PUT method
    update_data = {
        "ten_khach": "Updated User",
        "so_luong_khach": 6,
        "ghi_chu": "Updated booking"
    }
    test_api('PUT', '/datban/1', 'Update reservation', update_data)
    
    # Test PATCH method
    status_data = {
        "trang_thai": "da_xac_nhan"
    }
    test_api('PATCH', '/datban/1/status', 'Update reservation status', status_data)
    
    # Test DELETE method
    test_api('DELETE', '/datban/1', 'Delete reservation')
    
    print("📊 === SUMMARY ===")
    print_status('INFO', 'Đã test tất cả phương thức RESTful!')
    print()
    print("🎯 Các phương thức đã test:")
    print("   ✅ GET    - Lấy dữ liệu")
    print("   ✅ POST   - Tạo mới")
    print("   ✅ PUT    - Cập nhật toàn bộ")
    print("   ✅ PATCH  - Cập nhật một phần")
    print("   ✅ DELETE - Xóa")
    print()
    print("💡 Nếu có lỗi 'Connection failed':")
    print("   1. Cài đặt Node.js: sudo apt install nodejs npm")
    print("   2. Chạy server: node test-server.js")
    print("   3. Hoặc chạy backend: cd backend && npm start")

if __name__ == "__main__":
    main()
