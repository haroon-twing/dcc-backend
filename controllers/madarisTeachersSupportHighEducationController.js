const asyncHandler = require('express-async-handler');
const MadarisTeachersSupportHighEducation = require('../models/MadarisTeachersSupportHighEducation');
const mongoose = require('mongoose');

// @desc    Get all teacher support high education records for a specific madrasa
// @route   GET /api/madaris/get-teachers-support-high-education/:madaris_id
// @access  Public
const getAllTeachersSupportHighEducation = asyncHandler(async (req, res) => {
  try {
    const { madaris_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(madaris_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid madrasa ID format'
      });
    }

    const records = await MadarisTeachersSupportHighEducation.aggregate([
      {
        $match: {
          madaris_id: new mongoose.Types.ObjectId(madaris_id),
          is_active: true
        }
      },
      {
        $lookup: {
          from: 'madaris_teachers',
          localField: 'teacher_id',
          foreignField: '_id',
          as: 'teacher'
        }
      },
      { $unwind: '$teacher' },
      {
        $project: {
          education_obtain: 1,
          edu_from: 1,
          remarks: 1,
          madaris_id: 1,
          'teacher.full_name': 1,
          'teacher.cnic': 1,
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
    console.error('Error fetching teacher support high education records:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error fetching teacher support high education records'
    });
  }
});

// @desc    Get single teacher support high education record by ID
// @route   GET /api/madaris/get-teachers-support-high-education/:id
// @access  Public
const getTeacherSupportHighEducationById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await MadarisTeachersSupportHighEducation.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          is_active: true
        }
      },
      {
        $lookup: {
          from: 'madaris_teachers',
          localField: 'teacher_id',
          foreignField: '_id',
          as: 'teacher'
        }
      },
      { $unwind: '$teacher' },
      {
        $project: {
          education_obtain: 1,
          edu_from: 1,
          remarks: 1,
          madaris_id: 1,
          'teacher.full_name': 1,
          'teacher.cnic': 1,
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
    console.error('Error fetching teacher support high education record:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error fetching teacher support high education record'
    });
  }
});

// @desc    Add a new teacher support high education record
// @route   POST /api/madaris/add-teachers-support-high-education
// @access  Public
const addTeacherSupportHighEducation = asyncHandler(async (req, res) => {
  try {
    const { teacher_id, education_obtain, edu_from, remarks, madaris_id } = req.body;

    // Validate required fields
    if (!teacher_id || !madaris_id) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID and madrasa ID are required fields'
      });
    }

    // Check if the record already exists
    const existingRecord = await MadarisTeachersSupportHighEducation.findOne({
      teacher_id,
      education_obtain,
      is_active: true
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'A record with this teacher and education already exists'
      });
    }

    const newRecord = await MadarisTeachersSupportHighEducation.create({
      teacher_id,
      education_obtain,
      edu_from,
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
    console.error('Error adding teacher support high education record:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error adding teacher support high education record'
    });
  }
});

// @desc    Update a teacher support high education record
// @route   PUT /api/madaris/update-teachers-support-high-education/:id
// @access  Public
const updateTeacherSupportHighEducation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { education_obtain, edu_from, remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    // Check if record exists and is active
    const existingRecord = await MadarisTeachersSupportHighEducation.findOne({
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
    if (education_obtain) updateData.education_obtain = education_obtain;
    if (edu_from) updateData.edu_from = edu_from;
    if (remarks !== undefined) updateData.remarks = remarks;

    const updatedRecord = await MadarisTeachersSupportHighEducation.findByIdAndUpdate(
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
    console.error('Error updating teacher support high education record:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error updating teacher support high education record'
    });
  }
});

// @desc    Delete a teacher support high education record (soft delete)
// @route   DELETE /api/madaris/delete-teachers-support-high-education/:id
// @access  Public
const deleteTeacherSupportHighEducation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    // Check if record exists and is active
    const existingRecord = await MadarisTeachersSupportHighEducation.findOne({
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
    await MadarisTeachersSupportHighEducation.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting teacher support high education record:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error deleting teacher support high education record'
    });
  }
});

module.exports = {
  getAllTeachersSupportHighEducation,
  getTeacherSupportHighEducationById,
  addTeacherSupportHighEducation,
  updateTeacherSupportHighEducation,
  deleteTeacherSupportHighEducation
};
