const mongoose = require('mongoose');

const madarisCurriculumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft',
    required: true
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
  collection: 'madaris_curriculum'
});

// Indexes
madarisCurriculumSchema.index({ title: 1, status: 1, is_active: 1 });

// Text index for search
madarisCurriculumSchema.index(
  { 
    title: 'text',
    description: 'text',
    status: 'text',
    remarks: 'text'
  },
  {
    weights: {
      title: 10,
      description: 5,
      status: 3,
      remarks: 2
    },
    name: 'text_search_index'
  }
);

const MadarisCurriculum = mongoose.model('MadarisCurriculum', madarisCurriculumSchema);

module.exports = MadarisCurriculum;
