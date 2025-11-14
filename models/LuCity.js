const mongoose = require('mongoose');

const luCitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'City name is required'],
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  status: {
    type: Boolean,
    default: true
  },
  district_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LuDistrict',
    required: [true, 'District reference is required']
  }
}, {
  timestamps: true,
  collection: 'lu_cities'
});

// Index for frequently queried fields
luCitySchema.index({ name: 1 });
luCitySchema.index({ district_id: 1 });
luCitySchema.index({ status: 1 });

const LuCity = mongoose.model('LuCity', luCitySchema);

module.exports = LuCity;