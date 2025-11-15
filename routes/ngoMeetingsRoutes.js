const express = require('express');
const router = express.Router();
const {
  getAllNGOMeetings,
  getNGOMeetingById,
  addNGOMeeting,
  updateNGOMeeting,
  deleteNGOMeeting
} = require('../controllers/ngoMeetingsController');

// Public routes
router.get('/get-all-ngo-meetings/:ngo_id', getAllNGOMeetings);
router.get('/get-single-ngo-meeting/:id', getNGOMeetingById);

// Protected routes (add authentication middleware if needed)
router.post('/add-ngo-meeting', addNGOMeeting);
router.put('/update-ngo-meeting/:id', updateNGOMeeting);
router.delete('/delete-ngo-meeting/:id', deleteNGOMeeting);

module.exports = router;
