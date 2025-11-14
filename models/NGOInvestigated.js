const mongoose = require('mongoose');

const ngoInvestigatedSchema = new mongoose.Schema({
  investigating_agency_dept: {
    type: String,
    required: [true, 'Investigating agency/department is required'],
    trim: true,
    maxlength: [255, 'Agency/Department name cannot exceed 255 characters']
  },
  nature_of_allegation: {
    type: String,
    required: [true, 'Nature of allegation is required'],
    trim: true
  },
  action_taken: {
    type: String,
    required: [true, 'Action taken is required'],
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  ngo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGOMain',
    required: [true, 'NGO reference is required']
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
  },
  investigation_date: {
    type: Date,
    required: [true, 'Investigation date is required']
  },
  status: {
    type: String,
    enum: ['Ongoing', 'Completed', 'Referred', 'Closed'],
    default: 'Ongoing'
  }
}, {
  timestamps: true,
  collection: 'ngo_investigated'
});

// Indexes
ngoInvestigatedSchema.index({ ngo_id: 1, investigation_date: -1 });
ngoInvestigatedSchema.index({ is_active: 1 });
ngoInvestigatedSchema.index({ status: 1 });

// Text index for search functionality
ngoInvestigatedSchema.index(
  { 
    'investigating_agency_dept': 'text',
    'nature_of_allegation': 'text',
    'action_taken': 'text',
    'remarks': 'text'
  },
  {
    name: 'ngo_investigated_search_index',
    weights: {
      investigating_agency_dept: 3,
      nature_of_allegation: 3,
      action_taken: 3,
      remarks: 1
    }
  }
);

const NGOInvestigated = mongoose.model('NGOInvestigated', ngoInvestigatedSchema);

module.exports = NGOInvestigated;
