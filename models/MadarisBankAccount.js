const mongoose = require('mongoose');

const madarisBankAccountSchema = new mongoose.Schema({
  bank_name: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true
  },
  acc_no: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true
  },
  acc_title: {
    type: String,
    required: [true, 'Account title is required'],
    trim: true
  },
  branch_code: {
    type: String,
    required: [true, 'Branch code is required'],
    trim: true
  },
  branch_address: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  madaris_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Madaris',
    required: [true, 'Madrassa reference is required']
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'madaris_bank_accounts'
});

// Indexes
madarisBankAccountSchema.index({ madaris_id: 1 });

// Create a compound index for better query performance
madarisBankAccountSchema.index(
  { madaris_id: 1, bank_name: 1, acc_no: 1 },
  { unique: true, name: 'unique_madaris_bank_account' }
);

const MadarisBankAccount = mongoose.model(
  'MadarisBankAccount',
  madarisBankAccountSchema
);

module.exports = MadarisBankAccount;
