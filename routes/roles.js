const express = require('express');
const Role = require('../models/Role');
const { protect, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true })
      .populate('permissions')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single role
// @route   GET /api/roles/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate('permissions');

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new role
// @route   POST /api/roles
// @access  Private (Admin only)
router.post('/', protect, checkPermission('roles', 'create'), async (req, res) => {
  try {
    const role = await Role.create(req.body);
    await role.populate('permissions');

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private (Admin only)
router.put('/:id', protect, checkPermission('roles', 'update'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('permissions');

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private (Admin only)
router.delete('/:id', protect, checkPermission('roles', 'delete'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Soft delete - set isActive to false
    role.isActive = false;
    await role.save();

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
