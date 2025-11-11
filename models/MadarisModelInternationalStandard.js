const mongoose = require('mongoose');

const madarisModelInternationalStandardSchema = new mongoose.Schema({
  authority_qualifies: {
    type: String,
    required: [true, 'Authority that qualifies is required'],
    trim: true,
    maxlength: [255, 'Authority name cannot exceed 255 characters']
  },
  date_of_acceptance: {
    type: Date,
    required: [true, 'Date of acceptance is required']
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
  collection: 'madaris_model_international_standards'
});

// Indexes
madarisModelInternationalStandardSchema.index({ madaris_id: 1 });

// Create a compound index for better query performance
madarisModelInternationalStandardSchema.index(
  { madaris_id: 1, authority_qualifies: 1 },
  { unique: true, name: 'unique_madaris_authority' }
);

const MadarisModelInternationalStandard = mongoose.model(
  'MadarisModelInternationalStandard',
  madarisModelInternationalStandardSchema
);

module.exports = MadarisModelInternationalStandard;
