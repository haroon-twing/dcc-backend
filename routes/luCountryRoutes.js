const express = require('express');
const router = express.Router();
const { 
  getAllCountries,
  getAllCitiesWithDistricts
} = require('../controllers/luCountryController');

// @route   GET /api/countries
// @access  Public
router.get('/', getAllCountries);

// @route   GET /api/cities
// @access  Public
router.get('/', getAllCitiesWithDistricts);

module.exports = router;