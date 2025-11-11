const MadarisMeeting = require('../models/MadarisMeeting');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// @desc    Add a new madrassa meeting
// @route   POST /api/madaris/add-madaris-meeting+no
// @access  Private
const addMadrassaMeeting = [
  body('madrassaId', 'Valid Madrassa ID is required').isMongoId(),
  body('date', 'Valid meeting date is required').isISO8601(),
  body('agenda', 'Meeting agenda is required').notEmpty(),
  body('participants', 'At least one participant is required').isArray({ min: 1 }),
  body('participants.*.name', 'Participant name is required').notEmpty(),
  body('location', 'Meeting location is required').notEmpty(),
  body('decisionsTaken', 'At least one decision is required').isArray({ min: 1 }),
  
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const meeting = new MadarisMeeting({
      ...req.body,
      createdBy: req.user.id
    });

    const createdMeeting = await meeting.save();
    
    res.status(201).json({
      success: true,
      message: 'Meeting added successfully',
      data: await createdMeeting.populate('madrassa', 'name')
    });
  })
];

// @desc    Get all meetings for a madrassa
// @route   GET /api/madaris/meetings/madrassa/:madrassaId
// @access  Private
const getAllMadrassaMeetings = asyncHandler(async (req, res) => {
  const { madrassaId } = req.params;
  
  const meetings = await MadarisMeeting.find({ madrassaId })
    .populate('madrassa', 'name')
    .populate('createdBy', 'name')
    .sort({ date: -1 });

  res.json({
    success: true,
    count: meetings.length,
    data: meetings
  });
});

// @desc    Get single madrassa meeting
// @route   GET /api/madaris/get-single-madaris-meeting/:id
// @access  Private
const getSingleMadrassaMeeting = asyncHandler(async (req, res) => {
  const meeting = await MadarisMeeting.findById(req.params.id)
    .populate('madrassa', 'name')
    .populate('createdBy', 'name email');

  if (!meeting) {
    return res.status(404).json({
      success: false,
      message: 'Meeting not found'
    });
  }

  res.json({
    success: true,
    data: meeting
  });
});

// @desc    Update madrassa meeting
// @route   PUT /api/madaris/update-madaris-meeting/:id
// @access  Private
const updateMadrassaMeeting = [
  body('date', 'Valid meeting date is required').optional().isISO8601(),
  body('agenda', 'Agenda cannot be empty').optional().notEmpty(),
  body('participants', 'Participants must be an array').optional().isArray(),
  body('participations.*.name', 'Participant name is required').optional().notEmpty(),
  body('location', 'Location cannot be empty').optional().notEmpty(),
  body('decisionsTaken', 'Decisions must be an array').optional().isArray(),
  
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const meeting = await MadarisMeeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'participants') {
        meeting[key] = req.body[key];
      }
    });
    
    // Special handling for participants array
    if (req.body.participants) {
      meeting.participants = req.body.participants;
    }
    
    meeting.updatedBy = req.user.id;
    const updatedMeeting = await meeting.save();

    res.json({
      success: true,
      message: 'Meeting updated successfully',
      data: await updatedMeeting.populate('madrassa', 'name')
    });
  })
];

// @desc    Delete madrassa meeting
// @route   DELETE /api/madaris/delete-madaris-meeting/:id
// @access  Private
const deleteMadrassaMeeting = asyncHandler(async (req, res) => {
  const meeting = await MadarisMeeting.findById(req.params.id);

  if (!meeting) {
    return res.status(404).json({
      success: false,
      message: 'Meeting not found'
    });
  }

  await meeting.deleteOne();

  res.json({
    success: true,
    message: 'Meeting deleted successfully'
  });
});

module.exports = {
  addMadrassaMeeting,
  getSingleMadrassaMeeting,
  getAllMadrassaMeetings,
  updateMadrassaMeeting,
  deleteMadrassaMeeting
};
