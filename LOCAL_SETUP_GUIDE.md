# 🍽️ Restaurant Management System - Local Setup (Không Docker)

## 🚀 **Hướng Dẫn Chạy Local**

### **📋 Yêu Cầu Hệ Thống**

#### **1. Node.js & npm**
```bash
# Kiểm tra version
node --version  # >= 16.0.0
npm --version   # >= 8.0.0

# Cài đặt Node.js (nếu chưa có)
# Windows: Tải từ https://nodejs.org/
# macOS: brew install node
# Ubuntu: sudo apt install nodejs npm
```

#### **2. MySQL Database**
```bash
# Kiểm tra MySQL
mysql --version

# Cài đặt MySQL (nếu chưa có)
# Windows: Tải MySQL Installer
# macOS: brew install mysql
# Ubuntu: sudo apt install mysql-server
```

#### **3. Git (Optional)**
```bash
git --version
```

### **🛠️ Cài Đặt Từng Bước**

#### **Bước 1: Chuẩn Bị Database**

```bash
# 1. Khởi động MySQL service
# Windows: Mở MySQL Workbench hoặc Command Line
# macOS: brew services start mysql
# Ubuntu: sudo systemctl start mysql

# 2. Đăng nhập MySQL
mysql -u root -p

# 3. Tạo database và user
CREATE DATABASE QuanLyNhaHang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'restaurant_user'@'localhost' IDENTIFIED BY 'restaurant_pass';
GRANT ALL PRIVILEGES ON QuanLyNhaHang.* TO 'restaurant_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 4. Import database schema
mysql -u restaurant_user -p QuanLyNhaHang < QuanLyDBWeb/CNPM_QuanLyNhaHang.sql
```

#### **Bước 2: Cấu Hình Backend**

```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env
cp .env.example .env
# Hoặc tạo file .env mới với nội dung bên dưới
```

#### **Bước 3: Cấu Hình Environment (.env)**

Tạo file `backend/.env` với nội dung:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=restaurant_user
DB_PASSWORD=restaurant_pass
DB_NAME=QuanLyNhaHang

# Server Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-2024
JWT_REFRESH_SECRET=your-refresh-secret-key-2024
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# AI Configuration (Optional)
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./images

# CORS
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

#### **Bước 4: Khởi Động Backend**

```bash
# Trong thư mục backend/
npm start
# Hoặc development mode với auto-reload
npm run dev
```

#### **Bước 5: Khởi Động Frontend**

```bash
# Mở terminal mới, quay về thư mục gốc
cd ../

# Option 1: Sử dụng Live Server (VS Code Extension)
# - Cài đặt Live Server extension trong VS Code
# - Right-click vào frontend/Index-new.html
# - Chọn "Open with Live Server"

# Option 2: Sử dụng Python HTTP Server
cd frontend
python -m http.server 8080
# Hoặc Python 2
python -m SimpleHTTPServer 8080

# Option 3: Sử dụng Node.js http-server
npm install -g http-server
cd frontend
http-server -p 8080

# Option 4: Sử dụng PHP (nếu có)
cd frontend
php -S localhost:8080
```

### **🌐 Truy Cập Ứng Dụng**

Sau khi khởi động thành công:

- **🏠 Frontend:** http://localhost:8080
- **🔧 Backend API:** http://localhost:3000/api
- **📚 API Documentation:** http://localhost:3000/api/docs
- **🏥 Health Check:** http://localhost:3000/api/health

### **📝 Scripts Hữu Ích**

#### **Backend Scripts:**
```bash
cd backend

# Khởi động production
npm start

# Khởi động development (auto-reload)
npm run dev

# Test API health
curl http://localhost:3000/api/health
```

#### **Database Scripts:**
```bash
# Backup database
mysqldump -u restaurant_user -p QuanLyNhaHang > backup.sql

# Restore database
mysql -u restaurant_user -p QuanLyNhaHang < backup.sql

# Connect to database
mysql -u restaurant_user -p QuanLyNhaHang
```

### **🔧 Troubleshooting**

#### **1. Lỗi Database Connection**
```bash
# Kiểm tra MySQL đang chạy
# Windows: services.msc -> MySQL
# macOS: brew services list | grep mysql
# Ubuntu: sudo systemctl status mysql

# Kiểm tra user và password
mysql -u restaurant_user -p

# Reset password nếu cần
ALTER USER 'restaurant_user'@'localhost' IDENTIFIED BY 'new_password';
```

#### **2. Lỗi Port đã sử dụng**
```bash
# Kiểm tra port 3000
netstat -an | grep 3000
# Hoặc
lsof -i :3000

# Kill process
kill -9 <PID>

# Hoặc đổi port trong .env
PORT=3001
```

#### **3. Lỗi npm install**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules và reinstall
rm -rf node_modules package-lock.json
npm install

# Hoặc sử dụng yarn
npm install -g yarn
yarn install
```

#### **4. Lỗi CORS**
```bash
# Trong file .env, đảm bảo:
CORS_ORIGIN=*

# Hoặc cụ thể hơn:
CORS_ORIGIN=http://localhost:8080
```

### **📊 Kiểm Tra Hoạt Động**

#### **Test Backend API:**
```bash
# Health check
curl http://localhost:3000/api/health

# Get foods
curl http://localhost:3000/api/foods

# Get categories
curl http://localhost:3000/api/categories

# Test with browser
# Mở http://localhost:3000/api/docs
```

#### **Test Frontend:**
```bash
# Mở browser và truy cập:
http://localhost:8080

# Kiểm tra console để xem có lỗi không
# F12 -> Console tab
```

### **🚀 Quick Start Commands**

```bash
# 1. Setup Database
mysql -u root -p < QuanLyDBWeb/CNPM_QuanLyNhaHang.sql

# 2. Setup Backend
cd backend
npm install
# Tạo file .env với config ở trên
npm run dev

# 3. Setup Frontend (terminal mới)
cd frontend
python -m http.server 8080

# 4. Truy cập
# Frontend: http://localhost:8080
# API: http://localhost:3000/api
```

### **📁 Cấu Trúc Thư Mục**

```
restaurant-management/
├── backend/                 # Node.js API Server
│   ├── config/             # Database, Swagger config
│   ├── controllers/        # API Controllers
│   ├── middleware/         # Auth, validation, etc.
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Helper functions
│   ├── images/            # Uploaded images
│   ├── logs/              # Application logs
│   ├── .env               # Environment variables
│   ├── package.json       # Dependencies
│   └── server.js          # Entry point
├── frontend/               # Static HTML/CSS/JS
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   ├── img/               # Images
│   ├── components/        # Reusable components
│   └── Index-new.html     # Main page
└── QuanLyDBWeb/           # Database schema
    └── CNPM_QuanLyNhaHang.sql
```

### **🎉 Hoàn Thành!**

Dự án của bạn giờ đây đã chạy local thành công:

✅ **Backend API:** http://localhost:3000/api
✅ **Frontend:** http://localhost:8080  
✅ **Database:** MySQL local
✅ **No Docker required!**

**Happy Coding! 🚀**
