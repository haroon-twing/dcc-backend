const asyncHandler = require('express-async-handler');
const SafecityPoliceStationConnectivity = require('../models/SafecityPoliceStationConnectivity');
const mongoose = require('mongoose');

// @desc    Get SafecityPoliceStationConnectivity records by sc_id
// @route   GET /api/safecity/get-safecitypolicestationconnectivities/:sc_id
// @access  Public
const getAllSafecityPoliceStationConnectivities = asyncHandler(async (req, res) => {
  try {
    const { sc_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sc_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sc_id format'
      });
    }

    const records = await SafecityPoliceStationConnectivity.find({ 
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

// @desc    Get single SafecityPoliceStationConnectivity record
// @route   GET /api/safecity/get-single-safecitypolicestationconnectivity/:id
// @access  Public
const getSafecityPoliceStationConnectivity = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await SafecityPoliceStationConnectivity.findOne({ _id: id, is_active: true })
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

// @desc    Add new SafecityPoliceStationConnectivity record
// @route   POST /api/safecity/add-safecitypolicestationconnectivity
// @access  Private
const addSafecityPoliceStationConnectivity = asyncHandler(async (req, res) => {
  try {
    const {
      no_of_ps_connected = 0,
      no_of_ps_unconnected = 0,
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

    // Check if record already exists for this SafecityMain
    const existingRecord = await SafecityPoliceStationConnectivity.findOne({ sc_id });
    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'Record already exists for this SafecityMain'
      });
    }

    // Create new record
    const newRecord = new SafecityPoliceStationConnectivity({
      no_of_ps_connected,
      no_of_ps_unconnected,
      remarks,
      sc_id,
      created_by: req.user?._id
    });

    const createdRecord = await newRecord.save();

    // Populate the created record
    const populatedRecord = await SafecityPoliceStationConnectivity.findById(createdRecord._id)
      .populate('sc_id', 'present_status')
      .populate('created_by', 'name');

    res.status(201).json({
      success: true,
      message: 'Police station connectivity record created successfully',
      data: populatedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating police station connectivity record',
      error: error.message
    });
  }
});

// @desc    Update SafecityPoliceStationConnectivity record
// @route   PUT /api/safecity/update-safecitypolicestationconnectivity/:id
// @access  Private
const updateSafecityPoliceStationConnectivity = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      no_of_ps_connected,
      no_of_ps_unconnected,
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
    const record = await SafecityPoliceStationConnectivity.findOne({ _id: id, is_active: true });
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or has been deleted'
      });
    }

    // Update fields if provided
    if (no_of_ps_connected !== undefined) record.no_of_ps_connected = no_of_ps_connected;
    if (no_of_ps_unconnected !== undefined) record.no_of_ps_unconnected = no_of_ps_unconnected;
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
      // Check if another record already exists with the new sc_id
      const existingRecord = await SafecityPoliceStationConnectivity.findOne({ sc_id });
      if (existingRecord && existingRecord._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'Another record already exists for the specified SafecityMain'
        });
      }
      record.sc_id = sc_id;
    }

    // Update the updated_by field if user is authenticated
    if (req.user) {
      record.updated_by = req.user._id;
    }

    const updatedRecord = await record.save();

    // Populate the updated record
    const populatedRecord = await SafecityPoliceStationConnectivity.findById(updatedRecord._id)
      .populate('sc_id', 'present_status')
      .populate('updated_by', 'name')
      .populate('created_by', 'name');

    res.status(200).json({
      success: true,
      message: 'Police station connectivity record updated successfully',
      data: populatedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating police station connectivity record',
      error: error.message
    });
  }
});

// @desc    Delete SafecityPoliceStationConnectivity record (soft delete)
// @route   DELETE /api/safecity/delete-safecitypolicestationconnectivity/:id
// @access  Private
const deleteSafecityPoliceStationConnectivity = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await SafecityPoliceStationConnectivity.findOne({ _id: id, is_active: true });
    
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
      message: 'Police station connectivity record deleted successfully',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting police station connectivity record',
      error: error.message
    });
  }
});

module.exports = {
  getAllSafecityPoliceStationConnectivities,
  getSafecityPoliceStationConnectivity,
  addSafecityPoliceStationConnectivity,
  updateSafecityPoliceStationConnectivity,
  deleteSafecityPoliceStationConnectivity
};
