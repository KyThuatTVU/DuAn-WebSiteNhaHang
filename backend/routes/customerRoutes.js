// Customer Routes - Authentication & User Management
const express = require('express');
const router = express.Router();
const { authenticateToken, authEndpoints } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - ho_ten
 *         - email
 *         - mat_khau
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *         ho_ten:
 *           type: string
 *           description: Full name
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         so_dien_thoai:
 *           type: string
 *           description: Phone number
 *         dia_chi:
 *           type: string
 *           description: Address
 *         ngay_tao:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         trang_thai:
 *           type: string
 *           enum: [active, inactive]
 *           description: User status
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - ho_ten
 *         - email
 *         - mat_khau
 *       properties:
 *         ho_ten:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         mat_khau:
 *           type: string
 *         so_dien_thoai:
 *           type: string
 *         dia_chi:
 *           type: string
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         khach_hang:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *         refreshToken:
 *           type: string
 *         expiresIn:
 *           type: string
 */

/**
 * @swagger
 * /api/khach_hang/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - validation error
 *       500:
 *         description: Internal server error
 */
router.post('/register', authEndpoints.register);

/**
 * @swagger
 * /api/khach_hang/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', authEndpoints.login);

/**
 * @swagger
 * /api/khach_hang/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */
router.post('/refresh', authEndpoints.refresh);

/**
 * @swagger
 * /api/khach_hang/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/profile', authenticateToken, authEndpoints.profile);

/**
 * @swagger
 * /api/khach_hang/profile:
 *   put:
 *     summary: Cập nhật thông tin profile
 *     description: Cập nhật thông tin cá nhân của khách hàng đã đăng nhập
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ho_ten:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               so_dien_thoai:
 *                 type: string
 *                 example: "0987654321"
 *               dia_chi:
 *                 type: string
 *                 example: "123 Đường ABC, TP.HCM"
 *     responses:
 *       200:
 *         description: Cập nhật profile thành công
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { ho_ten, so_dien_thoai, dia_chi } = req.body;

    // Validation
    if (so_dien_thoai) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(so_dien_thoai)) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại không hợp lệ'
        });
      }
    }

    // Mock update (in real app, would update database)
    const updatedProfile = {
      id: userId,
      ho_ten: ho_ten || req.user.ho_ten,
      email: req.user.email, // Email không thay đổi
      so_dien_thoai: so_dien_thoai || req.user.so_dien_thoai,
      dia_chi: dia_chi || req.user.dia_chi,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: updatedProfile,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật profile',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/khach_hang/profile:
 *   delete:
 *     summary: Xóa tài khoản
 *     description: Xóa tài khoản khách hàng (soft delete)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa tài khoản thành công
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Mock deletion (in real app, would soft delete from database)
    res.json({
      success: true,
      message: 'Xóa tài khoản thành công',
      data: {
        id: userId,
        deleted_at: new Date().toISOString(),
        status: 'deleted'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa tài khoản',
      error: error.message
    });
  }
});

module.exports = router;
