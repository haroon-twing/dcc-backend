// config/db.config.js
require('dotenv').config({ path: './.env' });

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/leadsdb',
  // You can add other database-related configurations here
  // like connection options, timeouts, etc.
};