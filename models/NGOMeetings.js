const mongoose = require('mongoose');

const ngoMeetingsSchema = new mongoose.Schema({
  meeting_conducting_authority: {
    type: String,
    required: [true, 'Meeting conducting authority is required'],
    trim: true,
    maxlength: [255, 'Authority name cannot exceed 255 characters']
  },
  no_of_participants: {
    type: Number,
    required: [true, 'Number of participants is required'],
    min: [0, 'Number of participants cannot be negative']
  },
  conducted_on_date: {
    type: Date,
    required: [true, 'Meeting date is required']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true,
    maxlength: [500, 'Venue cannot exceed 500 characters']
  },
  agenda: {
    type: String,
    required: [true, 'Agenda is required'],
    trim: true
  },
  decision_taken: {
    type: String,
    required: [true, 'Decision taken is required'],
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  ngo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGOMain',
    required: [true, 'NGO reference is required']
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
  collection: 'ngo_meetings'
});

// Indexes
ngoMeetingsSchema.index({ ngo_id: 1, conducted_on_date: -1 });
ngoMeetingsSchema.index({ is_active: 1 });

// Text index for search functionality
ngoMeetingsSchema.index(
  { 
    'meeting_conducting_authority': 'text',
    'venue': 'text',
    'agenda': 'text',
    'decision_taken': 'text',
    'remarks': 'text'
  },
  {
    name: 'ngo_meetings_search_index',
    weights: {
      meeting_conducting_authority: 3,
      agenda: 3,
      decision_taken: 3,
      venue: 2,
      remarks: 1
    }
  }
);

const NGOMeetings = mongoose.model('NGOMeetings', ngoMeetingsSchema);

module.exports = NGOMeetings;
