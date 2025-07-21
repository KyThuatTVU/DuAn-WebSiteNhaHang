# 🔧 Fix Datban API Error - Khắc phục lỗi 404 DELETE /api/datban

## 🚨 **Lỗi gặp phải:**

```json
{
    "success": false,
    "status": "fail",
    "error": "Không tìm thấy /api/datban?page=1&limit=20&status=cho_xac_nhan&date=2024-01-15",
    "code": "NOT_FOUND",
    "method": "DELETE"
}
```

## 🔍 **Nguyên nhân:**

Bạn đang gửi **DELETE request** với **query parameters** thay vì DELETE một reservation cụ thể theo ID:

❌ **SAI:** `DELETE /api/datban?page=1&limit=20&status=cho_xac_nhan&date=2024-01-15`
✅ **ĐÚNG:** `DELETE /api/datban/1` (xóa reservation có ID = 1)

## ✅ **Đã khắc phục:**

### **1. Thêm các endpoints mới vào `/api/datban`:**

#### **DELETE by ID:**
```http
DELETE /api/datban/:id
Authorization: Bearer <token>
```

#### **PATCH partial update:**
```http
PATCH /api/datban/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "so_luong_khach": 6,
  "ghi_chu": "Cập nhật số lượng khách"
}
```

#### **DELETE multiple:**
```http
DELETE /api/datban/bulk
Content-Type: application/json
Authorization: Bearer <token>

{
  "ids": [1, 2, 3]
}
```

#### **Check availability:**
```http
GET /api/datban/availability?date=2024-01-15&time=19:00&guests=4
```

#### **HEAD metadata:**
```http
HEAD /api/datban
```

#### **OPTIONS methods:**
```http
OPTIONS /api/datban
```

### **2. Cập nhật Postman Collection:**

Đã thêm các requests mới:
- ✅ DELETE Reservation by ID
- ✅ PATCH Update Reservation Partially  
- ✅ DELETE Multiple Reservations
- ✅ GET Table Availability
- ✅ HEAD Reservations Metadata
- ✅ OPTIONS Reservations Methods

## 🎯 **Cách sử dụng đúng:**

### **Scenario 1: Xóa một reservation cụ thể**
```bash
# Lấy ID của reservation trước
GET /api/datban

# Sau đó xóa theo ID
DELETE /api/datban/1
```

### **Scenario 2: Xóa nhiều reservations**
```bash
DELETE /api/datban/bulk
{
  "ids": [1, 2, 3]
}
```

### **Scenario 3: Cập nhật một phần reservation**
```bash
PATCH /api/datban/1
{
  "so_luong_khach": 6,
  "ghi_chu": "Thay đổi số lượng khách"
}
```

### **Scenario 4: Kiểm tra bàn trống**
```bash
GET /api/datban/availability?date=2024-01-15&time=19:00&guests=4
```

## 📮 **Postman Usage:**

### **1. Import collection mới:**
- File: `Restaurant_API_Postman_Collection.json`
- Environment: `Restaurant_API_Environment.json`

### **2. Test sequence:**
1. **GET All Reservations** - Lấy danh sách và ID
2. **DELETE Reservation by ID** - Xóa theo ID cụ thể
3. **PATCH Update Partially** - Cập nhật một phần
4. **GET Table Availability** - Kiểm tra bàn trống
5. **DELETE Multiple** - Xóa nhiều cùng lúc

### **3. Correct request examples:**

#### **✅ Xóa reservation theo ID:**
```
Method: DELETE
URL: {{baseUrl}}/api/datban/1
Headers: Authorization: Bearer {{token}}
```

#### **✅ Cập nhật reservation:**
```
Method: PATCH
URL: {{baseUrl}}/api/datban/1
Headers: 
  - Authorization: Bearer {{token}}
  - Content-Type: application/json
Body:
{
  "so_luong_khach": 6,
  "ghi_chu": "Cập nhật thông tin"
}
```

#### **✅ Kiểm tra bàn trống:**
```
Method: GET
URL: {{baseUrl}}/api/datban/availability?date=2024-01-15&time=19:00&guests=4
```

## 🔧 **Troubleshooting:**

### **Nếu vẫn gặp lỗi 404:**

1. **Kiểm tra server đang chạy:**
```bash
curl http://localhost:3000/api/health
```

2. **Kiểm tra routes được mount:**
```bash
curl http://localhost:3000/api/datban
```

3. **Kiểm tra method đúng:**
```bash
# Đúng
curl -X DELETE http://localhost:3000/api/datban/1

# Sai
curl -X DELETE "http://localhost:3000/api/datban?page=1&limit=20"
```

### **Nếu gặp lỗi 401 Unauthorized:**
- Đảm bảo có token trong header
- Kiểm tra token chưa expire
- Login lại để lấy token mới

### **Nếu gặp lỗi 400 Bad Request:**
- Kiểm tra ID là số hợp lệ
- Kiểm tra request body format
- Kiểm tra required fields

## 📊 **API Endpoints Summary:**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/datban` | Lấy danh sách đặt bàn | ❌ |
| GET | `/api/datban/:id` | Lấy đặt bàn theo ID | ❌ |
| GET | `/api/datban/availability` | Kiểm tra bàn trống | ❌ |
| POST | `/api/datban` | Tạo đặt bàn mới | ❌ |
| PUT | `/api/datban/:id` | Cập nhật toàn bộ | ✅ |
| PATCH | `/api/datban/:id` | Cập nhật một phần | ✅ |
| PATCH | `/api/datban/:id/status` | Cập nhật trạng thái | ✅ |
| DELETE | `/api/datban/:id` | Xóa đặt bàn | ✅ |
| DELETE | `/api/datban/bulk` | Xóa nhiều đặt bàn | ✅ |
| HEAD | `/api/datban` | Metadata | ❌ |
| OPTIONS | `/api/datban` | Methods hỗ trợ | ❌ |

## 🎉 **Kết quả:**

✅ **Đã sửa lỗi 404** cho DELETE requests
✅ **Thêm 6 endpoints mới** cho reservations
✅ **Cập nhật Postman collection** với requests đúng
✅ **Hỗ trợ đầy đủ 7 HTTP methods**
✅ **Error handling** và validation hoàn chỉnh

**Bây giờ bạn có thể test tất cả các operations cho reservations API một cách chính xác!** 🚀

## 🔗 **Quick Test:**

```bash
# 1. Test server
curl http://localhost:3000/api/health

# 2. Get reservations
curl http://localhost:3000/api/datban

# 3. Delete by ID (replace 1 with actual ID)
curl -X DELETE http://localhost:3000/api/datban/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Check availability
curl "http://localhost:3000/api/datban/availability?date=2024-01-15&time=19:00&guests=4"
```

**Happy Testing! 🎯**
