const mongoose = require('mongoose');

const safecityPoliceStationConnectivitySchema = new mongoose.Schema({
  no_of_ps_connected: {
    type: Number,
    required: [true, 'Number of connected police stations is required'],
    min: [0, 'Number of connected police stations cannot be negative'],
    default: 0
  },
  no_of_ps_unconnected: {
    type: Number,
    required: [true, 'Number of unconnected police stations is required'],
    min: [0, 'Number of unconnected police stations cannot be negative'],
    default: 0
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
  collection: 'safecity_police_station_connectivity'
});

// Index for frequently queried fields
safecityPoliceStationConnectivitySchema.index({ sc_id: 1, is_active: 1 });

// Text index for search functionality
safecityPoliceStationConnectivitySchema.index(
  { 'remarks': 'text' },
  {
    name: 'police_connectivity_search_index',
    weights: {
      remarks: 1
    }
  }
);

const SafecityPoliceStationConnectivity = mongoose.model('SafecityPoliceStationConnectivity', safecityPoliceStationConnectivitySchema);

module.exports = SafecityPoliceStationConnectivity;