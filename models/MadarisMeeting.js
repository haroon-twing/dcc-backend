const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const madarisMeetingSchema = new Schema({
  madrassaId: {
    type: Schema.Types.ObjectId,
    ref: 'Madaris',
    required: [true, 'Madrassa reference is required']
  },
  date: {
    type: Date,
    required: [true, 'Meeting date is required']
  },
  agenda: {
    type: String,
    required: [true, 'Meeting agenda is required'],
    trim: true,
    maxlength: [500, 'Agenda cannot exceed 500 characters']
  },
  participants: [{
    name: {
      type: String,
      required: [true, 'Participant name is required'],
      trim: true
    },
    designation: {
      type: String,
      trim: true
    },
    organization: {
      type: String,
      trim: true
    }
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  decisionsTaken: {
    type: [String],
    required: [true, 'Decisions made are required'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one decision must be provided'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  collection: 'madaris_meetings'
});

// Indexes
madarisMeetingSchema.index({ madrassaId: 1, date: -1 });

// Virtual for populating madrassa details
madarisMeetingSchema.virtual('madrassa', {
  ref: 'Madaris',
  localField: 'madrassaId',
  foreignField: '_id',
  justOne: true
});

const MadarisMeeting = mongoose.model('MadarisMeeting', madarisMeetingSchema);

module.exports = MadarisMeeting;
