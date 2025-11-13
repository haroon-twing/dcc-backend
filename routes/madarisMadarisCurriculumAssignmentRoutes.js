const express = require('express');
const router = express.Router();
const { addMadrasaCurriculumAssignment } = require('../controllers/madarisMadarisCurriculumAssignmentController');

// @route   POST /api/madaris/add-madrasa-curriculum-assignment
// @desc    Add a new madrasa-curriculum assignment
// @body    { madaris_id: String (required), curriculum_id: String (required) }
// @access  Public
router.post('/add-madrasa-curriculum-assignment', addMadrasaCurriculumAssignment);

module.exports = router;
