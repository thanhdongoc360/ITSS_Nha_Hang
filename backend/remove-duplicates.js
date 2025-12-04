const db = require('./config/database');

async function removeDuplicates() {
  try {
    console.log('Checking for duplicate restaurants...');
    
    // Find duplicates
    const [duplicates] = await db.query(`
      SELECT name, cuisine, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM restaurants
      GROUP BY name, cuisine
      HAVING count > 1
    `);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      process.exit(0);
    }
    
    console.log(`Found ${duplicates.length} groups with duplicates:`);
    console.log(duplicates);
    
    // Delete duplicates, keep the one with lowest ID
    for (const dup of duplicates) {
      const ids = dup.ids.split(',').map(Number);
      const idsToDelete = ids.slice(1); // Keep first, delete rest
      
      console.log(`\nRemoving duplicate IDs: ${idsToDelete.join(', ')} (keeping ${ids[0]})`);
      
      await db.query(
        `DELETE FROM restaurants WHERE id IN (${idsToDelete.map(() => '?').join(',')})`,
        idsToDelete
      );
    }
    
    console.log('\n✅ Duplicates removed!');
    
    // Verify
    const [all] = await db.query('SELECT COUNT(*) as total FROM restaurants');
    console.log(`Total restaurants now: ${all[0].total}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeDuplicates();
