# 🍽️ Restaurant Management System - Docker Setup

## 🚀 **Quick Start**

### **1. Prerequisites**
```bash
# Install Docker & Docker Compose
# Ubuntu/Debian:
sudo apt update
sudo apt install docker.io docker-compose

# macOS:
brew install docker docker-compose

# Windows: Download Docker Desktop
```

### **2. Clone & Setup**
```bash
# Clone repository
git clone <your-repo-url>
cd restaurant-management

# Copy environment file
cp .env.docker .env

# Make scripts executable
chmod +x docker/scripts/*.sh
```

### **3. Start Application**
```bash
# Option 1: Using script (recommended)
./docker/scripts/start.sh

# Option 2: Using docker-compose directly
docker-compose up -d
```

### **4. Access Application**
- **Frontend:** http://localhost
- **API:** http://localhost:3000/api
- **API Docs:** http://localhost:3000/api/docs
- **PhpMyAdmin:** http://localhost:8080

## 📋 **Services Overview**

| Service | Port | Description |
|---------|------|-------------|
| **nginx** | 80, 443 | Web server + Frontend |
| **backend** | 3000 | Node.js API server |
| **mysql** | 3306 | MySQL database |
| **redis** | 6379 | Cache & sessions |
| **phpmyadmin** | 8080 | Database management |

## ⚙️ **Configuration**

### **Environment Variables (.env)**
```bash
# Database
DB_HOST=mysql
DB_USER=restaurant_user
DB_PASSWORD=your-secure-password
DB_NAME=QuanLyNhaHang

# JWT Security
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# AI Services (Optional)
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key

# Ports
API_PORT=3000
WEB_PORT=80
PHPMYADMIN_PORT=8080
```

## 🛠️ **Management Commands**

### **Start/Stop Services**
```bash
# Start all services
./docker/scripts/start.sh

# Stop services
./docker/scripts/stop.sh

# Restart specific service
docker-compose restart backend

# View logs
docker-compose logs -f backend
```

### **Database Management**
```bash
# Backup database
./docker/scripts/backup.sh

# Access MySQL CLI
docker-compose exec mysql mysql -u restaurant_user -p QuanLyNhaHang

# Import SQL file
docker-compose exec -T mysql mysql -u restaurant_user -p QuanLyNhaHang < backup.sql
```

### **Development**
```bash
# Build without cache
docker-compose build --no-cache

# Scale backend service
docker-compose up -d --scale backend=3

# Execute commands in container
docker-compose exec backend npm run dev
```

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. Port Already in Use**
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or change port in .env
API_PORT=3001
```

#### **2. Database Connection Failed**
```bash
# Check MySQL container
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql

# Wait for MySQL to be ready
docker-compose exec mysql mysqladmin ping -h localhost
```

#### **3. Permission Denied**
```bash
# Fix file permissions
sudo chown -R $USER:$USER backend/logs
sudo chown -R $USER:$USER backend/images
sudo chmod -R 755 backend/logs backend/images
```

#### **4. Out of Disk Space**
```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune

# Remove old images
docker image prune -a
```

### **Health Checks**
```bash
# Check all services
docker-compose ps

# Test API health
curl http://localhost:3000/api/health

# Test frontend
curl http://localhost/

# Check database
docker-compose exec mysql mysqladmin ping -h localhost
```

## 📊 **Monitoring**

### **View Logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### **Resource Usage**
```bash
# Container stats
docker stats

# Disk usage
docker system df

# Network info
docker network ls
```

## 🔒 **Security**

### **Production Checklist**
- [ ] Change default passwords in `.env`
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Set up backup automation
- [ ] Enable log rotation
- [ ] Update Docker images regularly

### **SSL Setup (Optional)**
```bash
# Generate self-signed certificate
mkdir -p docker/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/ssl/key.pem \
  -out docker/ssl/cert.pem

# Update nginx configuration to enable HTTPS
```

## 📦 **Backup & Restore**

### **Automated Backup**
```bash
# Manual backup
./docker/scripts/backup.sh

# Schedule with cron (daily at 2 AM)
echo "0 2 * * * /path/to/project/docker/scripts/backup.sh" | crontab -
```

### **Restore from Backup**
```bash
# Stop services
docker-compose down

# Restore database
gunzip -c backups/restaurant_db_backup_20240101_020000.sql.gz | \
  docker-compose exec -T mysql mysql -u restaurant_user -p QuanLyNhaHang

# Restore images
tar -xzf backups/images_backup_20240101_020000.tar.gz -C backend/

# Start services
docker-compose up -d
```

## 🚀 **Production Deployment**

### **Docker Swarm (Recommended)**
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml restaurant

# Scale services
docker service scale restaurant_backend=3
```

### **Kubernetes**
```bash
# Convert docker-compose to k8s
kompose convert

# Deploy to k8s
kubectl apply -f .
```

## 📞 **Support**

### **Get Help**
```bash
# Check service status
docker-compose ps

# View recent logs
docker-compose logs --tail=50

# Test connectivity
curl -v http://localhost:3000/api/health
```

### **Reset Everything**
```bash
# ⚠️ WARNING: This will delete all data
docker-compose down -v
docker system prune -a
./docker/scripts/start.sh
```

---

## 🎉 **Success!**

Your Restaurant Management System is now running in Docker! 

- **Frontend:** http://localhost
- **API:** http://localhost:3000/api
- **Database:** Accessible via PhpMyAdmin at http://localhost:8080

**Happy Coding! 🍽️**
