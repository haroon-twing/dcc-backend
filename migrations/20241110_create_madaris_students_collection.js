const mongoose = require('mongoose');
const MadarisStudents = require('../models/MadarisStudents');
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
    const collectionExists = await mongoose.connection.db.listCollections({ name: 'madaris_students' }).hasNext();
    
    if (!collectionExists) {
      // Create collection with schema
      await mongoose.connection.db.createCollection('madaris_students');
      console.log('Created madaris_students collection');
      
      // Create indexes
      await MadarisStudents.createIndexes();
      console.log('✓ Created indexes for madaris_students collection');
    } else {
      console.log('madaris_students collection already exists');
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error in migration:', error);
    process.exit(1);
  }
}

async function down() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Drop the collection
    await mongoose.connection.db.dropCollection('madaris_students');
    console.log('✓ madaris_students collection dropped');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Rollback completed successfully');
  } catch (error) {
    console.error('Error during rollback:', error);
    process.exit(1);
  }
}

// Execute if run directly from command line
if (require.main === module) {
  (async () => {
    try {
      console.log('Running migration...');
      await up();
      console.log('Migration completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = { up, down };
