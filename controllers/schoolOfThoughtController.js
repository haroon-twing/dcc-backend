const asyncHandler = require('express-async-handler');
const LuSchoolOfThought = require('../models/LuSchoolOfThought');

// @desc    Get all school of thoughts
// @route   GET /api/all-school-of-thoughts
// @access  Public
const getAllSchoolOfThoughts = asyncHandler(async (req, res) => {
  try {
    const schoolOfThoughts = await LuSchoolOfThought.aggregate([
      { $match: { isActive: true } },
      { $sort: { name: 1 } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: schoolOfThoughts.length,
      data: schoolOfThoughts
    });
  } catch (error) {
    console.error('Error fetching school of thoughts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching school of thoughts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = {
  getAllSchoolOfThoughts
};