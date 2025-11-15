const express = require('express');
const router = express.Router();
const { 
  getAllCountries
} = require('../controllers/luCountryController');

// @route   GET /api/countries
// @access  Public
router.get('/', getAllCountries);

module.exports = router;