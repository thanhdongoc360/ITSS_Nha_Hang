const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/reviews/restaurant/:restaurantId - Lấy tất cả reviews của nhà hàng (public)
router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);

// Routes yêu cầu authentication
router.use(authenticateToken);

// POST /api/reviews - Tạo hoặc cập nhật review
router.post('/', reviewController.createOrUpdateReview);

// GET /api/reviews/my-review/:restaurantId - Lấy review của user cho nhà hàng
router.get('/my-review/:restaurantId', reviewController.getUserReviewForRestaurant);

// GET /api/reviews/my-reviews - Lấy tất cả reviews của user
router.get('/my-reviews', reviewController.getUserReviews);

// DELETE /api/reviews/:reviewId - Xóa review
router.delete('/:reviewId', reviewController.deleteReview);

module.exports = router;
