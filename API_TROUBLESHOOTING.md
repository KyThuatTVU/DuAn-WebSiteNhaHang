# 🔧 API Troubleshooting Guide - Khắc phục sự cố API món ăn

## 🚨 Vấn đề thường gặp khi test API với Postman

### 1. **Server không chạy**

#### Kiểm tra:
```bash
# Kiểm tra Node.js đã cài đặt chưa
node --version
npm --version

# Nếu chưa có, cài đặt Node.js
# Ubuntu/Debian:
sudo apt update
sudo apt install nodejs npm

# Windows: Download từ https://nodejs.org
# macOS: brew install node
```

#### Khởi động server:
```bash
cd backend
npm install
npm run dev
# hoặc
node server.js
```

#### Kiểm tra server đang chạy:
```bash
curl http://localhost:3000/api/health
```

### 2. **API Foods không hoạt động**

#### Các endpoint cần kiểm tra:

**✅ GET /api/foods - Lấy danh sách món ăn**
```bash
curl -X GET "http://localhost:3000/api/foods" \
  -H "Content-Type: application/json"
```

**✅ GET /api/foods/:id - Lấy món ăn theo ID**
```bash
curl -X GET "http://localhost:3000/api/foods/1" \
  -H "Content-Type: application/json"
```

**✅ POST /api/foods - Tạo món ăn mới**
```bash
curl -X POST "http://localhost:3000/api/foods" \
  -H "Content-Type: multipart/form-data" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "id_loai=2" \
  -F "ten_mon=Test Food" \
  -F "mo_ta=Test Description" \
  -F "gia=50000" \
  -F "so_luong=10"
```

### 3. **Lỗi Database Connection**

#### Kiểm tra MySQL:
```bash
# Kiểm tra MySQL service
sudo systemctl status mysql
# hoặc
sudo service mysql status

# Khởi động MySQL nếu cần
sudo systemctl start mysql
```

#### Kiểm tra database:
```sql
-- Kết nối MySQL
mysql -u root -p

-- Kiểm tra database
SHOW DATABASES;
USE QuanLyNhaHang;
SHOW TABLES;

-- Kiểm tra dữ liệu món ăn
SELECT * FROM mon_an LIMIT 5;
SELECT * FROM loai_mon;
```

### 4. **Cấu hình Environment Variables**

#### Tạo file .env trong thư mục backend:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=QuanLyNhaHang
DB_PORT=3306

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# AI (Optional)
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key
```

### 5. **Postman Configuration**

#### Environment Setup:
```json
{
  "baseUrl": "http://localhost:3000",
  "token": "",
  "refreshToken": "",
  "userId": ""
}
```

#### Headers cần thiết:
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

#### Pre-request Script để auto-login:
```javascript
// Auto login if no token
if (!pm.collectionVariables.get("token")) {
    pm.sendRequest({
        url: pm.collectionVariables.get("baseUrl") + "/api/khach_hang/login",
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: "test@example.com",
                password: "password123"
            })
        }
    }, function (err, response) {
        if (response.code === 200) {
            const data = response.json().data;
            pm.collectionVariables.set("token", data.token);
            pm.collectionVariables.set("userId", data.user.id);
        }
    });
}
```

### 6. **Kiểm tra từng bước**

#### Bước 1: Health Check
```bash
curl http://localhost:3000/api/health
```
**Expected Response:**
```json
{
  "success": true,
  "message": "API is running successfully",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

#### Bước 2: Test Categories (không cần auth)
```bash
curl http://localhost:3000/api/categories
```

#### Bước 3: Test Foods (không cần auth cho GET)
```bash
curl http://localhost:3000/api/foods
```

#### Bước 4: Authentication
```bash
curl -X POST http://localhost:3000/api/khach_hang/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "password": "password123"
  }'
```

#### Bước 5: Test với Authentication
```bash
# Lấy token từ response trên, sau đó:
curl -X POST http://localhost:3000/api/foods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id_loai": 2,
    "ten_mon": "Test Food",
    "mo_ta": "Test Description",
    "gia": 50000,
    "so_luong": 10
  }'
```

### 7. **Debug với Console Logs**

#### Thêm logging vào controller:
```javascript
// Trong FoodController.js
static getAllFoods = catchAsync(async (req, res) => {
  console.log('🔍 GET /api/foods called');
  console.log('Query params:', req.query);
  
  // ... rest of code
  
  console.log('✅ Response:', response);
  res.json(response);
});
```

### 8. **Common Error Solutions**

#### CORS Error:
```javascript
// Trong app.js, thêm:
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### 404 Not Found:
- Kiểm tra URL: `http://localhost:3000/api/foods` (không phải `/foods`)
- Kiểm tra routes được mount đúng trong `routes/index.js`

#### 500 Internal Server Error:
- Kiểm tra database connection
- Kiểm tra console logs
- Kiểm tra file .env

#### Authentication Error:
- Đảm bảo đã login và có token
- Kiểm tra token format: `Bearer <token>`
- Kiểm tra token chưa expire

### 9. **Test Script cho Postman**

#### Collection Pre-request Script:
```javascript
// Set base URL
pm.collectionVariables.set("baseUrl", "http://localhost:3000");

// Auto-refresh token if needed
const token = pm.collectionVariables.get("token");
if (token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now + 300) {
            console.log('Token expiring soon, refreshing...');
            // Refresh logic here
        }
    } catch (e) {
        console.log('Invalid token format');
    }
}
```

#### Test Script:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});

pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

### 10. **Quick Fix Commands**

```bash
# Restart server
pkill -f "node server.js"
cd backend && node server.js

# Reset database
mysql -u root -p < ../QuanLyDBWeb/CNPM_QuanLyNhaHang.sql

# Clear npm cache
npm cache clean --force
rm -rf node_modules
npm install

# Check ports
netstat -tulpn | grep :3000
lsof -i :3000
```

### 📞 **Nếu vẫn không được:**

1. **Kiểm tra logs chi tiết:**
   - Console logs trong terminal
   - Network tab trong browser
   - Postman console

2. **Test với curl trước:**
   - Đảm bảo API hoạt động với curl
   - Sau đó mới test với Postman

3. **Kiểm tra Postman settings:**
   - SSL certificate verification: OFF
   - Proxy settings
   - Headers tự động

4. **Contact support:**
   - Gửi screenshot lỗi
   - Gửi request/response details
   - Gửi console logs

---

## 🎯 **Quick Test Checklist:**

- [ ] Node.js và npm đã cài đặt
- [ ] MySQL service đang chạy
- [ ] Database QuanLyNhaHang đã tạo
- [ ] File .env đã cấu hình đúng
- [ ] Server chạy trên port 3000
- [ ] Health check API hoạt động
- [ ] Postman environment đã setup
- [ ] Headers và authentication đúng

**Happy Testing! 🚀**
