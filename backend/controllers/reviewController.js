const Review = require('../models/Review');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Tạo review mới hoặc cập nhật review cũ
 */
exports.createOrUpdateReview = async (req, res) => {
  try {
    const { restaurantId, rating, comment } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating phải từ 1 đến 5', 400);
    }

    // Kiểm tra xem user đã review nhà hàng này chưa
    const existingReview = await Review.getUserReviewForRestaurant(userId, restaurantId);

    if (existingReview) {
      // Cập nhật review cũ
      await Review.update(existingReview.id, userId, { rating, comment });
      return successResponse(res, 200, 'Cập nhật đánh giá thành công');
    } else {
      // Tạo review mới
      const reviewId = await Review.create({
        userId,
        restaurantId,
        rating,
        comment
      });
      return successResponse(res, 201, 'Tạo đánh giá thành công', { id: reviewId });
    }
  } catch (error) {
    console.error('Error creating/updating review:', error);
    return errorResponse(res, 'Lỗi khi tạo đánh giá', 500);
  }
};

/**
 * Lấy tất cả reviews của một nhà hàng
 */
exports.getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const reviews = await Review.getByRestaurantId(restaurantId);
    const stats = await Review.getRestaurantRatingStats(restaurantId);
    
    return successResponse(res, 200, 'Reviews retrieved successfully', {
      reviews,
      stats: {
        averageRating: parseFloat(stats.average_rating) || 0,
        totalReviews: parseInt(stats.total_reviews) || 0,
        distribution: {
          5: parseInt(stats.five_star) || 0,
          4: parseInt(stats.four_star) || 0,
          3: parseInt(stats.three_star) || 0,
          2: parseInt(stats.two_star) || 0,
          1: parseInt(stats.one_star) || 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting restaurant reviews:', error);
    return errorResponse(res, 'Lỗi khi lấy danh sách đánh giá', 500);
  }
};

/**
 * Lấy review của user cho nhà hàng cụ thể
 */
exports.getUserReviewForRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user.id;
    
    const review = await Review.getUserReviewForRestaurant(userId, restaurantId);
    
    if (!review) {
      return successResponse(res, 200, 'No review found', { review: null });
    }
    
    return successResponse(res, 200, 'Review retrieved successfully', { review });
  } catch (error) {
    console.error('Error getting user review:', error);
    return errorResponse(res, 'Lỗi khi lấy đánh giá', 500);
  }
};

/**
 * Lấy tất cả reviews của user
 */
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await Review.getByUserId(userId);
    return successResponse(res, 200, 'User reviews retrieved successfully', { reviews });
  } catch (error) {
    console.error('Error getting user reviews:', error);
    return errorResponse(res, 'Lỗi khi lấy danh sách đánh giá', 500);
  }
};

/**
 * Xóa review
 */
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const success = await Review.delete(reviewId, userId);

    if (!success) {
      return errorResponse(res, 404, 'Không tìm thấy đánh giá hoặc bạn không có quyền xóa');
    }

    return successResponse(res, 200, 'Xóa đánh giá thành công');
  } catch (error) {
    console.error('Error deleting review:', error);
    return errorResponse(res, 'Lỗi khi xóa đánh giá', 500);
  }
};
