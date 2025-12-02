const db = require('../config/database');

class Favorite {
  /**
   * Lấy tất cả favorites của user
   */
  static async findByUserId(userId) {
    const [rows] = await db.query(`
      SELECT 
        r.*,
        f.created_at as favorited_at
      FROM favorites f
      JOIN restaurants r ON f.restaurant_id = r.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);
    return rows;
  }

  /**
   * Kiểm tra restaurant đã được favorite chưa
   */
  static async isFavorite(userId, restaurantId) {
    const [rows] = await db.query(
      'SELECT id FROM favorites WHERE user_id = ? AND restaurant_id = ?',
      [userId, restaurantId]
    );
    return rows.length > 0;
  }

  /**
   * Thêm vào favorites
   */
  static async add(userId, restaurantId) {
    try {
      await db.query(
        'CALL add_to_favorites(?, ?)',
        [userId, restaurantId]
      );
      return true;
    } catch (error) {
      // Handle duplicate entry
      if (error.code === 'ER_DUP_ENTRY') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Xóa khỏi favorites
   */
  static async remove(userId, restaurantId) {
    await db.query(
      'CALL remove_from_favorites(?, ?)',
      [userId, restaurantId]
    );
    return true;
  }

  /**
   * Đếm số lượng favorites của user
   */
  static async count(userId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM favorites WHERE user_id = ?',
      [userId]
    );
    return rows[0].count;
  }

  /**
   * Lấy danh sách restaurant IDs được favorite
   */
  static async getFavoriteIds(userId) {
    const [rows] = await db.query(
      'SELECT restaurant_id FROM favorites WHERE user_id = ?',
      [userId]
    );
    return rows.map(row => row.restaurant_id);
  }
}

module.exports = Favorite;
