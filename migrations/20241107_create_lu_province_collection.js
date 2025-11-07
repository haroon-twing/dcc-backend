const mongoose = require('mongoose');
const Province = require('../models/LuProvince');

// Use the same MongoDB URI as in your .env file
const MONGODB_URI = 'mongodb://localhost:27017/leadsdb';

async function up() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Create the collection if it doesn't exist
    const collections = await db.listCollections({ name: 'lu_province' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('lu_province');
      console.log('✅ Created collection: lu_province');
    }

    // Initialize the model to create indexes
    await Province.init();
    console.log('✅ Created indexes for lu_province collection');
    
    // Insert sample data
    const result = await db.collection('lu_province').insertMany([
      { name: 'Punjab', remarks: 'Punjab', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sindh', remarks: 'Sindh', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'KPK', remarks: 'KPK', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Balochistan', remarks: 'Balochistan', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'GB', remarks: 'GB', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'AJK', remarks: 'AJK', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ]);
    
    console.log(`✅ Inserted ${result.insertedCount} provinces into lu_province collection`);
    
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
    await mongoose.connection.db.dropCollection('lu_province');
    console.log('✅ Dropped collection: lu_province');
    
  } catch (error) {
    // Ignore error if collection doesn't exist
    if (error.codeName !== 'NamespaceNotFound') {
      console.error('❌ Migration rollback failed:', error);
      throw error;
    }
    console.log('ℹ️ Collection lu_province did not exist, nothing to drop');
  } finally {
    await mongoose.disconnect();
  }
}

// Export both functions for migration tool
module.exports = { up, down };

// If run directly (for testing)
if (require.main === module) {
  up().catch(console.error);
}
