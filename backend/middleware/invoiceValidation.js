const { body, param, query } = require('express-validator');

// Validation cho tạo hóa đơn
const validateCreateInvoice = [
    body('loai_don')
        .notEmpty()
        .withMessage('Loại đơn không được để trống')
        .isIn(['tai_cho', 'giao_hang'])
        .withMessage('Loại đơn phải là "tai_cho" hoặc "giao_hang"'),
    
    body('tong_tien')
        .notEmpty()
        .withMessage('Tổng tiền không được để trống')
        .isFloat({ min: 0 })
        .withMessage('Tổng tiền phải là số dương'),
    
    body('dia_chi_giao_hang')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Địa chỉ giao hàng không được quá 500 ký tự'),
    
    body('ghi_chu')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Ghi chú không được quá 1000 ký tự'),
    
    body('chi_tiet')
        .isArray({ min: 1 })
        .withMessage('Chi tiết hóa đơn phải là mảng và có ít nhất 1 món'),
    
    body('chi_tiet.*.id_mon_an')
        .notEmpty()
        .withMessage('ID món ăn không được để trống')
        .isInt({ min: 1 })
        .withMessage('ID món ăn phải là số nguyên dương'),
    
    body('chi_tiet.*.ten_mon')
        .notEmpty()
        .withMessage('Tên món không được để trống')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Tên món phải từ 1-255 ký tự'),
    
    body('chi_tiet.*.gia')
        .notEmpty()
        .withMessage('Giá món không được để trống')
        .isFloat({ min: 0 })
        .withMessage('Giá món phải là số dương'),
    
    body('chi_tiet.*.so_luong')
        .notEmpty()
        .withMessage('Số lượng không được để trống')
        .isInt({ min: 1 })
        .withMessage('Số lượng phải là số nguyên dương'),

    // Custom validation cho địa chỉ giao hàng khi loại đơn là giao_hang
    body().custom((value) => {
        if (value.loai_don === 'giao_hang' && !value.dia_chi_giao_hang) {
            throw new Error('Địa chỉ giao hàng là bắt buộc cho đơn giao hàng');
        }
        return true;
    })
];

// Validation cho cập nhật trạng thái hóa đơn
const validateUpdateStatus = [
    param('id')
        .notEmpty()
        .withMessage('ID hóa đơn không được để trống')
        .isInt({ min: 1 })
        .withMessage('ID hóa đơn phải là số nguyên dương'),
    
    body('trang_thai')
        .notEmpty()
        .withMessage('Trạng thái không được để trống')
        .isIn(['cho_xac_nhan', 'dang_phuc_vu', 'hoan_thanh', 'da_huy'])
        .withMessage('Trạng thái không hợp lệ')
];

// Validation cho lấy hóa đơn theo ID
const validateGetById = [
    param('id')
        .notEmpty()
        .withMessage('ID hóa đơn không được để trống')
        .isInt({ min: 1 })
        .withMessage('ID hóa đơn phải là số nguyên dương')
];

// Validation cho phân trang
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Số trang phải là số nguyên dương'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Giới hạn phải từ 1-100')
];

// Validation cho filter hóa đơn
const validateInvoiceFilters = [
    ...validatePagination,
    
    query('trang_thai')
        .optional()
        .isIn(['cho_xac_nhan', 'dang_phuc_vu', 'hoan_thanh', 'da_huy'])
        .withMessage('Trạng thái filter không hợp lệ'),
    
    query('loai_don')
        .optional()
        .isIn(['tai_cho', 'giao_hang'])
        .withMessage('Loại đơn filter không hợp lệ'),
    
    query('from_date')
        .optional()
        .isISO8601()
        .withMessage('Ngày bắt đầu phải có định dạng ISO8601 (YYYY-MM-DD)'),
    
    query('to_date')
        .optional()
        .isISO8601()
        .withMessage('Ngày kết thúc phải có định dạng ISO8601 (YYYY-MM-DD)')
        .custom((value, { req }) => {
            if (req.query.from_date && value < req.query.from_date) {
                throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
            }
            return true;
        })
];

// Validation cho thống kê
const validateStatistics = [
    query('from_date')
        .optional()
        .isISO8601()
        .withMessage('Ngày bắt đầu phải có định dạng ISO8601 (YYYY-MM-DD)'),
    
    query('to_date')
        .optional()
        .isISO8601()
        .withMessage('Ngày kết thúc phải có định dạng ISO8601 (YYYY-MM-DD)')
        .custom((value, { req }) => {
            if (req.query.from_date && value < req.query.from_date) {
                throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
            }
            return true;
        })
];

// Validation cho hủy hóa đơn
const validateCancelInvoice = [
    param('id')
        .notEmpty()
        .withMessage('ID hóa đơn không được để trống')
        .isInt({ min: 1 })
        .withMessage('ID hóa đơn phải là số nguyên dương')
];

module.exports = {
    validateCreateInvoice,
    validateUpdateStatus,
    validateGetById,
    validatePagination,
    validateInvoiceFilters,
    validateStatistics,
    validateCancelInvoice
};
