const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const MadarisSubjectUpdateCurriculum = require('../models/MadarisSubjectUpdateCurriculum');

// @desc    Get all subject update curriculum records
// @route   GET /api/madaris/get-subject-update-curriculums
// @access  Public
const getAllSubjectUpdateCurriculums = asyncHandler(async (req, res) => {
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
    
    // Filter by subject if provided
    if (req.query.subject) {
      query.subject = { $regex: req.query.subject, $options: 'i' };
    }
    
    // Filter by class if provided
    if (req.query.updated_for_class) {
      query.updated_for_class = req.query.updated_for_class;
    }
    
    // Get total count for pagination
    const total = await MadarisSubjectUpdateCurriculum.countDocuments(query);
    
    // Get paginated results
    const subjectUpdateCurriculums = await MadarisSubjectUpdateCurriculum.find(query)
      .sort({ updated_on_date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    res.status(200).json({
      success: true,
      count: subjectUpdateCurriculums.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: subjectUpdateCurriculums
    });
  } catch (error) {
    console.error('Error fetching subject update curriculums:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error fetching subject update curriculums'
    });
  }
});

// @desc    Get single subject update curriculum by ID
// @route   GET /api/madaris/get-single-subject-update-curriculum/:id
// @access  Public
const getSubjectUpdateCurriculumById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject update curriculum ID format'
      });
    }
    
    const subjectUpdateCurriculum = await MadarisSubjectUpdateCurriculum.findOne({
      _id: id,
      is_active: true
    });
    
    if (!subjectUpdateCurriculum) {
      return res.status(404).json({
        success: false,
        message: 'Subject update curriculum not found or inactive'
      });
    }
    
    res.status(200).json({
      success: true,
      data: subjectUpdateCurriculum
    });
  } catch (error) {
    console.error('Error fetching subject update curriculum:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error fetching subject update curriculum'
    });
  }
});

// @desc    Add a new subject update curriculum
// @route   POST /api/madaris/add-subject-update-curriculum
// @access  Public
const addSubjectUpdateCurriculum = asyncHandler(async (req, res) => {
  try {
    const { 
      subject, 
      chap_no, 
      updated_on_date, 
      updated_for_class, 
      updated_for_age_group, 
      remarks 
    } = req.body;
    
    // Validate required fields
    if (!subject || !chap_no || !updated_on_date || !updated_for_class || !updated_for_age_group) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: subject, chap_no, updated_on_date, updated_for_class, updated_for_age_group'
      });
    }
    
    // Check if update already exists for the same subject, chapter, and class
    const existingUpdate = await MadarisSubjectUpdateCurriculum.findOne({
      subject: { $regex: new RegExp(`^${subject}$`, 'i') },
      chap_no: { $regex: new RegExp(`^${chap_no}$`, 'i') },
      updated_for_class,
      is_active: true
    });
    
    if (existingUpdate) {
      return res.status(400).json({
        success: false,
        message: 'An update for this subject and chapter already exists for the specified class'
      });
    }
    
    // Create new subject update curriculum
    const newSubjectUpdateCurriculum = new MadarisSubjectUpdateCurriculum({
      subject,
      chap_no,
      updated_on_date: new Date(updated_on_date),
      updated_for_class,
      updated_for_age_group,
      remarks,
      created_by: req.user?._id
    });
    
    await newSubjectUpdateCurriculum.save();
    
    res.status(201).json({
      success: true,
      message: 'Subject update curriculum added successfully',
      data: newSubjectUpdateCurriculum
    });
  } catch (error) {
    console.error('Error adding subject update curriculum:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error adding subject update curriculum'
    });
  }
});

// @desc    Update a subject update curriculum
// @route   PUT /api/madaris/update-subject-update-curriculum/:id
// @access  Public
const updateSubjectUpdateCurriculum = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      subject, 
      chap_no, 
      updated_on_date, 
      updated_for_class, 
      updated_for_age_group, 
      remarks 
    } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject update curriculum ID format'
      });
    }
    
    // Check if subject update curriculum exists
    const existingSubjectUpdateCurriculum = await MadarisSubjectUpdateCurriculum.findOne({
      _id: id,
      is_active: true
    });
    
    if (!existingSubjectUpdateCurriculum) {
      return res.status(404).json({
        success: false,
        message: 'Subject update curriculum not found or inactive'
      });
    }
    
    // Check if updating would create a duplicate
    const checkSubject = subject || existingSubjectUpdateCurriculum.subject;
    const checkChapNo = chap_no || existingSubjectUpdateCurriculum.chap_no;
    const checkClass = updated_for_class || existingSubjectUpdateCurriculum.updated_for_class;
    
    const duplicate = await MadarisSubjectUpdateCurriculum.findOne({
      _id: { $ne: id },
      subject: { $regex: new RegExp(`^${checkSubject}$`, 'i') },
      chap_no: { $regex: new RegExp(`^${checkChapNo}$`, 'i') },
      updated_for_class: checkClass,
      is_active: true
    });
    
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'An update for this subject and chapter already exists for the specified class'
      });
    }
    
    // Build update object
    const updateObj = {};
    if (subject) updateObj.subject = subject;
    if (chap_no) updateObj.chap_no = chap_no;
    if (updated_on_date) updateObj.updated_on_date = new Date(updated_on_date);
    if (updated_for_class) updateObj.updated_for_class = updated_for_class;
    if (updated_for_age_group) updateObj.updated_for_age_group = updated_for_age_group;
    if (remarks !== undefined) updateObj.remarks = remarks;
    updateObj.updated_by = req.user?._id;
    
    const updatedSubjectUpdateCurriculum = await MadarisSubjectUpdateCurriculum.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Subject update curriculum updated successfully',
      data: updatedSubjectUpdateCurriculum
    });
  } catch (error) {
    console.error('Error updating subject update curriculum:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error updating subject update curriculum'
    });
  }
});

// @desc    Delete a subject update curriculum (soft delete)
// @route   DELETE /api/madaris/delete-subject-update-curriculum/:id
// @access  Public
const deleteSubjectUpdateCurriculum = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject update curriculum ID format'
      });
    }
    
    // Soft delete by setting is_active to false
    const deletedSubjectUpdateCurriculum = await MadarisSubjectUpdateCurriculum.findByIdAndUpdate(
      id,
      { 
        $set: { 
          is_active: false,
          updated_by: req.user?._id
        } 
      },
      { new: true }
    );
    
    if (!deletedSubjectUpdateCurriculum) {
      return res.status(404).json({
        success: false,
        message: 'Subject update curriculum not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Subject update curriculum deleted successfully',
      data: deletedSubjectUpdateCurriculum._id
    });
  } catch (error) {
    console.error('Error deleting subject update curriculum:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error deleting subject update curriculum'
    });
  }
});

module.exports = {
  getAllSubjectUpdateCurriculums,
  getSubjectUpdateCurriculumById,
  addSubjectUpdateCurriculum,
  updateSubjectUpdateCurriculum,
  deleteSubjectUpdateCurriculum
};
