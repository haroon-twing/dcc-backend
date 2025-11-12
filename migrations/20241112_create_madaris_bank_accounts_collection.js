require('dotenv').config({ path: './.env' });
const MONGODB_URI = process.env.MONGODB_URI;

const mongoose = require('mongoose');
const MadarisBankAccount = require('../models/MadarisBankAccount');

async function up() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('✅ Connected to MongoDB');

  try {
    // Create collection and indexes
    await MadarisBankAccount.init();
    console.log('✅ Created madaris_bank_accounts collection with indexes');
    
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
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('✅ Connected to MongoDB');

  try {
    // Drop the collection
    await mongoose.connection.dropCollection('madaris_bank_accounts');
    console.log('✅ Dropped madaris_bank_accounts collection');
    
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
