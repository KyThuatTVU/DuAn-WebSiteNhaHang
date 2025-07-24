# 🔧 Environment Files Guide

## 📋 Tổng quan các file environment

Dự án Restaurant Management System có các file environment sau:

### **Root Directory**
- `.env` - Production environment (active)
- `.env.example` - Template cho production
- `.env.dev` - Development environment template

### **Backend Directory**
- `backend/.env` - Backend production config (active)
- `backend/.env.example` - Backend production template
- `backend/.env.dev` - Backend development template

## 🔄 Environment Switching

### **Sử dụng Script**
```bash
# Switch to development
./switch-env.sh dev

# Switch to production
./switch-env.sh prod

# Check current environment
./switch-env.sh status
```

### **Sử dụng Makefile**
```bash
# Switch to development
make env-dev

# Switch to production
make env-prod

# Check status
make env-status
```

## 📊 So sánh Environment Settings

| Setting | Development | Production |
|---------|-------------|------------|
| NODE_ENV | development | production |
| Frontend Port | 8080 | 80 |
| DB Host | database | database |
| DB User | nhahang_user | nhahang_user |
| DB Password | nhahang_dev_password | nhahang_secure_password_2024 |
| JWT Secret | dev-jwt-secret... | restaurant-management-jwt... |
| Debug Mode | true | false |
| Log Level | debug | info |
| Rate Limit | 1000 req/15min | 100 req/15min |
| Max File Size | 10MB | 5MB |
| CORS | Permissive | Restrictive |

## 🔑 Cấu hình hiện tại

### **Database Configuration**
```bash
# Production
DB_HOST=database          # Internal Docker network
DB_PORT=3306             # Internal container port
DB_USER=nhahang_user
DB_PASSWORD=nhahang_secure_password_2024
DB_NAME=QuanLyNhaHang
# External access: localhost:3307

# Development
DB_HOST=database          # Internal Docker network
DB_PORT=3306             # Internal container port
DB_USER=nhahang_user
DB_PASSWORD=nhahang_dev_password
DB_NAME=QuanLyNhaHang
# External access: localhost:3307
```

### **Port Mapping (Tránh xung đột với MySQL local)**
```bash
# Docker MySQL port mapping
Host:3307 → Container:3306

# Kết nối từ host machine
mysql -h localhost -P 3307 -u nhahang_user -p

# Kết nối từ backend container
DB_HOST=database
DB_PORT=3306  # Internal port
```

### **AI Services (Đã có sẵn)**
```bash
# Google Gemini 2.0 Flash
GOOGLE_AI_API_KEY=AIzaSyDIFJyixG2eQL_xCu1-nDXWET_yVOUspzE
GEMINI_API_KEY=AIzaSyDIFJyixG2eQL_xCu1-nDXWET_yVOUspzE

# Groq (cần cập nhật)
GROQ_API_KEY=your-actual-groq-api-key
```

### **Security Settings**
```bash
# Production JWT (Strong)
JWT_SECRET=restaurant-management-jwt-secret-key-2024-super-secure-change-this

# Development JWT (Weak - for dev only)
JWT_SECRET=dev-jwt-secret-key-not-for-production
```

## 🚀 Quick Start Commands

### **Development Environment**
```bash
# Initialize development
make init-dev

# Or manual steps:
./switch-env.sh dev
make dev-build
make dev-up

# Access:
# Frontend: http://localhost:8080
# Backend: http://localhost:3000
# phpMyAdmin: http://localhost:8081
```

### **Production Environment**
```bash
# Initialize production
make init-prod

# Review and edit .env files
nano .env
nano backend/.env

# Build and deploy
make build
make up

# Access:
# Frontend: http://localhost:80
# Backend: http://localhost:3000
```

## ⚠️ Security Checklist

### **Before Production Deployment:**
- [ ] Change JWT_SECRET to a strong random key
- [ ] Update database passwords
- [ ] Review CORS origins
- [ ] Update API keys if needed
- [ ] Set NODE_ENV=production
- [ ] Disable debug mode
- [ ] Review rate limiting settings

### **Generate Strong Secrets:**
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 16
```

## 🔍 Environment Validation

### **Check Current Settings:**
```bash
# Show environment status
make env-status

# Validate Docker setup
./docker-validate.sh

# Check environment variables
grep "NODE_ENV\|DB_HOST\|JWT_SECRET" .env backend/.env
```

### **Test Environment:**
```bash
# Test development
make dev-up
curl http://localhost:8080
curl http://localhost:3000/api/health

# Test production
make up
curl http://localhost:80
curl http://localhost:3000/api/health
```

## 📝 File Backup

Environment switcher tự động backup các file .env:
- `.env.backup.YYYYMMDD_HHMMSS`
- `backend/.env.backup.YYYYMMDD_HHMMSS`

## 🆘 Troubleshooting

### **Environment Issues:**
```bash
# Reset to default
cp .env.example .env
cp backend/.env.example backend/.env

# Check file permissions
ls -la .env backend/.env

# Validate environment files
./switch-env.sh status
```

### **Docker Issues:**
```bash
# Restart with new environment
make down
make up

# Check environment in container
docker-compose exec backend env | grep NODE_ENV
```
