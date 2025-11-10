const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const luCountrySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true
  },
  phoneCode: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'lu_countries'
});

// Text index for search
luCountrySchema.index({ name: 'text', code: 'text' });

module.exports = mongoose.model('LuCountry', luCountrySchema);
