const db = require('./config/database');

async function checkHistory() {
  try {
    // Check the current procedure code
    const [result] = await db.query(`
      SELECT ROUTINE_DEFINITION 
      FROM information_schema.ROUTINES 
      WHERE ROUTINE_SCHEMA = 'gohan_go' 
      AND ROUTINE_NAME = 'add_to_history'
    `);
    
    console.log('Current stored procedure:');
    console.log(result[0].ROUTINE_DEFINITION);
    
    // Check history records
    const [history] = await db.query('SELECT * FROM history LIMIT 10');
    console.log('\nRecent history records:');
    console.log(history);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkHistory();
