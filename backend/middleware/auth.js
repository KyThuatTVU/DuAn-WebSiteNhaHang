const jwt = require('jsonwebtoken');
const CustomerModel = require('../models/CustomerModel');

// Middleware xác thực JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token không được cung cấp'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Kiểm tra user còn tồn tại không
        const customer = await CustomerModel.findById(decoded.id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                error: 'Token không hợp lệ - Người dùng không tồn tại'
            });
        }

        // Gắn thông tin user vào request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            type: decoded.type
        };

        next();
    } catch (error) {
        console.error('❌ Lỗi xác thực token:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Token không hợp lệ'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token đã hết hạn'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Lỗi server khi xác thực'
        });
    }
};

// Middleware kiểm tra quyền admin (nếu cần)
const requireAdmin = (req, res, next) => {
    if (req.user.type !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Không có quyền truy cập'
        });
    }
    next();
};

// Middleware tùy chọn - không bắt buộc đăng nhập
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const customer = await CustomerModel.findById(decoded.id);
            
            if (customer) {
                req.user = {
                    id: decoded.id,
                    email: decoded.email,
                    type: decoded.type
                };
            }
        }
        
        next();
    } catch (error) {
        // Nếu có lỗi với token, vẫn tiếp tục nhưng không set user
        next();
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    optionalAuth
};
