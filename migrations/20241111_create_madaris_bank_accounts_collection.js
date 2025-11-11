const mongoose = require('mongoose');
const MadarisBankAccount = require('../models/MadarisBankAccount');
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
    const collectionExists = await mongoose.connection.db.listCollections({ name: 'madarisbankaccounts' }).hasNext();
    
    if (!collectionExists) {
      // Create collection with schema
      await mongoose.connection.db.createCollection('madarisbankaccounts');
      console.log('Created madarisbankaccounts collection');
      
      // Create indexes
      await MadarisBankAccount.createIndexes();
      console.log('✓ Created indexes for madarisbankaccounts collection');
    } else {
      console.log('madarisbankaccounts collection already exists');
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
    await mongoose.connection.db.dropCollection('madarisbankaccounts');
    console.log('Dropped madarisbankaccounts collection');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Rollback completed successfully');
  } catch (error) {
    console.error('Error in rollback:', error);
    process.exit(1);
  }
}

module.exports = { up, down };
