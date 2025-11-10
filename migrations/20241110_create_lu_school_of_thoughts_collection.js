const mongoose = require('mongoose');
const LuSchoolOfThought = require('../models/LuSchoolOfThought');

async function up() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/leadsdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('✅ Connected to MongoDB');

  try {
    // Create collection and indexes
    await LuSchoolOfThought.init();
    console.log('✅ Created indexes for lu_school_of_thoughts collection');

    // Insert initial data
    const schoolOfThoughts = [
      {
        name: 'Barelvi',
        description: 'Barelvi',
      },
      {
        name: 'Deobandi',
        description: 'Deobandi',
      },
      {
        name: 'Ahl-e-Hadith',
        description: 'Ahl-e-Hadith',
      },
      {
        name: 'Ahl-e-Tashi',
        description: 'Ahl-e-Tashi',
      },
      {
        name: 'Salafi',
        description: 'Salafi',
      },
      {
        name: 'Sufi',
        description: 'Sufi',
      },
      {
        name: 'Hanafi',
        description: 'Hanafi',
      },
      {
        name: 'Maliki',
        description: 'Maliki',
      },
      {
        name: 'Hanbali',
        description: 'Hanbali',
      },
      {
        name: 'Zahiri',
        description: 'Zahiri',
      }
    ];

    const result = await LuSchoolOfThought.insertMany(schoolOfThoughts);
    console.log(`✅ Inserted ${result.length} school of thoughts`);
    
    return result;
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

async function down() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/leadsdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('✅ Connected to MongoDB');

  try {
    // Drop the collection
    await mongoose.connection.dropCollection('lu_school_of_thoughts');
    console.log('✅ Dropped lu_school_of_oughts collection');
    
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
