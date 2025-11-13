const express = require('express');
const router = express.Router();
const {
  getAllCurriculums,
  getCurriculumById,
  addCurriculum,
  updateCurriculum,
  deleteCurriculum
} = require('../controllers/madarisCurriculumController');

// @route   GET /api/madaris/get-curriculums
// @desc    Get all curriculum records
router.get('/get-curriculums', getAllCurriculums);

// @route   GET /api/madaris/get-single-curriculum/:id
// @desc    Get single curriculum by ID
router.get('/get-single-curriculum/:id', getCurriculumById);

// @route   POST /api/madaris/add-curriculum
// @desc    Add a new curriculum
router.post('/add-curriculum', addCurriculum);

// @route   PUT /api/madaris/update-curriculum/:id
// @desc    Update a curriculum
router.put('/update-curriculum/:id', updateCurriculum);

// @route   DELETE /api/madaris/delete-curriculum/:id
// @desc    Delete a curriculum (soft delete)
router.delete('/delete-curriculum/:id', deleteCurriculum);

module.exports = router;
