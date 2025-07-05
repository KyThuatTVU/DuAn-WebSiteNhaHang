const mysql = require('mysql2/promise');
const { validationResult } = require('express-validator');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'QuanLyNhaHang',
};

class InvoiceController {
    static async createInvoice(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Dữ liệu không hợp lệ',
                    details: errors.array()
                });
            }

            const { loai_don, tong_tien, dia_chi_giao_hang, ghi_chu, chi_tiet } = req.body;
            const id_khach = req.body.id_khach;
            
            if (!id_khach) {
                return res.status(400).json({
                    success: false,
                    error: 'Thiếu thông tin khách hàng (id_khach)'
                });
            }

            if (!loai_don || !tong_tien || !chi_tiet || chi_tiet.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Thiếu thông tin bắt buộc: loai_don, tong_tien, chi_tiet'
                });
            }

            // Validate chi_tiet
            for (let i = 0; i < chi_tiet.length; i++) {
                const item = chi_tiet[i];
                if (
                    typeof item.id_mon !== 'number' ||
                    typeof item.so_luong !== 'number' ||
                    typeof item.don_gia !== 'number'
                ) {
                    return res.status(400).json({
                        success: false,
                        error: `Chi tiết món ăn không hợp lệ tại vị trí ${i + 1}`
                    });
                }
            }

            if (!['tai_cho', 'giao_hang'].includes(loai_don)) {
                return res.status(400).json({
                    success: false,
                    error: 'Loại đơn không hợp lệ'
                });
            }

            if (loai_don === 'giao_hang' && !dia_chi_giao_hang) {
                return res.status(400).json({
                    success: false,
                    error: 'Địa chỉ giao hàng là bắt buộc cho đơn giao hàng'
                });
            }

            // Tính lại tổng tiền từ chi tiết món
            let calculatedTotal = 0;
            for (const item of chi_tiet) {
                item.thanh_tien = parseFloat((item.don_gia * item.so_luong).toFixed(2));
                calculatedTotal += item.thanh_tien;
            }

            if (Math.abs(calculatedTotal - tong_tien) > 0.01) {
                return res.status(400).json({
                    success: false,
                    error: 'Tổng tiền không khớp với chi tiết đơn hàng'
                });
            }

            // Kết nối database và tạo hóa đơn
            const connection = await mysql.createConnection(dbConfig);

            try {
                await connection.beginTransaction();

                // Insert hóa đơn vào bảng hoa_don
                const [result] = await connection.execute(
                    'INSERT INTO hoa_don (id_khach, loai_don, trang_thai, tong_tien, dia_chi_giao_hang, ghi_chu) VALUES (?, ?, ?, ?, ?, ?)',
                    [
                        id_khach,
                        loai_don,
                        'cho_xac_nhan',
                        calculatedTotal,
                        loai_don === 'giao_hang' ? dia_chi_giao_hang : null,
                        ghi_chu || null
                    ]
                );

                const invoiceId = result.insertId;

                // Insert chi tiết hóa đơn vào bảng chi_tiet_hoa_don
                for (const item of chi_tiet) {
                    await connection.execute(
                        'INSERT INTO chi_tiet_hoa_don (id_hoa_don, id_mon, so_luong, don_gia) VALUES (?, ?, ?, ?)',
                        [
                            invoiceId,
                            item.id_mon,
                            item.so_luong,
                            item.don_gia
                        ]
                    );
                }

                await connection.commit();

                // Lấy hóa đơn vừa tạo để trả về
                const [invoiceRows] = await connection.execute(
                    'SELECT * FROM hoa_don WHERE id_hoa_don = ?',
                    [invoiceId]
                );

                const [detailRows] = await connection.execute(
                    'SELECT * FROM chi_tiet_hoa_don WHERE id_hoa_don = ?',
                    [invoiceId]
                );

                const invoice = invoiceRows[0];
                invoice.chi_tiet = detailRows;

                await connection.end();

                console.log('✅ Hóa đơn đã được lưu vào database:', invoice);

                res.status(201).json({
                    success: true,
                    message: 'Tạo hóa đơn thành công',
                    hoa_don: invoice
                });

            } catch (dbError) {
                await connection.rollback();
                await connection.end();
                throw dbError;
            }

        } catch (error) {
            console.error('❌ Lỗi tạo hóa đơn:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi tạo hóa đơn'
            });
        }
    }

    static async getMyInvoices(req, res) {
        try {
            const connection = await mysql.createConnection(dbConfig);
            
            const [rows] = await connection.execute(
                'SELECT * FROM hoa_don ORDER BY ngay_tao DESC'
            );
            
            await connection.end();
            
            res.status(200).json({
                success: true,
                data: rows,
                message: 'Danh sách hóa đơn'
            });
        } catch (error) {
            console.error('❌ Lỗi lấy danh sách hóa đơn:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy danh sách hóa đơn'
            });
        }
    }

    static async getInvoiceById(req, res) {
        try {
            const { id } = req.params;
            const connection = await mysql.createConnection(dbConfig);
            
            const [invoiceRows] = await connection.execute(
                'SELECT * FROM hoa_don WHERE id_hoa_don = ?',
                [id]
            );
            
            if (invoiceRows.length === 0) {
                await connection.end();
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy hóa đơn'
                });
            }
            
            const [detailRows] = await connection.execute(
                'SELECT * FROM chi_tiet_hoa_don WHERE id_hoa_don = ?',
                [id]
            );
            
            const invoice = invoiceRows[0];
            invoice.chi_tiet = detailRows;
            
            await connection.end();
            
            res.status(200).json({
                success: true,
                data: invoice,
                message: `Hóa đơn ID: ${id}`
            });
        } catch (error) {
            console.error('❌ Lỗi lấy hóa đơn:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy hóa đơn'
            });
        }
    }

    static async updateInvoiceStatus(req, res) {
        try {
            const { id } = req.params;
            const { trang_thai } = req.body;
            
            if (!['cho_xac_nhan', 'dang_phuc_vu', 'hoan_thanh', 'da_huy'].includes(trang_thai)) {
                return res.status(400).json({
                    success: false,
                    error: 'Trạng thái không hợp lệ'
                });
            }
            
            const connection = await mysql.createConnection(dbConfig);
            
            const [result] = await connection.execute(
                'UPDATE hoa_don SET trang_thai = ? WHERE id_hoa_don = ?',
                [trang_thai, id]
            );
            
            await connection.end();
            
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy hóa đơn'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Cập nhật trạng thái thành công'
            });
        } catch (error) {
            console.error('❌ Lỗi cập nhật trạng thái:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi cập nhật trạng thái'
            });
        }
    }

    static async cancelInvoice(req, res) {
        try {
            const { id } = req.params;
            const connection = await mysql.createConnection(dbConfig);
            
            const [result] = await connection.execute(
                'UPDATE hoa_don SET trang_thai = ? WHERE id_hoa_don = ?',
                ['da_huy', id]
            );
            
            await connection.end();
            
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy hóa đơn'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Hủy hóa đơn thành công'
            });
        } catch (error) {
            console.error('❌ Lỗi hủy hóa đơn:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi hủy hóa đơn'
            });
        }
    }

    static async getAllInvoices(req, res) {
        try {
            const connection = await mysql.createConnection(dbConfig);
            
            const [rows] = await connection.execute(
                'SELECT h.*, k.full_name as ten_khach_hang FROM hoa_don h LEFT JOIN khach_hang k ON h.id_khach = k.id ORDER BY h.ngay_tao DESC'
            );
            
            await connection.end();
            
            res.status(200).json({
                success: true,
                data: rows,
                message: 'Danh sách tất cả hóa đơn'
            });
        } catch (error) {
            console.error('❌ Lỗi lấy tất cả hóa đơn:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy tất cả hóa đơn'
            });
        }
    }

    static async getInvoiceStatistics(req, res) {
        try {
            const connection = await mysql.createConnection(dbConfig);
            
            const [stats] = await connection.execute(`
                SELECT 
                    COUNT(*) as tong_hoa_don,
                    SUM(CASE WHEN trang_thai = 'cho_xac_nhan' THEN 1 ELSE 0 END) as cho_xac_nhan,
                    SUM(CASE WHEN trang_thai = 'dang_phuc_vu' THEN 1 ELSE 0 END) as dang_phuc_vu,
                    SUM(CASE WHEN trang_thai = 'hoan_thanh' THEN 1 ELSE 0 END) as hoan_thanh,
                    SUM(CASE WHEN trang_thai = 'da_huy' THEN 1 ELSE 0 END) as da_huy,
                    SUM(CASE WHEN trang_thai = 'hoan_thanh' THEN tong_tien ELSE 0 END) as doanh_thu
                FROM hoa_don
            `);
            
            await connection.end();
            
            res.status(200).json({
                success: true,
                data: stats[0],
                message: 'Thống kê hóa đơn'
            });
        } catch (error) {
            console.error('❌ Lỗi thống kê hóa đơn:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi thống kê hóa đơn'
            });
        }
    }
}

module.exports = InvoiceController;
