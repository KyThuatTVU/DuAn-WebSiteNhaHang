const InvoiceModel = require('../models/InvoiceModel');
const { validationResult } = require('express-validator');

class InvoiceController {
    // Tạo hóa đơn mới
    static async createInvoice(req, res) {
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

            const { loai_don, tong_tien, dia_chi_giao_hang, ghi_chu, chi_tiet } = req.body;
            const id_khach = req.user.id; // Lấy từ JWT token

            // Kiểm tra dữ liệu bắt buộc
            if (!loai_don || !tong_tien || !chi_tiet || chi_tiet.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Thiếu thông tin bắt buộc'
                });
            }

            // Kiểm tra loại đơn hợp lệ
            if (!['tai_cho', 'giao_hang'].includes(loai_don)) {
                return res.status(400).json({
                    success: false,
                    error: 'Loại đơn không hợp lệ'
                });
            }

            // Nếu là giao hàng thì phải có địa chỉ
            if (loai_don === 'giao_hang' && !dia_chi_giao_hang) {
                return res.status(400).json({
                    success: false,
                    error: 'Địa chỉ giao hàng là bắt buộc cho đơn giao hàng'
                });
            }

            // Tính toán lại tổng tiền để đảm bảo chính xác
            let calculatedTotal = 0;
            for (const item of chi_tiet) {
                if (!item.id_mon_an || !item.ten_mon || !item.gia || !item.so_luong) {
                    return res.status(400).json({
                        success: false,
                        error: 'Thông tin chi tiết món ăn không đầy đủ'
                    });
                }
                
                item.thanh_tien = item.gia * item.so_luong;
                calculatedTotal += item.thanh_tien;
            }

            // Kiểm tra tổng tiền có khớp không (cho phép sai lệch nhỏ do làm tròn)
            if (Math.abs(calculatedTotal - tong_tien) > 0.01) {
                return res.status(400).json({
                    success: false,
                    error: 'Tổng tiền không khớp với chi tiết đơn hàng'
                });
            }

            const invoiceData = {
                id_khach,
                loai_don,
                tong_tien: calculatedTotal,
                dia_chi_giao_hang: loai_don === 'giao_hang' ? dia_chi_giao_hang : null,
                ghi_chu: ghi_chu || null,
                chi_tiet
            };

            const invoice = await InvoiceModel.create(invoiceData);

            res.status(201).json({
                success: true,
                message: 'Tạo hóa đơn thành công',
                hoa_don: invoice
            });

        } catch (error) {
            console.error('❌ Lỗi tạo hóa đơn:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi tạo hóa đơn'
            });
        }
    }

    // Lấy hóa đơn theo ID
    static async getInvoiceById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userType = req.user.type;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID hóa đơn không hợp lệ'
                });
            }

            const invoice = await InvoiceModel.getById(id);

            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy hóa đơn'
                });
            }

            // Kiểm tra quyền truy cập (chỉ chủ hóa đơn hoặc admin mới xem được)
            if (userType !== 'admin' && invoice.id_khach !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Không có quyền truy cập hóa đơn này'
                });
            }

            res.json({
                success: true,
                hoa_don: invoice
            });

        } catch (error) {
            console.error('❌ Lỗi lấy hóa đơn:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy hóa đơn'
            });
        }
    }

    // Lấy danh sách hóa đơn của khách hàng
    static async getMyInvoices(req, res) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            if (page < 1 || limit < 1 || limit > 100) {
                return res.status(400).json({
                    success: false,
                    error: 'Tham số phân trang không hợp lệ'
                });
            }

            const result = await InvoiceModel.getByCustomerId(userId, page, limit);

            res.json({
                success: true,
                message: 'Lấy danh sách hóa đơn thành công',
                ...result
            });

        } catch (error) {
            console.error('❌ Lỗi lấy danh sách hóa đơn:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy danh sách hóa đơn'
            });
        }
    }

    // Cập nhật trạng thái hóa đơn (chỉ admin)
    static async updateInvoiceStatus(req, res) {
        try {
            const { id } = req.params;
            const { trang_thai } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID hóa đơn không hợp lệ'
                });
            }

            const validStatuses = ['cho_xac_nhan', 'dang_phuc_vu', 'hoan_thanh', 'da_huy'];
            if (!validStatuses.includes(trang_thai)) {
                return res.status(400).json({
                    success: false,
                    error: 'Trạng thái không hợp lệ'
                });
            }

            const invoice = await InvoiceModel.updateStatus(id, trang_thai);

            res.json({
                success: true,
                message: 'Cập nhật trạng thái hóa đơn thành công',
                hoa_don: invoice
            });

        } catch (error) {
            console.error('❌ Lỗi cập nhật trạng thái hóa đơn:', error);
            
            if (error.message.includes('Không tìm thấy')) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Lỗi server khi cập nhật trạng thái hóa đơn'
            });
        }
    }

    // Lấy tất cả hóa đơn (admin only)
    static async getAllInvoices(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            // Filters
            const filters = {};
            if (req.query.trang_thai) filters.trang_thai = req.query.trang_thai;
            if (req.query.loai_don) filters.loai_don = req.query.loai_don;
            if (req.query.from_date) filters.from_date = req.query.from_date;
            if (req.query.to_date) filters.to_date = req.query.to_date;

            if (page < 1 || limit < 1 || limit > 100) {
                return res.status(400).json({
                    success: false,
                    error: 'Tham số phân trang không hợp lệ'
                });
            }

            const result = await InvoiceModel.getAll(page, limit, filters);

            res.json({
                success: true,
                message: 'Lấy danh sách hóa đơn thành công',
                ...result
            });

        } catch (error) {
            console.error('❌ Lỗi lấy danh sách hóa đơn (admin):', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy danh sách hóa đơn'
            });
        }
    }

    // Hủy hóa đơn
    static async cancelInvoice(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userType = req.user.type;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID hóa đơn không hợp lệ'
                });
            }

            // Lấy thông tin hóa đơn để kiểm tra quyền
            const invoice = await InvoiceModel.getById(id);
            
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy hóa đơn'
                });
            }

            // Kiểm tra quyền hủy (chỉ chủ hóa đơn hoặc admin)
            if (userType !== 'admin' && invoice.id_khach !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Không có quyền hủy hóa đơn này'
                });
            }

            // Kiểm tra trạng thái có thể hủy không
            if (invoice.trang_thai === 'hoan_thanh') {
                return res.status(400).json({
                    success: false,
                    error: 'Không thể hủy hóa đơn đã hoàn thành'
                });
            }

            if (invoice.trang_thai === 'da_huy') {
                return res.status(400).json({
                    success: false,
                    error: 'Hóa đơn đã được hủy trước đó'
                });
            }

            const cancelledInvoice = await InvoiceModel.delete(id);

            res.json({
                success: true,
                message: 'Hủy hóa đơn thành công',
                hoa_don: cancelledInvoice
            });

        } catch (error) {
            console.error('❌ Lỗi hủy hóa đơn:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi hủy hóa đơn'
            });
        }
    }

    // Thống kê hóa đơn (admin only)
    static async getInvoiceStatistics(req, res) {
        try {
            const filters = {};
            if (req.query.from_date) filters.from_date = req.query.from_date;
            if (req.query.to_date) filters.to_date = req.query.to_date;

            const statistics = await InvoiceModel.getStatistics(filters);

            res.json({
                success: true,
                message: 'Lấy thống kê hóa đơn thành công',
                statistics
            });

        } catch (error) {
            console.error('❌ Lỗi thống kê hóa đơn:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy thống kê hóa đơn'
            });
        }
    }
}

module.exports = InvoiceController;
