# 🔧 Step-by-Step Fix Guide - Khắc phục API Foods không chạy được

## 🎯 Mục tiêu
Khắc phục vấn đề API Foods không chạy được trong Postman và đảm bảo tất cả endpoints hoạt động bình thường.

## 📋 Checklist trước khi bắt đầu

### ✅ **Bước 1: Kiểm tra môi trường**
```bash
# Kiểm tra Node.js
node --version
# Kết quả mong đợi: v18.x.x hoặc cao hơn

# Kiểm tra npm
npm --version
# Kết quả mong đợi: 8.x.x hoặc cao hơn

# Kiểm tra MySQL
mysql --version
# Kết quả mong đợi: mysql Ver 8.x.x
```

### ✅ **Bước 2: Cài đặt dependencies**
```bash
cd backend
npm install

# Kiểm tra các package quan trọng
npm list express mysql2 cors helmet
```

### ✅ **Bước 3: Cấu hình Database**
```bash
# Khởi động MySQL service
sudo systemctl start mysql
# hoặc trên Windows: net start mysql

# Kết nối MySQL và tạo database
mysql -u root -p
```

```sql
-- Tạo database nếu chưa có
CREATE DATABASE IF NOT EXISTS QuanLyNhaHang 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE QuanLyNhaHang;

-- Import dữ liệu
SOURCE ../QuanLyDBWeb/CNPM_QuanLyNhaHang.sql;

-- Kiểm tra tables
SHOW TABLES;

-- Kiểm tra dữ liệu món ăn
SELECT COUNT(*) FROM mon_an;
SELECT * FROM mon_an LIMIT 3;

-- Kiểm tra categories
SELECT COUNT(*) FROM loai_mon;
SELECT * FROM loai_mon;
```

### ✅ **Bước 4: Cấu hình Environment**
Tạo file `.env` trong thư mục `backend`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=QuanLyNhaHang
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# AI Configuration (Optional)
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./images
```

### ✅ **Bước 5: Test kết nối Database**
Tạo file `test-db.js` trong thư mục `backend`:

```javascript
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Database connected successfully');

    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM mon_an');
    console.log(`📊 Found ${rows[0].count} food items`);

    const [categories] = await connection.execute('SELECT COUNT(*) as count FROM loai_mon');
    console.log(`📂 Found ${categories[0].count} categories`);

    await connection.end();
    console.log('✅ Database test completed');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

testDatabase();
```

Chạy test:
```bash
node test-db.js
```

### ✅ **Bước 6: Khởi động Server**
```bash
# Trong thư mục backend
node server.js

# Hoặc với nodemon (nếu có)
npm run dev
```

Kết quả mong đợi:
```
🚀 Server running on port 3000
📱 Environment: development
🌐 API URL: http://localhost:3000/api
📚 Documentation: http://localhost:3000/api/docs
📖 Swagger UI: http://localhost:3000/api-docs
❤️  Health Check: http://localhost:3000/api/health
```

### ✅ **Bước 7: Test API với script**
```bash
# Chạy quick check script
node quick-api-check.js

# Hoặc với custom URL
node quick-api-check.js --url http://localhost:3000
```

### ✅ **Bước 8: Test với Browser**
Mở browser và truy cập:

1. **Health Check**: http://localhost:3000/api/health
2. **API Test**: http://localhost:3000/api/test
3. **Foods API**: http://localhost:3000/api/foods
4. **Categories**: http://localhost:3000/api/categories
5. **Documentation**: http://localhost:3000/api/docs

### ✅ **Bước 9: Test với HTML Tool**
Mở file `test-api-foods.html` trong browser và test các endpoints.

### ✅ **Bước 10: Cấu hình Postman**

#### Import Collection:
1. Mở Postman
2. Click **Import**
3. Chọn file `Restaurant_API_Postman_Collection.json`
4. Import `Restaurant_API_Environment.json`

#### Cấu hình Environment:
```json
{
  "baseUrl": "http://localhost:3000",
  "token": "",
  "refreshToken": "",
  "userId": ""
}
```

#### Test từng bước:
1. **Test Server Connection** - Chạy request đầu tiên
2. **Health Check** - Kiểm tra server status
3. **Get All Foods** - Test API foods
4. **Register User** - Tạo tài khoản test
5. **Login** - Lấy token
6. **Create Food** - Test với authentication

## 🚨 Troubleshooting các lỗi thường gặp

### ❌ **Error: ECONNREFUSED**
```bash
# Kiểm tra server có chạy không
netstat -tulpn | grep :3000
lsof -i :3000

# Khởi động lại server
pkill -f "node server.js"
node server.js
```

### ❌ **Error: ER_ACCESS_DENIED_ERROR**
```bash
# Kiểm tra MySQL credentials
mysql -u root -p

# Reset MySQL password nếu cần
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
```

### ❌ **Error: Cannot find module**
```bash
# Cài đặt lại dependencies
rm -rf node_modules package-lock.json
npm install
```

### ❌ **CORS Error trong Postman**
Thêm vào `app.js`:
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### ❌ **404 Not Found**
Kiểm tra routes trong `routes/index.js`:
```javascript
router.use('/foods', foodRoutes);
```

### ❌ **500 Internal Server Error**
Kiểm tra logs trong console và thêm error handling:
```javascript
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});
```

## 🎯 **Verification Steps**

### ✅ **Final Checklist:**
- [ ] Server chạy trên port 3000
- [ ] Database connection thành công
- [ ] Health check API trả về 200
- [ ] Foods API trả về danh sách món ăn
- [ ] Categories API hoạt động
- [ ] Postman collection import thành công
- [ ] Environment variables được set đúng
- [ ] Authentication flow hoạt động
- [ ] CRUD operations cho foods hoạt động

### 🎉 **Success Indicators:**
```json
// GET /api/health
{
  "success": true,
  "message": "API is running successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// GET /api/foods
{
  "success": true,
  "data": [...],
  "total": 30,
  "pagination": {...}
}
```

## 📞 **Nếu vẫn gặp vấn đề:**

1. **Kiểm tra logs chi tiết** trong console
2. **Chạy từng endpoint riêng lẻ** với curl
3. **Kiểm tra network tab** trong browser
4. **Verify database data** trực tiếp
5. **Test với simple HTTP client** trước khi dùng Postman

**Good luck! 🚀**
