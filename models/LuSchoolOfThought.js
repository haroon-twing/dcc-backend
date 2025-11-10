const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schoolOfThoughtSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'lu_school_of_thoughts'
});

// Indexes
schoolOfThoughtSchema.index({ name: 'text' });

module.exports = mongoose.model('LuSchoolOfThought', schoolOfThoughtSchema);
