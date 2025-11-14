const asyncHandler = require('express-async-handler');
const SafecityIntegrations = require('../models/SafecityIntegrations');
const mongoose = require('mongoose');

// @desc    Get all SafecityIntegrations records
// @route   GET /api/safecity/integrations
// @access  Public
const getAllSafecityIntegrations = asyncHandler(async (req, res) => {
  try {
    const records = await SafecityIntegrations.find({ is_active: true })
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

// @desc    Get single SafecityIntegrations record
// @route   GET /api/safecity/integrations/:id
// @access  Public
const getSafecityIntegration = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await SafecityIntegrations.findOne({
      _id: id,
      is_active: true
    })
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

// @desc    Add new SafecityIntegrations record
// @route   POST /api/safecity/add-integration
// @access  Private
const addSafecityIntegration = asyncHandler(async (req, res) => {
  try {
    const {
      integ_with_dcc = false,
      integ_with_piftac = false,
      integ_with_niftac = false,
      sc_id,
      remarks = ''
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

    // Check if integration already exists for this SafecityMain
    const existingIntegration = await SafecityIntegrations.findOne({ sc_id });
    if (existingIntegration) {
      return res.status(400).json({
        success: false,
        message: 'Integration record already exists for this SafecityMain'
      });
    }

    // Create new integration record
    const newIntegration = new SafecityIntegrations({
      integ_with_dcc,
      integ_with_piftac,
      integ_with_niftac,
      sc_id,
      remarks,
      created_by: req.user?._id
    });

    const createdRecord = await newIntegration.save();

    // Populate the created record
    const populatedRecord = await SafecityIntegrations.findById(createdRecord._id)
      .populate('sc_id', 'present_status')
      .populate('created_by', 'name');

    res.status(201).json({
      success: true,
      data: populatedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Update SafecityIntegrations record
// @route   PUT /api/safecity/update-integration/:id
// @access  Private
const updateSafecityIntegration = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      integ_with_dcc,
      integ_with_piftac,
      integ_with_niftac,
      sc_id,
      remarks
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    // Find the record
    let record = await SafecityIntegrations.findById(id);

    if (!record || !record.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or has been deleted'
      });
    }

    // Update fields if provided
    if (integ_with_dcc !== undefined) record.integ_with_dcc = integ_with_dcc;
    if (integ_with_piftac !== undefined) record.integ_with_piftac = integ_with_piftac;
    if (integ_with_niftac !== undefined) record.integ_with_niftac = integ_with_niftac;
    if (remarks !== undefined) record.remarks = remarks;
    
    // Prevent changing sc_id if it's a different ID
    if (sc_id && sc_id !== record.sc_id.toString()) {
      // Check if new sc_id is already in use
      const existingIntegration = await SafecityIntegrations.findOne({ sc_id });
      if (existingIntegration) {
        return res.status(400).json({
          success: false,
          message: 'Another integration already exists for the specified SafecityMain'
        });
      }
      record.sc_id = sc_id;
    }

    record.updated_by = req.user?._id;
    const updatedRecord = await record.save();

    // Populate the updated record
    const populatedRecord = await SafecityIntegrations.findById(updatedRecord._id)
      .populate('sc_id', 'present_status')
      .populate('updated_by', 'name');

    res.status(200).json({
      success: true,
      data: populatedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Delete SafecityIntegrations record (soft delete)
// @route   DELETE /api/safecity/delete-integration/:id
// @access  Private
const deleteSafecityIntegration = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await SafecityIntegrations.findById(id);

    if (!record || !record.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or has already been deleted'
      });
    }

    // Soft delete
    record.is_active = false;
    record.updated_by = req.user?._id;
    await record.save();

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully'
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
  getAllSafecityIntegrations,
  getSafecityIntegration,
  addSafecityIntegration,
  updateSafecityIntegration,
  deleteSafecityIntegration
};
