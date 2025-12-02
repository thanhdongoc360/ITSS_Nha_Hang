const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/auth');

// Tất cả favorite routes đều cần authentication
router.use(authenticateToken);

/**
 * @route   GET /api/favorites
 * @desc    Lấy tất cả favorites của user
 * @access  Private
 */
router.get('/', FavoriteController.getAll);

/**
 * @route   GET /api/favorites/:id/check
 * @desc    Check nếu restaurant đã được favorite
 * @access  Private
 */
router.get('/:id/check', FavoriteController.check);

/**
 * @route   PUT /api/favorites/:id/toggle
 * @desc    Toggle favorite status
 * @access  Private
 */
router.put('/:id/toggle', FavoriteController.toggle);

/**
 * @route   POST /api/favorites/:id
 * @desc    Thêm restaurant vào favorites
 * @access  Private
 */
router.post('/:id', FavoriteController.add);

/**
 * @route   DELETE /api/favorites/:id
 * @desc    Xóa restaurant khỏi favorites
 * @access  Private
 */
router.delete('/:id', FavoriteController.remove);

module.exports = router;
