# 🐳 Docker Deployment Guide - Restaurant Management System

## 📋 Tổng quan

Hệ thống quản lý nhà hàng được containerized với Docker, bao gồm:
- **Frontend**: Nginx serving static HTML/CSS/JS files
- **Backend**: Node.js/Express API server
- **Database**: MySQL 8.0 with persistent storage

## 🏗️ Kiến trúc Docker

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (Nginx:80)    │◄──►│  (Node.js:3000) │◄──►│   (MySQL:3306)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Chuẩn bị môi trường

```bash
# Clone repository
git clone <your-repo-url>
cd DuAnBaoCaoWeb

# Copy và cấu hình environment files
make setup
```

### 2. Development Mode

```bash
# Khởi tạo development environment
make init-dev

# Hoặc thực hiện từng bước:
make dev-build
make dev-up
```

**Truy cập services:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- Database: localhost:3307 (external port, tránh xung đột với MySQL local)
- phpMyAdmin: http://localhost:8081

### 3. Production Mode

```bash
# Build và start production
make build
make up
```

**Truy cập services:**
- Frontend: http://localhost:80
- Backend API: http://localhost:3000
- Database: localhost:3307 (external port)

## 🔌 Port Configuration

### MySQL Port Mapping
Docker MySQL sử dụng **port 3307** (external) để tránh xung đột với MySQL local trên port 3306:

```
Host Machine:3307 → Docker Container:3306
```

**Kết nối từ bên ngoài Docker:**
```bash
mysql -h localhost -P 3307 -u nhahang_user -p
```

**Kết nối từ bên trong Docker network:**
```bash
# Backend container kết nối với database container
DB_HOST=database
DB_PORT=3306  # Internal port
```

### Port Summary
| Service | Internal Port | External Port | URL |
|---------|---------------|---------------|-----|
| Frontend | 80 | 80/8080 | http://localhost:80 |
| Backend | 3000 | 3000 | http://localhost:3000 |
| MySQL | 3306 | 3307 | localhost:3307 |
| phpMyAdmin | 80 | 8081 | http://localhost:8081 |

## ⚙️ Cấu hình Environment

### Root .env file
```bash
# Database
DB_NAME=QuanLyNhaHang
DB_USER=nhahang_user
DB_PASSWORD=nhahang_password
DB_ROOT_PASSWORD=TVU@842004

# Ports
BACKEND_PORT=3000
FRONTEND_PORT=80
PHPMYADMIN_PORT=8081

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI Services (Optional)
GOOGLE_AI_API_KEY=your-google-ai-api-key
GROQ_API_KEY=your-groq-api-key
```

### Backend .env file
```bash
NODE_ENV=production
PORT=3000
DB_HOST=database
JWT_SECRET=your-jwt-secret
# ... (xem backend/.env.example)
```

## 📦 Docker Commands

### Makefile Commands

| Command | Description |
|---------|-------------|
| `make help` | Hiển thị tất cả commands |
| `make setup` | Chuẩn bị môi trường lần đầu |
| `make init-dev` | Khởi tạo development environment |
| `make build` | Build production images |
| `make up` | Start production services |
| `make dev-up` | Start development services |
| `make down` | Stop all services |
| `make logs` | Xem logs tất cả services |
| `make status` | Kiểm tra trạng thái containers |
| `make clean` | Dọn dẹp Docker resources |

### Manual Docker Commands

```bash
# Production
docker-compose up -d
docker-compose down
docker-compose logs -f

# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
```

## 🗄️ Database Management

### Database Initialization
Database được tự động khởi tạo với sample data từ `QuanLyDBWeb/init.sql`:
```bash
# Kiểm tra sample data
make db-sample

# Xem tóm tắt dữ liệu
make db-summary
```

### Backup Database
```bash
make db-backup
```

### Restore Database
```bash
make db-restore FILE=backup_20240724_120000.sql
```

### Access MySQL Shell
```bash
make db-shell
```

## 🔧 Troubleshooting

### 1. Port conflicts
```bash
# Kiểm tra ports đang sử dụng
netstat -tulpn | grep :3000
netstat -tulpn | grep :80

# Thay đổi ports trong .env
BACKEND_PORT=3001
FRONTEND_PORT=8080
```

### 2. Database connection issues
```bash
# Kiểm tra database container
docker-compose logs database

# Restart database
docker-compose restart database
```

### 3. Permission issues
```bash
# Fix permissions cho volumes
sudo chown -R $USER:$USER ./backend/images
sudo chown -R $USER:$USER ./backend/logs
```

### 4. Memory issues
```bash
# Kiểm tra resource usage
make monitor

# Clean up unused resources
make clean
docker system prune -f
```

## 📊 Monitoring

### Health Checks
```bash
# Kiểm tra health của services
make health

# Monitor resource usage
make monitor
```

### Logs
```bash
# All services
make logs

# Specific service
make logs-backend
make logs-frontend
make logs-db
```

## 🔒 Security Considerations

### Production Checklist
- [ ] Thay đổi JWT_SECRET
- [ ] Thay đổi database passwords
- [ ] Cấu hình CORS origins
- [ ] Enable HTTPS (reverse proxy)
- [ ] Cấu hình firewall rules
- [ ] Regular backup database

### Environment Variables
```bash
# Tạo strong JWT secret
openssl rand -base64 32

# Tạo strong database password
openssl rand -base64 16
```

## 🚀 Deployment

### Development
```bash
make init-dev
```

### Staging/Production
```bash
# 1. Chuẩn bị environment
cp .env.example .env
# Edit .env với production values

# 2. Build và deploy
make build
make up

# 3. Verify deployment
make health
make status
```

## 📝 File Structure

```
DuAnBaoCaoWeb/
├── docker-compose.yml          # Production compose
├── docker-compose.dev.yml      # Development compose
├── Makefile                    # Docker commands
├── .env.example               # Environment template
├── backend/
│   ├── Dockerfile             # Backend container
│   ├── .dockerignore         # Backend ignore rules
│   └── .env.example          # Backend environment
├── frontend/
│   ├── Dockerfile            # Frontend container
│   ├── .dockerignore        # Frontend ignore rules
│   ├── nginx.prod.conf      # Production nginx config
│   └── nginx.dev.conf       # Development nginx config
└── QuanLyDBWeb/
    └── CNPM_QuanLyNhaHang.sql # Database schema
```

## 🧪 Testing

### API Testing
```bash
# Test backend health
curl http://localhost:3000/api/health

# Test frontend
curl http://localhost:80/

# Test database connection
make db-shell
```

### Load Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test API performance
ab -n 1000 -c 10 http://localhost:3000/api/health
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Docker Build and Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and Deploy
        run: |
          make build
          make up
```

## 🆘 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `make logs`
2. Kiểm tra status: `make status`
3. Restart services: `make restart`
4. Clean và rebuild: `make clean && make build && make up`
5. Chạy health check: `make health`
