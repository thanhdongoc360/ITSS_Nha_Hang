const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createDemoUser() {
  let connection;
  
  try {
    // Kết nối database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'gohan_go'
    });

    console.log('✅ Kết nối database thành công!');

    // Hash password
    const hashedPassword = await bcrypt.hash('test123', 10);

    // Xóa user cũ nếu có
    await connection.execute('DELETE FROM users WHERE email = ?', ['demo@gohan.com']);

    // Tạo demo user
    const [result] = await connection.execute(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      ['demo@gohan.com', hashedPassword, 'Demo User']
    );

    console.log('✅ Đã tạo user demo thành công!');
    console.log('📧 Email: demo@gohan.com');
    console.log('🔑 Password: test123');
    console.log('👤 ID:', result.insertId);

    // Tạo thêm một số user test khác
    const testUsers = [
      { email: 'user1@test.com', name: 'Test User 1' },
      { email: 'user2@test.com', name: 'Test User 2' },
      { email: 'user3@test.com', name: 'Test User 3' }
    ];

    for (const user of testUsers) {
      await connection.execute('DELETE FROM users WHERE email = ?', [user.email]);
      await connection.execute(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [user.email, hashedPassword, user.name]
      );
    }

    console.log('✅ Đã tạo thêm 3 user test (password: test123)');

    // Kiểm tra
    const [users] = await connection.execute('SELECT id, email, name FROM users');
    console.log('\n📋 Danh sách users trong database:');
    console.table(users);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

createDemoUser();
