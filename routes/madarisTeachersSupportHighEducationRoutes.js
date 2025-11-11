const express = require('express');
const router = express.Router();
const {
  getAllTeachersSupportHighEducation,
  getTeacherSupportHighEducationById,
  addTeacherSupportHighEducation,
  updateTeacherSupportHighEducation,
  deleteTeacherSupportHighEducation
} = require('../controllers/madarisTeachersSupportHighEducationController');

// @route   GET /api/madaris/get-teachers-support-high-education/:madaris_id
// @desc    Get all teacher support high education records for a specific madrasa
router.get('/get-teachers-support-high-education/:madaris_id', getAllTeachersSupportHighEducation);

// @route   GET /api/madaris/get-single-teacher-support-high-education/:id
// @desc    Get single teacher support high education record by ID
router.get('/get-single-teacher-support-high-education/:id', getTeacherSupportHighEducationById);

// @route   POST /api/madaris/add-teachers-support-high-education
// @desc    Add a new teacher support high education record
router.post('/add-teachers-support-high-education', addTeacherSupportHighEducation);

// @route   PUT /api/madaris/update-teachers-support-high-education/:id
// @desc    Update a teacher support high education record
router.put('/update-teachers-support-high-education/:id', updateTeacherSupportHighEducation);

// @route   DELETE /api/madaris/delete-teachers-support-high-education/:id
// @desc    Delete a teacher support high education record (soft delete)
router.delete('/delete-teachers-support-high-education/:id', deleteTeacherSupportHighEducation);

module.exports = router;
