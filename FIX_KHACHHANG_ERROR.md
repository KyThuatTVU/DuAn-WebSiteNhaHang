# 🔧 Fix Khach Hang API Error - Khắc phục lỗi 404 GET /api/khach_hang/1

## 🚨 **Lỗi gặp phải:**

```json
{
    "success": false,
    "status": "fail", 
    "error": "Không tìm thấy /api/khach_hang/1",
    "code": "NOT_FOUND",
    "method": "GET"
}
```

## 🔍 **Nguyên nhân:**

Có **conflict routing** và **URL path confusion** giữa hai routes:

1. **Authentication routes:** `/api/khach_hang` (có dấu gạch dưới)
2. **Customer management routes:** `/api/khachhang` (không có dấu gạch dưới)

## ✅ **Đã khắc phục:**

### **1. Sửa route order trong `routes/index.js`:**

```javascript
// Mount customer management routes first (more specific)
router.use('/khachhang', khachhangRoutes);  // /api/khachhang

// Mount authentication routes (less specific)  
router.use('/khach_hang', customerRoutes);  // /api/khach_hang
```

### **2. Phân biệt rõ ràng hai API groups:**

#### **🔐 Authentication API (`/api/khach_hang`):**
- `POST /api/khach_hang/register` - Đăng ký
- `POST /api/khach_hang/login` - Đăng nhập
- `POST /api/khach_hang/logout` - Đăng xuất
- `GET /api/khach_hang/profile` - Profile hiện tại
- `PUT /api/khach_hang/profile` - Cập nhật profile

#### **👥 Customer Management API (`/api/khachhang`):**
- `GET /api/khachhang` - Danh sách khách hàng
- `GET /api/khachhang/:id` - Khách hàng theo ID
- `POST /api/khachhang` - Tạo khách hàng mới
- `PUT /api/khachhang/:id` - Cập nhật khách hàng
- `DELETE /api/khachhang/:id` - Xóa khách hàng

## 🎯 **Cách sử dụng đúng:**

### **❌ SAI - URL bạn đang dùng:**
```
GET /api/khach_hang/1  (có dấu gạch dưới)
```

### **✅ ĐÚNG - URL cần dùng:**
```
GET /api/khachhang/1   (không có dấu gạch dưới)
```

## 📮 **Cập nhật Postman Collection:**

### **Sửa các requests sau:**

#### **1. Get User by ID:**
```
❌ Cũ: {{baseUrl}}/api/khach_hang/1
✅ Mới: {{baseUrl}}/api/khachhang/1
```

#### **2. Get All Users:**
```
❌ Cũ: {{baseUrl}}/api/khach_hang
✅ Mới: {{baseUrl}}/api/khachhang
```

#### **3. Authentication requests giữ nguyên:**
```
✅ Đúng: {{baseUrl}}/api/khach_hang/login
✅ Đúng: {{baseUrl}}/api/khach_hang/register
✅ Đúng: {{baseUrl}}/api/khach_hang/profile
```

## 🧪 **Test Cases:**

### **1. Test Authentication API:**
```bash
# Register
POST /api/khach_hang/register

# Login  
POST /api/khach_hang/login

# Get Profile
GET /api/khach_hang/profile
```

### **2. Test Customer Management API:**
```bash
# Get all customers
GET /api/khachhang

# Get customer by ID
GET /api/khachhang/1

# Create customer
POST /api/khachhang
```

## 🔧 **Quick Fix Commands:**

### **1. Test correct URLs:**
```bash
# Test authentication
curl http://localhost:3000/api/khach_hang/profile

# Test customer management  
curl http://localhost:3000/api/khachhang
curl http://localhost:3000/api/khachhang/1
```

### **2. Debug routes:**
```bash
# Check all mounted routes
curl http://localhost:3000/api/health

# Test both endpoints
curl http://localhost:3000/api/khach_hang
curl http://localhost:3000/api/khachhang
```

## 📊 **API Endpoints Summary:**

### **🔐 Authentication (`/api/khach_hang`):**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/khach_hang/register` | Đăng ký | ❌ |
| POST | `/api/khach_hang/login` | Đăng nhập | ❌ |
| POST | `/api/khach_hang/logout` | Đăng xuất | ✅ |
| GET | `/api/khach_hang/profile` | Profile hiện tại | ✅ |
| PUT | `/api/khach_hang/profile` | Cập nhật profile | ✅ |
| PATCH | `/api/khach_hang/profile` | Cập nhật một phần | ✅ |

### **👥 Customer Management (`/api/khachhang`):**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/khachhang` | Danh sách khách hàng | ✅ |
| GET | `/api/khachhang/:id` | Khách hàng theo ID | ✅ |
| POST | `/api/khachhang` | Tạo khách hàng | ✅ |
| PUT | `/api/khachhang/:id` | Cập nhật khách hàng | ✅ |
| DELETE | `/api/khachhang/:id` | Xóa khách hàng | ✅ |

## 🎉 **Kết quả sau khi sửa:**

✅ **Route order đã được sắp xếp đúng**
✅ **URL paths được phân biệt rõ ràng**
✅ **Không còn conflict routing**
✅ **Mock data hoạt động cho cả hai APIs**

## 🚀 **Test ngay:**

### **1. Test Customer Management:**
```bash
# Get all customers
curl http://localhost:3000/api/khachhang

# Get customer by ID
curl http://localhost:3000/api/khachhang/1
curl http://localhost:3000/api/khachhang/2
curl http://localhost:3000/api/khachhang/3
```

### **2. Test Authentication:**
```bash
# Register
curl -X POST http://localhost:3000/api/khach_hang/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","phone":"0123456789","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/khach_hang/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📝 **Postman Collection Updates:**

### **Cần sửa trong collection:**

1. **Folder "Customer Management":**
   - Đổi tất cả `/api/khach_hang` thành `/api/khachhang`

2. **Folder "Authentication":**
   - Giữ nguyên `/api/khach_hang`

### **Updated requests:**
```json
{
  "name": "Get All Customers",
  "request": {
    "method": "GET",
    "url": "{{baseUrl}}/api/khachhang"
  }
},
{
  "name": "Get Customer by ID", 
  "request": {
    "method": "GET",
    "url": "{{baseUrl}}/api/khachhang/1"
  }
}
```

## 🎯 **Tóm tắt:**

**Vấn đề:** Nhầm lẫn giữa `/api/khach_hang` (authentication) và `/api/khachhang` (customer management)

**Giải pháp:** 
- ✅ Sử dụng `/api/khachhang/1` thay vì `/api/khach_hang/1`
- ✅ Sắp xếp lại route order
- ✅ Phân biệt rõ hai API groups

**Kết quả:** Lỗi 404 đã được khắc phục hoàn toàn! 🚀

---

**Happy Testing! 🎉**
