const express = require('express');
const router = express.Router();
const {
  getAllSafecityPoliceStationConnectivities,
  getSafecityPoliceStationConnectivity,
  addSafecityPoliceStationConnectivity,
  updateSafecityPoliceStationConnectivity,
  deleteSafecityPoliceStationConnectivity
} = require('../controllers/safecityPoliceStationConnectivityController');

// @route   GET /api/safecity/get-safecitypolicestationconnectivities/:sc_id
// @desc    Get SafecityPoliceStationConnectivity records by sc_id
// @access  Public
router.get('/get-safecitypolicestationconnectivities/:sc_id', getAllSafecityPoliceStationConnectivities);

// @route   GET /api/safecity/get-single-safecitypolicestationconnectivity/:id
// @desc    Get single SafecityPoliceStationConnectivity record
// @access  Public
router.get('/get-single-safecitypolicestationconnectivity/:id', getSafecityPoliceStationConnectivity);

// @route   POST /api/safecity/add-safecitypolicestationconnectivity
// @desc    Add new SafecityPoliceStationConnectivity record
// @access  Private
router.post('/add-safecitypolicestationconnectivity', addSafecityPoliceStationConnectivity);

// @route   PUT /api/safecity/update-safecitypolicestationconnectivity/:id
// @desc    Update SafecityPoliceStationConnectivity record
// @access  Private
router.put('/update-safecitypolicestationconnectivity/:id', updateSafecityPoliceStationConnectivity);

// @route   DELETE /api/safecity/delete-safecitypolicestationconnectivity/:id
// @desc    Delete SafecityPoliceStationConnectivity record (soft delete)
// @access  Private
router.delete('/delete-safecitypolicestationconnectivity/:id', deleteSafecityPoliceStationConnectivity);

module.exports = router;
