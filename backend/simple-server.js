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
