const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký user mới
 * @access  Public
 */
router.post('/register', [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
router.post('/login', [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], AuthController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin user hiện tại
 * @access  Private
 */
router.get('/me', authenticateToken, AuthController.getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Đăng xuất
 * @access  Private
 */
router.post('/logout', authenticateToken, AuthController.logout);

module.exports = router;
