const { body } = require('express-validator');

// Validation cho đăng ký
const validateRegister = [
    body('full_name')
        .trim()
        .notEmpty()
        .withMessage('Họ tên không được để trống')
        .isLength({ min: 2, max: 255 })
        .withMessage('Họ tên phải từ 2-255 ký tự'),
    
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email không được để trống')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Số điện thoại không được để trống')
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại phải có 10-11 chữ số'),
    
    body('password')
        .notEmpty()
        .withMessage('Mật khẩu không được để trống')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),

    body('confirmPassword')
        .notEmpty()
        .withMessage('Xác nhận mật khẩu không được để trống')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Xác nhận mật khẩu không khớp');
            }
            return true;
        })
];

// Validation cho đăng nhập
const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email không được để trống')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Mật khẩu không được để trống')
];

// Validation cho cập nhật profile
const validateUpdateProfile = [
    body('full_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Họ tên phải từ 2-255 ký tự'),
    
    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại phải có 10-11 chữ số')
];

// Validation cho đổi mật khẩu
const validateChangePassword = [
    body('oldPassword')
        .notEmpty()
        .withMessage('Mật khẩu cũ không được để trống'),
    
    body('newPassword')
        .notEmpty()
        .withMessage('Mật khẩu mới không được để trống')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu mới phải có ít nhất 1 chữ thường, 1 chữ hoa và 1 số'),
    
    body('confirmNewPassword')
        .notEmpty()
        .withMessage('Xác nhận mật khẩu mới không được để trống')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Xác nhận mật khẩu mới không khớp');
            }
            return true;
        })
];

module.exports = {
    validateRegister,
    validateLogin,
    validateUpdateProfile,
    validateChangePassword
};
