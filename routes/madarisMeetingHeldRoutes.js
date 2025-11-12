const express = require('express');
const router = express.Router();
const {
  getAllMeetings,
  getMeetingById,
  addMeeting,
  updateMeeting,
  deleteMeeting,
  addParticipant,
  updateParticipant,
  removeParticipant
} = require('../controllers/madarisMeetingHeldController');

// @route   GET /api/madaris/get-meetings/:madaris_id
// @desc    Get all meetings for a specific madrasa
router.get('/get-meetings/:madaris_id', getAllMeetings);

// @route   GET /api/madaris/get-single-meeting/:id
// @desc    Get single meeting by ID
router.get('/get-single-meeting/:id', getMeetingById);

// @route   POST /api/madaris/add-meeting
// @desc    Add a new meeting
router.post('/add-meeting', addMeeting);

// @route   PUT /api/madaris/update-meeting/:id
// @desc    Update a meeting
router.put('/update-meeting/:id', updateMeeting);

// @route   DELETE /api/madaris/delete-meeting/:id
// @desc    Delete a meeting (soft delete)
router.delete('/delete-meeting/:id', deleteMeeting);

// @route   POST /api/madaris/add-participant/:meetingId
// @desc    Add a participant to a meeting
router.post('/add-participant/:meetingId', addParticipant);

// @route   PUT /api/madaris/update-participant/:meetingId/:participantIndex
// @desc    Update a participant in a meeting
router.put('/update-participant/:meetingId/:participantIndex', updateParticipant);

// @route   DELETE /api/madaris/delete-participant/:meetingId/:participantIndex
// @desc    Remove a participant from a meeting
router.delete('/delete-participant/:meetingId/:participantIndex', removeParticipant);

module.exports = router;
