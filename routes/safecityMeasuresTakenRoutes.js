const express = require('express');
const router = express.Router();
const {
  getAllSafecityMeasuresTaken,
  getSafecityMeasureTakenById,
  addSafecityMeasureTaken,
  updateSafecityMeasureTaken,
  deleteSafecityMeasureTaken
} = require('../controllers/safecityMeasuresTakenController');

// Public routes
router.get('/get-all-safecity-measures-taken/:sc_id', getAllSafecityMeasuresTaken);
router.get('/get-single-safecity-measure-taken/:id', getSafecityMeasureTakenById);

// Protected routes (add authentication middleware if needed)
router.post('/add-safecity-measure-taken', addSafecityMeasureTaken);
router.put('/update-safecity-measure-taken/:id', updateSafecityMeasureTaken);
router.delete('/delete-safecity-measure-taken/:id', deleteSafecityMeasureTaken);

module.exports = router;
