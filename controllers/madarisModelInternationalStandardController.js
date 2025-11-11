const asyncHandler = require('express-async-handler');
const MadarisModelInternationalStandard = require('../models/MadarisModelInternationalStandard');
const mongoose = require('mongoose');

// @desc    Get all international standard records for a specific madrasa
// @route   GET /api/madaris/get-international-standards/:madaris_id
// @access  Public
const getAllInternationalStandards = asyncHandler(async (req, res) => {
  try {
    const { madaris_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(madaris_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid madrasa ID format'
      });
    }

    const records = await MadarisModelInternationalStandard.aggregate([
      {
        $match: {
          madaris_id: new mongoose.Types.ObjectId(madaris_id),
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
          authority_qualifies: 1,
          date_of_acceptance: 1,
          remarks: 1,
          'madrasa.name': 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error fetching international standard records:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error fetching international standard records'
    });
  }
});

// @desc    Get single international standard record by ID
// @route   GET /api/madaris/get-single-international-standard/:id
// @access  Public
const getInternationalStandardById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await MadarisModelInternationalStandard.aggregate([
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
          authority_qualifies: 1,
          date_of_acceptance: 1,
          remarks: 1,
          'madrasa.name': 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    if (!record || record.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: record[0]
    });
  } catch (error) {
    console.error('Error fetching international standard record:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error fetching international standard record'
    });
  }
});

// @desc    Add a new international standard record
// @route   POST /api/madaris/add-international-standard
// @access  Public
const addInternationalStandard = asyncHandler(async (req, res) => {
  try {
    const { authority_qualifies, date_of_acceptance, remarks, madaris_id } = req.body;

    // Validate required fields
    if (!authority_qualifies || !date_of_acceptance || !madaris_id) {
      return res.status(400).json({
        success: false,
        message: 'Authority, date of acceptance, and madrasa ID are required fields'
      });
    }

    // Check if the record already exists
    const existingRecord = await MadarisModelInternationalStandard.findOne({
      madaris_id,
      authority_qualifies,
      is_active: true
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'A record with this authority for this madrasa already exists'
      });
    }

    const newRecord = await MadarisModelInternationalStandard.create({
      authority_qualifies,
      date_of_acceptance: new Date(date_of_acceptance),
      remarks,
      madaris_id,
      is_active: true
    });

    res.status(201).json({
      success: true,
      message: 'Record added successfully',
      data: newRecord
    });
  } catch (error) {
    console.error('Error adding international standard record:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error adding international standard record'
    });
  }
});

// @desc    Update an international standard record
// @route   PUT /api/madaris/update-international-standard/:id
// @access  Public
const updateInternationalStandard = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { authority_qualifies, date_of_acceptance, remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    // Check if record exists and is active
    const existingRecord = await MadarisModelInternationalStandard.findOne({
      _id: id,
      is_active: true
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or already deleted'
      });
    }

    // Update only the fields that are provided in the request
    const updateData = {};
    if (authority_qualifies) updateData.authority_qualifies = authority_qualifies;
    if (date_of_acceptance) updateData.date_of_acceptance = new Date(date_of_acceptance);
    if (remarks !== undefined) updateData.remarks = remarks;

    const updatedRecord = await MadarisModelInternationalStandard.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Error updating international standard record:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error updating international standard record'
    });
  }
});

// @desc    Delete an international standard record (soft delete)
// @route   DELETE /api/madaris/delete-international-standard/:id
// @access  Public
const deleteInternationalStandard = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    // Check if record exists and is active
    const existingRecord = await MadarisModelInternationalStandard.findOne({
      _id: id,
      is_active: true
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or already deleted'
      });
    }

    // Soft delete by setting is_active to false
    await MadarisModelInternationalStandard.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting international standard record:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error deleting international standard record'
    });
  }
});

module.exports = {
  getAllInternationalStandards,
  getInternationalStandardById,
  addInternationalStandard,
  updateInternationalStandard,
  deleteInternationalStandard
};
