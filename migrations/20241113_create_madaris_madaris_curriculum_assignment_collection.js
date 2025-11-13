const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import the model
const MadarisMadarisCurriculumAssignment = require('../models/MadarisMadarisCurriculumAssignment');

// Log the MongoDB URI being used (for debugging)
console.log('Using MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/leadsdb');

/**
 * Migration: Create madaris_madaris_curriculum_assignments collection with indexes
 */
async function up() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadsdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Create collection and indexes
    await MadarisMadarisCurriculumAssignment.init();
    console.log('✅ Created madaris_madaris_curriculum_assignments collection with indexes');
    
    return true;
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

/**
 * Rollback: Drop madaris_madaris_curriculum_assignments collection
 */
async function down() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadsdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Drop the collection
    await mongoose.connection.dropCollection('madaris_madaris_curriculum_assignments');
    console.log('✅ Dropped madaris_madaris_curriculum_assignments collection');
    
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
