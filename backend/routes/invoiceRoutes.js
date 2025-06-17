const express = require('express');
const router = express.Router();

console.log('🔧 Loading InvoiceController...');
const InvoiceController = require('../controllers/InvoiceController');
console.log('✅ InvoiceController loaded');

console.log('🔧 Loading auth middleware...');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
console.log('✅ Auth middleware loaded');

console.log('🔧 Loading invoice validation...');
const {
    validateCreateInvoice,
    validateUpdateStatus,
    validateGetById,
    validatePagination,
    validateInvoiceFilters,
    validateStatistics,
    validateCancelInvoice
} = require('../middleware/invoiceValidation');
console.log('✅ Invoice validation loaded');

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       properties:
 *         id_hoa_don:
 *           type: integer
 *           description: ID hóa đơn
 *         id_khach:
 *           type: integer
 *           description: ID khách hàng
 *         ngay_tao:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo hóa đơn
 *         loai_don:
 *           type: string
 *           enum: [tai_cho, giao_hang]
 *           description: Loại đơn hàng
 *         trang_thai:
 *           type: string
 *           enum: [cho_xac_nhan, dang_phuc_vu, hoan_thanh, da_huy]
 *           description: Trạng thái hóa đơn
 *         tong_tien:
 *           type: number
 *           format: decimal
 *           description: Tổng tiền hóa đơn
 *         dia_chi_giao_hang:
 *           type: string
 *           description: Địa chỉ giao hàng (nếu có)
 *         ghi_chu:
 *           type: string
 *           description: Ghi chú
 *         chi_tiet:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InvoiceDetail'
 *     
 *     InvoiceDetail:
 *       type: object
 *       properties:
 *         id_chi_tiet:
 *           type: integer
 *           description: ID chi tiết
 *         id_hoa_don:
 *           type: integer
 *           description: ID hóa đơn
 *         id_mon_an:
 *           type: integer
 *           description: ID món ăn
 *         ten_mon:
 *           type: string
 *           description: Tên món ăn
 *         gia:
 *           type: number
 *           format: decimal
 *           description: Giá món ăn
 *         so_luong:
 *           type: integer
 *           description: Số lượng
 *         thanh_tien:
 *           type: number
 *           format: decimal
 *           description: Thành tiền
 *     
 *     CreateInvoiceRequest:
 *       type: object
 *       required:
 *         - loai_don
 *         - tong_tien
 *         - chi_tiet
 *       properties:
 *         loai_don:
 *           type: string
 *           enum: [tai_cho, giao_hang]
 *           description: Loại đơn hàng
 *         tong_tien:
 *           type: number
 *           format: decimal
 *           description: Tổng tiền hóa đơn
 *         dia_chi_giao_hang:
 *           type: string
 *           description: Địa chỉ giao hàng (bắt buộc nếu loai_don = giao_hang)
 *         ghi_chu:
 *           type: string
 *           description: Ghi chú
 *         chi_tiet:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id_mon_an
 *               - ten_mon
 *               - gia
 *               - so_luong
 *             properties:
 *               id_mon_an:
 *                 type: integer
 *                 description: ID món ăn
 *               ten_mon:
 *                 type: string
 *                 description: Tên món ăn
 *               gia:
 *                 type: number
 *                 format: decimal
 *                 description: Giá món ăn
 *               so_luong:
 *                 type: integer
 *                 description: Số lượng
 */

/**
 * @swagger
 * /api/hoa_don:
 *   post:
 *     summary: Tạo hóa đơn mới
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInvoiceRequest'
 *     responses:
 *       201:
 *         description: Tạo hóa đơn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 hoa_don:
 *                   $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 */
// Test route
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Invoice routes working!' });
});

// Đặt routes cụ thể trước routes có params
router.get('/my', authenticateToken, validatePagination, InvoiceController.getMyInvoices);

// Admin routes - đặt trước routes có params
router.get('/admin/all', authenticateToken, requireAdmin, validateInvoiceFilters, InvoiceController.getAllInvoices);
router.get('/admin/statistics', authenticateToken, requireAdmin, validateStatistics, InvoiceController.getInvoiceStatistics);
router.patch('/admin/:id/status', authenticateToken, requireAdmin, validateUpdateStatus, InvoiceController.updateInvoiceStatus);

// Routes có params đặt cuối
router.post('/', authenticateToken, validateCreateInvoice, InvoiceController.createInvoice);
router.get('/:id', authenticateToken, validateGetById, InvoiceController.getInvoiceById);

router.patch('/:id/cancel', authenticateToken, validateCancelInvoice, InvoiceController.cancelInvoice);

module.exports = router;
