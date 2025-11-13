const mongoose = require('mongoose');

const madarisActionAgainstIllegalMadarisSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  role_of_institute: {
    type: String,
    required: [true, 'Role of institute is required'],
    trim: true,
    maxlength: [200, 'Role of institute cannot exceed 200 characters']
  },
  what_action_taken: {
    type: String,
    required: [true, 'Action taken is required'],
    trim: true,
    maxlength: [1000, 'Action taken cannot exceed 1000 characters']
  },
  date_of_action_taken: {
    type: Date,
    required: [true, 'Date of action taken is required']
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [1000, 'Remarks cannot exceed 1000 characters']
  },
  madaris_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Madaris',
    required: [true, 'Madrasa reference is required']
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  collection: 'madaris_action_against_illegal_madaris'
});

// Indexes
madarisActionAgainstIllegalMadarisSchema.index({ madaris_id: 1, is_active: 1 });

// Virtual for populating madrasa details
madarisActionAgainstIllegalMadarisSchema.virtual('madrasa', {
  ref: 'Madaris',
  localField: 'madaris_id',
  foreignField: '_id',
  justOne: true
});

// Pre-save hook to update timestamps
madarisActionAgainstIllegalMadarisSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  if (this.isNew) {
    this.created_at = this.updated_at;
  }
  next();
});

module.exports = mongoose.model('MadarisActionAgainstIllegalMadaris', madarisActionAgainstIllegalMadarisSchema);
