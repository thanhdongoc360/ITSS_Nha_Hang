const db = require('../config/database');

class History {
  /**
   * Lấy history của user
   */
  static async findByUserId(userId, limit = 50) {
    const [rows] = await db.query(`
      SELECT 
        h.*,
        r.name,
        r.cuisine,
        r.rating,
        r.price,
        r.image
      FROM history h
      JOIN restaurants r ON h.restaurant_id = r.id
      WHERE h.user_id = ?
      ORDER BY h.created_at DESC
      LIMIT ?
    `, [userId, limit]);
    return rows;
  }

  /**
   * Thêm vào history
   */
  static async add(userId, restaurantId, action = 'view') {
    await db.query(
      'CALL add_to_history(?, ?, ?)',
      [userId, restaurantId, action]
    );
    return true;
  }

  /**
   * Lấy history theo action type
   */
  static async findByAction(userId, action) {
    const [rows] = await db.query(`
      SELECT 
        h.*,
        r.name,
        r.cuisine,
        r.rating,
        r.price,
        r.image
      FROM history h
      JOIN restaurants r ON h.restaurant_id = r.id
      WHERE h.user_id = ? AND h.action = ?
      ORDER BY h.created_at DESC
    `, [userId, action]);
    return rows;
  }

  /**
   * Đếm số lượng history entries
   */
  static async count(userId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM history WHERE user_id = ?',
      [userId]
    );
    return rows[0].count;
  }

  /**
   * Lấy recently viewed restaurants
   */
  static async getRecentlyViewed(userId, limit = 10) {
    const [rows] = await db.query(`
      SELECT DISTINCT
        r.*,
        MAX(h.created_at) as last_viewed
      FROM history h
      JOIN restaurants r ON h.restaurant_id = r.id
      WHERE h.user_id = ? AND h.action = 'view'
      GROUP BY r.id
      ORDER BY last_viewed DESC
      LIMIT ?
    `, [userId, limit]);
    return rows;
  }

  /**
   * Xóa history cũ (cleanup)
   */
  static async deleteOld(userId, days = 30) {
    await db.query(
      'DELETE FROM history WHERE user_id = ? AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [userId, days]
    );
  }

  /**
   * Xóa tất cả history của user
   */
  static async deleteAll(userId) {
    await db.query(
      'DELETE FROM history WHERE user_id = ?',
      [userId]
    );
  }
}

module.exports = History;
