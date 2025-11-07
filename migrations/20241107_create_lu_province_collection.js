const mongoose = require('mongoose');
const Province = require('../models/LuProvince');

/**
 * Create lu_province collection
 * @param {import('mongodb').Db} db - MongoDB database instance
 * @param {import('mongodb').MongoClient} client - MongoDB client instance
 * @returns {Promise<void>}
 */
async function up(db, client) {
  try {
    // Create the collection if it doesn't exist
    const collections = await db.listCollections({ name: 'lu_province' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('lu_province');
      console.log('Created collection: lu_province');
    }

    // Create indexes
    await Province.init();
    console.log('Created indexes for lu_province collection');
    
    //Insert sample data if needed
    await db.collection('lu_province').insertMany([
      { name: 'Punjab', remarks: 'Punjab' },
      { name: 'Sindh', remarks: 'Sindh' },
      { name: 'KPK', remarks: 'KPK' },
      { name: 'Balochistan', remarks: 'Balochistan' },
      { name: 'GB', remarks: 'GB' },
      { name: 'AJK', remarks: 'AJK' },
      
    ]);
    console.log('Inserted sample data into lu_province collection');
    
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

/**
 * Drop lu_province collection
 * @param {import('mongodb').Db} db - MongoDB database instance
 * @param {import('mongodb').MongoClient} client - MongoDB client instance
 * @returns {Promise<void>}
 */
async function down(db, client) {
  try {
    await db.collection('lu_province').drop();
    console.log('Dropped collection: lu_province');
  } catch (error) {
    // Ignore error if collection doesn't exist
    if (error.codeName !== 'NamespaceNotFound') {
      console.error('Error dropping lu_province collection:', error);
      throw error;
    }
  }
}

module.exports = { up, down };
