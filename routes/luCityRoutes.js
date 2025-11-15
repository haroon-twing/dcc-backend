const express = require('express');
const router = express.Router();
const { getAllCitiesWithDistricts } = require('../controllers/luCityController');

// @route   GET /api/all-cities
// @desc    Get all cities with their districts
// @access  Public
router.get('/', getAllCitiesWithDistricts);

module.exports = router;
