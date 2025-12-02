const db = require('../config/database');

class Review {
  /**
   * Tạo review mới
   */
  static async create(reviewData) {
    const { userId, restaurantId, rating, comment } = reviewData;
    const [result] = await db.execute(
      'INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, restaurantId, rating, comment]
    );
    return result.insertId;
  }

  /**
   * Lấy tất cả reviews của một nhà hàng
   */
  static async getByRestaurantId(restaurantId) {
    const [rows] = await db.execute(
      `SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.restaurant_id = ?
      ORDER BY r.created_at DESC`,
      [restaurantId]
    );
    return rows;
  }

  /**
   * Lấy review của một user cho một nhà hàng cụ thể
   */
  static async getUserReviewForRestaurant(userId, restaurantId) {
    const [rows] = await db.execute(
      `SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at
      FROM reviews r
      WHERE r.user_id = ? AND r.restaurant_id = ?`,
      [userId, restaurantId]
    );
    return rows[0];
  }

  /**
   * Lấy tất cả reviews của một user
   */
  static async getByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        rest.id as restaurant_id,
        rest.name as restaurant_name,
        rest.cuisine,
        rest.image
      FROM reviews r
      JOIN restaurants rest ON r.restaurant_id = rest.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC`,
      [userId]
    );
    return rows;
  }

  /**
   * Cập nhật review
   */
  static async update(reviewId, userId, updateData) {
    const { rating, comment } = updateData;
    const [result] = await db.execute(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND user_id = ?',
      [rating, comment, reviewId, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Xóa review
   */
  static async delete(reviewId, userId) {
    const [result] = await db.execute(
      'DELETE FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Lấy thống kê rating của nhà hàng
   */
  static async getRestaurantRatingStats(restaurantId) {
    const [rows] = await db.execute(
      `SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews
      WHERE restaurant_id = ?`,
      [restaurantId]
    );
    return rows[0];
  }
}

module.exports = Review;
