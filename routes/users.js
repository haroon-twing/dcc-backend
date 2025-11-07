const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize, checkPermission, checkAnyPermission } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', protect, checkPermission('users', 'read'), async (req, res) => {
  try {
    const { sectionId } = req.query;
    let query = { isActive: true };
    
    if (sectionId) {
      query.sectionId = sectionId;
    }

    const users = await User.find(query)
      .populate('roleId', 'name')
      .populate('departmentId', 'name')
      .populate('sectionId', 'name')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get users by section
// @route   GET /api/users/by-section/:sectionId
// @access  Private
router.get('/by-section/:sectionId', protect, async (req, res) => {
  try {
    const users = await User.find({ 
      sectionId: req.params.sectionId,
      isActive: true 
    })
      .populate('roleId', 'name')
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Get users by section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('roleId', 'name')
      .populate('departmentId', 'name')
      .populate('sectionId', 'name')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
router.post('/', protect, checkPermission('users', 'create'), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('roleId').isMongoId().withMessage('Please provide a valid role ID'),
  body('departmentId').isMongoId().withMessage('Please provide a valid department ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, roleId, departmentId, sectionId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      roleId,
      departmentId,
      sectionId
    });

    // Populate the created user
    await user.populate([
      { path: 'roleId', select: 'name' },
      { path: 'departmentId', select: 'name' },
      { path: 'sectionId', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, email, roleId, departmentId, sectionId, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is trying to update their own profile or has update permission
    if (req.user._id.toString() !== req.params.id) {
      // Check if user has update permission for users
      if (!req.user.roleId.permissions) {
        await req.user.populate({
          path: 'roleId',
          populate: { path: 'permissions' }
        });
      }
      
      const hasUpdatePermission = req.user.roleId.permissions.some(permission => 
        permission.resource === 'users' && permission.action === 'update'
      );
      
      if (!hasUpdatePermission) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You don\'t have permission to update other users. Please contact your administrator.'
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, roleId, departmentId, sectionId, isActive },
      { new: true, runValidators: true }
    ).populate([
      { path: 'roleId', select: 'name' },
      { path: 'departmentId', select: 'name' },
      { path: 'sectionId', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', protect, checkPermission('users', 'delete'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - set isActive to false
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
