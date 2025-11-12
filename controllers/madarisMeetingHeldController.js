const asyncHandler = require('express-async-handler');
const MadarisMeetingHeld = require('../models/MadarisMeetingHeld');
const mongoose = require('mongoose');

// @desc    Get all meetings for a specific madrasa
// @route   GET /api/madaris/get-meetings/:madaris_id
// @access  Public
const getAllMeetings = asyncHandler(async (req, res) => {
  try {
    const { madaris_id } = req.params;
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(madaris_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid madrasa ID format'
      });
    }

    // Build the query
    const query = { 
      madaris_id: new mongoose.Types.ObjectId(madaris_id),
      is_active: true 
    };

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Get total count for pagination
    const total = await MadarisMeetingHeld.countDocuments(query);

    // Get paginated results
    const meetings = await MadarisMeetingHeld.aggregate([
      { $match: query },
      { 
        $lookup: {
          from: 'madaris',
          localField: 'madaris_id',
          foreignField: '_id',
          as: 'madrasa'
        }
      },
      { $unwind: '$madrasa' },
      { $sort: { date: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $project: {
          date: 1,
          agenda: 1,
          participants: 1,
          location: 1,
          decision_made: 1,
          notes: 1,
          'madrasa.name': 1,
          'madrasa._id': 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: meetings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: meetings
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error fetching meetings'
    });
  }
});

// @desc    Get single meeting by ID
// @route   GET /api/madaris/get-single-meeting/:id
// @access  Public
const getMeetingById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meeting ID format'
      });
    }

    const meeting = await MadarisMeetingHeld.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          is_active: true
        }
      },
      {
        $lookup: {
          from: 'madaris',
          localField: 'madaris_id',
          foreignField: '_id',
          as: 'madrasa'
        }
      },
      { $unwind: '$madrasa' },
      {
        $project: {
          date: 1,
          agenda: 1,
          participants: 1,
          location: 1,
          decision_made: 1,
          notes: 1,
          'madrasa.name': 1,
          'madrasa._id': 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    if (!meeting || meeting.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    res.status(200).json({
      success: true,
      data: meeting[0]
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error fetching meeting'
    });
  }
});

// @desc    Add a new meeting
// @route   POST /api/madaris/add-meeting
// @access  Public
const addMeeting = asyncHandler(async (req, res) => {
  try {
    const { 
      date, 
      agenda, 
      participants, 
      location, 
      decision_made, 
      notes, 
      madaris_id 
    } = req.body;

    // Validate required fields
    if (!date || !agenda || !location || !decision_made || !madaris_id) {
      return res.status(400).json({
        success: false,
        message: 'Date, agenda, location, decision made, and madrasa ID are required fields'
      });
    }

    // Validate participants array
    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one participant is required'
      });
    }

    // Validate each participant
    for (const participant of participants) {
      if (!participant.name || !participant.designation || !participant.organization) {
        return res.status(400).json({
          success: false,
          message: 'Each participant must have name, designation, and organization'
        });
      }
    }

    const newMeeting = await MadarisMeetingHeld.create({
      date: new Date(date),
      agenda,
      participants,
      location,
      decision_made,
      notes,
      madaris_id,
      is_active: true
    });

    res.status(201).json({
      success: true,
      message: 'Meeting added successfully',
      data: newMeeting
    });
  } catch (error) {
    console.error('Error adding meeting:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error adding meeting'
    });
  }
});

// @desc    Update a meeting
// @route   PUT /api/madaris/update-meeting/:id
// @access  Public
const updateMeeting = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      date, 
      agenda, 
      participants, 
      location, 
      decision_made, 
      notes 
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meeting ID format'
      });
    }

    // Check if meeting exists and is active
    const existingMeeting = await MadarisMeetingHeld.findOne({
      _id: id,
      is_active: true
    });

    if (!existingMeeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found or already deleted'
      });
    }

    // Validate participants if provided
    if (participants && Array.isArray(participants)) {
      for (const participant of participants) {
        if (!participant.name || !participant.designation || !participant.organization) {
          return res.status(400).json({
            success: false,
            message: 'Each participant must have name, designation, and organization'
          });
        }
      }
    }

    // Build update object with only provided fields
    const updateData = {};
    if (date) updateData.date = new Date(date);
    if (agenda) updateData.agenda = agenda;
    if (participants) updateData.participants = participants;
    if (location) updateData.location = location;
    if (decision_made) updateData.decision_made = decision_made;
    if (notes !== undefined) updateData.notes = notes;

    const updatedMeeting = await MadarisMeetingHeld.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Meeting updated successfully',
      data: updatedMeeting
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error updating meeting'
    });
  }
});

// @desc    Delete a meeting (soft delete)
// @route   DELETE /api/madaris/delete-meeting/:id
// @access  Public
const deleteMeeting = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meeting ID format'
      });
    }

    // Check if meeting exists and is active
    const existingMeeting = await MadarisMeetingHeld.findOne({
      _id: id,
      is_active: true
    });

    if (!existingMeeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found or already deleted'
      });
    }

    // Soft delete by setting is_active to false
    await MadarisMeetingHeld.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error deleting meeting'
    });
  }
});

// @desc    Add a participant to a meeting
// @route   POST /api/madaris/add-participant/:meetingId
// @access  Public
const addParticipant = asyncHandler(async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { name, designation, organization } = req.body;

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meeting ID format'
      });
    }

    // Validate participant data
    if (!name || !designation || !organization) {
      return res.status(400).json({
        success: false,
        message: 'Name, designation, and organization are required for each participant'
      });
    }

    const updatedMeeting = await MadarisMeetingHeld.findByIdAndUpdate(
      meetingId,
      {
        $push: {
          participants: { name, designation, organization }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedMeeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found or inactive'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Participant added successfully',
      data: updatedMeeting.participants[updatedMeeting.participants.length - 1]
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error adding participant'
    });
  }
});

// @desc    Update a participant in a meeting
// @route   PUT /api/madaris/update-participant/:meetingId/:participantIndex
// @access  Public
const updateParticipant = asyncHandler(async (req, res) => {
  try {
    const { meetingId, participantIndex } = req.params;
    const { name, designation, organization } = req.body;
    const index = parseInt(participantIndex);

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meeting ID format'
      });
    }

    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid participant index'
      });
    }

    // Check if meeting exists and get current participants
    const meeting = await MadarisMeetingHeld.findOne({
      _id: meetingId,
      is_active: true
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found or inactive'
      });
    }

    // Check if participant index is valid
    if (index >= meeting.participants.length) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found at the specified index'
      });
    }

    // Build update object with only provided fields
    const updateObj = {};
    if (name) updateObj[`participants.${index}.name`] = name;
    if (designation) updateObj[`participants.${index}.designation`] = designation;
    if (organization) updateObj[`participants.${index}.organization`] = organization;

    const updatedMeeting = await MadarisMeetingHeld.findByIdAndUpdate(
      meetingId,
      { $set: updateObj },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Participant updated successfully',
      data: updatedMeeting.participants[index]
    });
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error updating participant'
    });
  }
});

// @desc    Remove a participant from a meeting
// @route   DELETE /api/madaris/delete-participant/:meetingId/:participantIndex
// @access  Public
const removeParticipant = asyncHandler(async (req, res) => {
  try {
    const { meetingId, participantIndex } = req.params;
    const index = parseInt(participantIndex);

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meeting ID format'
      });
    }

    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid participant index'
      });
    }

    // Check if meeting exists and get current participants
    const meeting = await MadarisMeetingHeld.findOne({
      _id: meetingId,
      is_active: true
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found or inactive'
      });
    }

    // Check if participant index is valid
    if (index >= meeting.participants.length) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found at the specified index'
      });
    }

    // Remove the participant at the specified index
    meeting.participants.splice(index, 1);
    await meeting.save();

    res.status(200).json({
      success: true,
      message: 'Participant removed successfully'
    });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error removing participant'
    });
  }
});

module.exports = {
  getAllMeetings,
  getMeetingById,
  addMeeting,
  updateMeeting,
  deleteMeeting,
  addParticipant,
  updateParticipant,
  removeParticipant
};
