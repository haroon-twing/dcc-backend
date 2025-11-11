const mongoose = require('mongoose');

const madarisTeachersSupportHighEducationSchema = new mongoose.Schema({
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MadarisTeacher',
    required: [true, 'Teacher reference is required']
  },
  education_obtain: {
    type: String,
    required: [true, 'Education obtained is required'],
    trim: true,
    maxlength: [255, 'Education obtained cannot exceed 255 characters']
  },
  edu_from: {
    type: String,
    required: [true, 'Education from is required'],
    trim: true,
    maxlength: [255, 'Education from cannot exceed 255 characters']
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [1000, 'Remarks cannot exceed 1000 characters']
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
  collection: 'madaris_teachers_support_high_education'
});

// Indexes
madarisTeachersSupportHighEducationSchema.index({ teacher_id: 1 });
madarisTeachersSupportHighEducationSchema.index({ madaris_id: 1 });

// Create a compound index for better query performance
madarisTeachersSupportHighEducationSchema.index(
  { teacher_id: 1, education_obtain: 1 },
  { unique: true, name: 'unique_teacher_education' }
);

const MadarisTeachersSupportHighEducation = mongoose.model(
  'MadarisTeachersSupportHighEducation',
  madarisTeachersSupportHighEducationSchema
);

module.exports = MadarisTeachersSupportHighEducation;
