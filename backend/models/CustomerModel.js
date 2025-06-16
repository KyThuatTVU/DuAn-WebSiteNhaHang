const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class CustomerModel {
    // Tạo bảng khách hàng nếu chưa tồn tại (theo cấu trúc có sẵn)
    static async createTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS khach_hang (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                phone VARCHAR(20) NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        `;

        try {
            await pool.execute(query);
            console.log('✅ Bảng khách hàng đã được tạo/kiểm tra');
        } catch (error) {
            console.error('❌ Lỗi tạo bảng khách hàng:', error);
            throw error;
        }
    }

    // Đăng ký khách hàng mới
    static async register(customerData) {
        const { full_name, email, phone, password } = customerData;

        try {
            // Kiểm tra email đã tồn tại chưa
            const existingCustomer = await this.findByEmail(email);
            if (existingCustomer) {
                throw new Error('Email đã được sử dụng');
            }

            // Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, 12);

            const query = `
                INSERT INTO khach_hang (full_name, email, phone, password)
                VALUES (?, ?, ?, ?)
            `;

            const [result] = await pool.execute(query, [
                full_name, email, phone, hashedPassword
            ]);

            // Lấy thông tin khách hàng vừa tạo (không bao gồm mật khẩu)
            const newCustomer = await this.findById(result.insertId);
            return newCustomer;

        } catch (error) {
            console.error('❌ Lỗi đăng ký khách hàng:', error);
            throw error;
        }
    }

    // Đăng nhập
    static async login(email, password) {
        try {
            const customer = await this.findByEmail(email, true); // Include password
            if (!customer) {
                throw new Error('Email hoặc mật khẩu không đúng');
            }

            // Kiểm tra mật khẩu
            const isValidPassword = await bcrypt.compare(password, customer.password);
            if (!isValidPassword) {
                throw new Error('Email hoặc mật khẩu không đúng');
            }

            // Trả về thông tin khách hàng (không bao gồm mật khẩu)
            delete customer.password;
            return customer;

        } catch (error) {
            console.error('❌ Lỗi đăng nhập:', error);
            throw error;
        }
    }

    // Tìm khách hàng theo email
    static async findByEmail(email, includePassword = false) {
        try {
            const fields = includePassword
                ? '*'
                : 'id, full_name, email, phone, created_at';

            const query = `SELECT ${fields} FROM khach_hang WHERE email = ?`;
            const [rows] = await pool.execute(query, [email]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('❌ Lỗi tìm khách hàng theo email:', error);
            throw error;
        }
    }

    // Tìm khách hàng theo ID
    static async findById(id) {
        try {
            const query = `
                SELECT id, full_name, email, phone, created_at
                FROM khach_hang
                WHERE id = ?
            `;
            const [rows] = await pool.execute(query, [id]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('❌ Lỗi tìm khách hàng theo ID:', error);
            throw error;
        }
    }

    // Cập nhật thông tin khách hàng
    static async updateById(id, updateData) {
        try {
            const allowedFields = ['full_name', 'phone'];
            const updateFields = [];
            const updateValues = [];

            // Chỉ cập nhật các trường được phép
            for (const [key, value] of Object.entries(updateData)) {
                if (allowedFields.includes(key) && value !== undefined) {
                    updateFields.push(`${key} = ?`);
                    updateValues.push(value);
                }
            }

            if (updateFields.length === 0) {
                throw new Error('Không có dữ liệu để cập nhật');
            }

            updateValues.push(id);
            const query = `UPDATE khach_hang SET ${updateFields.join(', ')} WHERE id = ?`;

            const [result] = await pool.execute(query, updateValues);

            if (result.affectedRows === 0) {
                throw new Error('Không tìm thấy khách hàng để cập nhật');
            }

            return await this.findById(id);
        } catch (error) {
            console.error('❌ Lỗi cập nhật khách hàng:', error);
            throw error;
        }
    }

    // Đổi mật khẩu
    static async changePassword(id, oldPassword, newPassword) {
        try {
            // Lấy thông tin khách hàng bao gồm mật khẩu
            const query = `SELECT * FROM khach_hang WHERE id = ?`;
            const [rows] = await pool.execute(query, [id]);

            if (rows.length === 0) {
                throw new Error('Không tìm thấy khách hàng');
            }

            const customer = rows[0];

            // Kiểm tra mật khẩu cũ
            const isValidOldPassword = await bcrypt.compare(oldPassword, customer.password);
            if (!isValidOldPassword) {
                throw new Error('Mật khẩu cũ không đúng');
            }

            // Mã hóa mật khẩu mới
            const hashedNewPassword = await bcrypt.hash(newPassword, 12);

            // Cập nhật mật khẩu
            const updateQuery = `UPDATE khach_hang SET password = ? WHERE id = ?`;
            await pool.execute(updateQuery, [hashedNewPassword, id]);

            return { success: true, message: 'Đổi mật khẩu thành công' };
        } catch (error) {
            console.error('❌ Lỗi đổi mật khẩu:', error);
            throw error;
        }
    }

    // Lấy danh sách tất cả khách hàng (cho admin)
    static async getAll(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;

            const query = `
                SELECT id, full_name, email, phone, created_at
                FROM khach_hang
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;

            const [rows] = await pool.execute(query, [limit, offset]);

            // Đếm tổng số khách hàng
            const countQuery = `SELECT COUNT(*) as total FROM khach_hang`;
            const [countResult] = await pool.execute(countQuery);
            const total = countResult[0].total;

            return {
                customers: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Lỗi lấy danh sách khách hàng:', error);
            throw error;
        }
    }
}

module.exports = CustomerModel;
