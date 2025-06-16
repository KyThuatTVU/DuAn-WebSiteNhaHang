const CustomerModel = require('../models/CustomerModel');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

class CustomerController {
    // Đăng ký khách hàng mới
    static async register(req, res) {
        try {
            // Kiểm tra validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Dữ liệu không hợp lệ',
                    details: errors.array()
                });
            }

            const customerData = req.body;
            
            // Đăng ký khách hàng
            const newCustomer = await CustomerModel.register(customerData);
            
            // Tạo JWT token với thời gian ngắn
            const token = jwt.sign(
                {
                    id: newCustomer.id,
                    email: newCustomer.email,
                    type: 'customer'
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: process.env.JWT_EXPIRES_IN || '5m' }
            );

            // Tạo refresh token
            const refreshToken = jwt.sign(
                {
                    id: newCustomer.id,
                    email: newCustomer.email,
                    type: 'customer',
                    tokenType: 'refresh'
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
            );

            res.status(201).json({
                success: true,
                message: 'Đăng ký thành công',
                khach_hang: newCustomer,
                token,
                refreshToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '5m'
            });

        } catch (error) {
            console.error('❌ Lỗi đăng ký:', error);
            res.status(400).json({
                success: false,
                error: error.message || 'Đăng ký thất bại'
            });
        }
    }

    // Đăng nhập
    static async login(req, res) {
        try {
            // Kiểm tra validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Dữ liệu không hợp lệ',
                    details: errors.array()
                });
            }

            const { email, password } = req.body;
            
            // Đăng nhập
            const customer = await CustomerModel.login(email, password);
            
            // Tạo JWT token với thời gian ngắn
            const token = jwt.sign(
                {
                    id: customer.id,
                    email: customer.email,
                    type: 'customer'
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: process.env.JWT_EXPIRES_IN || '5m' }
            );

            // Tạo refresh token
            const refreshToken = jwt.sign(
                {
                    id: customer.id,
                    email: customer.email,
                    type: 'customer',
                    tokenType: 'refresh'
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
            );

            res.json({
                success: true,
                message: 'Đăng nhập thành công',
                khach_hang: customer,
                token,
                refreshToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '5m'
            });

        } catch (error) {
            console.error('❌ Lỗi đăng nhập:', error);
            res.status(401).json({
                success: false,
                error: error.message || 'Đăng nhập thất bại'
            });
        }
    }

    // Lấy thông tin profile
    static async getProfile(req, res) {
        try {
            const customerId = req.user.id;
            const customer = await CustomerModel.findById(customerId);
            
            if (!customer) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy thông tin khách hàng'
                });
            }

            res.json({
                success: true,
                khach_hang: customer
            });

        } catch (error) {
            console.error('❌ Lỗi lấy profile:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server'
            });
        }
    }

    // Cập nhật thông tin profile
    static async updateProfile(req, res) {
        try {
            // Kiểm tra validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Dữ liệu không hợp lệ',
                    details: errors.array()
                });
            }

            const customerId = req.user.id;
            const updateData = req.body;
            
            const updatedCustomer = await CustomerModel.updateById(customerId, updateData);
            
            res.json({
                success: true,
                message: 'Cập nhật thông tin thành công',
                khach_hang: updatedCustomer
            });

        } catch (error) {
            console.error('❌ Lỗi cập nhật profile:', error);
            res.status(400).json({
                success: false,
                error: error.message || 'Cập nhật thất bại'
            });
        }
    }

    // Đổi mật khẩu
    static async changePassword(req, res) {
        try {
            // Kiểm tra validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Dữ liệu không hợp lệ',
                    details: errors.array()
                });
            }

            const customerId = req.user.id;
            const { oldPassword, newPassword } = req.body;
            
            const result = await CustomerModel.changePassword(customerId, oldPassword, newPassword);
            
            res.json({
                success: true,
                message: result.message
            });

        } catch (error) {
            console.error('❌ Lỗi đổi mật khẩu:', error);
            res.status(400).json({
                success: false,
                error: error.message || 'Đổi mật khẩu thất bại'
            });
        }
    }

    // Logout (chỉ cần xóa token ở client)
    static async logout(req, res) {
        res.json({
            success: true,
            message: 'Đăng xuất thành công'
        });
    }

    // Verify token
    static async verifyToken(req, res) {
        try {
            const customerId = req.user.id;
            const customer = await CustomerModel.findById(customerId);

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    error: 'Token không hợp lệ'
                });
            }

            res.json({
                success: true,
                message: 'Token hợp lệ',
                khach_hang: customer
            });

        } catch (error) {
            console.error('❌ Lỗi verify token:', error);
            res.status(401).json({
                success: false,
                error: 'Token không hợp lệ'
            });
        }
    }

    // Refresh token
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    error: 'Refresh token không được cung cấp'
                });
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key');

            if (decoded.tokenType !== 'refresh') {
                return res.status(401).json({
                    success: false,
                    error: 'Token không hợp lệ'
                });
            }

            // Kiểm tra user còn tồn tại không
            const customer = await CustomerModel.findById(decoded.id);
            if (!customer) {
                return res.status(401).json({
                    success: false,
                    error: 'Người dùng không tồn tại'
                });
            }

            // Tạo token mới
            const newToken = jwt.sign(
                {
                    id: customer.id,
                    email: customer.email,
                    type: 'customer'
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: process.env.JWT_EXPIRES_IN || '5m' }
            );

            res.json({
                success: true,
                message: 'Token đã được làm mới',
                token: newToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '5m'
            });

        } catch (error) {
            console.error('❌ Lỗi refresh token:', error);

            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Refresh token không hợp lệ hoặc đã hết hạn'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Lỗi server'
            });
        }
    }

    // Lấy danh sách khách hàng (cho admin)
    static async getAllCustomers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            const result = await CustomerModel.getAll(page, limit);
            
            res.json({
                success: true,
                ...result
            });

        } catch (error) {
            console.error('❌ Lỗi lấy danh sách khách hàng:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server'
            });
        }
    }
}

module.exports = CustomerController;
