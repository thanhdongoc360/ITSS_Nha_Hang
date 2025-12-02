const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const HistoryController = require('../controllers/historyController');
const { authenticateToken } = require('../middleware/auth');

// Tất cả history routes đều cần authentication
router.use(authenticateToken);

/**
 * @route   GET /api/history/recently-viewed
 * @desc    Lấy recently viewed restaurants
 * @access  Private
 */
router.get('/recently-viewed', HistoryController.getRecentlyViewed);

/**
 * @route   GET /api/history/by-action/:action
 * @desc    Lấy history theo action type
 * @access  Private
 */
router.get('/by-action/:action', HistoryController.getByAction);

/**
 * @route   GET /api/history
 * @desc    Lấy tất cả history của user
 * @access  Private
 */
router.get('/', HistoryController.getAll);

/**
 * @route   POST /api/history
 * @desc    Thêm vào history
 * @access  Private
 */
router.post('/', [
  body('restaurantId')
    .notEmpty()
    .withMessage('Restaurant ID is required')
    .isInt()
    .withMessage('Restaurant ID must be an integer'),
  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['view', 'search', 'visit', 'order'])
    .withMessage('Action must be: view, search, visit, or order')
], HistoryController.add);

/**
 * @route   DELETE /api/history/old/:days
 * @desc    Xóa history cũ hơn X ngày
 * @access  Private
 */
router.delete('/old/:days', HistoryController.deleteOld);

/**
 * @route   DELETE /api/history
 * @desc    Xóa tất cả history
 * @access  Private
 */
router.delete('/', HistoryController.deleteAll);

module.exports = router;
