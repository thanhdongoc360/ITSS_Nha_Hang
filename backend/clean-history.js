const db = require('./config/database');

async function cleanHistory() {
  try {
    console.log('Cleaning up duplicate history records...');
    
    // Xóa các bản ghi lặp, giữ lại bản ghi mới nhất
    await db.query(`
      DELETE h1 FROM history h1
      INNER JOIN history h2 
        ON h1.user_id = h2.user_id 
        AND h1.restaurant_id = h2.restaurant_id
        AND h1.action = h2.action
        AND h1.id < h2.id
    `);
    
    console.log('✅ Cleanup completed!');
    
    // Check remaining records
    const [history] = await db.query(`
      SELECT user_id, restaurant_id, action, COUNT(*) as count
      FROM history
      GROUP BY user_id, restaurant_id, action
      HAVING count > 1
    `);
    
    if (history.length > 0) {
      console.log('\n⚠️ Still found duplicates:');
      console.log(history);
    } else {
      console.log('\n✅ All duplicates removed!');
    }
    
    // Show total records
    const [total] = await db.query('SELECT COUNT(*) as total FROM history');
    console.log(`\nTotal history records: ${total[0].total}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanHistory();
