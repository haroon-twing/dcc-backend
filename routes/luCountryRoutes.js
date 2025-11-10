const express = require('express');
const router = express.Router();
const { getAllCountries } = require('../controllers/luCountryController');

// Public routes
router.get('/', getAllCountries);

module.exports = router;
