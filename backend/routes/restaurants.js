const express = require('express');
const router = express.Router();
const RestaurantController = require('../controllers/restaurantController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/restaurants/cuisines
 * @desc    Lấy danh sách cuisine types
 * @access  Public
 */
router.get('/cuisines', RestaurantController.getCuisines);

/**
 * @route   GET /api/restaurants/popular
 * @desc    Lấy popular restaurants
 * @access  Public
 */
router.get('/popular', RestaurantController.getPopular);

/**
 * @route   GET /api/restaurants/nearby
 * @desc    Lấy nearby restaurants
 * @access  Public
 */
router.get('/nearby', RestaurantController.getNearby);

/**
 * @route   GET /api/restaurants/recommendations
 * @desc    Lấy recommendations cho user
 * @access  Private
 */
router.get('/recommendations', authenticateToken, RestaurantController.getRecommendations);

/**
 * @route   GET /api/restaurants/search
 * @desc    Tìm kiếm restaurants
 * @access  Public (with optional auth for history)
 */
router.get('/search', optionalAuth, RestaurantController.search);

/**
 * @route   GET /api/restaurants/:id
 * @desc    Lấy chi tiết restaurant
 * @access  Public (with optional auth for favorites/history)
 */
router.get('/:id', optionalAuth, RestaurantController.getById);

/**
 * @route   GET /api/restaurants
 * @desc    Lấy danh sách restaurants với filters
 * @access  Public (with optional auth for favorites)
 */
router.get('/', optionalAuth, RestaurantController.getAll);

module.exports = router;
