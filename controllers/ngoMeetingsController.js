const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const NGOMeetings = require('../models/NGOMeetings');
const NGOMain = require('../models/NGOMain');

// @desc    Get all NGO meetings for a specific NGO
// @route   GET /api/ngo-main/get-all-ngo-meetings/:ngo_id
// @access  Public
const getAllNGOMeetings = asyncHandler(async (req, res) => {
  try {
    const { ngo_id } = req.params;

    if (!ngo_id || !mongoose.Types.ObjectId.isValid(ngo_id)) {
      return res.status(400).json({ success: false, message: 'Valid NGO ID is required' });
    }

    const meetings = await NGOMeetings.aggregate([
      {
        $match: {
          ngo_id: new mongoose.Types.ObjectId(ngo_id),
          is_active: true
        }
      },
      {
        $lookup: {
          from: 'ngo_main',
          localField: 'ngo_id',
          foreignField: '_id',
          as: 'ngo'
        }
      },
      { $unwind: { path: '$ngo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          meeting_conducting_authority: 1,
          no_of_participants: 1,
          conducted_on_date: 1,
          venue: 1,
          agenda: 1,
          decision_taken: 1,
          remarks: 1,
          ngo: { _id: '$ngo._id', name: '$ngo.name' },
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { conducted_on_date: -1, createdAt: -1 } }
    ]);

    res.status(200).json({ success: true, count: meetings.length, data: meetings });
  } catch (error) {
    console.error('Error fetching NGO meetings:', error);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === 'development' ? error.message : 'Server error while fetching NGO meetings' });
  }
});

// @desc    Get single NGO meeting by ID
// @route   GET /api/ngo-main/get-single-ngo-meeting/:id
// @access  Public
const getNGOMeetingById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid NGO meeting ID format' });
    }

    const meeting = await NGOMeetings.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id), is_active: true } },
      {
        $lookup: {
          from: 'ngo_main',
          localField: 'ngo_id',
          foreignField: '_id',
          as: 'ngo'
        }
      },
      { $unwind: { path: '$ngo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          meeting_conducting_authority: 1,
          no_of_participants: 1,
          conducted_on_date: 1,
          venue: 1,
          agenda: 1,
          decision_taken: 1,
          remarks: 1,
          ngo: { _id: '$ngo._id', name: '$ngo.name' },
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    if (!meeting || meeting.length === 0) {
      return res.status(404).json({ success: false, message: 'NGO meeting not found' });
    }

    res.status(200).json({ success: true, data: meeting[0] });
  } catch (error) {
    console.error('Error fetching NGO meeting:', error);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === 'development' ? error.message : 'Server error while fetching NGO meeting' });
  }
});

// @desc    Add a new NGO meeting
// @route   POST /api/ngo-main/add-ngo-meeting
// @access  Private
const addNGOMeeting = asyncHandler(async (req, res) => {
  try {
    const {
      meeting_conducting_authority,
      no_of_participants,
      conducted_on_date,
      venue,
      agenda,
      decision_taken,
      remarks,
      ngo_id
    } = req.body;

    if (!meeting_conducting_authority || no_of_participants === undefined || !conducted_on_date || !venue || !agenda || !decision_taken || !ngo_id) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (!mongoose.Types.ObjectId.isValid(ngo_id)) {
      return res.status(400).json({ success: false, message: 'Invalid NGO ID format' });
    }

    // Ensure ngo_id references an existing and active NGO Main record
    const ngo = await NGOMain.findOne({ _id: ngo_id, is_active: true });
    if (!ngo) {
      return res.status(400).json({ success: false, message: 'Invalid NGO ID: NGO not found or inactive' });
    }

    const meeting = await NGOMeetings.create({
      meeting_conducting_authority,
      no_of_participants: parseInt(no_of_participants, 10) || 0,
      conducted_on_date: new Date(conducted_on_date),
      venue,
      agenda,
      decision_taken,
      remarks,
      ngo_id,
      is_active: true
    });

    res.status(201).json({ success: true, message: 'NGO meeting added successfully', data: meeting });
  } catch (error) {
    console.error('Error adding NGO meeting:', error);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === 'development' ? error.message : 'Server error while adding NGO meeting' });
  }
});

// @desc    Update an NGO meeting
// @route   PUT /api/ngo-main/update-ngo-meeting/:id
// @access  Private
const updateNGOMeeting = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid NGO meeting ID format' });
    }

    const meeting = await NGOMeetings.findById(id);
    if (!meeting || !meeting.is_active) {
      return res.status(404).json({ success: false, message: 'NGO meeting not found' });
    }

    const updatableFields = [
      'meeting_conducting_authority',
      'no_of_participants',
      'conducted_on_date',
      'venue',
      'agenda',
      'decision_taken',
      'remarks'
    ];

    const updates = {};
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Cast fields
    if (updates.no_of_participants !== undefined) {
      updates.no_of_participants = parseInt(updates.no_of_participants, 10) || 0;
    }
    if (updates.conducted_on_date !== undefined) {
      updates.conducted_on_date = new Date(updates.conducted_on_date);
    }

    const updated = await NGOMeetings.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: 'NGO meeting updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating NGO meeting:', error);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === 'development' ? error.message : 'Server error while updating NGO meeting' });
  }
});

// @desc    Delete an NGO meeting (soft delete)
// @route   DELETE /api/ngo-main/delete-ngo-meeting/:id
// @access  Private
const deleteNGOMeeting = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid NGO meeting ID format' });
    }

    const meeting = await NGOMeetings.findById(id);
    if (!meeting || !meeting.is_active) {
      return res.status(404).json({ success: false, message: 'NGO meeting not found' });
    }

    await NGOMeetings.findByIdAndUpdate(id, { is_active: false }, { new: true });

    res.status(200).json({ success: true, message: 'NGO meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting NGO meeting:', error);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === 'development' ? error.message : 'Server error while deleting NGO meeting' });
  }
});

module.exports = {
  getAllNGOMeetings,
  getNGOMeetingById,
  addNGOMeeting,
  updateNGOMeeting,
  deleteNGOMeeting
};
