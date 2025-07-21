# 🔍 API Methods Analysis - Phân tích các phương thức HTTP

## 📊 Tình trạng hiện tại các API endpoints

### ✅ **Foods API (`/api/foods`)**
**Hiện có:**
- ✅ `GET /api/foods` - Lấy danh sách món ăn
- ✅ `GET /api/foods/:id` - Lấy món ăn theo ID
- ✅ `POST /api/foods` - Tạo món ăn mới
- ✅ `PUT /api/foods/:id` - Cập nhật món ăn
- ✅ `PATCH /api/foods/:id/stock` - Cập nhật số lượng
- ✅ `DELETE /api/foods/:id` - Xóa món ăn

**Thiếu:**
- ❌ `HEAD /api/foods` - Kiểm tra metadata
- ❌ `OPTIONS /api/foods` - Kiểm tra methods được hỗ trợ
- ❌ `PATCH /api/foods/:id` - Cập nhật một phần
- ❌ `PATCH /api/foods/:id/status` - Cập nhật trạng thái
- ❌ `POST /api/foods/bulk` - Tạo nhiều món ăn
- ❌ `DELETE /api/foods/bulk` - Xóa nhiều món ăn

### ✅ **Categories API (`/api/categories`)**
**Hiện có:**
- ✅ `GET /api/categories` - Lấy danh sách danh mục
- ✅ `GET /api/categories/:id` - Lấy danh mục theo ID
- ✅ `GET /api/categories/:id/foods` - Lấy món ăn theo danh mục
- ✅ `POST /api/categories` - Tạo danh mục mới
- ✅ `PUT /api/categories/:id` - Cập nhật danh mục
- ✅ `DELETE /api/categories/:id` - Xóa danh mục

**Thiếu:**
- ❌ `HEAD /api/categories` - Kiểm tra metadata
- ❌ `OPTIONS /api/categories` - Kiểm tra methods
- ❌ `PATCH /api/categories/:id` - Cập nhật một phần
- ❌ `PATCH /api/categories/:id/status` - Cập nhật trạng thái

### ⚠️ **Authentication API (`/api/khach_hang`)**
**Hiện có:**
- ✅ `POST /api/khach_hang/register` - Đăng ký
- ✅ `POST /api/khach_hang/login` - Đăng nhập
- ✅ `POST /api/khach_hang/refresh` - Refresh token
- ✅ `GET /api/khach_hang/profile` - Lấy profile
- ✅ `PUT /api/khach_hang/profile` - Cập nhật profile

**Thiếu:**
- ❌ `GET /api/khach_hang` - Lấy danh sách users (admin)
- ❌ `GET /api/khach_hang/:id` - Lấy user theo ID
- ❌ `PATCH /api/khach_hang/:id` - Cập nhật một phần
- ❌ `DELETE /api/khach_hang/:id` - Xóa user
- ❌ `POST /api/khach_hang/logout` - Đăng xuất
- ❌ `POST /api/khach_hang/forgot-password` - Quên mật khẩu
- ❌ `POST /api/khach_hang/reset-password` - Reset mật khẩu
- ❌ `PATCH /api/khach_hang/:id/status` - Cập nhật trạng thái
- ❌ `HEAD /api/khach_hang` - Metadata
- ❌ `OPTIONS /api/khach_hang` - Methods

### ⚠️ **Chat API (`/api/chat`)**
**Hiện có:**
- ✅ `POST /api/chat` - Gửi tin nhắn
- ✅ `POST /api/chat/generate-description` - Tạo mô tả món ăn
- ✅ `GET /api/chat/status` - Trạng thái AI service

**Thiếu:**
- ❌ `GET /api/chat` - Lấy lịch sử chat
- ❌ `GET /api/chat/:id` - Lấy cuộc trò chuyện theo ID
- ❌ `DELETE /api/chat/:id` - Xóa cuộc trò chuyện
- ❌ `PATCH /api/chat/:id` - Cập nhật cuộc trò chuyện
- ❌ `HEAD /api/chat` - Metadata
- ❌ `OPTIONS /api/chat` - Methods

### ⚠️ **Reservations API (`/api/datban`)**
**Hiện có:**
- ✅ `GET /api/datban` - Lấy danh sách đặt bàn
- ✅ `GET /api/datban/:id` - Lấy đặt bàn theo ID
- ✅ `POST /api/datban` - Tạo đặt bàn mới
- ✅ `PUT /api/datban/:id` - Cập nhật đặt bàn
- ✅ `PATCH /api/datban/:id/status` - Cập nhật trạng thái

**Thiếu:**
- ❌ `DELETE /api/datban/:id` - Xóa/hủy đặt bàn
- ❌ `PATCH /api/datban/:id` - Cập nhật một phần
- ❌ `HEAD /api/datban` - Metadata
- ❌ `OPTIONS /api/datban` - Methods
- ❌ `POST /api/datban/bulk` - Tạo nhiều đặt bàn
- ❌ `GET /api/datban/availability` - Kiểm tra bàn trống

### ⚠️ **Customer Management API (`/api/khachhang`)**
**Hiện có:**
- ✅ `GET /api/khachhang` - Lấy danh sách khách hàng
- ✅ `GET /api/khachhang/:id` - Lấy khách hàng theo ID

**Thiếu:**
- ❌ `POST /api/khachhang` - Tạo khách hàng mới
- ❌ `PUT /api/khachhang/:id` - Cập nhật khách hàng
- ❌ `PATCH /api/khachhang/:id` - Cập nhật một phần
- ❌ `DELETE /api/khachhang/:id` - Xóa khách hàng
- ❌ `HEAD /api/khachhang` - Metadata
- ❌ `OPTIONS /api/khachhang` - Methods

### ⚠️ **Documentation API (`/api/docs`)**
**Hiện có:**
- ✅ `GET /api/docs` - Trang documentation
- ✅ `GET /api/docs/swagger.json` - Swagger spec
- ✅ `GET /api/docs/postman-collection` - Download collection
- ✅ `GET /api/docs/stats` - API statistics

**Thiếu:**
- ❌ `HEAD /api/docs` - Metadata
- ❌ `OPTIONS /api/docs` - Methods

## 🎯 **Kế hoạch cập nhật**

### **Priority 1: Core HTTP Methods**
1. **HEAD endpoints** - Cho tất cả GET endpoints
2. **OPTIONS endpoints** - Cho tất cả resources
3. **PATCH endpoints** - Cập nhật một phần

### **Priority 2: Business Logic Methods**
1. **Bulk operations** - POST/DELETE nhiều items
2. **Status management** - PATCH status endpoints
3. **Advanced queries** - GET với filters nâng cao

### **Priority 3: Security & Management**
1. **User management** - CRUD cho users
2. **Password management** - Forgot/reset password
3. **Session management** - Logout, session info

## 📈 **Thống kê hiện tại**

| Module | GET | POST | PUT | PATCH | DELETE | HEAD | OPTIONS | Total |
|--------|-----|------|-----|-------|--------|------|---------|-------|
| Foods | 2 | 1 | 1 | 1 | 1 | 0 | 0 | 6/8 |
| Categories | 3 | 1 | 1 | 0 | 1 | 0 | 0 | 6/8 |
| Auth | 1 | 3 | 1 | 0 | 0 | 0 | 0 | 5/8 |
| Chat | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 3/8 |
| Reservations | 2 | 1 | 1 | 1 | 0 | 0 | 0 | 5/8 |
| Customers | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 2/8 |
| Docs | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 4/8 |

**Tổng kết:**
- **Endpoints hiện có:** 31
- **Endpoints cần bổ sung:** 25
- **Tỷ lệ hoàn thành:** 55%

## 🚀 **Next Steps**

1. **Cập nhật từng module** theo thứ tự ưu tiên
2. **Thêm middleware** cho HEAD và OPTIONS
3. **Cập nhật Postman collection** với endpoints mới
4. **Viết tests** cho tất cả endpoints
5. **Cập nhật documentation** với methods mới
