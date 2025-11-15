const express = require('express');
const router = express.Router();
const {
  getAllNGOVerifCasesRecommToMOI,
  getNGOVerifCasesRecommToMOI,
  addNGOVerifCasesRecommToMOI,
  updateNGOVerifCasesRecommToMOI,
  deleteNGOVerifCasesRecommToMOI
} = require('../controllers/ngoVerifCasesRecommToMOIController');

// @route   GET /api/ngo/get-ngo-verif-cases-recomm-moi/:ngo_id
// @desc    Get all NGOVerifCasesRecommToMOI records by NGO ID
// @access  Public
router.get('/get-ngo-verif-cases-recomm-moi/:ngo_id', getAllNGOVerifCasesRecommToMOI);

// @route   GET /api/ngo/get-single-ngo-verif-cases-recomm-moi/:id
// @desc    Get single NGOVerifCasesRecommToMOI record
// @access  Public
router.get('/get-single-ngo-verif-cases-recomm-moi/:id', getNGOVerifCasesRecommToMOI);

// @route   POST /api/ngo/add-ngo-verif-cases-recomm-moi
// @desc    Add new NGOVerifCasesRecommToMOI record
// @access  Private
router.post('/add-ngo-verif-cases-recomm-moi', addNGOVerifCasesRecommToMOI);

// @route   PUT /api/ngo/update-ngo-verif-cases-recomm-moi/:id
// @desc    Update NGOVerifCasesRecommToMOI record
// @access  Private
router.put('/update-ngo-verif-cases-recomm-moi/:id', updateNGOVerifCasesRecommToMOI);

// @route   DELETE /api/ngo/delete-ngo-verif-cases-recomm-moi/:id
// @desc    Delete NGOVerifCasesRecommToMOI record (soft delete)
// @access  Private
router.delete('/delete-ngo-verif-cases-recomm-moi/:id', deleteNGOVerifCasesRecommToMOI);

module.exports = router;
