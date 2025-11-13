const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const MadarisActionAgainstIllegalMadaris = require('../models/MadarisActionAgainstIllegalMadaris');

// @desc    Get all illegal actions for a madrasa
// @route   GET /api/madaris/get-illegal-actions/:madaris_id
// @access  Public
const getIllegalActions = asyncHandler(async (req, res) => {
  try {
    const { madaris_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(madaris_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid madrasa ID format'
      });
    }

    const actions = await MadarisActionAgainstIllegalMadaris.find({
      madaris_id,
      is_active: true
    }).sort({ date_of_action_taken: -1 });

    res.status(200).json({
      success: true,
      count: actions.length,
      data: actions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Get single illegal action by ID
// @route   GET /api/madaris/get-single-illegal-action/:id
// @access  Public
const getIllegalActionById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action ID format'
      });
    }

    const action = await MadarisActionAgainstIllegalMadaris.findOne({
      _id: id,
      is_active: true
    });

    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Action not found'
      });
    }

    res.status(200).json({
      success: true,
      data: action
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Create a new illegal action
// @route   POST /api/madaris/add-illegal-action
// @access  Private
const createIllegalAction = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      role_of_institute,
      what_action_taken,
      date_of_action_taken,
      remarks,
      madaris_id
    } = req.body;

    // Basic validation
    if (!name || !role_of_institute || !what_action_taken || !date_of_action_taken || !madaris_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(madaris_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid madrasa ID format'
      });
    }

    const newAction = new MadarisActionAgainstIllegalMadaris({
      name,
      role_of_institute,
      what_action_taken,
      date_of_action_taken: new Date(date_of_action_taken),
      remarks,
      madaris_id,
      created_by: req.user?._id || null
    });

    const savedAction = await newAction.save();

    res.status(201).json({
      success: true,
      data: savedAction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Update an illegal action
// @route   PUT /api/madaris/update-illegal-action/:id
// @access  Private
const updateIllegalAction = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action ID format'
      });
    }

    // Convert date string to Date object if provided
    if (updateData.date_of_action_taken) {
      updateData.date_of_action_taken = new Date(updateData.date_of_action_taken);
    }

    const updatedAction = await MadarisActionAgainstIllegalMadaris.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updated_at: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedAction) {
      return res.status(404).json({
        success: false,
        message: 'Action not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedAction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Delete an illegal action (soft delete)
// @route   DELETE /api/madaris/delete-illegal-action/:id
// @access  Private
const deleteIllegalAction = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action ID format'
      });
    }

    const deletedAction = await MadarisActionAgainstIllegalMadaris.findByIdAndUpdate(
      id,
      { 
        is_active: false,
        updated_at: Date.now()
      },
      { new: true }
    );

    if (!deletedAction) {
      return res.status(404).json({
        success: false,
        message: 'Action not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Action deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = {
  getIllegalActions,
  getIllegalActionById,
  createIllegalAction,
  updateIllegalAction,
  deleteIllegalAction
};
