const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Log the MongoDB URI being used (for debugging)
console.log('Using MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/leadsdb');

async function up() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadsdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Add new fields to the madaris collection
    await mongoose.connection.db.collection('madaris').updateMany(
      {}, // Match all documents
      {
        $set: {
          'no_of_local_students': 0,
          'category': null,
          'non_cooperation_reason': null
        }
      },
      { upsert: false } // Don't create new documents, only update existing ones
    );

    console.log('✅ Added new fields to madaris collection');
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

    // Remove the fields (using $unset)
    await mongoose.connection.db.collection('madaris').updateMany(
      {},
      {
        $unset: {
          'no_of_local_students': '',
          'category': '',
          'non_cooperation_reason': ''
        }
      }
    );

    console.log('✅ Removed fields from madaris collection');
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