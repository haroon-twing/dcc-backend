const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    console.log(`🔐 Protect middleware: ${req.method} ${req.path}`);
    console.log(`📋 Headers:`, req.headers.authorization ? 'Authorization header present' : 'No Authorization header');
    
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log(`🎫 Token found: ${token.substring(0, 20)}...`);
    } else {
      console.log('❌ No Bearer token found');
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password').populate({
        path: 'roleId',
        populate: {
          path: 'permissions',
          model: 'Permission'
        }
      });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No user found with this token'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles (legacy - use checkPermission instead)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.roleId.name)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.roleId.name} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user has specific permission
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      console.log(`🔍 Permission Check: ${action} ${resource}`);
      
      if (!req.user) {
        console.log('❌ No user found in request');
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route'
        });
      }

      console.log(`👤 User: ${req.user.name} (${req.user.email})`);
      console.log(`🎭 Role: ${req.user.roleId ? req.user.roleId.name : 'No role'}`);

      // Populate role with permissions if not already populated
      if (!req.user.roleId.permissions || req.user.roleId.permissions.length === 0) {
        console.log('📋 Populating role permissions...');
        await req.user.populate({
          path: 'roleId',
          populate: {
            path: 'permissions',
            model: 'Permission'
          }
        });
      }

      console.log(`📊 User has ${req.user.roleId.permissions ? req.user.roleId.permissions.length : 0} permissions`);
      
      // Log all permissions for debugging
      if (req.user.roleId.permissions) {
        console.log('🔐 User permissions:');
        req.user.roleId.permissions.forEach(p => {
          console.log(`  - ${p.resource}.${p.action}: ${p.name}`);
        });
      }

      const hasPermission = req.user.roleId.permissions.some(permission => 
        permission.resource === resource && 
        permission.action === action
      );

      console.log(`✅ Has ${action} ${resource} permission:`, hasPermission);

      if (!hasPermission) {
        console.log(`❌ Access denied: Missing ${action} ${resource} permission`);
        return res.status(403).json({
          success: false,
          message: `Access denied: You don't have permission to ${action} ${resource}. Please contact your administrator.`
        });
      }

      console.log(`✅ Permission check passed for ${action} ${resource}`);
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error in permission check'
      });
    }
  };
};

// Check if user has any of the specified permissions (OR logic)
const checkAnyPermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route'
        });
      }

      // Populate role with permissions if not already populated
      if (!req.user.roleId.permissions) {
        await req.user.populate({
          path: 'roleId',
          populate: {
            path: 'permissions'
          }
        });
      }

      const hasAnyPermission = permissions.some(({ resource, action }) =>
        req.user.roleId.permissions.some(permission => 
          permission.resource === resource && 
          permission.action === action
        )
      );

      if (!hasAnyPermission) {
        const permissionList = permissions.map(p => `${p.action} ${p.resource}`).join(' or ');
        return res.status(403).json({
          success: false,
          message: `Access denied: You need permission to ${permissionList}. Please contact your administrator.`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error in permission check'
      });
    }
  };
};

// Check if user has all of the specified permissions (AND logic)
const checkAllPermissions = (...permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route'
        });
      }

      // Populate role with permissions if not already populated
      if (!req.user.roleId.permissions) {
        await req.user.populate({
          path: 'roleId',
          populate: {
            path: 'permissions'
          }
        });
      }

      const hasAllPermissions = permissions.every(({ resource, action }) =>
        req.user.roleId.permissions.some(permission => 
          permission.resource === resource && 
          permission.action === action
        )
      );

      if (!hasAllPermissions) {
        const permissionList = permissions.map(p => `${p.action} ${p.resource}`).join(' and ');
        return res.status(403).json({
          success: false,
          message: `Access denied: You need permission to ${permissionList}. Please contact your administrator.`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error in permission check'
      });
    }
  };
};

module.exports = {
  protect,
  authorize,
  checkPermission,
  checkAnyPermission,
  checkAllPermissions
};
