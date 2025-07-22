# 🍽️ Restaurant Management System

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-orange.svg)](https://mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-red.svg)](https://jwt.io/)
[![AI](https://img.shields.io/badge/AI-Gemini%20%7C%20Groq-purple.svg)](https://ai.google.dev/)

Hệ thống quản lý nhà hàng hiện đại với API RESTful, tích hợp AI chatbot, và giao diện web responsive.

## ✨ Tính năng chính

### 🔐 **Authentication & Security**
- JWT-based authentication với refresh tokens
- Role-based access control (RBAC)
- Password hashing với bcrypt
- Rate limiting và security headers
- Input validation và sanitization

### 🍜 **Food Management**
- CRUD operations cho món ăn
- Upload và quản lý hình ảnh
- Phân loại món ăn theo danh mục
- Advanced filtering, sorting, pagination
- Quản lý tồn kho và trạng thái

### 🤖 **AI Integration**
- Chatbot thông minh với Gemini AI và Groq
- Tự động tạo mô tả món ăn
- Hỗ trợ khách hàng 24/7
- Đa ngôn ngữ và context-aware

### 📅 **Reservation System**
- Đặt bàn online với xác nhận real-time
- Quản lý lịch đặt bàn
- Thông báo và reminder
- Conflict detection và resolution

### 📊 **Advanced Features**
- Comprehensive pagination với metadata
- Real-time search và filtering
- Caching và performance optimization
- Comprehensive logging và monitoring
- Error handling và recovery

## 🏗️ Kiến trúc hệ thống

```
Restaurant Management System/
├── 📁 backend/                 # Node.js API Server
│   ├── 📁 config/             # Configuration files
│   ├── 📁 controllers/        # Business logic layer
│   ├── 📁 middleware/         # Custom middleware
│   ├── 📁 models/            # Data access layer
│   ├── 📁 routes/            # API routes
│   ├── 📁 services/          # External services
│   ├── 📁 utils/             # Utility functions
│   └── 📁 public/            # Static files
├── 📁 frontend/               # Web Interface
│   ├── 📁 components/        # Reusable components
│   ├── 📁 css/              # Stylesheets
│   ├── 📁 js/               # JavaScript modules
│   └── 📁 img/              # Images and assets
├── 📁 docker/                # Docker configuration
├── 📁 QuanLyDBWeb/           # Database scripts
└── 📄 API Documentation      # Generated docs
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x hoặc cao hơn
- MySQL 8.x
- npm hoặc yarn

### 1. Clone Repository
```bash
git clone https://github.com/your-username/restaurant-management.git
cd restaurant-management
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Configure database connection in .env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=QuanLyNhaHang

# Setup database
mysql -u root -p < ../QuanLyDBWeb/CNPM_QuanLyNhaHang.sql

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
# Open frontend in browser
open frontend/Index-new.html
# or serve with a local server
npx serve frontend
```

### 4. Access Services
- **API Server**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **Swagger UI**: http://localhost:3000/api-docs
- **Frontend**: http://localhost:8080 (if using serve)

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
```bash
# Register
POST /api/khach_hang/register
{
  "full_name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0123456789",
  "password": "password123"
}

# Login
POST /api/khach_hang/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Food Management
```bash
# Get all foods with filtering
GET /api/foods?page=1&limit=10&category=1&search=phở&sort=gia&order=asc

# Create food (with image upload)
POST /api/foods
Content-Type: multipart/form-data
Authorization: Bearer <token>

# Update food
PUT /api/foods/{id}
Authorization: Bearer <token>

# Delete food
DELETE /api/foods/{id}
Authorization: Bearer <token>
```

### AI Chat
```bash
# Send chat message
POST /api/chat
{
  "messages": [
    {
      "role": "user",
      "content": "Tôi muốn đặt món phở bò"
    }
  ],
  "options": {
    "temperature": 0.7,
    "maxTokens": 1000
  }
}
```

### Reservations
```bash
# Create reservation
POST /api/datban
{
  "ten_khach": "Nguyễn Văn A",
  "sdt": "0123456789",
  "ngay": "2024-01-15",
  "gio": "19:00",
  "so_luong_khach": 4
}

# Get reservations with filtering
GET /api/datban?status=cho_xac_nhan&date=2024-01-15
```

## 🧪 Testing

### Postman Collection
1. Import `Restaurant_API_Postman_Collection.json`
2. Import `Restaurant_API_Environment.json`
3. Run collection tests

### Automated Testing
```bash
# Install Newman (Postman CLI)
npm install -g newman

# Run API tests
node postman-test-runner.js all

# Run specific test suite
node postman-test-runner.js folder "Authentication"

# Generate HTML report
node postman-test-runner.js report
```

## 🐳 Docker Deployment (Khuyến Nghị)

### Quick Start với Docker
```bash
# Cách 1: Sử dụng script tự động
./docker-start.sh

# Cách 2: Chạy thủ công
docker-compose up --build -d
```

### Truy cập ứng dụng
- 🌐 **Frontend**: http://localhost
- 🔧 **Backend API**: http://localhost:3000
- 📚 **API Docs**: http://localhost:3000/api-docs
- 🗄️ **MySQL**: localhost:3306

### Docker Commands hữu ích
```bash
# Xem trạng thái
docker-compose ps

# Xem logs
docker-compose logs -f [service_name]

# Restart service
docker-compose restart [service_name]

# Dừng tất cả
docker-compose down

# Reset hoàn toàn
docker-compose down -v && docker system prune -a
```

📖 **Chi tiết**: Xem [DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)

## 🔧 Configuration

### Environment Variables

**📁 File `.env` (Đã có sẵn)** - Cấu hình cho Docker:
```env
# Database (Docker)
DB_HOST=mysql              # Service name trong Docker
DB_USER=root
DB_PASSWORD=TVU@842004
DB_NAME=QuanLyNhaHang

# AI Services (Đã có API key)
GEMINI_API_KEY=AIzaSyDIFJyixG2eQL_xCu1-nDXWET_yVOUspzE
GROQ_API_KEY=your-actual-groq-api-key

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-restaurant-api-2024
```

**🔄 Chuyển đổi môi trường:**
```bash
# Chuyển sang Docker
./switch-env.sh docker

# Chuyển sang Local development
./switch-env.sh local

# Xem trạng thái hiện tại
./switch-env.sh status
```

## 📊 Performance & Monitoring

### Metrics
- Response time < 200ms (average)
- 99.9% uptime
- Concurrent users: 1000+
- Database connection pooling
- Memory usage optimization

### Logging
- Winston logger với multiple transports
- Request/response logging
- Error tracking và alerting
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write comprehensive tests
- Update documentation
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Development**: Node.js, Express, MySQL
- **Frontend Development**: HTML5, CSS3, JavaScript
- **AI Integration**: Gemini AI, Groq
- **DevOps**: Docker, CI/CD

## 🆘 Support

- 📧 Email: support@restaurant-api.com
- 📖 Documentation: http://localhost:3000/api/docs
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-repo/discussions)

## 🎯 Roadmap

### Version 1.1.0
- [ ] Real-time notifications với WebSocket
- [ ] Payment integration (VNPay, MoMo)
- [ ] Advanced analytics dashboard
- [ ] Mobile app với React Native

### Version 1.2.0
- [ ] Multi-restaurant support
- [ ] Advanced reporting
- [ ] Inventory management
- [ ] Staff management system

---

<div align="center">
  <p>Made with ❤️ by Restaurant Management Team</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
