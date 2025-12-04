const db = require('./config/database');

async function updateProcedure() {
  try {
    console.log('Dropping old procedure...');
    await db.query('DROP PROCEDURE IF EXISTS add_to_history');
    
    console.log('Creating new procedure...');
    await db.query(`
      CREATE PROCEDURE add_to_history(
        IN p_user_id INT,
        IN p_restaurant_id INT,
        IN p_action VARCHAR(50)
      )
      BEGIN
        DECLARE v_last_action_time DATETIME;
        
        -- Kiểm tra xem bản ghi này đã tồn tại trong 5 phút gần đây không
        SELECT created_at INTO v_last_action_time
        FROM history
        WHERE user_id = p_user_id 
          AND restaurant_id = p_restaurant_id 
          AND action = p_action
          AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        ORDER BY created_at DESC
        LIMIT 1;
        
        -- Chỉ insert nếu không có bản ghi gần đây
        IF v_last_action_time IS NULL THEN
          INSERT INTO history (user_id, restaurant_id, action)
          VALUES (p_user_id, p_restaurant_id, p_action);
        END IF;
      END
    `);
    
    console.log('✅ Procedure updated successfully!');
    
    // Verify
    const [result] = await db.query(`
      SELECT ROUTINE_DEFINITION 
      FROM information_schema.ROUTINES 
      WHERE ROUTINE_SCHEMA = 'gohan_go' 
      AND ROUTINE_NAME = 'add_to_history'
    `);
    
    console.log('\nNew procedure code:');
    console.log(result[0].ROUTINE_DEFINITION);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateProcedure();
