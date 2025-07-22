# Hướng Dẫn Cài Đặt và Chạy Docker cho Dự Án Quản Lý Nhà Hàng

## 1. Cài Đặt Docker

### Ubuntu/Debian:
```bash
# Cập nhật package index
sudo apt update

# Cài đặt Docker
sudo apt install docker.io docker-compose

# Khởi động Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Thêm user vào group docker (để không cần sudo)
sudo usermod -aG docker $USER

# Logout và login lại để áp dụng thay đổi
```

### Windows:
1. Tải Docker Desktop từ: https://www.docker.com/products/docker-desktop
2. Cài đặt và khởi động Docker Desktop
3. Đảm bảo WSL2 được bật nếu sử dụng Windows 10/11

### macOS:
1. Tải Docker Desktop từ: https://www.docker.com/products/docker-desktop
2. Cài đặt và khởi động Docker Desktop

## 2. Cấu Trúc Dự Án

```
DuAnBaoCaoWeb/
├── docker-compose.yml          # Orchestration file
├── .env                        # Environment variables
├── docker-start.sh            # Start script
├── backend/
│   ├── Dockerfile             # Backend container config
│   ├── .dockerignore          # Files to ignore
│   └── ...
├── frontend/
│   ├── Dockerfile             # Frontend container config
│   ├── nginx.conf             # Nginx configuration
│   ├── .dockerignore          # Files to ignore
│   └── ...
└── QuanLyDBWeb/
    └── CNPM_QuanLyNhaHang.sql # Database initialization
```

## 3. Chạy Dự Án

### Cách 1: Sử dụng script tự động
```bash
./docker-start.sh
```

### Cách 2: Chạy thủ công
```bash
# Build và start tất cả services
docker-compose up --build -d

# Xem logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 4. Truy Cập Ứng Dụng

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **MySQL Database**: localhost:3306

## 5. Các Lệnh Docker Hữu Ích

```bash
# Xem trạng thái containers
docker-compose ps

# Xem logs của service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Restart service cụ thể
docker-compose restart backend

# Rebuild service cụ thể
docker-compose up --build backend

# Truy cập vào container
docker-compose exec backend bash
docker-compose exec mysql mysql -u root -p

# Xóa tất cả containers và volumes
docker-compose down -v

# Xem resource usage
docker stats
```

## 6. Cấu Hình Environment Variables

### File `.env` (Đã có sẵn)
Dự án đã có file `.env` với cấu hình database sẵn:

```env
# Database Configuration (Docker)
DB_HOST=mysql          # Service name trong Docker
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TVU@842004
DB_NAME=QuanLyNhaHang

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-restaurant-api-2024

# AI APIs
GEMINI_API_KEY=AIzaSyDIFJyixG2eQL_xCu1-nDXWET_yVOUspzE
GROQ_API_KEY=your-actual-groq-api-key
```

### File `.env.local` (Cho development không dùng Docker)
Nếu chạy local không dùng Docker, sử dụng:
```bash
cp .env.local .env
# DB_HOST sẽ là 127.0.0.1 thay vì mysql
```

## 7. Troubleshooting

### Lỗi Port đã được sử dụng:
```bash
# Kiểm tra process sử dụng port
sudo lsof -i :80
sudo lsof -i :3000
sudo lsof -i :3306

# Kill process nếu cần
sudo kill -9 <PID>
```

### Lỗi Permission Denied:
```bash
# Thêm user vào docker group
sudo usermod -aG docker $USER
# Logout và login lại
```

### Reset hoàn toàn:
```bash
# Stop và xóa tất cả
docker-compose down -v
docker system prune -a
# Sau đó chạy lại
docker-compose up --build
```

## 8. Database Management

### Truy cập MySQL:
```bash
docker-compose exec mysql mysql -u root -p
# Password: TVU@842004
```

### Backup Database:
```bash
docker-compose exec mysql mysqldump -u root -p QuanLyNhaHang > backup.sql
```

### Restore Database:
```bash
docker-compose exec -T mysql mysql -u root -p QuanLyNhaHang < backup.sql
```

## 9. Development Mode

Để development, có thể mount source code:

```yaml
# Thêm vào docker-compose.yml
volumes:
  - ./backend:/app
  - /app/node_modules
```

## 10. Production Deployment

Để deploy production:

1. Thay đổi environment variables trong `.env`
2. Sử dụng reverse proxy (nginx) cho SSL
3. Cấu hình backup database tự động
4. Monitor logs và performance
