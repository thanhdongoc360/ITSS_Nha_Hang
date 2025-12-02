const db = require('../config/database');

class Restaurant {
  /**
   * Lấy tất cả restaurants
   */
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM restaurants WHERE 1=1';
    const params = [];

    // Search by name
    if (filters.q) {
      query += ' AND name LIKE ?';
      params.push(`%${filters.q}%`);
    }

    // Filter by cuisine
    if (filters.cuisine) {
      query += ' AND cuisine = ?';
      params.push(filters.cuisine);
    }

    // Filter by max distance
    if (filters.maxDistance) {
      query += ' AND distance <= ?';
      params.push(parseInt(filters.maxDistance));
    }

    // Filter by max price
    if (filters.maxPrice) {
      query += ' AND price <= ?';
      params.push(parseInt(filters.maxPrice));
    }

    // Filter by min rating
    if (filters.minRating) {
      query += ' AND rating >= ?';
      params.push(parseFloat(filters.minRating));
    }

    // Sorting
    const sortBy = filters.sortBy || 'rating';
    const order = filters.order || 'DESC';
    query += ` ORDER BY ${sortBy} ${order}`;

    // Pagination
    const limit = parseInt(filters.limit) || 50;
    const offset = parseInt(filters.offset) || 0;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows;
  }

  /**
   * Tìm restaurant theo ID
   */
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM restaurants WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  /**
   * Lấy danh sách cuisine types
   */
  static async getCuisineTypes() {
    const [rows] = await db.query(
      'SELECT DISTINCT cuisine FROM restaurants ORDER BY cuisine'
    );
    return rows.map(row => row.cuisine);
  }

  /**
   * Tìm kiếm restaurants với stored procedure
   */
  static async search(query, cuisine, maxDistance, maxPrice) {
    const [rows] = await db.query(
      'CALL search_restaurants(?, ?, ?, ?)',
      [query || null, cuisine || null, maxDistance || null, maxPrice || null]
    );
    return rows[0]; // Stored procedure returns array of arrays
  }

  /**
   * Lấy recommendations cho user
   */
  static async getRecommendations(userId) {
    const [rows] = await db.query(
      'CALL get_recommendations(?)',
      [userId]
    );
    return rows[0];
  }

  /**
   * Lấy popular restaurants
   */
  static async getPopular(limit = 10) {
    const [rows] = await db.query(
      'SELECT * FROM popular_restaurants LIMIT ?',
      [limit]
    );
    return rows;
  }

  /**
   * Lấy nearby restaurants
   */
  static async getNearby(limit = 10) {
    const [rows] = await db.query(
      'SELECT * FROM nearby_restaurants LIMIT ?',
      [limit]
    );
    return rows;
  }

  /**
   * Increment review count
   */
  static async incrementReviews(id) {
    await db.query(
      'UPDATE restaurants SET reviews = reviews + 1 WHERE id = ?',
      [id]
    );
  }
}

module.exports = Restaurant;
