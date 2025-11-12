const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const {
  getAllNonCooperativeRecords,
  createNonCooperativeRecord,
  getNonCooperativeRecord,
  updateNonCooperativeRecord,
  deleteNonCooperativeRecord
} = require('../controllers/madarisNonCooperativeController');

// Routes for non-cooperative madaris records
router.route('/')
  .post(protect, createNonCooperativeRecord)  // Create a new record
  .get(protect, getAllNonCooperativeRecords); // Get all records for a madrasa

router.route('/:id')
  .get(protect, getNonCooperativeRecord)     // Get single record
  .put(protect, updateNonCooperativeRecord)  // Update record
  .delete(protect, deleteNonCooperativeRecord); // Soft delete record

module.exports = router;
