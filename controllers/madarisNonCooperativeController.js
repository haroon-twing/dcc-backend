const asyncHandler = require('express-async-handler');
const MadarisNonCooperative = require('../models/MadarisNonCooperative');
const mongoose = require('mongoose');

// @desc    Get all non-cooperative records for a specific madrasa
// @route   GET /api/madaris/non-cooperative/:madaris_id
// @access  Public
const getAllNonCooperativeRecords = asyncHandler(async (req, res) => {
  try {
    const { madaris_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(madaris_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid madrasa ID format'
      });
    }

    const records = await MadarisNonCooperative.aggregate([
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
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          as: 'createdBy'
        }
      },
      { $unwind: '$createdBy' },
      {
        $project: {
          role_of_institute: 1,
          nature_of_non_cooperation: 1,
          remarks: 1,
          'madrasa.name': 1,
          'createdBy.name': 1,
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
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Create a new non-cooperative record
// @route   POST /api/madaris/non-cooperative
// @access  Private
const createNonCooperativeRecord = asyncHandler(async (req, res) => {
  try {
    const { madaris_id, role_of_institute, nature_of_non_cooperation, remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(madaris_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid madrasa ID format'
      });
    }

    const nonCoopRecord = new MadarisNonCooperative({
      madaris_id,
      role_of_institute,
      nature_of_non_cooperation,
      remarks,
      created_by: req.user._id
    });

    const createdRecord = await nonCoopRecord.save();
    
    // Populate the created record with related data
    const populatedRecord = await MadarisNonCooperative.aggregate([
      { $match: { _id: createdRecord._id } },
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
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          as: 'createdBy'
        }
      },
      { $unwind: '$createdBy' },
      {
        $project: {
          role_of_institute: 1,
          nature_of_non_cooperation: 1,
          remarks: 1,
          'madrasa.name': 1,
          'createdBy.name': 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    res.status(201).json({
      success: true,
      data: populatedRecord[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Get a single non-cooperative record
// @route   GET /api/madaris/non-cooperative/:id
// @access  Public
const getNonCooperativeRecord = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await MadarisNonCooperative.aggregate([
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
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          as: 'createdBy'
        }
      },
      { $unwind: '$createdBy' },
      {
        $project: {
          role_of_institute: 1,
          nature_of_non_cooperation: 1,
          remarks: 1,
          'madrasa.name': 1,
          'createdBy.name': 1,
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
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Update a non-cooperative record
// @route   PUT /api/madaris/non-cooperative/:id
// @access  Private
const updateNonCooperativeRecord = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { role_of_institute, nature_of_non_cooperation, remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await MadarisNonCooperative.findById(id);

    if (!record || !record.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Update fields if they are provided
    if (role_of_institute !== undefined) record.role_of_institute = role_of_institute;
    if (nature_of_non_cooperation !== undefined) record.nature_of_non_cooperation = nature_of_non_cooperation;
    if (remarks !== undefined) record.remarks = remarks;
    
    record.updated_by = req.user._id;
    
    const updatedRecord = await record.save();
    
    // Populate the updated record with related data
    const populatedRecord = await MadarisNonCooperative.aggregate([
      { $match: { _id: updatedRecord._id } },
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
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          as: 'createdBy'
        }
      },
      { $unwind: '$createdBy' },
      {
        $lookup: {
          from: 'users',
          localField: 'updated_by',
          foreignField: '_id',
          as: 'updatedBy'
        }
      },
      { $unwind: '$updatedBy' },
      {
        $project: {
          role_of_institute: 1,
          nature_of_non_cooperation: 1,
          remarks: 1,
          'madrasa.name': 1,
          'createdBy.name': 1,
          'updatedBy.name': 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: populatedRecord[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Delete a non-cooperative record (soft delete)
// @route   DELETE /api/madaris/non-cooperative/:id
// @access  Private
const deleteNonCooperativeRecord = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await MadarisNonCooperative.findById(id);

    if (!record || !record.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Soft delete
    record.is_active = false;
    record.updated_by = req.user._id;
    
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
  getAllNonCooperativeRecords,
  createNonCooperativeRecord,
  getNonCooperativeRecord,
  updateNonCooperativeRecord,
  deleteNonCooperativeRecord
};
