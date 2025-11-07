const express = require('express');
const Section = require('../models/Section');
const { protect, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const sections = await Section.find({ isActive: true })
      .populate('departmentId', 'name')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: sections.length,
      data: sections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/by-department/:departmentId', protect, async (req, res) => {
  try {
    const sections = await Section.find({ 
      departmentId: req.params.departmentId,
      isActive: true 
    }).sort({ name: 1 });

    res.json({
      success: true,
      count: sections.length,
      data: sections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single section
// @route   GET /api/sections/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('departmentId', 'name');

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    res.json({
      success: true,
      data: section
    });
  } catch (error) {
    console.error('Get section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new section
// @route   POST /api/sections
// @access  Private (Admin only)
router.post('/', protect, checkPermission('sections', 'create'), async (req, res) => {
  try {
    const section = await Section.create(req.body);
    await section.populate('departmentId', 'name');

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: section
    });
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private (Admin only)
router.put('/:id', protect, checkPermission('sections', 'update'), async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    const updatedSection = await Section.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('departmentId', 'name');

    res.json({
      success: true,
      message: 'Section updated successfully',
      data: updatedSection
    });
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete section
// @route   DELETE /api/sections/:id
// @access  Private (Admin only)
router.delete('/:id', protect, checkPermission('sections', 'delete'), async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    // Soft delete - set isActive to false
    section.isActive = false;
    await section.save();

    res.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
