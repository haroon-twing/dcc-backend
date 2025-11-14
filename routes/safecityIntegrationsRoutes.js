const express = require('express');
const router = express.Router();
const {
  getAllSafecityIntegrations,
  getSafecityIntegration,
  addSafecityIntegration,
  updateSafecityIntegration,
  deleteSafecityIntegration
} = require('../controllers/safecityIntegrationsController');

// @route   GET /api/safecity/get-safecityintegrations
// @desc    Get all SafecityIntegrations records
// @access  Public
router.get('/get-safecityintegrations/:sc_id', getAllSafecityIntegrations);

// @route   GET /api/safecity/get-single-safecityintegration/:id
// @desc    Get single SafecityIntegrations record
// @access  Public
router.get('/get-single-safecityintegration/:id', getSafecityIntegration);

// @route   POST /api/safecity/add-safecityintegration
// @desc    Add new SafecityIntegrations record
// @access  Private
router.post('/add-safecityintegration', addSafecityIntegration);

// @route   PUT /api/safecity/update-safecityintegration/:id
// @desc    Update SafecityIntegrations record
// @access  Private
router.put('/update-safecityintegration/:id', updateSafecityIntegration);

// @route   DELETE /api/safecity/delete-safecityintegration/:id
// @desc    Delete SafecityIntegrations record (soft delete)
// @access  Private
router.delete('/delete-safecityintegration/:id', deleteSafecityIntegration);

module.exports = router;
