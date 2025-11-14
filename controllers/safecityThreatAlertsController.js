const asyncHandler = require('express-async-handler');
const SafecityThreatAlerts = require('../models/SafecityThreatAlerts');
const mongoose = require('mongoose');

// @desc    Get SafecityThreatAlerts records by sc_id
// @route   GET /api/safecity/get-safecitythreatalerts/:sc_id
// @access  Public
const getAllSafecityThreatAlerts = asyncHandler(async (req, res) => {
  try {
    const { sc_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sc_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sc_id format'
      });
    }

    const records = await SafecityThreatAlerts.find({ 
      sc_id: sc_id,
      is_active: true 
    })
      .populate('sc_id', 'present_status')
      .populate('created_by', 'name')
      .populate('updated_by', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Get single SafecityThreatAlerts record
// @route   GET /api/safecity/get-single-safecitythreatalert/:id
// @access  Public
const getSafecityThreatAlert = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await SafecityThreatAlerts.findOne({ _id: id, is_active: true })
      .populate('sc_id', 'present_status')
      .populate('created_by', 'name')
      .populate('updated_by', 'name');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or has been deleted'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Add new SafecityThreatAlerts record
// @route   POST /api/safecity/add-safecitythreatalert
// @access  Private
const addSafecityThreatAlert = asyncHandler(async (req, res) => {
  try {
    const {
      no_of_ta_issued = 0,
      no_of_actions_taken = 0,
      remarks = '',
      sc_id
    } = req.body;

    // Validate required fields
    if (!sc_id) {
      return res.status(400).json({
        success: false,
        message: 'SafecityMain ID is required'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(sc_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SafecityMain ID format'
      });
    }

    // Validate no_of_actions_taken doesn't exceed no_of_ta_issued
    if (no_of_actions_taken > no_of_ta_issued) {
      return res.status(400).json({
        success: false,
        message: 'Number of actions taken cannot exceed number of threat alerts issued'
      });
    }

    // Create new record
    const newRecord = new SafecityThreatAlerts({
      no_of_ta_issued,
      no_of_actions_taken,
      remarks,
      sc_id,
      created_by: req.user?._id
    });

    const createdRecord = await newRecord.save();

    // Populate the created record
    const populatedRecord = await SafecityThreatAlerts.findById(createdRecord._id)
      .populate('sc_id', 'present_status')
      .populate('created_by', 'name');

    res.status(201).json({
      success: true,
      message: 'Threat alert record created successfully',
      data: populatedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating threat alert record',
      error: error.message
    });
  }
});

// @desc    Update SafecityThreatAlerts record
// @route   PUT /api/safecity/update-safecitythreatalert/:id
// @access  Private
const updateSafecityThreatAlert = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      no_of_ta_issued,
      no_of_actions_taken,
      remarks,
      sc_id
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    // Find the record
    const record = await SafecityThreatAlerts.findOne({ _id: id, is_active: true });
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or has been deleted'
      });
    }

    // Update fields if provided
    if (no_of_ta_issued !== undefined) record.no_of_ta_issued = no_of_ta_issued;
    if (no_of_actions_taken !== undefined) record.no_of_actions_taken = no_of_actions_taken;
    if (remarks !== undefined) record.remarks = remarks;
    
    // Prevent changing sc_id if it's a different ID
    if (sc_id && sc_id !== record.sc_id.toString()) {
      // Check if new sc_id is valid
      if (!mongoose.Types.ObjectId.isValid(sc_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid SafecityMain ID format'
        });
      }
      record.sc_id = sc_id;
    }

    // Validate no_of_actions_taken doesn't exceed no_of_ta_issued
    if (record.no_of_actions_taken > record.no_of_ta_issued) {
      return res.status(400).json({
        success: false,
        message: 'Number of actions taken cannot exceed number of threat alerts issued'
      });
    }

    // Update the updated_by field if user is authenticated
    if (req.user) {
      record.updated_by = req.user._id;
    }

    const updatedRecord = await record.save();

    // Populate the updated record
    const populatedRecord = await SafecityThreatAlerts.findById(updatedRecord._id)
      .populate('sc_id', 'present_status')
      .populate('updated_by', 'name')
      .populate('created_by', 'name');

    res.status(200).json({
      success: true,
      message: 'Threat alert record updated successfully',
      data: populatedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating threat alert record',
      error: error.message
    });
  }
});

// @desc    Delete SafecityThreatAlerts record (soft delete)
// @route   DELETE /api/safecity/delete-safecitythreatalert/:id
// @access  Private
const deleteSafecityThreatAlert = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await SafecityThreatAlerts.findOne({ _id: id, is_active: true });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or already deleted'
      });
    }

    // Soft delete by setting is_active to false
    record.is_active = false;
    
    // Set updated_by if user is authenticated
    if (req.user) {
      record.updated_by = req.user._id;
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Threat alert record deleted successfully',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting threat alert record',
      error: error.message
    });
  }
});

module.exports = {
  getAllSafecityThreatAlerts,
  getSafecityThreatAlert,
  addSafecityThreatAlert,
  updateSafecityThreatAlert,
  deleteSafecityThreatAlert
};
