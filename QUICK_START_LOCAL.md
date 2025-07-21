# ⚡ QUICK START - Chạy Local Không Docker

## 🚀 **Lệnh Nhanh (5 phút setup)**

### **Bước 1: Chuẩn bị Database**
```bash
# Khởi động MySQL
# Windows: Mở MySQL Workbench
# macOS: brew services start mysql  
# Ubuntu: sudo systemctl start mysql

# Tạo database và user
mysql -u root -p < setup-database.sql

# Import dữ liệu
mysql -u restaurant_user -p QuanLyNhaHang < QuanLyDBWeb/CNPM_QuanLyNhaHang.sql
```

### **Bước 2: Khởi động tất cả**
```bash
# Cấp quyền thực thi
chmod +x start-local.sh

# Chạy script tự động
./start-local.sh
```

### **Bước 3: Truy cập ứng dụng**
- **Frontend:** http://localhost:8080
- **API:** http://localhost:3000/api
- **Docs:** http://localhost:3000/api/docs

---

## 🛠️ **Setup Thủ Công (Nếu script không hoạt động)**

### **1. Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Chỉnh sửa .env với thông tin database
npm run dev
```

### **2. Frontend Setup (Terminal mới)**
```bash
cd frontend

# Chọn 1 trong các cách sau:
python -m http.server 8080        # Python 3
python -m SimpleHTTPServer 8080   # Python 2
php -S localhost:8080             # PHP
npx http-server -p 8080           # Node.js
```

---

## 🔧 **Cấu hình .env**

Tạo file `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=restaurant_user
DB_PASSWORD=restaurant_pass
DB_NAME=QuanLyNhaHang

NODE_ENV=development
PORT=3000

JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
```

---

## 🚨 **Troubleshooting**

### **Lỗi Database:**
```bash
# Kiểm tra MySQL đang chạy
mysql -u root -p

# Reset user nếu cần
DROP USER 'restaurant_user'@'localhost';
CREATE USER 'restaurant_user'@'localhost' IDENTIFIED BY 'restaurant_pass';
GRANT ALL PRIVILEGES ON QuanLyNhaHang.* TO 'restaurant_user'@'localhost';
```

### **Lỗi Port:**
```bash
# Kiểm tra port đang sử dụng
netstat -an | grep 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### **Lỗi npm:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## 🛑 **Dừng Server**

```bash
# Sử dụng script
./stop-local.sh

# Hoặc thủ công
pkill -f "node.*server.js"
pkill -f "python.*http.server"
```

---

## ✅ **Kiểm tra hoạt động**

```bash
# Test API
curl http://localhost:3000/api/health
curl http://localhost:3000/api/foods

# Test Frontend
# Mở browser: http://localhost:8080
```

---

## 🎯 **Tóm tắt lệnh**

```bash
# 1. Setup database
mysql -u root -p < setup-database.sql
mysql -u restaurant_user -p QuanLyNhaHang < QuanLyDBWeb/CNPM_QuanLyNhaHang.sql

# 2. Start all
chmod +x start-local.sh
./start-local.sh

# 3. Access
# Frontend: http://localhost:8080
# API: http://localhost:3000/api
```

**Chỉ cần 3 lệnh là chạy được! 🚀**
