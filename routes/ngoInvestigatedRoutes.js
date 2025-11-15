const express = require('express');
const router = express.Router();
const {
  getAllNGOInvestigated,
  getNGOInvestigated,
  addNGOInvestigated,
  updateNGOInvestigated,
  deleteNGOInvestigated
} = require('../controllers/ngoInvestigatedController');

// @route   GET /api/ngo/get-ngo-investigateds/:ngo_id
// @desc    Get all NGOInvestigated records by NGO ID
// @access  Public
router.get('/get-ngo-investigateds/:ngo_id', getAllNGOInvestigated);

// @route   GET /api/ngo/get-single-ngo-investigated/:id
// @desc    Get single NGOInvestigated record
// @access  Public
router.get('/get-single-ngo-investigated/:id', getNGOInvestigated);

// @route   POST /api/ngo/add-ngo-investigated
// @desc    Add new NGOInvestigated record
// @access  Private
router.post('/add-ngo-investigated', addNGOInvestigated);

// @route   PUT /api/ngo/update-ngo-investigated/:id
// @desc    Update NGOInvestigated record
// @access  Private
router.put('/update-ngo-investigated/:id', updateNGOInvestigated);

// @route   DELETE /api/ngo/delete-ngo-investigated/:id
// @desc    Delete NGOInvestigated record (soft delete)
// @access  Private
router.delete('/delete-ngo-investigated/:id', deleteNGOInvestigated);

module.exports = router;
