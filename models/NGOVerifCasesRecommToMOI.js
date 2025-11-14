const mongoose = require('mongoose');

const ngoVerifCasesRecommToMOISchema = new mongoose.Schema({
  recomm_by: {
    type: String,
    required: [true, 'Recommended by is required'],
    trim: true,
    maxlength: [255, 'Recommended by cannot exceed 255 characters']
  },
  recomm_date: {
    type: Date,
    required: [true, 'Recommendation date is required']
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
  case_reference: {
    type: String,
    trim: true,
    maxlength: [100, 'Case reference cannot exceed 100 characters']
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'In Progress', 'Completed', 'Rejected'],
    required: [true, 'Status is required']
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
  collection: 'ngo_verif_cases_recomm_moi'
});

// Indexes
ngoVerifCasesRecommToMOISchema.index({ ngo_id: 1, recomm_date: -1 });
ngoVerifCasesRecommToMOISchema.index({ is_active: 1 });
ngoVerifCasesRecommToMOISchema.index({ status: 1 });

// Text index for search functionality
ngoVerifCasesRecommToMOISchema.index(
  { 
    'recomm_by': 'text',
    'action_taken': 'text',
    'remarks': 'text',
    'case_reference': 'text'
  },
  {
    name: 'ngo_verif_cases_recomm_moi_search_index',
    weights: {
      case_reference: 5,
      recomm_by: 3,
      action_taken: 3,
      remarks: 1
    }
  }
);

const NGOVerifCasesRecommToMOI = mongoose.model('NGOVerifCasesRecommToMOI', ngoVerifCasesRecommToMOISchema);

module.exports = NGOVerifCasesRecommToMOI;
