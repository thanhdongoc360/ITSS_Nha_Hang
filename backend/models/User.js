const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Tạo user mới
   */
  static async create(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return result.insertId;
  }

  /**
   * Tìm user theo email
   */
  static async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  /**
   * Tìm user theo ID
   */
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  /**
   * Cập nhật thông tin user
   */
  static async update(id, data) {
    const { name, email } = data;
    await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
    return this.findById(id);
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Compare password (alias for verifyPassword)
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update password
   */
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
  }

  /**
   * Xóa user
   */
  static async delete(id) {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
  }
}

module.exports = User;
