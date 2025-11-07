const mongoose = require('mongoose');

// Use the same MongoDB URI as in your .env file
const MONGODB_URI = 'mongodb://localhost:27017/leadsdb';

async function up() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Create the collection by creating an index (this will create the collection if it doesn't exist)
    await mongoose.connection.db.collection('dummies').createIndex({ name: 1 });
    
    console.log('✅ Created dummies collection');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

async function down() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Drop the collection (be careful with this in production!)
    await mongoose.connection.db.dropCollection('dummies');
    
    console.log('✅ Dropped dummies collection');
  } catch (error) {
    console.error('❌ Migration rollback failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Check if running directly
if (require.main === module) {
  const command = process.argv[2];
  if (command === 'up') {
    up().then(() => process.exit(0));
  } else if (command === 'down') {
    down().then(() => process.exit(0));
  } else {
    console.log('Usage: node migrations/20241106_create_dummies_collection.js [up|down]');
    process.exit(1);
  }
}

module.exports = { up, down };
