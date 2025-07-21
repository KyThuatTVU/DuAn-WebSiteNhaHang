# 🍽️ Restaurant Management API Documentation

## 📋 Tổng quan

Hệ thống API quản lý nhà hàng được xây dựng với Node.js, Express, MySQL và tích hợp AI chatbot.

**Base URL:** `http://localhost:3000/api`
**Version:** 1.0.0
**Database:** MySQL
**Authentication:** JWT Token

## 🔐 Authentication

### Đăng ký tài khoản
```http
POST /api/khach_hang/register
Content-Type: application/json

{
  "full_name": "Nguyễn Văn A",
  "email": "user@example.com", 
  "phone": "0123456789",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": 1,
      "full_name": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0123456789"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Đăng nhập
```http
POST /api/khach_hang/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Lấy thông tin profile
```http
GET /api/khach_hang/profile
Authorization: Bearer <token>
```

### Refresh token
```http
POST /api/khach_hang/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🍜 Foods Management

### Lấy danh sách món ăn
```http
GET /api/foods?page=1&limit=10&category=1&search=phở&sort=gia&order=asc
```

**Query Parameters:**
- `page` (number): Trang hiện tại (default: 1)
- `limit` (number): Số lượng items per page (default: 20, max: 100)
- `category` (number): Lọc theo ID loại món
- `search` (string): Tìm kiếm theo tên món
- `sort` (string): Sắp xếp theo field (gia, ten_mon, created_at)
- `order` (string): Thứ tự sắp xếp (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_mon": 1,
      "ten_mon": "Phở Bò Tái",
      "mo_ta": "Phở bò tái với nước dùng đậm đà",
      "gia": 45000,
      "hinh_anh": "http://localhost:3000/images/pho-bo-tai.jpg",
      "so_luong": 50,
      "trang_thai": "kha_dung",
      "loai_mon": {
        "id_loai": 2,
        "ten_loai": "Món Chính"
      }
    }
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Lấy chi tiết món ăn
```http
GET /api/foods/{id}
```

### Tạo món ăn mới
```http
POST /api/foods
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

{
  "id_loai": 2,
  "ten_mon": "Bún Bò Huế",
  "mo_ta": "Bún bò Huế cay nồng đặc trưng",
  "gia": 50000,
  "so_luong": 30,
  "hinh_anh": <file>
}
```

### Cập nhật món ăn
```http
PUT /api/foods/{id}
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

{
  "ten_mon": "Bún Bò Huế Cay",
  "gia": 55000,
  "hinh_anh": <file>
}
```

### Xóa món ăn
```http
DELETE /api/foods/{id}
Authorization: Bearer <admin_token>
```

### Cập nhật số lượng tồn kho
```http
PATCH /api/foods/{id}/stock
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "so_luong": 25
}
```

## 📂 Categories Management

### Lấy danh sách loại món
```http
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_loai": 1,
      "ten_loai": "Khai Vị",
      "mo_ta": "Các món ăn nhẹ mở đầu bữa ăn",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 4
}
```

### Lấy món ăn theo loại
```http
GET /api/categories/{id}/foods?limit=10&offset=0
```

### Tạo loại món mới
```http
POST /api/categories
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "ten_loai": "Món Tráng Miệng",
  "mo_ta": "Các món ăn ngọt kết thúc bữa ăn"
}
```

## 🤖 AI Chat

### Gửi tin nhắn chat
```http
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Tôi muốn đặt món phở bò"
    }
  ],
  "options": {
    "useGroq": false,
    "temperature": 0.7,
    "maxTokens": 1000
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Phở bò là món đặc sản của chúng tôi! Bạn muốn phở bò tái hay phở bò chín?",
  "provider": "gemini",
  "model": "gemini-pro",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Tạo mô tả món ăn bằng AI
```http
POST /api/chat/generate-description
Content-Type: application/json

{
  "foodName": "Bún Bò Huế",
  "ingredients": ["bún", "thịt bò", "chả cua", "ớt"],
  "options": {
    "style": "traditional",
    "length": "medium"
  }
}
```

## 📅 Reservations (Đặt bàn)

### Tạo đặt bàn mới
```http
POST /api/datban
Content-Type: application/json

{
  "ten_khach": "Nguyễn Văn A",
  "sdt": "0123456789",
  "email": "user@example.com",
  "ngay": "2024-01-15",
  "gio": "19:00",
  "so_luong_khach": 4,
  "ghi_chu": "Bàn gần cửa sổ"
}
```

### Lấy danh sách đặt bàn
```http
GET /api/datban?page=1&limit=20&status=cho_xac_nhan&date=2024-01-15&phone=0123
```

**Query Parameters:**
- `status`: cho_xac_nhan, da_xac_nhan, da_huy
- `date`: Lọc theo ngày (YYYY-MM-DD)
- `phone`: Tìm kiếm theo SĐT/tên/email

### Cập nhật trạng thái đặt bàn
```http
PATCH /api/datban/{id}/status
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "trang_thai": "da_xac_nhan"
}
```

## 👥 Customer Management

### Lấy danh sách khách hàng
```http
GET /api/khachhang
Authorization: Bearer <admin_token>
```

### Lấy thông tin khách hàng
```http
GET /api/khachhang/{id}
Authorization: Bearer <admin_token>
```

## 🔧 System APIs

### Health check
```http
GET /api/health
```

### API test
```http
GET /api/test
```

### API documentation
```http
GET /api/docs
```

## 📊 Response Format Chuẩn

### Success Response
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

### Error Response
```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "error": "Chi tiết lỗi",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin protection  
- **Rate Limiting**: DDoS protection
- **Input Validation**: SQL injection prevention
- **File Upload Security**: Type và size validation
- **JWT Authentication**: Secure token-based auth

## 📝 Validation Rules

### Food Item Validation
- `ten_mon`: 2-255 ký tự, chỉ chữ cái, số, dấu cách
- `gia`: Số dương, tối đa 10,000,000 VNĐ
- `mo_ta`: Tối đa 1000 ký tự
- `hinh_anh`: JPG, PNG, tối đa 5MB

### User Registration Validation
- `email`: Format email hợp lệ
- `password`: Tối thiểu 6 ký tự
- `phone`: 10-11 số
- `full_name`: 2-100 ký tự

## 🚀 Getting Started

1. Clone repository
2. Install dependencies: `npm install`
3. Setup database: Import `QuanLyDBWeb/CNPM_QuanLyNhaHang.sql`
4. Configure environment variables
5. Start server: `npm run dev`
6. Access API docs: `http://localhost:3000/api-docs`
