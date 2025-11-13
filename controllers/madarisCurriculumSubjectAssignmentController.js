const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const MadarisCurriculumSubjectAssignment = require('../models/MadarisCurriculumSubjectAssignment');
const MadarisCurriculum = require('../models/MadarisCurriculum');
const MadarisSubjectCurriculum = require('../models/MadarisSubjectCurriculum');

// @desc    Add a new curriculum subject assignment
// @route   POST /api/madaris/add-curriculum-subject-assignment
// @access  Public
const addCurriculumSubjectAssignment = asyncHandler(async (req, res) => {
  try {
    const { 
      curriculum_id, 
      subject_id 
    } = req.body;
    
    // Validate required fields
    if (!curriculum_id || !subject_id) {
      return res.status(400).json({
        success: false,
        message: 'Both curriculum_id and subject_id are required'
      });
    }
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(curriculum_id) || 
        !mongoose.Types.ObjectId.isValid(subject_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    // Check if curriculum exists and is active
    const curriculum = await MadarisCurriculum.findOne({
      _id: curriculum_id,
      is_active: true
    });
    
    if (!curriculum) {
      return res.status(404).json({
        success: false,
        message: 'Curriculum not found or inactive'
      });
    }
    
    // Check if subject exists and is active
    const subject = await MadarisSubjectCurriculum.findOne({
      _id: subject_id,
      is_active: true
    });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or inactive'
      });
    }
    
    // Check if assignment already exists and is active
    const existingAssignment = await MadarisCurriculumSubjectAssignment.findOne({
      curriculum_id,
      subject_id,
      is_active: true
    });
    
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'This subject is already assigned to the curriculum'
      });
    }
    
    // Check if there's an inactive assignment to reactivate
    const inactiveAssignment = await MadarisCurriculumSubjectAssignment.findOne({
      curriculum_id,
      subject_id,
      is_active: false
    });
    
    let assignment;
    
    if (inactiveAssignment) {
      // Reactivate the existing assignment
      inactiveAssignment.is_active = true;
      inactiveAssignment.updated_by = req.user?._id;
      assignment = await inactiveAssignment.save();
    } else {
      // Create new assignment
      assignment = new MadarisCurriculumSubjectAssignment({
        curriculum_id,
        subject_id,
        created_by: req.user?._id
      });
      
      await assignment.save();
    }
    
    // Populate the response with related data
    const populatedAssignment = await MadarisCurriculumSubjectAssignment
      .findById(assignment._id)
      .populate('curriculum_id', 'title status')
      .populate('subject_id', 'subject added_for_class')
      .lean();
    
    res.status(201).json({
      success: true,
      message: 'Subject successfully assigned to curriculum',
      data: populatedAssignment
    });
    
  } catch (error) {
    console.error('Error adding curriculum subject assignment:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error adding curriculum subject assignment'
    });
  }
});

module.exports = {
  addCurriculumSubjectAssignment
};
