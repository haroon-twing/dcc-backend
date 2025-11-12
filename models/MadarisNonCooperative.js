const mongoose = require('mongoose');

const madarisNonCooperativeSchema = new mongoose.Schema({
  madaris_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Madaris',
    required: [true, 'Madrasa reference is required']
  },
  role_of_institute: {
    type: String,
    required: [true, 'Role of institute is required'],
    trim: true,
    maxlength: [200, 'Role of institute cannot exceed 200 characters']
  },
  nature_of_non_cooperation: {
    type: String,
    required: [true, 'Nature of non-cooperation is required'],
    trim: true,
    maxlength: [500, 'Nature of non-cooperation cannot exceed 500 characters']
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [1000, 'Remarks cannot exceed 1000 characters']
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  collection: 'madaris_non_cooperative'
});

// Indexes
madarisNonCooperativeSchema.index({ madaris_id: 1, is_active: 1 });

// Virtual for populating madrassa details
madarisNonCooperativeSchema.virtual('madrassa', {
  ref: 'Madaris',
  localField: 'madrasis_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for populating createdBy details
madarisNonCooperativeSchema.virtual('createdByUser', {
  ref: 'User',
  localField: 'created_by',
  foreignField: '_id',
  justOne: true
});

// Virtual for populating updatedBy details
madarisNonCooperativeSchema.virtual('updatedByUser', {
  ref: 'User',
  localField: 'updated_by',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('MadarisNonCooperative', madarisNonCooperativeSchema);
