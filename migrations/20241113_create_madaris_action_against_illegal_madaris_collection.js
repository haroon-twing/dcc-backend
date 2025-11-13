const mongoose = require('mongoose');
const { Schema } = mongoose;

// This migration creates the madaris_action_against_illegal_madaris collection

/**
 * @param {import('mongoose').Connection} db - The MongoDB connection
 */
const up = async (db) => {
  try {
    // Create the collection
    await db.createCollection('madaris_action_against_illegal_madaris', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'role_of_institute', 'what_action_taken', 'date_of_action_taken', 'madaris_id'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Name of the action taken',
              maxLength: 200
            },
            role_of_institute: {
              bsonType: 'string',
              description: 'Role of the institute',
              maxLength: 200
            },
            what_action_taken: {
              bsonType: 'string',
              description: 'Description of the action taken',
              maxLength: 1000
            },
            date_of_action_taken: {
              bsonType: 'date',
              description: 'Date when the action was taken'
            },
            remarks: {
              bsonType: 'string',
              description: 'Additional remarks',
              maxLength: 1000
            },
            madaris_id: {
              bsonType: 'objectId',
              description: 'Reference to Madaris document'
            },
            is_active: {
              bsonType: 'bool',
              description: 'Soft delete flag',
              default: true
            },
            created_at: {
              bsonType: 'date',
              description: 'Creation timestamp'
            },
            updated_at: {
              bsonType: 'date',
              description: 'Last update timestamp'
            }
          }
        }
      }
    });

    // Create indexes
    await db.collection('madaris_action_against_illegal_madaris').createIndex({ madaris_id: 1, is_active: 1 });
    await db.collection('madaris_action_against_illegal_madaris').createIndex({ is_active: 1 });
    
    console.log('Created collection: madaris_action_against_illegal_madaris');
    return true;
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
};

/**
 * @param {import('mongoose').Connection} db - The MongoDB connection
 */
const down = async (db) => {
  try {
    await db.dropCollection('madaris_action_against_illegal_madaris');
    console.log('Dropped collection: madaris_action_against_illegal_madaris');
    return true;
  } catch (error) {
    console.error('Error dropping collection:', error);
    throw error;
  }
};

module.exports = { up, down };
