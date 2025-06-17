const { pool } = require('../config/database');

class InvoiceModel {
    // Tạo bảng hóa đơn nếu chưa tồn tại
    static async createTable() {
        const createInvoiceTable = `
            CREATE TABLE IF NOT EXISTS hoa_don (
                id_hoa_don INT AUTO_INCREMENT PRIMARY KEY,
                id_khach INT NOT NULL,
                ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                loai_don ENUM('tai_cho','giao_hang') NOT NULL,
                trang_thai ENUM('cho_xac_nhan','dang_phuc_vu','hoan_thanh','da_huy') 
                           NOT NULL DEFAULT 'cho_xac_nhan',
                tong_tien DECIMAL(12,2) NOT NULL,
                dia_chi_giao_hang TEXT,
                ghi_chu TEXT,
                FOREIGN KEY (id_khach) REFERENCES khach_hang(id)
                    ON UPDATE CASCADE ON DELETE RESTRICT
            ) ENGINE=InnoDB
        `;

        const createInvoiceDetailTable = `
            CREATE TABLE IF NOT EXISTS chi_tiet_hoa_don (
                id_chi_tiet INT AUTO_INCREMENT PRIMARY KEY,
                id_hoa_don INT NOT NULL,
                id_mon_an INT NOT NULL,
                ten_mon VARCHAR(255) NOT NULL,
                gia DECIMAL(10,2) NOT NULL,
                so_luong INT NOT NULL,
                thanh_tien DECIMAL(12,2) NOT NULL,
                FOREIGN KEY (id_hoa_don) REFERENCES hoa_don(id_hoa_don)
                    ON UPDATE CASCADE ON DELETE CASCADE
            ) ENGINE=InnoDB
        `;

        try {
            await pool.execute(createInvoiceTable);
            console.log('✅ Bảng hóa đơn đã được tạo/kiểm tra');
            
            await pool.execute(createInvoiceDetailTable);
            console.log('✅ Bảng chi tiết hóa đơn đã được tạo/kiểm tra');
        } catch (error) {
            console.error('❌ Lỗi tạo bảng hóa đơn:', error);
            throw error;
        }
    }

    // Tạo hóa đơn mới
    static async create(invoiceData) {
        const { id_khach, loai_don, tong_tien, dia_chi_giao_hang, ghi_chu, chi_tiet } = invoiceData;
        
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Tạo hóa đơn chính (khớp với cấu trúc database hiện tại)
            const invoiceQuery = `
                INSERT INTO hoa_don (id_khach, loai_don, tong_tien)
                VALUES (?, ?, ?)
            `;

            const [invoiceResult] = await connection.execute(invoiceQuery, [
                id_khach, loai_don, tong_tien
            ]);

            const invoiceId = invoiceResult.insertId;

            // Thêm chi tiết hóa đơn
            if (chi_tiet && chi_tiet.length > 0) {
                const detailQuery = `
                    INSERT INTO chi_tiet_hoa_don (id_hoa_don, id_mon, so_luong, don_gia)
                    VALUES (?, ?, ?, ?)
                `;

                for (const item of chi_tiet) {
                    await connection.execute(detailQuery, [
                        invoiceId,
                        item.id_mon_an || item.id_mon,
                        item.so_luong,
                        item.gia || item.don_gia
                    ]);
                }
            }

            await connection.commit();

            // Lấy hóa đơn vừa tạo với chi tiết
            const invoice = await this.getById(invoiceId);
            return invoice;

        } catch (error) {
            await connection.rollback();
            console.error('❌ Lỗi tạo hóa đơn:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // Lấy hóa đơn theo ID
    static async getById(id) {
        try {
            // Lấy thông tin hóa đơn
            const invoiceQuery = `
                SELECT hd.*, kh.full_name, kh.email, kh.phone
                FROM hoa_don hd
                JOIN khach_hang kh ON hd.id_khach = kh.id
                WHERE hd.id_hoa_don = ?
            `;

            const [invoiceRows] = await pool.execute(invoiceQuery, [id]);
            
            if (invoiceRows.length === 0) {
                return null;
            }

            const invoice = invoiceRows[0];

            // Lấy chi tiết hóa đơn (khớp với cấu trúc database hiện tại)
            const detailQuery = `
                SELECT * FROM chi_tiet_hoa_don
                WHERE id_hoa_don = ?
                ORDER BY id_ct
            `;

            const [detailRows] = await pool.execute(detailQuery, [id]);
            invoice.chi_tiet = detailRows;

            return invoice;

        } catch (error) {
            console.error('❌ Lỗi lấy hóa đơn theo ID:', error);
            throw error;
        }
    }

    // Lấy danh sách hóa đơn của khách hàng
    static async getByCustomerId(customerId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;

            const query = `
                SELECT hd.*, kh.full_name
                FROM hoa_don hd
                JOIN khach_hang kh ON hd.id_khach = kh.id
                WHERE hd.id_khach = ?
                ORDER BY hd.ngay_tao DESC
                LIMIT ? OFFSET ?
            `;

            const [rows] = await pool.execute(query, [customerId, limit, offset]);

            // Đếm tổng số hóa đơn
            const countQuery = `SELECT COUNT(*) as total FROM hoa_don WHERE id_khach = ?`;
            const [countResult] = await pool.execute(countQuery, [customerId]);
            const total = countResult[0].total;

            return {
                invoices: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            console.error('❌ Lỗi lấy hóa đơn theo khách hàng:', error);
            throw error;
        }
    }

    // Cập nhật trạng thái hóa đơn
    static async updateStatus(id, trang_thai) {
        try {
            const query = `
                UPDATE hoa_don 
                SET trang_thai = ?
                WHERE id_hoa_don = ?
            `;

            const [result] = await pool.execute(query, [trang_thai, id]);

            if (result.affectedRows === 0) {
                throw new Error('Không tìm thấy hóa đơn để cập nhật');
            }

            return await this.getById(id);

        } catch (error) {
            console.error('❌ Lỗi cập nhật trạng thái hóa đơn:', error);
            throw error;
        }
    }

    // Lấy tất cả hóa đơn (cho admin)
    static async getAll(page = 1, limit = 10, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            let whereClause = '';
            let queryParams = [];

            // Xây dựng điều kiện lọc
            if (filters.trang_thai) {
                whereClause += ' WHERE hd.trang_thai = ?';
                queryParams.push(filters.trang_thai);
            }

            if (filters.loai_don) {
                whereClause += whereClause ? ' AND hd.loai_don = ?' : ' WHERE hd.loai_don = ?';
                queryParams.push(filters.loai_don);
            }

            if (filters.from_date) {
                whereClause += whereClause ? ' AND hd.ngay_tao >= ?' : ' WHERE hd.ngay_tao >= ?';
                queryParams.push(filters.from_date);
            }

            if (filters.to_date) {
                whereClause += whereClause ? ' AND hd.ngay_tao <= ?' : ' WHERE hd.ngay_tao <= ?';
                queryParams.push(filters.to_date);
            }

            const query = `
                SELECT hd.*, kh.full_name, kh.email, kh.phone
                FROM hoa_don hd
                JOIN khach_hang kh ON hd.id_khach = kh.id
                ${whereClause}
                ORDER BY hd.ngay_tao DESC
                LIMIT ? OFFSET ?
            `;

            queryParams.push(limit, offset);
            const [rows] = await pool.execute(query, queryParams);

            // Đếm tổng số hóa đơn
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM hoa_don hd
                JOIN khach_hang kh ON hd.id_khach = kh.id
                ${whereClause}
            `;
            
            const countParams = queryParams.slice(0, -2); // Loại bỏ limit và offset
            const [countResult] = await pool.execute(countQuery, countParams);
            const total = countResult[0].total;

            return {
                invoices: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            console.error('❌ Lỗi lấy danh sách hóa đơn:', error);
            throw error;
        }
    }

    // Xóa hóa đơn (soft delete - chuyển trạng thái thành da_huy)
    static async delete(id) {
        try {
            return await this.updateStatus(id, 'da_huy');
        } catch (error) {
            console.error('❌ Lỗi xóa hóa đơn:', error);
            throw error;
        }
    }

    // Thống kê hóa đơn
    static async getStatistics(filters = {}) {
        try {
            let whereClause = '';
            let queryParams = [];

            if (filters.from_date) {
                whereClause += ' WHERE ngay_tao >= ?';
                queryParams.push(filters.from_date);
            }

            if (filters.to_date) {
                whereClause += whereClause ? ' AND ngay_tao <= ?' : ' WHERE ngay_tao <= ?';
                queryParams.push(filters.to_date);
            }

            const query = `
                SELECT 
                    COUNT(*) as total_invoices,
                    SUM(CASE WHEN trang_thai = 'hoan_thanh' THEN tong_tien ELSE 0 END) as total_revenue,
                    COUNT(CASE WHEN trang_thai = 'cho_xac_nhan' THEN 1 END) as pending_invoices,
                    COUNT(CASE WHEN trang_thai = 'dang_phuc_vu' THEN 1 END) as processing_invoices,
                    COUNT(CASE WHEN trang_thai = 'hoan_thanh' THEN 1 END) as completed_invoices,
                    COUNT(CASE WHEN trang_thai = 'da_huy' THEN 1 END) as cancelled_invoices,
                    COUNT(CASE WHEN loai_don = 'tai_cho' THEN 1 END) as dine_in_orders,
                    COUNT(CASE WHEN loai_don = 'giao_hang' THEN 1 END) as delivery_orders
                FROM hoa_don
                ${whereClause}
            `;

            const [rows] = await pool.execute(query, queryParams);
            return rows[0];

        } catch (error) {
            console.error('❌ Lỗi thống kê hóa đơn:', error);
            throw error;
        }
    }
}

module.exports = InvoiceModel;
