const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const madarisStudentsSchema = new Schema({
  total_foreign_students: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  total_local_students: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  origin_country: {
    type: Schema.Types.ObjectId,
    ref: 'LuCountry',
    required: true
  },
  remarks: {
    type: String,
    trim: true
  },
  madaris_id: {
    type: Schema.Types.ObjectId,
    ref: 'Madaris',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'madaris_students'
});

// Indexes
madarisStudentsSchema.index({ madaris_id: 1 });
madarisStudentsSchema.index({ origin_country: 1 });

module.exports = mongoose.model('MadarisStudents', madarisStudentsSchema);
