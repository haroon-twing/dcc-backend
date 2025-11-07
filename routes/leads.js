const express = require('express');
const path = require('path');
const fs = require('fs');
const Lead = require('../models/Lead');
const { protect, checkPermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { assignedToId, createdBy } = req.query;
    
    let query = { isActive: true };
    
    // If assignedToId is provided, filter by assigned users
    if (assignedToId) {
      query.$or = [
        { assignedToId: assignedToId },
        { 'assignedUsers.userId': assignedToId }
      ];
    }
    // If createdBy is provided, filter by creator
    else if (createdBy) {
      query.createdById = createdBy;
    }
    // Default: show only leads created by current user
    else {
      query.createdById = req.user._id;
    }

    const leads = await Lead.find(query)
      .populate('assignedToId', 'name email')
      .populate('assignedUsers.userId', 'name email')
      .populate('assignedUsers.assignedBy', 'name email')
      .populate('createdById', 'name email')
      .populate('departmentId', 'name')
      .populate('sectionId', 'name')
      .populate('programId', 'name')
      .populate('readBy.userId', 'name email')
      .sort({ updatedAt: -1 });

    // Add read status for each lead
    const leadsWithReadStatus = leads.map(lead => {
      const leadObj = lead.toObject();
      const isRead = lead.readBy.some(read => read.userId._id.toString() === req.user._id.toString());
      leadObj.isRead = isRead;
      return leadObj;
    });

    res.json({
      success: true,
      count: leadsWithReadStatus.length,
      data: leadsWithReadStatus
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedToId', 'name email')
      .populate('assignedUsers.userId', 'name email')
      .populate('assignedUsers.assignedBy', 'name email')
      .populate('createdById', 'name email')
      .populate('departmentId', 'name')
      .populate('sectionId', 'name')
      .populate('programId', 'name');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private
router.post('/', protect, checkPermission('leads', 'create'), upload.array('documents', 10), async (req, res) => {
  try {
    const { assignedUserIds, contactInfo, ...otherData } = req.body;
    
    // Parse JSON strings if they exist
    let parsedAssignedUserIds = [];
    if (assignedUserIds) {
      try {
        parsedAssignedUserIds = JSON.parse(assignedUserIds);
      } catch (e) {
        parsedAssignedUserIds = [];
      }
    }
    
    let parsedContactInfo = {};
    if (contactInfo) {
      try {
        parsedContactInfo = JSON.parse(contactInfo);
      } catch (e) {
        parsedContactInfo = {};
      }
    }
    
    // Sanitize empty strings to null for optional ObjectId fields
    const sanitizedData = { ...otherData, contactInfo: parsedContactInfo };
    
    // Convert empty strings to null for optional ObjectId fields
    if (sanitizedData.programId === '') {
      sanitizedData.programId = null;
    }
    if (sanitizedData.sectionId === '') {
      sanitizedData.sectionId = null;
    }
    if (sanitizedData.departmentId === '') {
      sanitizedData.departmentId = null;
    }
    if (sanitizedData.assignedToId === '') {
      sanitizedData.assignedToId = null;
    }

    const leadData = {
      ...sanitizedData,
      createdById: req.user._id
    };

    // Handle uploaded document files
    console.log('Files received:', req.files);
    if (req.files && req.files.length > 0) {
      console.log('Processing', req.files.length, 'files');
      leadData.documentFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      }));
      
      console.log('DocumentFiles created:', leadData.documentFiles);
      
      // Keep the first file in documentFile for backward compatibility
      if (req.files[0]) {
        leadData.documentFile = {
          filename: req.files[0].filename,
          originalName: req.files[0].originalname,
          mimetype: req.files[0].mimetype,
          size: req.files[0].size,
          path: req.files[0].path
        };
        console.log('DocumentFile created:', leadData.documentFile);
      }
    } else {
      console.log('No files received');
    }

    // Add assigned users if provided
    if (parsedAssignedUserIds && Array.isArray(parsedAssignedUserIds) && parsedAssignedUserIds.length > 0) {
      leadData.assignedUsers = parsedAssignedUserIds.map(userId => ({
        userId,
        assignedBy: req.user._id,
        assignedAt: new Date()
      }));
    }

    console.log('Lead data before creation:', JSON.stringify(leadData, null, 2));
    
    const lead = await Lead.create(leadData);
    console.log('Lead created with ID:', lead._id);
    console.log('Lead documentFiles after creation:', lead.documentFiles);
    console.log('Lead documentFile after creation:', lead.documentFile);
    
    await lead.populate([
      { path: 'assignedToId', select: 'name email' },
      { path: 'assignedUsers.userId', select: 'name email' },
      { path: 'assignedUsers.assignedBy', select: 'name email' },
      { path: 'createdById', select: 'name email' },
      { path: 'departmentId', select: 'name' },
      { path: 'sectionId', select: 'name' },
      { path: 'programId', select: 'name' }
    ]);
    
    console.log('Lead after population - documentFiles:', lead.documentFiles);
    console.log('Lead after population - documentFile:', lead.documentFile);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
router.put('/:id', protect, checkPermission('leads', 'update'), upload.array('documents', 10), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const { assignedUserIds, ...otherData } = req.body;
    
    // Sanitize empty strings to null for optional ObjectId fields
    const sanitizedData = { ...otherData };
    
    // Convert empty strings to null for optional ObjectId fields
    if (sanitizedData.programId === '') {
      sanitizedData.programId = null;
    }
    if (sanitizedData.sectionId === '') {
      sanitizedData.sectionId = null;
    }
    if (sanitizedData.departmentId === '') {
      sanitizedData.departmentId = null;
    }
    if (sanitizedData.assignedToId === '') {
      sanitizedData.assignedToId = null;
    }

    // Handle uploaded document files for edit
    console.log('Edit: Files received:', req.files);
    if (req.files && req.files.length > 0) {
      console.log('Edit: Processing', req.files.length, 'new files');
      
      // Get existing documents
      const existingDocuments = lead.documentFiles || [];
      
      // Add new documents to existing ones
      const newDocuments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      }));
      
      // Combine existing and new documents
      sanitizedData.documentFiles = [...existingDocuments, ...newDocuments];
      
      console.log('Edit: Total documents after update:', sanitizedData.documentFiles.length);
      
      // Update documentFile with the first new file for backward compatibility
      if (req.files[0]) {
        sanitizedData.documentFile = {
          filename: req.files[0].filename,
          originalName: req.files[0].originalname,
          mimetype: req.files[0].mimetype,
          size: req.files[0].size,
          path: req.files[0].path
        };
      }
    }

    // Update assigned users if provided
    if (assignedUserIds !== undefined) {
      if (Array.isArray(assignedUserIds) && assignedUserIds.length > 0) {
        sanitizedData.assignedUsers = assignedUserIds.map(userId => ({
          userId,
          assignedBy: req.user._id,
          assignedAt: new Date()
        }));
      } else {
        sanitizedData.assignedUsers = [];
      }
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      sanitizedData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'assignedToId', select: 'name email' },
      { path: 'assignedUsers.userId', select: 'name email' },
      { path: 'assignedUsers.assignedBy', select: 'name email' },
      { path: 'createdById', select: 'name email' },
      { path: 'departmentId', select: 'name' },
      { path: 'sectionId', select: 'name' },
      { path: 'programId', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
router.delete('/:id', protect, checkPermission('leads', 'delete'), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Soft delete - set isActive to false
    lead.isActive = false;
    await lead.save();

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Mark lead as read
// @route   PUT /api/leads/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if user has already read this lead
    const alreadyRead = lead.readBy.some(read => read.userId.toString() === req.user._id.toString());
    
    if (!alreadyRead) {
      lead.readBy.push({
        userId: req.user._id,
        readAt: new Date()
      });
      await lead.save();
    }

    res.json({
      success: true,
      message: 'Lead marked as read'
    });
  } catch (error) {
    console.error('Mark lead as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get unread leads count for user
// @route   GET /api/leads/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const unreadCount = await Lead.countDocuments({
      isActive: true,
      assignedToId: req.user._id,
      readBy: { $not: { $elemMatch: { userId: req.user._id } } }
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Serve uploaded documents
// @route   GET /api/leads/documents/:filename
// @access  Private
router.get('/documents/:filename', protect, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Get file extension to determine content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.xls':
        contentType = 'application/vnd.ms-excel';
        break;
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Serve document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
