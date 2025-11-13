const express = require('express');
const router = express.Router();
const {
  getAllNonCooperativeRecords,
  createNonCooperativeRecord,
  getNonCooperativeRecord,
  updateNonCooperativeRecord,
  deleteNonCooperativeRecord
} = require('../controllers/madarisNonCooperativeController');

// @route   GET /api/madaris/get-non-cooperative-records/:madaris_id
// @desc    Get all non-cooperative records for a specific madrasa
router.get('/get-non-cooperative-records/:madaris_id',  getAllNonCooperativeRecords);

// @route   GET /api/madaris/get-single-non-cooperative-record/:id
// @desc    Get single non-cooperative record by ID
router.get('/get-single-non-cooperative-record/:id',  getNonCooperativeRecord);

// @route   POST /api/madaris/add-non-cooperative-record
// @desc    Add a new non-cooperative record
router.post('/add-non-cooperative-record',  createNonCooperativeRecord);

// @route   PUT /api/madaris/update-non-cooperative-record/:id
// @desc    Update a non-cooperative record
router.put('/update-non-cooperative-record/:id',  updateNonCooperativeRecord);

// @route   DELETE /api/madaris/delete-non-cooperative-record/:id
// @desc    Delete a non-cooperative record (soft delete)
router.delete('/delete-non-cooperative-record/:id',  deleteNonCooperativeRecord);

module.exports = router;
