const mongoose = require('mongoose');

const safecityMeasuresTakenSchema = new mongoose.Schema({
  measure_taken: {
    type: String,
    required: [true, 'Measure taken is required'],
    trim: true
  },
  measure_taken_authority: {
    type: String,
    required: [true, 'Authority that took the measure is required'],
    trim: true
  },
  details: {
    type: String,
    required: [true, 'Details of the measure are required'],
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  sc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SafecityMain',
    required: [true, 'SafecityMain ID is required'],
    index: true
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
  collection: 'safecity_measures_taken'
});

// Text index for search functionality
safecityMeasuresTakenSchema.index(
  { 
    'measure_taken': 'text',
    'measure_taken_authority': 'text',
    'details': 'text',
    'remarks': 'text'
  },
  {
    name: 'safecity_measures_search_index',
    weights: {
      measure_taken: 3,
      measure_taken_authority: 2,
      details: 1,
      remarks: 1
    }
  }
);

// Index for frequently queried fields
safecityMeasuresTakenSchema.index({ sc_id: 1, is_active: 1 });

const SafecityMeasuresTaken = mongoose.model('SafecityMeasuresTaken', safecityMeasuresTakenSchema);

module.exports = SafecityMeasuresTaken;
