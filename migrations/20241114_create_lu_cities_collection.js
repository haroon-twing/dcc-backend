const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import the model
const LuCity = require('../models/LuCity');

// Log the MongoDB URI being used
console.log('Using MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/leadsdb');

// Sample data for Pakistani cities with their district IDs
const pakistaniCities = [
  // AJK
  { name: 'Kotli', district_id: '691383368950e38b41aa6c7d', status: true },
  { name: 'Mirpur', district_id: '691383368950e38b41aa6c7c', status: true },
  { name: 'Muzaffarabad', district_id: '691383368950e38b41aa6c7b', status: true },
  
  // Balochistan
  { name: 'Quetta', district_id: '691383368950e38b41aa6c76', status: true },
  { name: 'Turbat', district_id: '691383368950e38b41aa6c77', status: true },
  { name: 'Khuzdar', district_id: '691383368950e38b41aa6c78', status: true },
  
  // Gilgit-Baltistan
  { name: 'Gilgit', district_id: '691383368950e38b41aa6c79', status: true },
  { name: 'Skardu', district_id: '691383368950e38b41aa6c7a', status: true },
  
  // KPK
  { name: 'Peshawar', district_id: '691383368950e38b41aa6c72', status: true },
  { name: 'Mardan', district_id: '691383368950e38b41aa6c73', status: true },
  { name: 'Swat', district_id: '691383368950e38b41aa6c74', status: true },
  { name: 'Abbottabad', district_id: '691383368950e38b41aa6c75', status: true },
  
  // Punjab
  { name: 'Lahore', district_id: '691383368950e38b41aa6c67', status: true },
  { name: 'Faisalabad', district_id: '691383368950e38b41aa6c68', status: true },
  { name: 'Rawalpindi', district_id: '691383368950e38b41aa6c69', status: true },
  { name: 'Multan', district_id: '691383368950e38b41aa6c6a', status: true },
  { name: 'Gujranwala', district_id: '691383368950e38b41aa6c6b', status: true },
  { name: 'Sialkot', district_id: '691383368950e38b41aa6c6c', status: true },
  
  // Sindh
  { name: 'Karachi Central', district_id: '691383368950e38b41aa6c6d', status: true },
  { name: 'Karachi East', district_id: '691383368950e38b41aa6c6e', status: true },
  { name: 'Karachi South', district_id: '691383368950e38b41aa6c6f', status: true },
  { name: 'Hyderabad', district_id: '691383368950e38b41aa6c70', status: true },
  { name: 'Sukkur', district_id: '691383368950e38b41aa6c71', status: true }
];

/**
 * Migration: Create lu_cities collection with indexes and sample data
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
    await LuCity.init();
    console.log('✅ Created lu_cities collection with indexes');

    // Insert sample data
    await LuCity.insertMany(pakistaniCities);
    console.log(`✅ Inserted ${pakistaniCities.length} cities into lu_cities collection`);
    
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
 * Rollback: Drop lu_cities collection
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
    await mongoose.connection.dropCollection('lu_cities');
    console.log('✅ Dropped lu_cities collection');
    
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