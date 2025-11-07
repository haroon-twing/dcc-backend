const mongoose = require('mongoose');

// Use the same MongoDB URI as in your .env file
const MONGODB_URI = 'mongodb://localhost:27017/leadsdb';

async function up() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Get the collection
    const collection = mongoose.connection.db.collection('dummies');
    
    // Add roomno field to all existing documents (setting a default value of 0)
    await collection.updateMany(
      { roomno: { $exists: false } }, // Only update documents where roomno doesn't exist
      { $set: { roomno: 0 } } // Set default value
    );
    
    console.log('✅ Added roomno field to dummies collection');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

async function down() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Remove the roomno field from all documents
    await mongoose.connection.db.collection('dummies').updateMany(
      {},
      { $unset: { roomno: "" } }
    );
    
    console.log('✅ Removed roomno field from dummies collection');
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
    console.log('Usage: node migrations/20241107_add_roomno_to_dummies.js [up|down]');
    process.exit(1);
  }
}

module.exports = { up, down };
