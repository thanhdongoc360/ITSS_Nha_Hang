const db = require('./config/database');

async function freshStart() {
  try {
    console.log('Clearing all old history records...');
    
    // Xóa tất cả history records cũ
    await db.query('DELETE FROM history WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)');
    
    console.log('✅ Old history cleared!');
    
    // Show remaining
    const [history] = await db.query('SELECT * FROM history ORDER BY created_at DESC');
    console.log('\nRemaining records:');
    console.log(history);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

freshStart();
