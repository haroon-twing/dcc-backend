const asyncHandler = require('express-async-handler');
const SafecityMain = require('../models/SafecityMain');
const mongoose = require('mongoose');

// @desc    Get all SafecityMain records
// @route   GET /api/safecity/main
// @access  Public
const getAllSafecityMain = asyncHandler(async (req, res) => {
  try {
    // Get all active records without population first
    const records = await SafecityMain.find({ is_active: true })
      .sort({ created_at: -1 });
      
    // If no records found, return empty array
    if (!records || records.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

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

// @desc    Get single SafecityMain record
// @route   GET /api/safecity/main/:id
// @access  Public
const getSafecityMain = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await SafecityMain.safeFindById(id);
    
    // Check if record exists and is active
    if (!record || !record.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or has been deleted'
      });
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
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

// @desc    Add new SafecityMain record
// @route   POST /api/safecity/add-safecitymain
// @access  Private
const addSafecityMain = asyncHandler(async (req, res) => {
  try {
    const {
      province_id,
      district_id,
      city_id,
      approval_date,
      present_status,
      no_of_total_cameras,
      active_cameras,
      inactive_cameras,
      fr_cameras,
      non_fr_cameras,
      no_of_employees,
      remarks
    } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(province_id) || 
        !mongoose.Types.ObjectId.isValid(district_id) || 
        !mongoose.Types.ObjectId.isValid(city_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format. Province, district, and city IDs must be valid MongoDB ObjectIds.'
      });
    }

    const newRecord = new SafecityMain({
      province_id,
      district_id,
      city_id,
      approval_date: new Date(approval_date),
      present_status,
      no_of_total_cameras,
      active_cameras,
      inactive_cameras,
      fr_cameras,
      non_fr_cameras,
      no_of_employees,
      remarks,
      created_by: req.user?._id
    });

    // Validate camera counts
    if (active_cameras + inactive_cameras > no_of_total_cameras) {
      return res.status(400).json({
        success: false,
        message: 'Sum of active and inactive cameras cannot exceed total cameras'
      });
    }

    if (fr_cameras + non_fr_cameras > no_of_total_cameras) {
      return res.status(400).json({
        success: false,
        message: 'Sum of FR and non-FR cameras cannot exceed total cameras'
      });
    }

    const createdRecord = await newRecord.save();

    // Get the created record with safe population
    const populatedRecord = await SafecityMain.safeFindById(createdRecord._id);

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

// @desc    Update SafecityMain record
// @route   PUT /api/safecity/main/:id
// @access  Private
const updateSafecityMain = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      province_id,
      district_id,
      city_id,
      approval_date,
      present_status,
      no_of_total_cameras,
      active_cameras,
      inactive_cameras,
      fr_cameras,
      non_fr_cameras,
      no_of_employees,
      remarks
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await SafecityMain.findById(id);

    if (!record || !record.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Update fields
    if (province_id !== undefined) record.province_id = province_id;
    if (district_id !== undefined) record.district_id = district_id;
    if (city_id !== undefined) record.city_id = city_id;
    if (approval_date !== undefined) record.approval_date = new Date(approval_date);
    if (present_status !== undefined) record.present_status = present_status;
    if (no_of_total_cameras !== undefined) record.no_of_total_cameras = no_of_total_cameras;
    if (active_cameras !== undefined) record.active_cameras = active_cameras;
    if (inactive_cameras !== undefined) record.inactive_cameras = inactive_cameras;
    if (fr_cameras !== undefined) record.fr_cameras = fr_cameras;
    if (non_fr_cameras !== undefined) record.non_fr_cameras = non_fr_cameras;
    if (no_of_employees !== undefined) record.no_of_employees = no_of_employees;
    if (remarks !== undefined) record.remarks = remarks;
    
    // Update updated_by if user is authenticated
    if (req.user?._id) {
      record.updated_by = req.user._id;
    }

    // Validate camera counts
    if (record.active_cameras + record.inactive_cameras > record.no_of_total_cameras) {
      return res.status(400).json({
        success: false,
        message: 'Sum of active and inactive cameras cannot exceed total cameras'
      });
    }

    if (record.fr_cameras + record.non_fr_cameras > record.no_of_total_cameras) {
      return res.status(400).json({
        success: false,
        message: 'Sum of FR and non-FR cameras cannot exceed total cameras'
      });
    }

    const updatedRecord = await record.save();

    // Populate the updated record
    // Get the updated record with safe population
    const populatedRecord = await SafecityMain.safeFindById(updatedRecord._id);

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

// @desc    Delete SafecityMain record (soft delete)
// @route   DELETE /api/safecity/main/:id
// @access  Private
const deleteSafecityMain = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await SafecityMain.findById(id);

    if (!record || !record.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Soft delete
    record.is_active = false;
    if (req.user?._id) {
      record.updated_by = req.user._id;
    }
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
  getAllSafecityMain,
  getSafecityMain,
  addSafecityMain,
  updateSafecityMain,
  deleteSafecityMain
};
