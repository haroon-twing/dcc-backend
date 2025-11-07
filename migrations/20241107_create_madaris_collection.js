const mongoose = require('mongoose');
const Madaris = require('../models/Madaris');

// Use the same MongoDB URI as in your .env file
const MONGODB_URI = 'mongodb://localhost:27017/leadsdb';

async function up() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Create the collection if it doesn't exist
    const collections = await db.listCollections({ name: 'madaris' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('madaris');
      console.log('✅ Created collection: madaris');
    }

    // Initialize the model to create indexes
    await Madaris.init();
    console.log('✅ Created indexes for madaris collection');
    
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
    
    // Drop the collection
    await mongoose.connection.db.dropCollection('madaris');
    console.log('✅ Dropped collection: madaris');
    
  } catch (error) {
    // Ignore error if collection doesn't exist
    if (error.codeName !== 'NamespaceNotFound') {
      console.error('❌ Migration rollback failed:', error);
      throw error;
    }
    console.log('ℹ️ Collection madaris did not exist, nothing to drop');
  } finally {
    await mongoose.disconnect();
  }
}

// Export both functions for migration tool
module.exports = { up, down };

// If run directly (for testing)
if (require.main === module) {
  const command = process.argv[2];
  if (command === 'down') {
    down().catch(console.error);
  } else {
    up().catch(console.error);
  }
}
