const mongoose = require('mongoose');

const ngoMainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'NGO name is required'],
    trim: true,
    maxlength: [255, 'NGO name cannot exceed 255 characters']
  },
  field_of_work: {
    type: String,
    required: [true, 'Field of work is required'],
    trim: true
  },
  operating_area_district_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LuDistrict',
    required: [true, 'Operating district is required']
  },
  funding_source: {
    type: String,
    required: [true, 'Funding source is required'],
    trim: true
  },
  known_affiliate_linkage: {
    type: String,
    required: [true, 'Affiliate linkage information is required'],
    trim: true
  },
  is_involve_financial_irregularities: {
    type: Boolean,
    default: false
  },
  is_against_national_interest: {
    type: Boolean,
    default: false
  },
  nature_antinational_activity: {
    type: String,
    trim: true,
    required: function() {
      return this.is_against_national_interest === true;
    }
  },
  remarks: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'ngo_main'
});

// Indexes
ngoMainSchema.index({ name: 1, operating_area_district_id: 1 }, { unique: true });
ngoMainSchema.index({ is_active: 1 });

// Text index for search functionality
ngoMainSchema.index(
  { 
    'name': 'text',
    'field_of_work': 'text',
    'funding_source': 'text',
    'known_affiliate_linkage': 'text',
    'remarks': 'text'
  },
  {
    name: 'ngo_search_index',
    weights: {
      name: 5,
      field_of_work: 3,
      funding_source: 2,
      known_affiliate_linkage: 2,
      remarks: 1
    }
  }
);

const NGOMain = mongoose.model('NGOMain', ngoMainSchema);

module.exports = NGOMain;
