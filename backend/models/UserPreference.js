const db = require('../config/database');

class UserPreference {
  /**
   * Lấy preferences của user
   */
  static async findByUserId(userId) {
    const [rows] = await db.query(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    return rows[0];
  }

  /**
   * Tạo hoặc cập nhật preferences
   */
  static async upsert(userId, preferences) {
    const { max_distance, max_walk_time, cuisine_types, price_range } = preferences;

    // Convert arrays to JSON strings
    const cuisineJson = cuisine_types ? JSON.stringify(cuisine_types) : null;
    const priceJson = price_range ? JSON.stringify(price_range) : null;

    await db.query(`
      INSERT INTO user_preferences (user_id, max_distance, max_walk_time, cuisine_types, price_range)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        max_distance = VALUES(max_distance),
        max_walk_time = VALUES(max_walk_time),
        cuisine_types = VALUES(cuisine_types),
        price_range = VALUES(price_range)
    `, [userId, max_distance, max_walk_time, cuisineJson, priceJson]);

    return this.findByUserId(userId);
  }

  /**
   * Xóa preferences
   */
  static async delete(userId) {
    await db.query(
      'DELETE FROM user_preferences WHERE user_id = ?',
      [userId]
    );
  }
}

module.exports = UserPreference;
