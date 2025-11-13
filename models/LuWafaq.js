const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const luWafaqSchema = new Schema({
  wafaq_name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  school_of_thought: {
    type: String,
    required: true,
    trim: true
  },
  hq_address: {
    type: String,
    trim: true
  },
  contact: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true,
    lowercase: true
  },
  estd_year: {
    type: Number,
    min: 1000,
    max: new Date().getFullYear()
  },
  chairman_name: {
    type: String,
    trim: true
  },
  registration_no: {
    type: String,
    trim: true,
    unique: true
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'lu_wafaqs'
});

// Indexes
luWafaqSchema.index({ wafaq_name: 1 }, { unique: true });
luWafaqSchema.index({ registration_no: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('LuWafaq', luWafaqSchema);
