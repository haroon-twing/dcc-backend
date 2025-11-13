const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const MadarisMadarisCurriculumAssignment = require('../models/MadarisMadarisCurriculumAssignment');
const Madaris = require('../models/Madaris');
const MadarisCurriculum = require('../models/MadarisCurriculum');

// @desc    Add a new madrasa-curriculum assignment
// @route   POST /api/madaris/add-madrasa-curriculum-assignment
// @access  Public
const addMadrasaCurriculumAssignment = asyncHandler(async (req, res) => {
  try {
    const { 
      madaris_id, 
      curriculum_id 
    } = req.body;
    
    // Validate required fields
    if (!madaris_id || !curriculum_id) {
      return res.status(400).json({
        success: false,
        message: 'Both madaris_id and curriculum_id are required'
      });
    }
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(madaris_id) || 
        !mongoose.Types.ObjectId.isValid(curriculum_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    // Check if madrasa exists first
    const madrasa = await Madaris.findById(madaris_id).lean();
    
    if (!madrasa) {
      return res.status(404).json({
        success: false,
        message: `Madrasa with ID ${madaris_id} not found`
      });
    }
    
    // Then check if it's active
    if (madrasa.is_active === false) {
      return res.status(400).json({
        success: false,
        message: `Madrasa "${madrasa.name || madras_id}" is inactive`
      });
    }
    
    // Check if curriculum exists first
    const curriculum = await MadarisCurriculum.findById(curriculum_id).lean();
    
    if (!curriculum) {
      return res.status(404).json({
        success: false,
        message: `Curriculum with ID ${curriculum_id} not found`
      });
    }
    
    // Then check if it's active
    if (curriculum.is_active === false) {
      return res.status(400).json({
        success: false,
        message: `Curriculum "${curriculum.title || curriculum_id}" is inactive`
      });
    }
    
    // Check if assignment already exists and is active
    const existingAssignment = await MadarisMadarisCurriculumAssignment.findOne({
      madaris_id,
      curriculum_id,
      is_active: true
    });
    
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'This curriculum is already assigned to the madrasa'
      });
    }
    
    // Check if there's an inactive assignment to reactivate
    const inactiveAssignment = await MadarisMadarisCurriculumAssignment.findOne({
      madaris_id,
      curriculum_id,
      is_active: false
    });
    
    let assignment;
    
    if (inactiveAssignment) {
      // Reactivate the existing assignment
      inactiveAssignment.is_active = true;
      inactiveAssignment.assigned_date = new Date();
      inactiveAssignment.updated_by = req.user?._id;
      assignment = await inactiveAssignment.save();
    } else {
      // Create new assignment
      assignment = new MadarisMadarisCurriculumAssignment({
        madaris_id,
        curriculum_id,
        created_by: req.user?._id
      });
      
      await assignment.save();
    }
    
    // Populate the response with related data
    const populatedAssignment = await MadarisMadarisCurriculumAssignment
      .findById(assignment._id)
      .populate('madaris_id', 'name reg_no')
      .populate('curriculum_id', 'title status')
      .lean();
    
    res.status(201).json({
      success: true,
      message: 'Curriculum successfully assigned to madrasa',
      data: populatedAssignment
    });
    
  } catch (error) {
    console.error('Error adding madrasa curriculum assignment:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error adding madrasa curriculum assignment'
    });
  }
});

module.exports = {
  addMadrasaCurriculumAssignment
};
