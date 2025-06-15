const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/CustomerController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
    validateRegister,
    validateLogin,
    validateUpdateProfile,
    validateChangePassword
} = require('../middleware/customerValidation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID khách hàng
 *         full_name:
 *           type: string
 *           description: Họ tên khách hàng
 *         email:
 *           type: string
 *           description: Email khách hàng
 *         phone:
 *           type: string
 *           description: Số điện thoại
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo tài khoản
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - full_name
 *         - email
 *         - phone
 *         - password
 *         - confirmPassword
 *       properties:
 *         full_name:
 *           type: string
 *           description: Họ tên khách hàng
 *         email:
 *           type: string
 *           description: Email khách hàng
 *         phone:
 *           type: string
 *           description: Số điện thoại
 *         password:
 *           type: string
 *           description: Mật khẩu
 *         confirmPassword:
 *           type: string
 *           description: Xác nhận mật khẩu
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: Email khách hàng
 *         password:
 *           type: string
 *           description: Mật khẩu
 */

/**
 * @swagger
 * /api/khach_hang/register:
 *   post:
 *     summary: Đăng ký tài khoản khách hàng
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 khach_hang:
 *                   $ref: '#/components/schemas/Customer'
 *                 token:
 *                   type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/register', validateRegister, CustomerController.register);

/**
 * @swagger
 * /api/khach_hang/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 khach_hang:
 *                   $ref: '#/components/schemas/Customer'
 *                 token:
 *                   type: string
 *       401:
 *         description: Email hoặc mật khẩu không đúng
 */
router.post('/login', validateLogin, CustomerController.login);

/**
 * @swagger
 * /api/khach_hang/social-login:
 *   post:
 *     summary: Đăng nhập bằng mạng xã hội
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - providerId
 *               - email
 *               - full_name
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [google, facebook]
 *                 description: Nhà cung cấp dịch vụ
 *               providerId:
 *                 type: string
 *                 description: ID từ nhà cung cấp
 *               email:
 *                 type: string
 *                 description: Email từ mạng xã hội
 *               full_name:
 *                 type: string
 *                 description: Tên đầy đủ
 *               avatar:
 *                 type: string
 *                 description: URL avatar
 *               phone:
 *                 type: string
 *                 description: Số điện thoại (tùy chọn)
 *               verified:
 *                 type: boolean
 *                 description: Trạng thái xác thực
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 khach_hang:
 *                   $ref: '#/components/schemas/Customer'
 *                 token:
 *                   type: string
 */
router.post('/social-login', CustomerController.socialLogin);

/**
 * @swagger
 * /api/khach_hang/logout:
 *   post:
 *     summary: Đăng xuất
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 */
router.post('/logout', authenticateToken, CustomerController.logout);

/**
 * @swagger
 * /api/khach_hang/profile:
 *   get:
 *     summary: Lấy thông tin profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 khach_hang:
 *                   $ref: '#/components/schemas/Customer'
 */
router.get('/profile', authenticateToken, CustomerController.getProfile);

/**
 * @swagger
 * /api/khach_hang/profile:
 *   put:
 *     summary: Cập nhật thông tin profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/profile', authenticateToken, validateUpdateProfile, CustomerController.updateProfile);

/**
 * @swagger
 * /api/khach_hang/change-password:
 *   put:
 *     summary: Đổi mật khẩu
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmNewPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 */
router.put('/change-password', authenticateToken, validateChangePassword, CustomerController.changePassword);

/**
 * @swagger
 * /api/khach_hang/verify:
 *   get:
 *     summary: Xác thực token
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token hợp lệ
 */
router.get('/verify', authenticateToken, CustomerController.verifyToken);

/**
 * @swagger
 * /api/khach_hang/all:
 *   get:
 *     summary: Lấy danh sách khách hàng (Admin only)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng mỗi trang
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get('/all', authenticateToken, requireAdmin, CustomerController.getAllCustomers);

module.exports = router;
