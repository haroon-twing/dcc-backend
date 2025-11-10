const express = require('express');
const router = express.Router();
const { getAllSchoolOfThoughts } = require('../controllers/schoolOfThoughtController');

// Public route to get all school of thoughts
router.get('/', getAllSchoolOfThoughts);

module.exports = router;