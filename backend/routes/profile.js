const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ProfileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

// Tất cả profile routes đều cần authentication
router.use(authenticateToken);

/**
 * @route   GET /api/profile/stats
 * @desc    Lấy statistics của user
 * @access  Private
 */
router.get('/stats', ProfileController.getStats);

/**
 * @route   GET /api/profile/preferences
 * @desc    Lấy preferences của user
 * @access  Private
 */
router.get('/preferences', ProfileController.getPreferences);

/**
 * @route   PUT /api/profile/preferences
 * @desc    Cập nhật preferences
 * @access  Private
 */
router.put('/preferences', [
  body('max_distance')
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage('max_distance must be between 0 and 10000'),
  body('max_walk_time')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('max_walk_time must be between 0 and 120'),
  body('cuisine_types')
    .optional()
    .isArray()
    .withMessage('cuisine_types must be an array'),
  body('price_range')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('price_range must be an array with 2 elements [min, max]')
], ProfileController.updatePreferences);

/**
 * @route   DELETE /api/profile/preferences
 * @desc    Xóa preferences
 * @access  Private
 */
router.delete('/preferences', ProfileController.deletePreferences);

/**
 * @route   GET /api/profile
 * @desc    Lấy profile của user
 * @access  Private
 */
router.get('/', ProfileController.getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Cập nhật profile
 * @access  Private
 */
router.put('/', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
], ProfileController.updateProfile);

module.exports = router;
