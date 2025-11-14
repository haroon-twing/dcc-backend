const mongoose = require('mongoose');

const safecityMainSchema = new mongoose.Schema({
  province_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Province',
    required: [true, 'Province ID is required'],
    index: true
  },
  district_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: [true, 'District ID is required'],
    index: true
  },
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: [true, 'City ID is required'],
    index: true
  },
  approval_date: {
    type: Date,
    required: [true, 'Approval date is required']
  },
  present_status: {
    type: String,
    required: [true, 'Present status is required'],
    trim: true
  },
  no_of_total_cameras: {
    type: Number,
    required: [true, 'Number of total cameras is required'],
    min: [0, 'Number of total cameras cannot be negative']
  },
  active_cameras: {
    type: Number,
    required: [true, 'Number of active cameras is required'],
    min: [0, 'Number of active cameras cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.no_of_total_cameras;
      },
      message: 'Active cameras cannot exceed total cameras'
    }
  },
  inactive_cameras: {
    type: Number,
    required: [true, 'Number of inactive cameras is required'],
    min: [0, 'Number of inactive cameras cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.no_of_total_cameras;
      },
      message: 'Inactive cameras cannot exceed total cameras'
    }
  },
  fr_cameras: {
    type: Number,
    required: [true, 'Number of FR cameras is required'],
    min: [0, 'Number of FR cameras cannot be negative']
  },
  non_fr_cameras: {
    type: Number,
    required: [true, 'Number of non-FR cameras is required'],
    min: [0, 'Number of non-FR cameras cannot be negative']
  },
  no_of_employees: {
    type: Number,
    required: [true, 'Number of employees is required'],
    min: [0, 'Number of employees cannot be negative']
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
  collection: 'safecity_main'
});

// Compound index for location-based queries
safecityMainSchema.index({ province_id: 1, district_id: 1, city_id: 1 });

// Text index for search functionality
safecityMainSchema.index(
  { 
    'present_status': 'text',
    'remarks': 'text'
  },
  {
    name: 'safecity_search_index',
    weights: {
      present_status: 3,
      remarks: 1
    }
  }
);

const SafecityMain = mongoose.model('SafecityMain', safecityMainSchema);

module.exports = SafecityMain;
