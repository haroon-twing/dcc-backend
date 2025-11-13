const express = require('express');
const router = express.Router();
const {
  getAllSubjectCurriculums,
  getSubjectCurriculumById,
  addSubjectCurriculum,
  updateSubjectCurriculum,
  deleteSubjectCurriculum
} = require('../controllers/madarisSubjectCurriculumController');

// @route   GET /api/madaris/get-subject-curriculums
// @desc    Get all subject curriculum records
router.get('/get-subject-curriculums', getAllSubjectCurriculums);

// @route   GET /api/madaris/get-single-subject-curriculum/:id
// @desc    Get single subject curriculum by ID
router.get('/get-single-subject-curriculum/:id', getSubjectCurriculumById);

// @route   POST /api/madaris/add-subject-curriculum
// @desc    Add a new subject curriculum
router.post('/add-subject-curriculum', addSubjectCurriculum);

// @route   PUT /api/madaris/update-subject-curriculum/:id
// @desc    Update a subject curriculum
router.put('/update-subject-curriculum/:id', updateSubjectCurriculum);

// @route   DELETE /api/madaris/delete-subject-curriculum/:id
// @desc    Delete a subject curriculum (soft delete)
router.delete('/delete-subject-curriculum/:id', deleteSubjectCurriculum);

module.exports = router;
