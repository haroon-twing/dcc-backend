const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addMadrassaMeeting,
  getSingleMadrassaMeeting,
  getAllMadrassaMeetings,
  updateMadrassaMeeting,
  deleteMadrassaMeeting
} = require('../controllers/madarisMeetingController');

// Apply auth middleware to all routes
router.use(protect);

// @route   POST /
router.post('/', addMadrassaMeeting);

// @route   GET /:id
router.get('/:id', getSingleMadrassaMeeting);

// @route   GET /madrassa/:madrassaId
router.get('/madrassa/:madrassaId', getAllMadrassaMeetings);

// @route   PUT /:id
router.put('/:id', updateMadrassaMeeting);

// @route   DELETE /:id
router.delete('/:id', deleteMadrassaMeeting);

module.exports = router;
