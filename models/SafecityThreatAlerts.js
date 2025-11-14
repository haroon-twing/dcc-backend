const mongoose = require('mongoose');

const safecityThreatAlertsSchema = new mongoose.Schema({
  no_of_ta_issued: {
    type: Number,
    required: [true, 'Number of threat alerts issued is required'],
    min: [0, 'Number of threat alerts cannot be negative'],
    default: 0
  },
  no_of_actions_taken: {
    type: Number,
    required: [true, 'Number of actions taken is required'],
    min: [0, 'Number of actions taken cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.no_of_ta_issued;
      },
      message: 'Actions taken cannot exceed number of threat alerts issued'
    },
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
  collection: 'safecity_threat_alerts'
});

// Index for frequently queried fields
safecityThreatAlertsSchema.index({ sc_id: 1, is_active: 1 });

// Text index for search functionality
safecityThreatAlertsSchema.index(
  { 'remarks': 'text' },
  {
    name: 'threat_alerts_search_index',
    weights: {
      remarks: 1
    }
  }
);

const SafecityThreatAlerts = mongoose.model('SafecityThreatAlerts', safecityThreatAlertsSchema);

module.exports = SafecityThreatAlerts;
