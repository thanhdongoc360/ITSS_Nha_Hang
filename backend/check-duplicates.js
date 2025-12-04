const db = require('./config/database');

async function checkDuplicates() {
  try {
    console.log('Checking popular_restaurants...');
    const [popular] = await db.query('SELECT * FROM popular_restaurants');
    console.log(`Total: ${popular.length}`);
    console.log(popular);
    
    console.log('\n\nChecking nearby_restaurants...');
    const [nearby] = await db.query('SELECT * FROM nearby_restaurants');
    console.log(`Total: ${nearby.length}`);
    console.log(nearby);
    
    console.log('\n\nChecking restaurants table...');
    const [all] = await db.query('SELECT COUNT(*) as total FROM restaurants');
    console.log(`Total restaurants: ${all[0].total}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDuplicates();
