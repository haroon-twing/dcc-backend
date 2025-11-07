const mongoose = require('mongoose');

const leadResponseSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: [true, 'Lead ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  isReadByCreator: {
    type: Boolean,
    default: false
  },
  readByCreatorAt: {
    type: Date
  },
  isReadByTarget: {
    type: Boolean,
    default: false
  },
  readByTargetAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better performance
leadResponseSchema.index({ leadId: 1, createdAt: -1 });
leadResponseSchema.index({ userId: 1 });
leadResponseSchema.index({ targetUserId: 1 });
leadResponseSchema.index({ isReadByCreator: 1 });
leadResponseSchema.index({ isReadByTarget: 1 });

// Update timestamp on save
leadResponseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LeadResponse', leadResponseSchema);
