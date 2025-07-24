# 🔌 MySQL Port Configuration - Tránh xung đột với MySQL local

## 🎯 Vấn đề đã giải quyết

Máy tính của bạn đã có MySQL chạy trên port **3306**, Docker MySQL sẽ sử dụng port **3307** để tránh xung đột.

## 📊 Port Mapping

```
Host Machine Port 3307 → Docker Container Port 3306
```

| Kết nối từ | Host | Port | Mô tả |
|------------|------|------|-------|
| **Host machine** | localhost | 3307 | Kết nối từ máy tính của bạn |
| **Docker containers** | database | 3306 | Kết nối giữa các container |

## ⚙️ Cấu hình đã cập nhật

### **1. Docker Compose Files**
```yaml
# docker-compose.yml & docker-compose.dev.yml
database:
  ports:
    - "3307:3306"  # Host:3307 → Container:3306
```

### **2. Environment Files**
```bash
# .env & .env.dev (Root directory)
DB_PORT=3307  # External port for host connections

# backend/.env & backend/.env.dev
DB_HOST=database  # Internal Docker network
DB_PORT=3306      # Internal container port
```

### **3. Validation Scripts**
- `docker-validate.sh` - Kiểm tra port 3307
- `test-db-connection.sh` - Test kết nối database

## 🚀 Cách sử dụng

### **Kết nối từ Host Machine**
```bash
# MySQL client
mysql -h localhost -P 3307 -u nhahang_user -p QuanLyNhaHang

# Test connection
make db-test-host
```

### **Kết nối từ Backend Container**
```bash
# Backend tự động kết nối qua Docker network
DB_HOST=database
DB_PORT=3306

# Test connection
make db-test-container
```

### **phpMyAdmin (Development)**
```bash
# Truy cập qua browser
http://localhost:8081
```

## 🧪 Testing Commands

```bash
# Test tất cả kết nối
make db-test

# Test từ host machine
make db-test-host

# Test từ container
make db-test-container

# Kiểm tra status database
make db-status

# Truy cập MySQL shell
make db-shell
```

## 🔍 Troubleshooting

### **1. Port 3307 vẫn bị xung đột**
```bash
# Kiểm tra port đang sử dụng
netstat -tulpn | grep :3307
lsof -i :3307

# Thay đổi port trong .env
DB_PORT=3308  # Hoặc port khác
```

### **2. Không kết nối được database**
```bash
# Kiểm tra containers
make status

# Xem logs database
make logs-db

# Restart database
docker-compose restart database
```

### **3. Backend không kết nối được database**
```bash
# Kiểm tra network
docker network ls
docker network inspect duanbaocaoweb_nha-hang-network

# Test từ backend container
make db-test-container
```

## 📋 Environment Files Summary

### **Production (.env)**
```bash
DB_HOST=database
DB_PORT=3307                                    # External port
DB_USER=nhahang_user
DB_PASSWORD=nhahang_secure_password_2024
```

### **Development (.env.dev)**
```bash
DB_HOST=database
DB_PORT=3307                                    # External port
DB_USER=nhahang_user
DB_PASSWORD=nhahang_dev_password
```

### **Backend Production (backend/.env)**
```bash
DB_HOST=database                                # Internal network
DB_PORT=3306                                    # Internal port
DB_USER=nhahang_user
DB_PASSWORD=nhahang_secure_password_2024
```

### **Backend Development (backend/.env.dev)**
```bash
DB_HOST=database                                # Internal network
DB_PORT=3306                                    # Internal port
DB_USER=nhahang_user
DB_PASSWORD=nhahang_dev_password
```

## ✅ Verification Checklist

- [ ] MySQL local vẫn chạy trên port 3306
- [ ] Docker MySQL chạy trên port 3307 (external)
- [ ] Backend container kết nối database qua port 3306 (internal)
- [ ] Host machine kết nối database qua port 3307
- [ ] phpMyAdmin hoạt động trên port 8081
- [ ] Không có port conflicts

## 🎯 Next Steps

1. **Start development environment:**
   ```bash
   make init-dev
   ```

2. **Test database connections:**
   ```bash
   make db-test
   ```

3. **Access services:**
   - Frontend: http://localhost:8080
   - Backend: http://localhost:3000
   - Database: localhost:3307
   - phpMyAdmin: http://localhost:8081

Bây giờ bạn có thể chạy Docker MySQL mà không lo xung đột với MySQL local! 🎉
