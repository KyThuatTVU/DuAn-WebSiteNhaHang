const CustomerModel = require('../models/CustomerModel');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

class CustomerController {
    // Đăng ký khách hàng mới
    static async register(req, res) {
        try {
            console.log('📝 Register request body:', req.body);

            // Kiểm tra validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('❌ Validation errors:', errors.array());
                return res.status(400).json({
                    success: false,
                    error: 'Dữ liệu không hợp lệ',
                    details: errors.array()
                });
            }

            const customerData = req.body;
            
            // Đăng ký khách hàng
            const newCustomer = await CustomerModel.register(customerData);
            
            // Tạo JWT token với thời hạn 5 phút
            const token = jwt.sign(
                {
                    id: newCustomer.id,
                    email: newCustomer.email,
                    full_name: newCustomer.full_name,
                    type: 'customer'
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '5m' }
            );

            res.status(201).json({
                success: true,
                message: 'Đăng ký thành công',
                khach_hang: newCustomer,
                token
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
            
            // Tạo JWT token với thời hạn 5 phút
            const token = jwt.sign(
                {
                    id: customer.id,
                    email: customer.email,
                    full_name: customer.full_name,
                    type: 'customer'
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '5m' }
            );

            res.json({
                success: true,
                message: 'Đăng nhập thành công',
                khach_hang: customer,
                token
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

    // Đăng nhập bằng mạng xã hội
    static async socialLogin(req, res) {
        try {
            const { provider, providerId, email, full_name, avatar, phone, verified } = req.body;

            if (!provider || !providerId || !email || !full_name) {
                return res.status(400).json({
                    success: false,
                    error: 'Thiếu thông tin bắt buộc từ mạng xã hội'
                });
            }

            // Kiểm tra xem user đã tồn tại chưa (theo email hoặc social ID)
            let customer = await CustomerModel.findByEmail(email);

            if (!customer) {
                // Tạo user mới từ thông tin social
                const newCustomerData = {
                    full_name,
                    email,
                    phone: phone || '0000000000', // Số điện thoại mặc định
                    password: Math.random().toString(36).substring(2, 15), // Random password
                    provider,
                    provider_id: providerId,
                    avatar,
                    verified: verified || false
                };

                customer = await CustomerModel.createSocialUser(newCustomerData);
            } else {
                // Cập nhật thông tin social nếu chưa có
                await CustomerModel.updateSocialInfo(customer.id, {
                    provider,
                    provider_id: providerId,
                    avatar
                });
            }

            // Tạo JWT token
            const token = jwt.sign(
                {
                    id: customer.id,
                    email: customer.email,
                    full_name: customer.full_name,
                    type: 'customer'
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '5m' }
            );

            res.json({
                success: true,
                message: 'Đăng nhập thành công',
                khach_hang: customer,
                token
            });

        } catch (error) {
            console.error('❌ Lỗi đăng nhập social:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Lỗi server'
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
