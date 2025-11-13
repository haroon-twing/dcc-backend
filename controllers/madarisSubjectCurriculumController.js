const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const MadarisSubjectCurriculum = require('../models/MadarisSubjectCurriculum');

// @desc    Get all subject curriculum records
// @route   GET /api/madaris/get-subject-curriculums
// @access  Public
const getAllSubjectCurriculums = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { is_active: true };
    
    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Get total count for pagination
    const total = await MadarisSubjectCurriculum.countDocuments(query);
    
    // Get paginated results
    const subjectCurriculums = await MadarisSubjectCurriculum.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    res.status(200).json({
      success: true,
      count: subjectCurriculums.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: subjectCurriculums
    });
  } catch (error) {
    console.error('Error fetching subject curriculums:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error fetching subject curriculums'
    });
  }
});

// @desc    Get single subject curriculum by ID
// @route   GET /api/madaris/get-single-subject-curriculum/:id
// @access  Public
const getSubjectCurriculumById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject curriculum ID format'
      });
    }
    
    const subjectCurriculum = await MadarisSubjectCurriculum.findOne({
      _id: id,
      is_active: true
    });
    
    if (!subjectCurriculum) {
      return res.status(404).json({
        success: false,
        message: 'Subject curriculum not found or inactive'
      });
    }
    
    res.status(200).json({
      success: true,
      data: subjectCurriculum
    });
  } catch (error) {
    console.error('Error fetching subject curriculum:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error fetching subject curriculum'
    });
  }
});

// @desc    Add a new subject curriculum
// @route   POST /api/madaris/add-subject-curriculum
// @access  Public
const addSubjectCurriculum = asyncHandler(async (req, res) => {
  try {
    const { subject, added_on_date, added_for_class, added_for_agegroup, remarks } = req.body;
    
    // Validate required fields
    if (!subject || !added_on_date || !added_for_class || !added_for_agegroup) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: subject, added_on_date, added_for_class, added_for_agegroup'
      });
    }
    
    // Check if subject already exists for the same class
    const existingSubject = await MadarisSubjectCurriculum.findOne({
      subject: { $regex: new RegExp(`^${subject}$`, 'i') },
      added_for_class,
      is_active: true
    });
    
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'A subject with this name already exists for the specified class'
      });
    }
    
    // Create new subject curriculum
    const newSubjectCurriculum = new MadarisSubjectCurriculum({
      subject,
      added_on_date: new Date(added_on_date),
      added_for_class,
      added_for_agegroup,
      remarks,
      created_by: req.user?._id
    });
    
    await newSubjectCurriculum.save();
    
    res.status(201).json({
      success: true,
      message: 'Subject curriculum added successfully',
      data: newSubjectCurriculum
    });
  } catch (error) {
    console.error('Error adding subject curriculum:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error adding subject curriculum'
    });
  }
});

// @desc    Update a subject curriculum
// @route   PUT /api/madaris/update-subject-curriculum/:id
// @access  Public
const updateSubjectCurriculum = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, added_on_date, added_for_class, added_for_agegroup, remarks } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject curriculum ID format'
      });
    }
    
    // Check if subject curriculum exists
    const existingSubjectCurriculum = await MadarisSubjectCurriculum.findOne({
      _id: id,
      is_active: true
    });
    
    if (!existingSubjectCurriculum) {
      return res.status(404).json({
        success: false,
        message: 'Subject curriculum not found or inactive'
      });
    }
    
    // Check if updating would create a duplicate
    if (subject || added_for_class) {
      const checkSubject = subject || existingSubjectCurriculum.subject;
      const checkClass = added_for_class || existingSubjectCurriculum.added_for_class;
      
      const duplicate = await MadarisSubjectCurriculum.findOne({
        _id: { $ne: id },
        subject: { $regex: new RegExp(`^${checkSubject}$`, 'i') },
        added_for_class: checkClass,
        is_active: true
      });
      
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'A subject with this name already exists for the specified class'
        });
      }
    }
    
    // Build update object
    const updateObj = {};
    if (subject) updateObj.subject = subject;
    if (added_on_date) updateObj.added_on_date = new Date(added_on_date);
    if (added_for_class) updateObj.added_for_class = added_for_class;
    if (added_for_agegroup) updateObj.added_for_agegroup = added_for_agegroup;
    if (remarks !== undefined) updateObj.remarks = remarks;
    updateObj.updated_by = req.user?._id;
    
    const updatedSubjectCurriculum = await MadarisSubjectCurriculum.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Subject curriculum updated successfully',
      data: updatedSubjectCurriculum
    });
  } catch (error) {
    console.error('Error updating subject curriculum:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error updating subject curriculum'
    });
  }
});

// @desc    Delete a subject curriculum (soft delete)
// @route   DELETE /api/madaris/delete-subject-curriculum/:id
// @access  Public
const deleteSubjectCurriculum = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject curriculum ID format'
      });
    }
    
    // Soft delete by setting is_active to false
    const deletedSubjectCurriculum = await MadarisSubjectCurriculum.findByIdAndUpdate(
      id,
      { 
        $set: { 
          is_active: false,
          updated_by: req.user?._id
        } 
      },
      { new: true }
    );
    
    if (!deletedSubjectCurriculum) {
      return res.status(404).json({
        success: false,
        message: 'Subject curriculum not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Subject curriculum deleted successfully',
      data: deletedSubjectCurriculum._id
    });
  } catch (error) {
    console.error('Error deleting subject curriculum:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error deleting subject curriculum'
    });
  }
});

module.exports = {
  getAllSubjectCurriculums,
  getSubjectCurriculumById,
  addSubjectCurriculum,
  updateSubjectCurriculum,
  deleteSubjectCurriculum
};
