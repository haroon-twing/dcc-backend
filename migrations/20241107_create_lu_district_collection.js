const mongoose = require('mongoose');
const District = require('../models/LuDistrict');
const Province = require('../models/LuProvince');

// Use the same MongoDB URI as in your .env file
const MONGODB_URI = 'mongodb://localhost:27017/leadsdb';

// Sample districts data with province names
const districtsData = [
  // Punjab
  { name: 'Lahore', province: 'Punjab' },
  { name: 'Faisalabad', province: 'Punjab' },
  { name: 'Rawalpindi', province: 'Punjab' },
  { name: 'Multan', province: 'Punjab' },
  { name: 'Gujranwala', province: 'Punjab' },
  { name: 'Sialkot', province: 'Punjab' },
  
  // Sindh
  { name: 'Karachi Central', province: 'Sindh' },
  { name: 'Karachi East', province: 'Sindh' },
  { name: 'Karachi South', province: 'Sindh' },
  { name: 'Hyderabad', province: 'Sindh' },
  { name: 'Sukkur', province: 'Sindh' },
  
  // KPK
  { name: 'Peshawar', province: 'KPK' },
  { name: 'Mardan', province: 'KPK' },
  { name: 'Swat', province: 'KPK' },
  { name: 'Abbottabad', province: 'KPK' },
  
  // Balochistan
  { name: 'Quetta', province: 'Balochistan' },
  { name: 'Turbat', province: 'Balochistan' },
  { name: 'Khuzdar', province: 'Balochistan' },
  
  // Gilgit-Baltistan
  { name: 'Gilgit', province: 'GB' },
  { name: 'Skardu', province: 'GB' },
  
  // AJK
  { name: 'Muzaffarabad', province: 'AJK' },
  { name: 'Mirpur', province: 'AJK' },
  { name: 'Kotli', province: 'AJK' }
];

async function up() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Create the collection if it doesn't exist
    const collections = await db.listCollections({ name: 'lu_district' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('lu_district');
      console.log('✅ Created collection: lu_district');
    }

    // Initialize the model to create indexes
    await District.init();
    console.log('✅ Created indexes for lu_district collection');
    
    // Get all provinces to map province names to IDs
    const provinces = await Province.find({}, '_id name');
    const provinceMap = {};
    provinces.forEach(province => {
      provinceMap[province.name] = province._id;
    });
    
    // Prepare districts with province IDs
    const districtsToInsert = [];
    const now = new Date();
    
    for (const district of districtsData) {
      const provinceId = provinceMap[district.province];
      if (!provinceId) {
        console.warn(`⚠️  Province not found: ${district.province}`);
        continue;
      }
      
      districtsToInsert.push({
        name: district.name,
        prov_id: provinceId,
        remarks: `${district.name}, ${district.province}`,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
    }
    
    // Insert districts
    if (districtsToInsert.length > 0) {
      const result = await db.collection('lu_district').insertMany(districtsToInsert);
      console.log(`✅ Inserted ${result.insertedCount} districts into lu_district collection`);
    } else {
      console.log('ℹ️  No districts to insert');
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
    await mongoose.connect(MONGODB_URI);
    
    // Drop the collection
    await mongoose.connection.db.dropCollection('lu_district');
    console.log('✅ Dropped collection: lu_district');
    
  } catch (error) {
    // Ignore error if collection doesn't exist
    if (error.codeName !== 'NamespaceNotFound') {
      console.error('❌ Migration rollback failed:', error);
      throw error;
    }
    console.log('ℹ️ Collection lu_district did not exist, nothing to drop');
  } finally {
    await mongoose.disconnect();
  }
}

// Export both functions for migration tool
module.exports = { up, down };

// If run directly (for testing)
if (require.main === module) {
  up().catch(console.error);
}
