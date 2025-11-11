const mongoose = require('mongoose');
const MadarisTeachersSupportHighEducation = require('../models/MadarisTeachersSupportHighEducation');

async function up() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadsdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('✅ Connected to MongoDB');

  try {
    // Create collection and indexes
    await MadarisTeachersSupportHighEducation.init();
    console.log('✅ Created madaris_teachers_support_high_education collection with indexes');
    
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
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadsdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('✅ Connected to MongoDB');

  try {
    // Drop the collection
    await mongoose.connection.dropCollection('madaris_teachers_support_high_education');
    console.log('✅ Dropped madaris_teachers_support_high_education collection');
    
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
