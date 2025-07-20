# 📮 Postman Collection - Website Nhà Hàng API

Bộ collection Postman hoàn chỉnh để test API của dự án Website Nhà Hàng.

## 📁 Files trong thư mục

- `Website-NhaHang-API.postman_collection.json` - Collection chính (Health, Categories, Foods)
- `Website-NhaHang-API-Part2.postman_collection.json` - Authentication & Booking
- `Website-NhaHang-API-Part3.postman_collection.json` - AI Chat & Testing
- `Restaurant-Environment.postman_environment.json` - Environment variables
- `README.md` - Hướng dẫn sử dụng

## 🚀 Cách import vào Postman

### 1. Import Collections
1. Mở Postman
2. Click **Import** button
3. Chọn **Upload Files**
4. Import tất cả 3 file `.postman_collection.json`

### 2. Import Environment
1. Click **Import** button
2. Import file `Restaurant-Environment.postman_environment.json`
3. Chọn environment "Restaurant API Environment" ở góc phải trên

## 🔧 Cấu hình Environment

### Variables quan trọng:
- `baseUrl`: http://localhost:3000/api (API base URL)
- `serverUrl`: http://localhost:3000 (Server URL)
- `authToken`: JWT token (tự động set sau khi login)
- `testEmail`: test@restaurant.com
- `testPhone`: 0987654321

### Thay đổi URL cho môi trường khác:
- **Local**: http://localhost:3000/api
- **Docker**: http://localhost:3000/api
- **Production**: https://your-domain.com/api

## 📋 Cấu trúc Collections

### 🏥 Collection 1: Health & Core APIs
- **Health Check**: Kiểm tra trạng thái server
- **Categories**: CRUD operations cho danh mục món ăn
- **Foods**: CRUD operations cho món ăn (có upload ảnh)

### 🔐 Collection 2: Authentication & Booking
- **Authentication**: Register, Login, Profile
- **Customer Management**: Quản lý khách hàng
- **Booking Management**: Đặt bàn (CRUD + status update)

### 🤖 Collection 3: AI Chat & Advanced
- **AI Chat**: Tích hợp Gemini AI và Groq AI
- **File Upload**: Upload và serve images
- **Analytics**: Reports và thống kê
- **Testing Scenarios**: Test flows hoàn chỉnh

## 🎯 Cách sử dụng

### 1. Khởi động server
```bash
# Chạy với Docker
docker-compose up -d

# Hoặc chạy local
cd backend && npm start
```

### 2. Test cơ bản
1. Chạy **Health Check** để đảm bảo server hoạt động
2. Test **Get All Categories** và **Get All Foods**
3. Test **Create Reservation** để đặt bàn

### 3. Test Authentication
1. Chạy **Register Customer** để tạo tài khoản
2. Chạy **Login Customer** (token sẽ tự động lưu)
3. Chạy **Get User Profile** với token

### 4. Test AI Chat
1. Chạy **Chat Health Check**
2. Test **Send Chat Message** với câu hỏi tiếng Việt
3. Test **Chat with Groq AI** (nếu có API key)

## 🔑 Authentication

### JWT Token
- Token tự động lưu sau khi login thành công
- Sử dụng trong header: `Authorization: Bearer {{authToken}}`
- Token có thời hạn 24h (có thể thay đổi)

### API Keys (Optional)
Để sử dụng AI Chat, cần set environment variables:
- `GEMINI_API_KEY`: Google Gemini API key
- `GROQ_API_KEY`: Groq API key

## 📊 Test Scenarios

### Complete Booking Flow
1. **Create Reservation** → Tạo đặt bàn mới
2. **Confirm Reservation** → Xác nhận đặt bàn
3. **Get Confirmed Reservation** → Lấy thông tin đã xác nhận

### Food Management Flow
1. **Create Category** → Tạo danh mục
2. **Create Food** → Tạo món ăn (với ảnh)
3. **Update Food Stock** → Cập nhật số lượng
4. **Get Foods by Category** → Lấy món theo danh mục

## 🧪 Testing Features

### Auto-generated Data
- Timestamps tự động
- Future dates cho booking
- Random IDs cho testing

### Response Validation
- Response time < 5000ms
- Success field validation
- Auto-extract tokens và IDs

### Error Handling
- Test với data không hợp lệ
- Test authentication failures
- Test missing parameters

## 📝 Sample Requests

### Create Food with Image
```json
{
  "id_loai": 1,
  "ten_mon": "Phở Bò Tái",
  "mo_ta": "Phở bò truyền thống",
  "gia": 50000,
  "so_luong": 100
}
```

### Create Reservation
```json
{
  "ten_khach": "Nguyễn Văn A",
  "sdt": "0987654321",
  "email": "test@example.com",
  "ngay": "2024-12-25",
  "gio": "19:00:00",
  "so_luong_khach": 4,
  "ghi_chu": "Bàn gần cửa sổ"
}
```

### AI Chat Message
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Tôi muốn đặt bàn cho 4 người"
    }
  ],
  "options": {
    "useGroq": false,
    "temperature": 0.7
  }
}
```

## 🔧 Troubleshooting

### Server không phản hồi
- Kiểm tra server đang chạy: `docker-compose ps`
- Kiểm tra logs: `docker-compose logs -f backend`
- Thử health check endpoint

### Authentication lỗi
- Kiểm tra token trong environment
- Login lại để refresh token
- Kiểm tra token expiry

### Database lỗi
- Kiểm tra database connection
- Restart database: `docker-compose restart database`
- Kiểm tra logs: `docker-compose logs database`

## 📚 API Documentation

Truy cập Swagger UI tại: http://localhost:3000/api-docs

## 🆘 Support

Nếu gặp vấn đề:
1. Kiểm tra server logs
2. Verify environment variables
3. Test với curl commands
4. Check network connectivity

Happy Testing! 🚀
