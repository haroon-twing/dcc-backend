const mongoose = require('mongoose');
const MadarisNonCooperative = require('../models/MadarisNonCooperative');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/leadsdb');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

async function up() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Check if collection exists
    const collectionExists = await mongoose.connection.db.listCollections({ name: 'madaris_non_cooperative' }).hasNext();
    
    if (!collectionExists) {
      // Create collection with schema
      await mongoose.connection.db.createCollection('madaris_non_cooperative');
      console.log('Created madaris_non_cooperative collection');
      
      // Create indexes
      await MadarisNonCooperative.init();
      console.log('✓ Created indexes for madaris_non_cooperative collection');
    } else {
      console.log('madaris_non_cooperative collection already exists');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

async function down() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Drop the collection
    await mongoose.connection.db.dropCollection('madaris_non_cooperative');
    console.log('✓ Dropped madaris_non_cooperative collection');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Export both functions for migration tools
module.exports = { up, down };

// If run directly (not required), execute the migration
if (require.main === module) {
  up().then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  }).catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}
