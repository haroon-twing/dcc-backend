const express = require('express');
const router = express.Router();
const {
  getAllSafecityMain,
  getSafecityMain,
  addSafecityMain,
  updateSafecityMain,
  deleteSafecityMain
} = require('../controllers/safecityMainController');

// @route   GET /api/safecity/get-safecitymains
// @desc    Get all SafecityMain records
// @access  Public
router.get('/get-safecitymains', getAllSafecityMain);

// @route   GET /api/safecity/get-single-safecitymain/:id
// @desc    Get single SafecityMain record by ID
// @access  Public
router.get('/get-single-safecitymain/:id', getSafecityMain);

// @route   POST /api/safecity/add-safecitymain
// @desc    Add new SafecityMain record
// @access  Private
router.post('/add-safecitymain', addSafecityMain);

// @route   PUT /api/safecity/update-safecitymain/:id
// @desc    Update SafecityMain record
// @access  Private
router.put('/update-safecitymain/:id', updateSafecityMain);

// @route   DELETE /api/safecity/delete-safecitymain/:id
// @desc    Delete SafecityMain record (soft delete)
// @access  Private
router.delete('/delete-safecitymain/:id', deleteSafecityMain);

module.exports = router;
