const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Permission name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    trim: true,
    enum: ['users', 'leads', 'departments', 'sections', 'programs', 'roles', 'permissions', 'inbox']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    enum: ['create', 'read', 'update', 'delete', 'manage']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better performance
permissionSchema.index({ name: 1 });
permissionSchema.index({ resource: 1, action: 1 });
permissionSchema.index({ isActive: 1 });

// Update timestamp on save
permissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Permission', permissionSchema);
