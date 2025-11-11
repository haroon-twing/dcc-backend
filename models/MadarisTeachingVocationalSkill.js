const mongoose = require('mongoose');

const madarisTeachingVocationalSkillSchema = new mongoose.Schema({
  madaris_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Madaris',
    required: [true, 'Madrassa reference is required']
  },
  voc_skill_offered: {
    type: String,
    required: [true, 'Vocational skill offered is required'],
    trim: true,
    maxlength: [255, 'Vocational skill offered cannot exceed 255 characters']
  },
  age_group_offered: {
    type: String,
    required: [true, 'Age group offered is required'],
    trim: true,
    maxlength: [100, 'Age group offered cannot exceed 100 characters']
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [1000, 'Remarks cannot exceed 1000 characters']
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'madaris_teaching_vocational_skills'
});

// Indexes
madarisTeachingVocationalSkillSchema.index({ madaris_id: 1 });

// Create a compound index for unique constraint on voc_skill_offered and madaris_id
madarisTeachingVocationalSkillSchema.index(
  { voc_skill_offered: 1, madaris_id: 1 },
  { unique: true, name: 'unique_voc_skill_madaris' }
);

const MadarisTeachingVocationalSkill = mongoose.model('MadarisTeachingVocationalSkill', madarisTeachingVocationalSkillSchema);

module.exports = MadarisTeachingVocationalSkill;
