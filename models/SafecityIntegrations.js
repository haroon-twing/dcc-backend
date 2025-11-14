const mongoose = require('mongoose');

const safecityIntegrationsSchema = new mongoose.Schema({
  integ_with_dcc: {
    type: Boolean,
    default: false
  },
  integ_with_piftac: {
    type: Boolean,
    default: false
  },
  integ_with_niftac: {
    type: Boolean,
    default: false
  },
  remarks: {
    type: String,
    trim: true
  },
  sc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SafecityMain',
    required: [true, 'SafecityMain ID is required'],
    index: true,
    unique: true  // One-to-one relationship with SafecityMain
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
  collection: 'safecity_integrations'
});

// Index for frequently queried fields
safecityIntegrationsSchema.index({ sc_id: 1, is_active: 1 });


const SafecityIntegrations = mongoose.model('SafecityIntegrations', safecityIntegrationsSchema);

module.exports = SafecityIntegrations;
