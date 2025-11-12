const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Participant name is required'],
    trim: true
  },
  designation: {
    type: String,
    required: [true, 'Participant designation is required'],
    trim: true
  },
  organization: {
    type: String,
    required: [true, 'Participant organization is required'],
    trim: true
  }
}, { _id: false });

const madarisMeetingHeldSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Meeting date is required']
  },
  agenda: {
    type: String,
    required: [true, 'Meeting agenda is required'],
    trim: true
  },
  participants: [participantSchema],
  location: {
    type: String,
    required: [true, 'Meeting location is required'],
    trim: true
  },
  decision_made: {
    type: String,
    required: [true, 'Decision made is required'],
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  madaris_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Madaris',
    required: [true, 'Madrasa reference is required']
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'madaris_meetings_held'
});

// Indexes
madarisMeetingHeldSchema.index({ madaris_id: 1, date: -1 });

// Add text index for search functionality
madarisMeetingHeldSchema.index(
  { 
    agenda: 'text',
    'participants.name': 'text',
    location: 'text',
    decision_made: 'text',
    notes: 'text'
  },
  {
    weights: {
      agenda: 10,
      'participants.name': 5,
      decision_made: 8,
      location: 3,
      notes: 2
    },
    name: 'text_search_index'
  }
);

const MadarisMeetingHeld = mongoose.model('MadarisMeetingHeld', madarisMeetingHeldSchema);

module.exports = MadarisMeetingHeld;
