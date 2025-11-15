const asyncHandler = require('express-async-handler');
const NGOVerifCasesRecommToMOI = require('../models/NGOVerifCasesRecommToMOI');
const mongoose = require('mongoose');

// @desc    Get all NGOVerifCasesRecommToMOI records by NGO ID
// @route   GET /api/ngo/get-ngo-verif-cases-recomm-moi/:ngo_id
// @access  Public
const getAllNGOVerifCasesRecommToMOI = asyncHandler(async (req, res) => {
  try {
    const { ngo_id } = req.params;

    const records = await NGOVerifCasesRecommToMOI.find({ is_active: true, ngo_id })
      .populate('ngo_id', 'ngo_name')
      .populate('created_by', 'name')
      .populate('updated_by', 'name')
      .sort({ recomm_date: -1 });

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

// @desc    Get single NGOVerifCasesRecommToMOI record
// @route   GET /api/ngo/get-single-ngo-verif-cases-recomm-moi/:id
// @access  Public
const getNGOVerifCasesRecommToMOI = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await NGOVerifCasesRecommToMOI.findOne({ _id: id, is_active: true })
      .populate('ngo_id', 'ngo_name')
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

// @desc    Add new NGOVerifCasesRecommToMOI record
// @route   POST /api/ngo/add-ngo-verif-cases-recomm-moi
// @access  Private
const addNGOVerifCasesRecommToMOI = asyncHandler(async (req, res) => {
  try {
    const {
      recomm_by,
      recomm_date,
      action_taken,
      remarks = '',
      ngo_id,
      case_reference = '',
      status = 'Pending'
    } = req.body;

    // Validate required fields
    if (!recomm_by || !recomm_date || !action_taken || !ngo_id) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(ngo_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid NGO ID format'
      });
    }

    // Validate status enum
    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: Pending, In Progress, Completed, Rejected'
      });
    }

    // Validate date
    const dateObj = new Date(recomm_date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recommendation date format'
      });
    }

    // Create new record
    const newRecord = new NGOVerifCasesRecommToMOI({
      recomm_by,
      recomm_date: dateObj,
      action_taken,
      remarks,
      ngo_id,
      case_reference,
      status,
      created_by: req.user?._id
    });

    const createdRecord = await newRecord.save();

    // Populate the created record
    const populatedRecord = await NGOVerifCasesRecommToMOI.findById(createdRecord._id)
      .populate('ngo_id', 'ngo_name')
      .populate('created_by', 'name');

    res.status(201).json({
      success: true,
      message: 'NGO verification case recommendation created successfully',
      data: populatedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating NGO verification case recommendation',
      error: error.message
    });
  }
});

// @desc    Update NGOVerifCasesRecommToMOI record
// @route   PUT /api/ngo/update-ngo-verif-cases-recomm-moi/:id
// @access  Private
const updateNGOVerifCasesRecommToMOI = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      recomm_by,
      recomm_date,
      action_taken,
      remarks,
      ngo_id,
      case_reference,
      status
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    // Find the record
    const record = await NGOVerifCasesRecommToMOI.findOne({ _id: id, is_active: true });
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or has been deleted'
      });
    }

    // Update fields if provided
    if (recomm_by !== undefined) record.recomm_by = recomm_by;
    if (action_taken !== undefined) record.action_taken = action_taken;
    if (remarks !== undefined) record.remarks = remarks;
    if (case_reference !== undefined) record.case_reference = case_reference;
    
    // Validate and update recomm_date if provided
    if (recomm_date !== undefined) {
      const dateObj = new Date(recomm_date);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid recommendation date format'
        });
      }
      record.recomm_date = dateObj;
    }
    
    // Validate ngo_id if provided
    if (ngo_id !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(ngo_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid NGO ID format'
        });
      }
      record.ngo_id = ngo_id;
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['Pending', 'In Progress', 'Completed', 'Rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: Pending, In Progress, Completed, Rejected'
        });
      }
      record.status = status;
    }

    // Update the updated_by field if user is authenticated
    if (req.user) {
      record.updated_by = req.user._id;
    }

    const updatedRecord = await record.save();

    // Populate the updated record
    const populatedRecord = await NGOVerifCasesRecommToMOI.findById(updatedRecord._id)
      .populate('ngo_id', 'ngo_name')
      .populate('updated_by', 'name')
      .populate('created_by', 'name');

    res.status(200).json({
      success: true,
      message: 'NGO verification case recommendation updated successfully',
      data: populatedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating NGO verification case recommendation',
      error: error.message
    });
  }
});

// @desc    Delete NGOVerifCasesRecommToMOI record (soft delete)
// @route   DELETE /api/ngo/delete-ngo-verif-cases-recomm-moi/:id
// @access  Private
const deleteNGOVerifCasesRecommToMOI = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await NGOVerifCasesRecommToMOI.findOne({ _id: id, is_active: true });
    
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
      message: 'NGO verification case recommendation deleted successfully',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting NGO verification case recommendation',
      error: error.message
    });
  }
});

module.exports = {
  getAllNGOVerifCasesRecommToMOI,
  getNGOVerifCasesRecommToMOI,
  addNGOVerifCasesRecommToMOI,
  updateNGOVerifCasesRecommToMOI,
  deleteNGOVerifCasesRecommToMOI
};
