const express = require('express');
const router = express.Router();
const { addCurriculumSubjectAssignment } = require('../controllers/madarisCurriculumSubjectAssignmentController');

// @route   POST /api/madaris/add-curriculum-subject-assignment
// @desc    Add a new curriculum subject assignment
// @body    { curriculum_id: String (required), subject_id: String (required) }
// @access  Public
router.post('/add-curriculum-subject-assignment', addCurriculumSubjectAssignment);

module.exports = router;
