const express = require('express');
const router = express.Router();
const {
  getAllSubjectUpdateCurriculums,
  getSubjectUpdateCurriculumById,
  addSubjectUpdateCurriculum,
  updateSubjectUpdateCurriculum,
  deleteSubjectUpdateCurriculum
} = require('../controllers/madarisSubjectUpdateCurriculumController');

// @route   GET /api/madaris/get-subject-update-curriculums
// @desc    Get all subject update curriculum records
router.get('/get-subject-update-curriculums', getAllSubjectUpdateCurriculums);

// @route   GET /api/madaris/get-single-subject-update-curriculum/:id
// @desc    Get single subject update curriculum by ID
router.get('/get-single-subject-update-curriculum/:id', getSubjectUpdateCurriculumById);

// @route   POST /api/madaris/add-subject-update-curriculum
// @desc    Add a new subject update curriculum
router.post('/add-subject-update-curriculum', addSubjectUpdateCurriculum);

// @route   PUT /api/madaris/update-subject-update-curriculum/:id
// @desc    Update a subject update curriculum
router.put('/update-subject-update-curriculum/:id', updateSubjectUpdateCurriculum);

// @route   DELETE /api/madaris/delete-subject-update-curriculum/:id
// @desc    Delete a subject update curriculum (soft delete)
router.delete('/delete-subject-update-curriculum/:id', deleteSubjectUpdateCurriculum);

module.exports = router;
