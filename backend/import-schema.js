const mysql = require('mysql2/promise');
const fs = require('fs');

async function importSchema() {
  let connection;
  
  try {
    console.log('🔄 Đang kết nối database...');
    
    // Kết nối database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'gohan_go'
    });

    console.log('✅ Kết nối thành công!');

    // Đọc file SQL
    const sqlContent = fs.readFileSync('../database/schema.sql', 'utf8');
    
    // Tách các statements (bỏ qua DELIMITER blocks)
    const statements = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('DELIMITER') && !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.includes('CREATE PROCEDURE') && !s.includes('END //'));

    console.log(`📝 Tìm thấy ${statements.length} SQL statements`);

    // Execute từng statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.trim()) {
        try {
          await connection.query(stmt);
          if (stmt.includes('CREATE TABLE')) {
            const tableName = stmt.match(/CREATE TABLE (\w+)/)?.[1];
            console.log(`✅ Tạo table: ${tableName}`);
          } else if (stmt.includes('INSERT INTO')) {
            const tableName = stmt.match(/INSERT INTO (\w+)/)?.[1];
            console.log(`✅ Insert data: ${tableName}`);
          } else if (stmt.includes('CREATE VIEW')) {
            const viewName = stmt.match(/CREATE VIEW (\w+)/)?.[1];
            console.log(`✅ Tạo view: ${viewName}`);
          } else if (stmt.includes('CREATE INDEX')) {
            console.log(`✅ Tạo index`);
          }
        } catch (err) {
          // Bỏ qua lỗi table/view already exists
          if (!err.message.includes('already exists')) {
            console.warn(`⚠️ Warning:`, err.message.substring(0, 100));
          }
        }
      }
    }

    console.log('\n🎉 Import schema hoàn tất!');
    
    // Kiểm tra tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📋 Danh sách tables:');
    tables.forEach(t => console.log(`   - ${Object.values(t)[0]}`));

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

importSchema();
