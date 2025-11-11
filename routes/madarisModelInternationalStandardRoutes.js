const express = require('express');
const router = express.Router();
const {
  getAllInternationalStandards,
  getInternationalStandardById,
  addInternationalStandard,
  updateInternationalStandard,
  deleteInternationalStandard
} = require('../controllers/madarisModelInternationalStandardController');

// @route   GET /api/madaris/get-international-standards/:madaris_id
// @desc    Get all international standard records for a specific madrasa
router.get('/get-international-standards/:madaris_id', getAllInternationalStandards);

// @route   GET /api/madaris/get-single-international-standard/:id
// @desc    Get single international standard record by ID
router.get('/get-single-international-standard/:id', getInternationalStandardById);

// @route   POST /api/madaris/add-international-standard
// @desc    Add a new international standard record
router.post('/add-international-standard', addInternationalStandard);

// @route   PUT /api/madaris/update-international-standard/:id
// @desc    Update an international standard record
router.put('/update-international-standard/:id', updateInternationalStandard);

// @route   DELETE /api/madaris/delete-international-standard/:id
// @desc    Delete an international standard record (soft delete)
router.delete('/delete-international-standard/:id', deleteInternationalStandard);

module.exports = router;
