# 📋 Danh Sách Đầy Đủ API Endpoints - Restaurant Management System

## 🎯 **TỔNG QUAN**
- **Total Endpoints:** 86+
- **HTTP Methods:** GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- **Base URL:** `http://localhost:3000/api`
- **Authentication:** JWT Bearer Token (cho hầu hết endpoints)

---

## 🏥 **1. SYSTEM HEALTH & MONITORING**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Kiểm tra trạng thái server và database | ❌ |
| GET | `/ready` | Readiness probe cho container | ❌ |
| GET | `/live` | Liveness probe | ❌ |
| GET | `/test` | Test basic connectivity | ❌ |

---

## 🔐 **2. AUTHENTICATION & USER MANAGEMENT**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/khach_hang/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/khach_hang/login` | Đăng nhập | ❌ |
| POST | `/khach_hang/refresh` | Refresh access token | ❌ |
| POST | `/khach_hang/logout` | Đăng xuất | ✅ |
| GET | `/khach_hang/profile` | Lấy thông tin profile | ✅ |
| PUT | `/khach_hang/profile` | Cập nhật profile toàn bộ | ✅ |
| PATCH | `/khach_hang/profile` | Cập nhật profile một phần | ✅ |
| GET | `/khach_hang` | Lấy danh sách users (admin) | ✅ |
| GET | `/khach_hang/:id` | Lấy user theo ID | ✅ |
| DELETE | `/khach_hang/:id` | Xóa user (admin) | ✅ |
| POST | `/khach_hang/forgot-password` | Quên mật khẩu | ❌ |
| HEAD | `/khach_hang` | Metadata của users | ✅ |
| OPTIONS | `/khach_hang` | Supported methods | ❌ |

---

## 👥 **3. CUSTOMER MANAGEMENT**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/khachhang` | Lấy danh sách khách hàng | ✅ |
| GET | `/khachhang/:id` | Lấy khách hàng theo ID | ✅ |
| POST | `/khachhang` | Tạo khách hàng mới | ✅ |
| PUT | `/khachhang/:id` | Cập nhật khách hàng | ✅ |
| PATCH | `/khachhang/:id` | Cập nhật một phần | ✅ |
| DELETE | `/khachhang/:id` | Xóa khách hàng | ✅ |
| HEAD | `/khachhang` | Metadata | ✅ |
| OPTIONS | `/khachhang` | Supported methods | ❌ |

---

## 🍜 **4. FOODS MANAGEMENT**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/foods` | Lấy danh sách món ăn (có filter, search, pagination) | ❌ |
| GET | `/foods/:id` | Lấy chi tiết món ăn | ❌ |
| POST | `/foods` | Tạo món ăn mới (với upload hình) | ✅ |
| PUT | `/foods/:id` | Cập nhật món ăn toàn bộ | ✅ |
| PATCH | `/foods/:id` | Cập nhật món ăn một phần | ✅ |
| PATCH | `/foods/:id/stock` | Cập nhật số lượng tồn kho | ✅ |
| PATCH | `/foods/:id/status` | Cập nhật trạng thái món | ✅ |
| DELETE | `/foods/:id` | Xóa món ăn | ✅ |
| POST | `/foods/bulk` | Tạo nhiều món ăn cùng lúc | ✅ |
| DELETE | `/foods/bulk` | Xóa nhiều món ăn | ✅ |
| HEAD | `/foods` | Metadata của foods | ❌ |
| OPTIONS | `/foods` | Supported methods | ❌ |

**Query Parameters cho GET /foods:**
- `limit`, `offset` - Pagination
- `search` - Tìm kiếm theo tên, mô tả
- `category` - Lọc theo danh mục
- `minPrice`, `maxPrice` - Lọc theo giá
- `available` - Lọc theo tình trạng còn hàng
- `sort`, `order` - Sắp xếp

---

## 📂 **5. CATEGORIES MANAGEMENT**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories` | Lấy danh sách danh mục | ❌ |
| GET | `/categories/:id` | Lấy danh mục theo ID | ❌ |
| GET | `/categories/:id/foods` | Lấy món ăn theo danh mục | ❌ |
| POST | `/categories` | Tạo danh mục mới | ✅ |
| PUT | `/categories/:id` | Cập nhật danh mục | ✅ |
| PATCH | `/categories/:id` | Cập nhật một phần | ✅ |
| PATCH | `/categories/:id/status` | Cập nhật trạng thái | ✅ |
| DELETE | `/categories/:id` | Xóa danh mục | ✅ |
| HEAD | `/categories` | Metadata | ❌ |
| OPTIONS | `/categories` | Supported methods | ❌ |

---

## 🤖 **6. AI CHAT INTEGRATION**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/chat` | Gửi tin nhắn tới AI chatbot | ❌ |
| GET | `/chat` | Lấy lịch sử chat (với pagination) | ❌ |
| GET | `/chat/:id` | Lấy cuộc trò chuyện theo ID | ❌ |
| PATCH | `/chat/:id` | Cập nhật thông tin cuộc trò chuyện | ❌ |
| DELETE | `/chat/:id` | Xóa cuộc trò chuyện | ❌ |
| POST | `/chat/generate-description` | Tạo mô tả món ăn bằng AI | ❌ |
| GET | `/chat/status` | Kiểm tra trạng thái AI service | ❌ |
| HEAD | `/chat` | Metadata | ❌ |
| OPTIONS | `/chat` | Supported methods | ❌ |

---

## 📅 **7. RESERVATIONS (ĐẶT BÀN)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/datban` | Lấy danh sách đặt bàn (có filter) | ✅ |
| GET | `/datban/:id` | Lấy chi tiết đặt bàn | ✅ |
| POST | `/datban` | Tạo đặt bàn mới | ❌ |
| PUT | `/datban/:id` | Cập nhật đặt bàn toàn bộ | ✅ |
| PATCH | `/datban/:id` | Cập nhật đặt bàn một phần | ✅ |
| PATCH | `/datban/:id/status` | Cập nhật trạng thái đặt bàn | ✅ |
| DELETE | `/datban/:id` | Hủy/xóa đặt bàn | ✅ |
| GET | `/datban/availability` | Kiểm tra bàn trống | ❌ |
| POST | `/datban/bulk` | Tạo nhiều đặt bàn | ✅ |
| DELETE | `/datban/bulk` | Hủy nhiều đặt bàn | ✅ |
| HEAD | `/datban` | Metadata | ✅ |
| OPTIONS | `/datban` | Supported methods | ❌ |

**Query Parameters cho GET /datban:**
- `page`, `limit` - Pagination
- `status` - Lọc theo trạng thái (cho_xac_nhan, da_xac_nhan, da_huy)
- `date` - Lọc theo ngày (YYYY-MM-DD)
- `phone` - Tìm kiếm theo SĐT/tên/email

---

## 🧾 **8. INVOICE MANAGEMENT (MỚI)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/hoadon` | Lấy danh sách hóa đơn (có filter) | ✅ |
| GET | `/hoadon/:id` | Lấy chi tiết hóa đơn | ✅ |
| POST | `/hoadon` | Tạo hóa đơn mới | ✅ |
| PUT | `/hoadon/:id` | Cập nhật hóa đơn toàn bộ | ✅ |
| PATCH | `/hoadon/:id` | Cập nhật hóa đơn một phần | ✅ |
| PATCH | `/hoadon/:id/payment` | Cập nhật trạng thái thanh toán | ✅ |
| PATCH | `/hoadon/:id/cancel` | Hủy hóa đơn | ✅ |
| DELETE | `/hoadon/:id` | Xóa hóa đơn | ✅ |
| GET | `/hoadon/statistics` | Thống kê doanh thu | ✅ |
| GET | `/hoadon/:id/print` | In hóa đơn (PDF/HTML) | ✅ |
| HEAD | `/hoadon` | Metadata | ✅ |
| OPTIONS | `/hoadon` | Supported methods | ❌ |

**Query Parameters cho GET /hoadon:**
- `page`, `limit` - Pagination
- `status` - Lọc theo trạng thái (chua_thanh_toan, da_thanh_toan, da_huy)
- `date_from`, `date_to` - Lọc theo khoảng thời gian
- `customer_id` - Lọc theo khách hàng

**Query Parameters cho GET /hoadon/statistics:**
- `period` - Kỳ thống kê (day, week, month, year)
- `year`, `month` - Năm, tháng cụ thể

---

## 📚 **9. API DOCUMENTATION**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/docs` | Trang API documentation | ❌ |
| GET | `/docs/swagger.json` | Swagger JSON spec | ❌ |
| GET | `/docs/stats` | Thống kê API | ❌ |
| GET | `/docs/examples` | Ví dụ sử dụng API | ❌ |
| GET | `/docs/postman-collection` | Download Postman collection | ❌ |

---

## 🔧 **RESPONSE FORMAT CHUẨN**

### **Success Response:**
```json
{
  "success": true,
  "message": "Thông báo thành công",
  "data": {},
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### **Error Response:**
```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "error": "Chi tiết lỗi",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 🔐 **AUTHENTICATION**

### **JWT Token Format:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Token Endpoints:**
- **Login:** POST `/khach_hang/login`
- **Refresh:** POST `/khach_hang/refresh`
- **Logout:** POST `/khach_hang/logout`

---

## 📊 **SUMMARY**

| Category | Endpoints | Features |
|----------|-----------|----------|
| **System** | 4 | Health checks, monitoring |
| **Auth** | 13 | Registration, login, profile |
| **Customers** | 8 | Customer management |
| **Foods** | 12 | CRUD, search, filter, bulk ops |
| **Categories** | 10 | Category management |
| **AI Chat** | 9 | Chatbot, AI descriptions |
| **Reservations** | 13 | Booking system, availability |
| **Invoices** | 11 | Billing, payments, statistics |
| **Docs** | 5 | API documentation |
| **TOTAL** | **86+** | **Complete REST API** |

---

**🎯 Tất cả endpoints đều được implement đầy đủ trong Postman Collection v3.0!**
