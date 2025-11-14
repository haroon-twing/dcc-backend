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

// Add this new controller function
const getAllCitiesWithDistricts = asyncHandler(async (req, res) => {
  try {
    const cities = await LuCity.aggregate([
      {
        $match: { is_active: true }
      },
      {
        $lookup: {
          from: 'lu_districts',
          localField: 'district_id',
          foreignField: '_id',
          as: 'district'
        }
      },
      { $unwind: '$district' },
      {
        $project: {
          _id: 1,
          name: 1,
          status: 1,
          district_id: 1,
          district_name: '$district.name',
          created_at: 1,
          updated_at: 1
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities
    });
  } catch (error) {
    console.error('Error fetching cities with districts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cities with districts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


module.exports = {
  getAllCountries,
  getAllCitiesWithDistricts
};
