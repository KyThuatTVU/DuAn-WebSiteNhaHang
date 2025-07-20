# 🐳 Docker Setup cho Website Nhà Hàng

Hướng dẫn chi tiết để chạy dự án Website Nhà Hàng bằng Docker.

## 📋 Yêu cầu hệ thống

- Docker Engine 20.10+
- Docker Compose 2.0+
- RAM: Tối thiểu 2GB, khuyến nghị 4GB+
- Disk: Tối thiểu 5GB trống

## 🚀 Quick Start

### 1. Chuẩn bị môi trường

```bash
# Clone repository
git clone <your-repo-url>
cd DuAnBaoCaoWeb

# Copy environment file
cp .env.example .env

# Chỉnh sửa .env file theo nhu cầu
nano .env
```

### 2. Chạy Production

```bash
# Build và start tất cả services
docker-compose up -d

# Kiểm tra status
docker-compose ps

# Xem logs
docker-compose logs -f
```

### 3. Chạy Development

```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Xem logs backend
docker-compose logs -f backend

# Attach vào backend container để debug
docker-compose exec backend bash
```

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Nginx)       │◄──►│   (Node.js)     │◄──►│   (MySQL)       │
│   Port: 8080    │    │   Port: 3000    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Redis       │
                    │   (Cache)       │
                    │   Port: 6379    │
                    └─────────────────┘
```

## 📦 Services

### Core Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 8080 | Nginx serving static files |
| backend | 3000 | Node.js API server |
| database | 3306 | MySQL database |
| redis | 6379 | Redis cache |

### Development Services

| Service | Port | Description |
|---------|------|-------------|
| adminer | 8081 | Database management UI |
| redis-commander | 8082 | Redis management UI |
| mailhog | 8025 | Email testing tool |

### Monitoring Services (Optional)

| Service | Port | Description |
|---------|------|-------------|
| prometheus | 9090 | Metrics collection |
| grafana | 3001 | Monitoring dashboard |

## 🔧 Cấu hình

### Environment Variables

Chỉnh sửa file `.env`:

```bash
# Database
DB_USER=nha_hang_user
DB_PASSWORD=secure_password_here
DB_NAME=QuanLyNhaHang

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# API Keys (Optional)
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key
```

### Profiles

Sử dụng profiles để chạy các services tùy chọn:

```bash
# Chạy với monitoring
docker-compose --profile monitoring up -d

# Chạy backup
docker-compose --profile backup up backup
```

## 📊 Monitoring và Logs

### Xem logs

```bash
# Tất cả services
docker-compose logs -f

# Service cụ thể
docker-compose logs -f backend
docker-compose logs -f database

# Logs với timestamp
docker-compose logs -f -t backend
```

### Health checks

```bash
# Kiểm tra health của tất cả services
docker-compose ps

# Health check manual
curl http://localhost:8080/health
curl http://localhost:3000/api/health
```

### Monitoring

Truy cập các dashboard:

- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Adminer**: http://localhost:8081

## 💾 Backup và Restore

### Tạo backup

```bash
# Backup database
docker-compose --profile backup up backup

# Backup manual
docker-compose exec database mysqldump -u root -p QuanLyNhaHang > backup.sql
```

### Restore database

```bash
# Restore từ backup file
docker-compose exec -T database mysql -u root -p QuanLyNhaHang < backup.sql
```

## 🔧 Troubleshooting

### Lỗi thường gặp

#### 1. Database connection failed

```bash
# Kiểm tra database status
docker-compose logs database

# Restart database
docker-compose restart database
```

#### 2. Port đã được sử dụng

```bash
# Kiểm tra port đang sử dụng
netstat -tulpn | grep :3000

# Thay đổi port trong .env
PORT=3001
```

#### 3. Permission denied

```bash
# Fix permissions
sudo chown -R $USER:$USER .
chmod +x docker/scripts/*.sh
```

#### 4. Out of memory

```bash
# Kiểm tra memory usage
docker stats

# Tăng memory limit trong docker-compose.yml
deploy:
  resources:
    limits:
      memory: 512M
```

### Debug commands

```bash
# Vào container để debug
docker-compose exec backend bash
docker-compose exec database mysql -u root -p

# Kiểm tra network
docker network ls
docker network inspect duanbaocaoweb_nha-hang-network

# Rebuild services
docker-compose build --no-cache
docker-compose up -d --force-recreate
```

## 🧹 Cleanup

### Dọn dẹp containers và volumes

```bash
# Stop và remove containers
docker-compose down

# Remove volumes (⚠️ Sẽ xóa data!)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Complete cleanup
docker system prune -a --volumes
```

## 🔒 Security

### Production checklist

- [ ] Thay đổi default passwords
- [ ] Sử dụng strong JWT secret
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

### Security headers

Nginx đã được cấu hình với các security headers:

- X-Frame-Options
- X-XSS-Protection  
- X-Content-Type-Options
- Content-Security-Policy

## 📈 Performance Tuning

### Database optimization

```sql
-- Kiểm tra slow queries
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';

-- Optimize tables
OPTIMIZE TABLE dat_ban, khach_hang, mon_an;
```

### Redis optimization

```bash
# Monitor Redis performance
docker-compose exec redis redis-cli info memory
docker-compose exec redis redis-cli info stats
```

## 🆘 Support

Nếu gặp vấn đề:

1. Kiểm tra logs: `docker-compose logs -f`
2. Kiểm tra health checks: `docker-compose ps`
3. Tham khảo troubleshooting section
4. Tạo issue trên GitHub với logs chi tiết
