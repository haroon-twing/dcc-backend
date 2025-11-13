const mongoose = require('mongoose');

const madarisMadarisCurriculumAssignmentSchema = new mongoose.Schema({
  madaris_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Madaris',
    required: [true, 'Madaris ID is required'],
    index: true
  },
  curriculum_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MadarisCurriculum',
    required: [true, 'Curriculum ID is required'],
    index: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  assigned_date: {
    type: Date,
    default: Date.now
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
  collection: 'madaris_madaris_curriculum_assignments'
});

// Compound index to ensure unique active assignments
madarisMadarisCurriculumAssignmentSchema.index(
  { 
    madaris_id: 1, 
    curriculum_id: 1, 
    is_active: 1 
  },
  { 
    unique: true,
    partialFilterExpression: { is_active: true }
  }
);

// Text index for search if needed
madarisMadarisCurriculumAssignmentSchema.index(
  { 
    'madaris_id': 'text',
    'curriculum_id': 'text'
  },
  {
    name: 'assignment_search_index'
  }
);

const MadarisMadarisCurriculumAssignment = mongoose.model(
  'MadarisMadarisCurriculumAssignment', 
  madarisMadarisCurriculumAssignmentSchema
);

module.exports = MadarisMadarisCurriculumAssignment;
