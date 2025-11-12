const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import the model to register it with Mongoose
const MadarisMeetingHeld = require('../models/MadarisMeetingHeld');

// Log the connection string for debugging (remove in production)
console.log('Using MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/leadsdb');

async function up() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadsdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Create collection and indexes
    await MadarisMeetingHeld.init();
    console.log('✅ Created madaris_meetings_held collection with indexes');
    
    return true;
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

async function down() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadsdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Drop the collection
    await mongoose.connection.dropCollection('madaris_meetings_held');
    console.log('✅ Dropped madaris_meetings_held collection');
    
    return true;
  } catch (error) {
    console.error('❌ Error during rollback:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the migration if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'down') {
    down().catch(console.error);
  } else {
    up().catch(console.error);
  }
}

module.exports = { up, down };
