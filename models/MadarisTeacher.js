const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const madarisTeacherSchema = new Schema({
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  cnic: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{5}-\d{7}-\d{1}$/, 'Please enter a valid CNIC in the format: 12345-1234567-1']
  },
  contact_no: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
  },
  qualification: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  joining_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  madaris_id: {
    type: Schema.Types.ObjectId,
    ref: 'Madaris',
    required: true
  },
  isMohtamim: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'madaris_teachers'
});

// Indexes
madarisTeacherSchema.index({ cnic: 1 }, { unique: true });
madarisTeacherSchema.index({ madaris_id: 1 });
madarisTeacherSchema.index({ status: 1 });

module.exports = mongoose.model('MadarisTeacher', madarisTeacherSchema);
