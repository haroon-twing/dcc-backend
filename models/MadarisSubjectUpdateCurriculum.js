const mongoose = require('mongoose');

const madarisSubjectUpdateCurriculumSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  chap_no: {
    type: String,
    required: [true, 'Chapter number is required'],
    trim: true
  },
  updated_on_date: {
    type: Date,
    required: [true, 'Updated on date is required']
  },
  updated_for_class: {
    type: String,
    required: [true, 'Updated for class is required'],
    trim: true
  },
  updated_for_age_group: {
    type: String,
    required: [true, 'Updated for age group is required'],
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
  collection: 'madaris_subject_update_curriculum'
});

// Indexes
madarisSubjectUpdateCurriculumSchema.index({ subject: 1, updated_for_class: 1, is_active: 1 });

// Text index for search
madarisSubjectUpdateCurriculumSchema.index(
  { 
    subject: 'text',
    chap_no: 'text',
    updated_for_class: 'text',
    updated_for_age_group: 'text',
    remarks: 'text'
  },
  {
    weights: {
      subject: 10,
      chap_no: 5,
      updated_for_class: 5,
      updated_for_age_group: 3,
      remarks: 1
    },
    name: 'text_search_index'
  }
);

const MadarisSubjectUpdateCurriculum = mongoose.model('MadarisSubjectUpdateCurriculum', madarisSubjectUpdateCurriculumSchema);

module.exports = MadarisSubjectUpdateCurriculum;
