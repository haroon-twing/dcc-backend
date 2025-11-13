const mongoose = require('mongoose');

const madarisSubjectCurriculumSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  added_on_date: {
    type: Date,
    required: [true, 'Added on date is required']
  },
  added_for_class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true
  },
  added_for_agegroup: {
    type: String,
    required: [true, 'Age group is required'],
    trim: true
  },
  remarks: {
    type: String,
    trim: true
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
  collection: 'madaris_subject_curriculum'
});

// Indexes
madarisSubjectCurriculumSchema.index({ subject: 1, added_for_class: 1, is_active: 1 });

// Text index for search
madarisSubjectCurriculumSchema.index(
  { 
    subject: 'text',
    added_for_class: 'text',
    added_for_agegroup: 'text',
    remarks: 'text'
  },
  {
    weights: {
      subject: 10,
      added_for_class: 5,
      added_for_agegroup: 3,
      remarks: 1
    },
    name: 'text_search_index'
  }
);

const MadarisSubjectCurriculum = mongoose.model('MadarisSubjectCurriculum', madarisSubjectCurriculumSchema);

module.exports = MadarisSubjectCurriculum;
