const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const madarisBankAccountSchema = new Schema({
  madrassaId: {
    type: Schema.Types.ObjectId,
    ref: 'Madaris',
    required: [true, 'Madrassa reference is required']
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true,
    maxlength: [100, 'Bank name cannot exceed 100 characters']
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true,
    maxlength: [50, 'Account number cannot exceed 50 characters']
  },
  accountTitle: {
    type: String,
    required: [true, 'Account title is required'],
    trim: true,
    maxlength: [200, 'Account title cannot exceed 200 characters']
  },
  branchCode: {
    type: String,
    trim: true,
    maxlength: [20, 'Branch code cannot exceed 20 characters']
  },
  branchAddress: {
    type: String,
    trim: true,
    maxlength: [500, 'Branch address cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [1000, 'Remarks cannot exceed 1000 characters']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  collection: 'madaris_bank_accounts'
});

// Indexes
madarisBankAccountSchema.index({ madrassaId: 1, accountNumber: 1 }, { unique: true });

// Virtual for populating madrassa details
madarisBankAccountSchema.virtual('madrassa', {
  ref: 'Madaris',
  localField: 'madrassaId',
  foreignField: '_id',
  justOne: true
});

const MadarisBankAccount = mongoose.model('MadarisBankAccount', madarisBankAccountSchema);

module.exports = MadarisBankAccount;
