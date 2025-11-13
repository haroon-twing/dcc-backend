const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const MadarisCurriculum = require('../models/MadarisCurriculum');

// @desc    Get all curriculum records
// @route   GET /api/madaris/get-curriculums
// @access  Public
const getAllCurriculums = asyncHandler(async (req, res) => {
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
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Get total count for pagination
    const total = await MadarisCurriculum.countDocuments(query);
    
    // Get paginated results
    const curriculums = await MadarisCurriculum.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    res.status(200).json({
      success: true,
      count: curriculums.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: curriculums
    });
  } catch (error) {
    console.error('Error fetching curriculums:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error fetching curriculums'
    });
  }
});

// @desc    Get single curriculum by ID
// @route   GET /api/madaris/get-single-curriculum/:id
// @access  Public
const getCurriculumById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid curriculum ID format'
      });
    }
    
    const curriculum = await MadarisCurriculum.findOne({
      _id: id,
      is_active: true
    });
    
    if (!curriculum) {
      return res.status(404).json({
        success: false,
        message: 'Curriculum not found or inactive'
      });
    }
    
    res.status(200).json({
      success: true,
      data: curriculum
    });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error fetching curriculum'
    });
  }
});

// @desc    Add a new curriculum
// @route   POST /api/madaris/add-curriculum
// @access  Public
const addCurriculum = asyncHandler(async (req, res) => {
  try {
    const { 
      title, 
      description, 
      status = 'draft',
      remarks 
    } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    
    // Check if curriculum with same title already exists
    const existingCurriculum = await MadarisCurriculum.findOne({
      title: { $regex: new RegExp(`^${title}$`, 'i') },
      is_active: true
    });
    
    if (existingCurriculum) {
      return res.status(400).json({
        success: false,
        message: 'A curriculum with this title already exists'
      });
    }
    
    // Create new curriculum
    const newCurriculum = new MadarisCurriculum({
      title,
      description,
      status,
      remarks,
      created_by: req.user?._id
    });
    
    await newCurriculum.save();
    
    res.status(201).json({
      success: true,
      message: 'Curriculum added successfully',
      data: newCurriculum
    });
  } catch (error) {
    console.error('Error adding curriculum:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error adding curriculum'
    });
  }
});

// @desc    Update a curriculum
// @route   PUT /api/madaris/update-curriculum/:id
// @access  Public
const updateCurriculum = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      status, 
      remarks 
    } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid curriculum ID format'
      });
    }
    
    // Check if curriculum exists
    const existingCurriculum = await MadarisCurriculum.findOne({
      _id: id,
      is_active: true
    });
    
    if (!existingCurriculum) {
      return res.status(404).json({
        success: false,
        message: 'Curriculum not found or inactive'
      });
    }
    
    // Check if updating title would create a duplicate
    if (title && title !== existingCurriculum.title) {
      const duplicate = await MadarisCurriculum.findOne({
        _id: { $ne: id },
        title: { $regex: new RegExp(`^${title}$`, 'i') },
        is_active: true
      });
      
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'A curriculum with this title already exists'
        });
      }
    }
    
    // Build update object
    const updateObj = {};
    if (title) updateObj.title = title;
    if (description !== undefined) updateObj.description = description;
    if (status) updateObj.status = status;
    if (remarks !== undefined) updateObj.remarks = remarks;
    updateObj.updated_by = req.user?._id;
    
    const updatedCurriculum = await MadarisCurriculum.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Curriculum updated successfully',
      data: updatedCurriculum
    });
  } catch (error) {
    console.error('Error updating curriculum:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error updating curriculum'
    });
  }
});

// @desc    Delete a curriculum (soft delete)
// @route   DELETE /api/madaris/delete-curriculum/:id
// @access  Public
const deleteCurriculum = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid curriculum ID format'
      });
    }
    
    // Soft delete by setting is_active to false
    const deletedCurriculum = await MadarisCurriculum.findByIdAndUpdate(
      id,
      { 
        $set: { 
          is_active: false,
          updated_by: req.user?._id
        } 
      },
      { new: true }
    );
    
    if (!deletedCurriculum) {
      return res.status(404).json({
        success: false,
        message: 'Curriculum not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Curriculum deleted successfully',
      data: deletedCurriculum._id
    });
  } catch (error) {
    console.error('Error deleting curriculum:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error deleting curriculum'
    });
  }
});

module.exports = {
  getAllCurriculums,
  getCurriculumById,
  addCurriculum,
  updateCurriculum,
  deleteCurriculum
};
