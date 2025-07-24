# 📖 Hướng Dẫn Sử Dụng Postman Collection - Restaurant API

## 🎯 **TỔNG QUAN**

Hướng dẫn chi tiết cách sử dụng Postman Collection cho Restaurant Management API với 86+ endpoints và đầy đủ tính năng.

## 📥 **BƯỚC 1: IMPORT COLLECTION**

### **1.1 Import Collection:**
1. Mở **Postman**
2. Click **Import** (góc trái trên)
3. Chọn **Upload Files**
4. Chọn file `Restaurant_API_Updated_Collection.json`
5. Click **Import**

### **1.2 Import Environment:**
1. Click **Import** tiếp
2. Chọn file `Restaurant_API_Environment.json`
3. Click **Import**
4. Chọn environment **"🍽️ Restaurant API Environment - Complete v3.0"**

## 🚀 **BƯỚC 2: KIỂM TRA KẾT NỐI**

### **2.1 Đảm bảo server đang chạy:**
```bash
cd backend
node server.js
# Hoặc
npm run dev
```

### **2.2 Test kết nối:**
1. Mở folder **"🏥 System Health & Monitoring"**
2. Chạy **"🔍 API Health Check"**
3. Kiểm tra response:
```json
{
  "status": "OK",
  "services": {
    "database": "connected"
  }
}
```

## 🔐 **BƯỚC 3: AUTHENTICATION**

### **3.1 Đăng ký tài khoản mới:**
1. Mở folder **"🔐 Authentication"**
2. Chạy **"Register User"**
3. Kiểm tra token được lưu tự động trong variables

### **3.2 Hoặc đăng nhập với tài khoản có sẵn:**
1. Chạy **"Login User"**
2. Token sẽ được lưu tự động

### **3.3 Kiểm tra profile:**
1. Chạy **"Get Profile"**
2. Xác nhận authentication hoạt động

## 🍜 **BƯỚC 4: TEST FOODS MANAGEMENT**

### **4.1 Lấy danh sách món ăn:**
```http
GET /api/foods?limit=10&search=phở&category=2
```

### **4.2 Tạo món ăn mới:**
```http
POST /api/foods
Content-Type: multipart/form-data

{
  "id_loai": 2,
  "ten_mon": "Bún Bò Huế",
  "mo_ta": "Bún bò Huế cay nồng",
  "gia": 50000,
  "so_luong": 30,
  "hinh_anh": <file>
}
```

### **4.3 Test tất cả HTTP methods:**
- **GET** - Lấy danh sách và chi tiết
- **POST** - Tạo mới
- **PUT** - Cập nhật toàn bộ
- **PATCH** - Cập nhật một phần
- **DELETE** - Xóa
- **HEAD** - Lấy metadata
- **OPTIONS** - Kiểm tra methods hỗ trợ

## 📂 **BƯỚC 5: TEST CATEGORIES**

### **5.1 Lấy danh sách danh mục:**
```http
GET /api/categories
```

### **5.2 Tạo danh mục mới:**
```json
{
  "ten_loai": "Món Tráng Miệng",
  "mo_ta": "Các món ăn ngọt kết thúc bữa ăn"
}
```

### **5.3 Lấy món ăn theo danh mục:**
```http
GET /api/categories/1/foods?limit=10
```

## 🤖 **BƯỚC 6: TEST AI CHAT**

### **6.1 Gửi tin nhắn chat:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Tôi muốn đặt món phở bò"
    }
  ],
  "options": {
    "temperature": 0.7,
    "maxTokens": 1000
  }
}
```

### **6.2 Tạo mô tả món ăn bằng AI:**
```json
{
  "foodName": "Bún Bò Huế",
  "ingredients": ["bún", "thịt bò", "chả cua", "ớt"],
  "options": {
    "style": "traditional",
    "length": "medium"
  }
}
```

## 📅 **BƯỚC 7: TEST RESERVATIONS**

### **7.1 Tạo đặt bàn:**
```json
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

### **7.2 Lấy danh sách đặt bàn với filter:**
```http
GET /api/datban?status=cho_xac_nhan&date=2024-01-15&phone=0123
```

### **7.3 Cập nhật trạng thái:**
```json
{
  "trang_thai": "da_xac_nhan"
}
```

## 🧾 **BƯỚC 8: TEST INVOICE MANAGEMENT (MỚI)**

### **8.1 Tạo hóa đơn:**
```json
{
  "id_khachhang": 1,
  "id_datban": 1,
  "chi_tiet_mon": [
    {
      "id_mon": 1,
      "so_luong": 2,
      "gia": 45000,
      "ghi_chu": "Ít cay"
    }
  ],
  "giam_gia": 10000,
  "phuong_thuc_thanh_toan": "tien_mat"
}
```

### **8.2 Cập nhật thanh toán:**
```json
{
  "trang_thai": "da_thanh_toan",
  "phuong_thuc_thanh_toan": "the_ngan_hang",
  "so_tien_thanh_toan": 90000
}
```

### **8.3 Lấy thống kê:**
```http
GET /api/hoadon/statistics?period=month&year=2024&month=1
```

### **8.4 In hóa đơn:**
```http
GET /api/hoadon/1/print?format=pdf
```

## 👥 **BƯỚC 9: TEST CUSTOMER MANAGEMENT**

### **9.1 Lấy danh sách khách hàng:**
```http
GET /api/khachhang?limit=20&search=nguyen
```

### **9.2 Lấy chi tiết khách hàng:**
```http
GET /api/khachhang/1
```

## 🔧 **ADVANCED FEATURES**

### **10.1 Bulk Operations:**
```json
// Tạo nhiều món ăn cùng lúc
{
  "foods": [
    {
      "id_loai": 2,
      "ten_mon": "Bún Bò Huế",
      "gia": 50000
    },
    {
      "id_loai": 2,
      "ten_mon": "Bún Riêu",
      "gia": 45000
    }
  ]
}
```

### **10.2 Advanced Filtering:**
```http
GET /api/foods?category=2&minPrice=20000&maxPrice=100000&available=true&sort=gia&order=asc
```

### **10.3 File Upload:**
- Sử dụng **form-data** cho upload hình ảnh
- Chọn file trong Postman interface
- Kiểm tra validation (JPG, PNG, max 5MB)

## 📊 **MONITORING & DEBUGGING**

### **11.1 Sử dụng Console:**
- Mở **Postman Console** (View → Show Postman Console)
- Xem logs từ test scripts
- Debug requests và responses

### **11.2 Test Scripts:**
```javascript
// Tự động lưu token
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set('token', response.data.token);
}

// Validate response
pm.test('Response is successful', function () {
    pm.response.to.have.status(200);
    pm.expect(pm.response.json().success).to.be.true;
});
```

### **11.3 Environment Variables:**
- Kiểm tra variables được cập nhật tự động
- Sử dụng `{{variableName}}` trong requests
- Debug với console.log trong scripts

## ❗ **TROUBLESHOOTING**

### **Lỗi thường gặp:**

1. **Server không chạy:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Token hết hạn:**
   - Chạy lại "Login User"
   - Hoặc sử dụng "Refresh Token"

3. **Database không kết nối:**
   - Kiểm tra MySQL đang chạy
   - Kiểm tra config database

4. **404 Not Found:**
   - Kiểm tra URL đúng format
   - Đảm bảo server có route đó

5. **401 Unauthorized:**
   - Kiểm tra token trong headers
   - Đăng nhập lại nếu cần

## 🎯 **BEST PRACTICES**

### **12.1 Thứ tự test:**
1. System Health → Authentication → Other modules
2. Luôn test GET trước POST/PUT/DELETE
3. Sử dụng variables thay vì hardcode IDs

### **12.2 Organization:**
- Sử dụng folders để nhóm requests
- Đặt tên requests rõ ràng
- Thêm descriptions cho mỗi request

### **12.3 Testing:**
- Viết test scripts cho validation
- Sử dụng assertions để kiểm tra responses
- Test cả success và error cases

---

## 🎉 **KẾT LUẬN**

Collection này cung cấp **86 endpoints** với đầy đủ tính năng để test toàn bộ Restaurant Management API. Hãy làm theo hướng dẫn từng bước để có trải nghiệm tốt nhất!

**Happy Testing! 🚀**
