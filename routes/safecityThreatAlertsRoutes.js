const express = require('express');
const router = express.Router();
const {
  getAllSafecityThreatAlerts,
  getSafecityThreatAlert,
  addSafecityThreatAlert,
  updateSafecityThreatAlert,
  deleteSafecityThreatAlert
} = require('../controllers/safecityThreatAlertsController');

// @route   GET /api/safecity/get-safecitythreatalerts
// @desc    Get all SafecityThreatAlerts records
// @access  Public
router.get('/get-safecitythreatalerts', getAllSafecityThreatAlerts);

// @route   GET /api/safecity/get-single-safecitythreatalert/:id
// @desc    Get single SafecityThreatAlerts record
// @access  Public
router.get('/get-single-safecitythreatalert/:id', getSafecityThreatAlert);

// @route   POST /api/safecity/add-safecitythreatalert
// @desc    Add new SafecityThreatAlerts record
// @access  Private
router.post('/add-safecitythreatalert', addSafecityThreatAlert);

// @route   PUT /api/safecity/update-safecitythreatalert/:id
// @desc    Update SafecityThreatAlerts record
// @access  Private
router.put('/update-safecitythreatalert/:id', updateSafecityThreatAlert);

// @route   DELETE /api/safecity/delete-safecitythreatalert/:id
// @desc    Delete SafecityThreatAlerts record (soft delete)
// @access  Private
router.delete('/delete-safecitythreatalert/:id', deleteSafecityThreatAlert);

module.exports = router;
