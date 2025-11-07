const Province = require('../models/LuProvince');
const District = require('../models/LuDistrict');
const asyncHandler = require('express-async-handler');

// @desc    Get all provinces
// @route   GET /api/all-provinces
// @access  Public
const getProvinces = asyncHandler(async (req, res) => {
  try {
    const provinces = await Province.find({ isActive: true })
      .sort({ name: 1 })
      .select('_id name remarks');
    
    res.status(200).json({
      success: true,
      count: provinces.length,
      data: provinces
    });
  } catch (error) {
    console.error('Error fetching provinces:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching provinces',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get all districts with province names
// @route   GET /api/districts
// @access  Public
const getDistricts = asyncHandler(async (req, res) => {
  try {
    const districts = await District.aggregate([
      {
        $lookup: {
          from: 'lu_province', // The collection name in MongoDB (case-sensitive)
          localField: 'prov_id',
          foreignField: '_id',
          as: 'province'
        }
      },
      { $unwind: '$province' },
      { 
        $project: {
          _id: 1,
          name: 1,
          remarks: 1,
          isActive: 1,
          province: {
            _id: '$province._id',
            name: '$province.name'
          }
        }
      },
      { $sort: { 'province.name': 1, 'name': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      count: districts.length,
      data: districts
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching districts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = {
  getProvinces,
  getDistricts
};
