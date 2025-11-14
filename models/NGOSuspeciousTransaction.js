const mongoose = require('mongoose');

const ngoSuspeciousTransactionSchema = new mongoose.Schema({
  source_of_reported_transaction: {
    type: String,
    required: [true, 'Source of reported transaction is required'],
    trim: true,
    maxlength: [255, 'Source cannot exceed 255 characters']
  },
  nature_susp_trans: {
    type: String,
    required: [true, 'Nature of suspicious transaction is required'],
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
  transaction_date: {
    type: Date,
    required: [true, 'Transaction date is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  currency: {
    type: String,
    default: 'PKR',
    required: [true, 'Currency is required']
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
  status: {
    type: String,
    default: 'Reported'
  }
}, {
  timestamps: true,
  collection: 'ngo_suspecious_transactions'
});

// Indexes
ngoSuspeciousTransactionSchema.index({ ngo_id: 1, transaction_date: -1 });
ngoSuspeciousTransactionSchema.index({ is_active: 1 });
ngoSuspeciousTransactionSchema.index({ status: 1 });

// Text index for search functionality
ngoSuspeciousTransactionSchema.index(
  { 
    'source_of_reported_transaction': 'text',
    'nature_susp_trans': 'text',
    'action_taken': 'text',
    'remarks': 'text'
  },
  {
    name: 'ngo_suspecious_transactions_search_index',
    weights: {
      source_of_reported_transaction: 3,
      nature_susp_trans: 3,
      action_taken: 3,
      remarks: 1
    }
  }
);

const NGOSuspeciousTransaction = mongoose.model('NGOSuspeciousTransaction', ngoSuspeciousTransactionSchema);

module.exports = NGOSuspeciousTransaction;
