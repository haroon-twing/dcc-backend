const asyncHandler = require('express-async-handler');
const LuCountry = require('../models/LuCountry');

// @desc    Get all countries
// @route   GET /api/countries
// @access  Public
const getAllCountries = asyncHandler(async (req, res) => {
  try {
    const countries = await LuCountry.find({ isActive: true })
      .sort({ name: 1 })
      .select('name code phoneCode');

    res.status(200).json({
      success: true,
      count: countries.length,
      data: countries
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching countries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


module.exports = {
  getAllCountries
};
