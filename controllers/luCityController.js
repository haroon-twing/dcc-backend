const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const LuCity = require('../models/LuCity');

// @desc    Get all cities with their districts
// @route   GET /api/all-cities
// @access  Public
const getAllCitiesWithDistricts = asyncHandler(async (req, res) => {
  try {
    console.log('Starting to fetch cities with districts...');
    
    // First, check if there are any cities in the database
    const totalCities = await LuCity.countDocuments({});
    console.log(`Total cities in database: ${totalCities}`);
    
    // Get sample city to check data structure
    const sampleCity = await LuCity.findOne({});
    console.log('Sample city data:', sampleCity);

    // Get all districts to verify they exist
    const District = mongoose.connection.db.collection('lu_districts');
    const districtsCount = await District.countDocuments({});
    console.log(`Total districts in database: ${districtsCount}`);

    // Modified aggregation with better error handling
    const cities = await LuCity.aggregate([
      {
        $match: { status: true } // Changed from is_active to status to match schema
      },
      {
        $lookup: {
          from: 'lu_districts',
          localField: 'district_id',
          foreignField: '_id',
          as: 'district'
        }
      },
      { 
        $unwind: {
          path: '$district',
          preserveNullAndEmptyArrays: true // Include cities even if district not found
        } 
      },
      {
        $project: {
          _id: 1,
          name: 1,
          status: 1,
          district_id: 1,
          district_name: { $ifNull: ['$district.name', 'Unknown'] },
          is_active: '$status',
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { name: 1 } }
    ]);

    console.log(`Found ${cities.length} active cities with districts`);
    
    if (cities.length === 0) {
      console.warn('No cities found. This might indicate a data issue.');
    }

    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities
    });
  } catch (error) {
    console.error('Error in getAllCitiesWithDistricts:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cities with districts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = {
  getAllCitiesWithDistricts
};
