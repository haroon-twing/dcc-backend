const mongoose = require('mongoose');

const madarisCurriculumSubjectAssignmentSchema = new mongoose.Schema({
  curriculum_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MadarisCurriculum',
    required: [true, 'Curriculum ID is required'],
    index: true
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MadarisSubjectCurriculum',
    required: [true, 'Subject ID is required'],
    index: true
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
  collection: 'madaris_curriculum_subject_assignments'
});

// Compound index to ensure unique active assignments
madarisCurriculumSubjectAssignmentSchema.index(
  { 
    curriculum_id: 1, 
    subject_id: 1, 
    is_active: 1 
  },
  { 
    unique: true,
    partialFilterExpression: { is_active: true }
  }
);

// Text index for search if needed
madarisCurriculumSubjectAssignmentSchema.index(
  { 
    'curriculum_id': 'text',
    'subject_id': 'text'
  },
  {
    name: 'assignment_search_index'
  }
);

const MadarisCurriculumSubjectAssignment = mongoose.model(
  'MadarisCurriculumSubjectAssignment', 
  madarisCurriculumSubjectAssignmentSchema
);

module.exports = MadarisCurriculumSubjectAssignment;
