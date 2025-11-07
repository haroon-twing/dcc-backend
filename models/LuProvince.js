const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Province name is required'],
    trim: true,
    maxlength: [100, 'Province name cannot exceed 100 characters']
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
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
  collection: 'lu_province'
});

// Create a compound index on name and isActive
provinceSchema.index({ name: 1, isActive: 1 }, { unique: true });

const Province = mongoose.model('Province', provinceSchema);

module.exports = Province;
