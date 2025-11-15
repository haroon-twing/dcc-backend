const asyncHandler = require('express-async-handler');
const NGOInvestigated = require('../models/NGOInvestigated');
const mongoose = require('mongoose');

// @desc    Get all NGOInvestigated records by NGO ID
// @route   GET /api/ngo/get-ngo-investigateds/:ngo_id
// @access  Public
const getAllNGOInvestigated = asyncHandler(async (req, res) => {
  try {
    const { ngo_id } = req.params;

    const records = await NGOInvestigated.find({ is_active: true, ngo_id })
      .populate('ngo_id', 'ngo_name')
      .populate('created_by', 'name')
      .populate('updated_by', 'name')
      .sort({ investigation_date: -1 });

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

// @desc    Get single NGOInvestigated record
// @route   GET /api/ngo/get-single-ngo-investigated/:id
// @access  Public
const getNGOInvestigated = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await NGOInvestigated.findOne({ _id: id, is_active: true })
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

// @desc    Add new NGOInvestigated record
// @route   POST /api/ngo/add-ngo-investigated
// @access  Private
const addNGOInvestigated = asyncHandler(async (req, res) => {
  try {
    const {
      investigating_agency_dept,
      nature_of_allegation,
      action_taken,
      remarks = '',
      ngo_id,
      investigation_date,
      status = 'Ongoing'
    } = req.body;

    // Validate required fields
    if (!investigating_agency_dept || !nature_of_allegation || !action_taken || !ngo_id || !investigation_date) {
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
    const validStatuses = ['Ongoing', 'Completed', 'Referred', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: Ongoing, Completed, Referred, Closed'
      });
    }

    // Create new record
    const newRecord = new NGOInvestigated({
      investigating_agency_dept,
      nature_of_allegation,
      action_taken,
      remarks,
      ngo_id,
      investigation_date,
      status,
      created_by: req.user?._id
    });

    const createdRecord = await newRecord.save();

    // Populate the created record
    const populatedRecord = await NGOInvestigated.findById(createdRecord._id)
      .populate('ngo_id', 'ngo_name')
      .populate('created_by', 'name');

    res.status(201).json({
      success: true,
      message: 'NGO investigation record created successfully',
      data: populatedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating NGO investigation record',
      error: error.message
    });
  }
});

// @desc    Update NGOInvestigated record
// @route   PUT /api/ngo/update-ngo-investigated/:id
// @access  Private
const updateNGOInvestigated = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      investigating_agency_dept,
      nature_of_allegation,
      action_taken,
      remarks,
      ngo_id,
      investigation_date,
      status
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    // Find the record
    const record = await NGOInvestigated.findOne({ _id: id, is_active: true });
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or has been deleted'
      });
    }

    // Update fields if provided
    if (investigating_agency_dept !== undefined) record.investigating_agency_dept = investigating_agency_dept;
    if (nature_of_allegation !== undefined) record.nature_of_allegation = nature_of_allegation;
    if (action_taken !== undefined) record.action_taken = action_taken;
    if (remarks !== undefined) record.remarks = remarks;
    if (investigation_date !== undefined) record.investigation_date = investigation_date;
    
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
      const validStatuses = ['Ongoing', 'Completed', 'Referred', 'Closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: Ongoing, Completed, Referred, Closed'
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
    const populatedRecord = await NGOInvestigated.findById(updatedRecord._id)
      .populate('ngo_id', 'ngo_name')
      .populate('updated_by', 'name')
      .populate('created_by', 'name');

    res.status(200).json({
      success: true,
      message: 'NGO investigation record updated successfully',
      data: populatedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating NGO investigation record',
      error: error.message
    });
  }
});

// @desc    Delete NGOInvestigated record (soft delete)
// @route   DELETE /api/ngo/delete-ngo-investigated/:id
// @access  Private
const deleteNGOInvestigated = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await NGOInvestigated.findOne({ _id: id, is_active: true });
    
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
      message: 'NGO investigation record deleted successfully',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting NGO investigation record',
      error: error.message
    });
  }
});

module.exports = {
  getAllNGOInvestigated,
  getNGOInvestigated,
  addNGOInvestigated,
  updateNGOInvestigated,
  deleteNGOInvestigated
};
