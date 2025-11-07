const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const madarisSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Madrassa name is required'],
    trim: true,
    maxlength: [200, 'Madrassa name cannot exceed 200 characters']
  },
  reg_no: {
    type: String,
    trim: true,
    maxlength: [50, 'Registration number cannot exceed 50 characters']
  },
  prov_id: {
    type: Schema.Types.ObjectId,
    ref: 'Province',
    required: [true, 'Province reference is required']
  },
  district_id: {
    type: Schema.Types.ObjectId,
    ref: 'District',
    required: [true, 'District reference is required']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [500, 'Location cannot exceed 500 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  long: {
    type: String,
    trim: true
  },
  lat: {
    type: String,
    trim: true
  },
  is_reg: {
    type: Boolean,
    default: false
  },
  reg_from_wafaq: {
    type: String,
    trim: true,
    maxlength: [100, 'Registration from Wafaq cannot exceed 100 characters']
  },
  school_of_thought: {
    type: String,
    trim: true,
    maxlength: [100, 'School of thought cannot exceed 100 characters']
  },
  cooperation_status: {
    type: Boolean,
    default: false
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [1000, 'Remarks cannot exceed 1000 characters']
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
  collection: 'madaris'
});

// Indexes
madarisSchema.index({ name: 1, prov_id: 1, district_id: 1 }, { unique: true });
madarisSchema.index({ prov_id: 1 });
madarisSchema.index({ district_id: 1 });
madarisSchema.index({ status: 1 });

// Text index for search
madarisSchema.index({ 
  name: 'text', 
  reg_no: 'text', 
  location: 'text',
  phone: 'text',
  remarks: 'text'
});

const Madaris = mongoose.model('Madaris', madarisSchema);

module.exports = Madaris;
