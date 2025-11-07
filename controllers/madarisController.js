const Madaris = require('../models/Madaris');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// @desc    Add a new madrassa
// @route   POST /api/add-madaris
// @access  Private
const addMadrassa = [
  // Input validation
  body('name').notEmpty().withMessage('Name is required'),
  body('prov_id').isMongoId().withMessage('Valid province ID is required'),
  body('district_id').isMongoId().withMessage('Valid district ID is required'),
  //body('status').isIn(['active', 'inactive']).withMessage('Invalid status'),
  
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const madrassa = new Madaris({
      ...req.body,
      isActive: true
    });

    const createdMadrassa = await madrassa.save();
    res.status(201).json({
      success: true,
      data: createdMadrassa
    });
  })
];

// @desc    Get all madaris
// @route   GET /api/get-all-madaris
// @access  Public
const getAllMadaris = asyncHandler(async (req, res) => {
  try {
    const madaris = await Madaris.find({ isActive: true })
      .populate('prov_id', 'name')
      .populate('district_id', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: madaris.length,
      data: madaris
    });
  } catch (error) {
    console.error('Error fetching madaris:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching madaris',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get single madrassa
// @route   GET /api/view-single-madaris/:id
// @access  Public
const getMadrassaById = asyncHandler(async (req, res) => {
  try {
    const madrassa = await Madaris.findById(req.params.id)
      .populate('prov_id', 'name')
      .populate('district_id', 'name');

    if (!madrassa || !madrassa.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Madrassa not found'
      });
    }

    res.status(200).json({
      success: true,
      data: madrassa
    });
  } catch (error) {
    console.error('Error fetching madrassa:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching madrassa',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update madrassa
// @route   PUT /api/update-madaris/:id
// @access  Private
const updateMadrassa = [
  // Input validation
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const madrassa = await Madaris.findById(req.params.id);

    if (!madrassa || !madrassa.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Madrassa not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      madrassa[key] = req.body[key];
    });

    const updatedMadrassa = await madrassa.save();

    res.status(200).json({
      success: true,
      data: updatedMadrassa
    });
  })
];

// @desc    Delete madrassa (soft delete)
// @route   DELETE /api/delete-madaris/:id
// @access  Private
const deleteMadrassa = asyncHandler(async (req, res) => {
  try {
    const madrassa = await Madaris.findById(req.params.id);

    if (!madrassa || !madrassa.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Madrassa not found'
      });
    }

    // Soft delete
    madrassa.isActive = false;
    await madrassa.save();

    res.status(200).json({
      success: true,
      message: 'Madrassa deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting madrassa:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting madrassa',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = {
  addMadrassa,
  getAllMadaris,
  getMadrassaById,
  updateMadrassa,
  deleteMadrassa
};
