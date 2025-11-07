const express = require('express');
const Permission = require('../models/Permission');
const { protect, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('Admin', 'Super Admin'), async (req, res) => {
  try {
    const permissions = await Permission.find({ isActive: true })
      .sort({ resource: 1, action: 1 });

    res.json({
      success: true,
      count: permissions.length,
      data: permissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single permission
// @route   GET /api/permissions/:id
// @access  Private (Admin only)
router.get('/:id', protect, authorize('Admin', 'Super Admin'), async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    res.json({
      success: true,
      data: permission
    });
  } catch (error) {
    console.error('Get permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new permission
// @route   POST /api/permissions
// @access  Private (Admin only)
router.post('/', protect, checkPermission('permissions', 'create'), async (req, res) => {
  try {
    const permission = await Permission.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission
    });
  } catch (error) {
    console.error('Create permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update permission
// @route   PUT /api/permissions/:id
// @access  Private (Admin only)
router.put('/:id', protect, checkPermission('permissions', 'update'), async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    const updatedPermission = await Permission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Permission updated successfully',
      data: updatedPermission
    });
  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete permission
// @route   DELETE /api/permissions/:id
// @access  Private (Admin only)
router.delete('/:id', protect, checkPermission('permissions', 'delete'), async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    // Soft delete - set isActive to false
    permission.isActive = false;
    await permission.save();

    res.json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    console.error('Delete permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
