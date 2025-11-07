const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const districtSchema = new Schema({
  name: {
    type: String,
    required: [true, 'District name is required'],
    trim: true,
    maxlength: [100, 'District name cannot exceed 100 characters']
  },
  prov_id: {
    type: Schema.Types.ObjectId,
    ref: 'Province',
    required: [true, 'Province reference is required']
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
  collection: 'lu_district'
});

// Create a compound index on name, prov_id and isActive
districtSchema.index({ name: 1, prov_id: 1, isActive: 1 }, { unique: true });

// Add text index for search functionality
districtSchema.index({ name: 'text', remarks: 'text' });

const District = mongoose.model('District', districtSchema);

module.exports = District;
