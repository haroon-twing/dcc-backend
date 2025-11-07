const express = require('express');
const router = express.Router();
const { getProvinces } = require('../controllers/provinceController');

// Public routes
router.get('/', getProvinces);

module.exports = router;
