require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import auth middleware và endpoints
const { authenticateToken, authEndpoints } = require('./middleware/auth');

// Import database config để test MySQL connection
const { testConnection } = require('./config/database');



const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:5500', 'http://127.0.0.1:5500',
        'http://localhost:8080', 'http://127.0.0.1:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} from ${req.get('origin') || 'unknown'}`);
    next();
});

// Health check
app.get('/api/health', authEndpoints.health);

// Authentication routes sử dụng auth.js
app.post('/api/khach_hang/register', authEndpoints.register);
app.post('/api/khach_hang/login', authEndpoints.login);
app.post('/api/khach_hang/refresh', authEndpoints.refresh);
app.get('/api/test', authEndpoints.test);

// Protected routes
app.get('/api/profile', authenticateToken, authEndpoints.profile);

// Simple foods endpoint with mock data
app.get('/api/foods', (req, res) => {
    console.log('📥 GET /api/foods called');

    // Mock data với so_luong > 0
    const mockFoods = [
        {
            id_mon: 1,
            ten_mon: "Cá Lóc Nướng Trui",
            gia: 185000,
            gia_formatted: "185.000đ",
            hinh_anh: "http://localhost:3000/images/calocnuongtrui.jpg",
            mo_ta: "Cá lóc tươi nướng trui trên than hoa, phết mỡ hành và ăn kèm với các loại rau thơm đặc trưng miền Nam.",
            so_luong: 10,
            so_luong_display: "Còn 10 phần",
            tinh_trang: "Còn hàng",
            id_loai: 2,
            ten_loai: "Món Nướng"
        },
        {
            id_mon: 2,
            ten_mon: "Bánh Xèo",
            gia: 65000,
            gia_formatted: "65.000đ",
            hinh_anh: "http://localhost:3000/images/banhxeo.jpg",
            mo_ta: "Bánh xèo giòn rụm với nhân tôm thịt, ăn kèm rau sống và nước chấm đặc biệt.",
            so_luong: 15,
            so_luong_display: "Còn 15 phần",
            tinh_trang: "Còn hàng",
            id_loai: 1,
            ten_loai: "Món Khai Vị"
        },
        {
            id_mon: 3,
            ten_mon: "Gỏi Cuốn",
            gia: 45000,
            gia_formatted: "45.000đ",
            hinh_anh: "http://localhost:3000/images/goicuon.jpg",
            mo_ta: "Gỏi cuốn tươi với tôm, thịt heo và rau thơm, chấm nước mắm chua ngọt.",
            so_luong: 20,
            so_luong_display: "Còn 20 phần",
            tinh_trang: "Còn hàng",
            id_loai: 1,
            ten_loai: "Món Khai Vị"
        }
    ];

    res.json({
        success: true,
        data: mockFoods,
        total: mockFoods.length,
        message: 'Mock data from simple server'
    });
});



// Start server with database detection
app.listen(PORT, async () => {
    console.log(`🚀 Simple server running on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('  POST /api/khach_hang/register');
    console.log('  POST /api/khach_hang/login');
    console.log('  POST /api/khach_hang/refresh');
    console.log('  GET  /api/profile');

    console.log('  GET  /api/health');
    console.log('  GET  /api/test');
    console.log('');
    console.log('🔧 Using middleware/auth.js for authentication (MySQL database)');

    // Test MySQL connection
    console.log('🔍 Testing MySQL connection...');
    const mysqlAvailable = await testConnection();

    if (mysqlAvailable) {
        console.log('✅ MySQL connected - Database ready');
        global.USE_MYSQL = true;
    } else {
        console.log('⚠️  MySQL not available');
        global.USE_MYSQL = false;
    }

    console.log('🌐 CORS enabled for: http://localhost:5500, http://127.0.0.1:5500, http://localhost:8080, http://127.0.0.1:8080');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    process.exit(0);
});
