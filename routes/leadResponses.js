const express = require('express');
const LeadResponse = require('../models/LeadResponse');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { protect, checkPermission } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all responses for a lead
// @route   GET /api/leads/:leadId/responses
// @access  Private
router.get('/:leadId/responses', protect, async (req, res) => {
  try {
    const { leadId } = req.params;
    
    // Check if lead exists and user has access
    const lead = await Lead.findById(leadId)
      .populate('assignedUsers.userId', 'name email')
      .populate('createdById', 'name email');
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if user is authorized to view responses
    const isCreator = lead.createdById._id.toString() === req.user._id.toString();
    const isAssigned = lead.assignedUsers.some(assignment => 
      assignment.userId._id.toString() === req.user._id.toString()
    );
    const isAssignedTo = lead.assignedToId && lead.assignedToId.toString() === req.user._id.toString();

    if (!isCreator && !isAssigned && !isAssignedTo) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view responses for this lead'
      });
    }

    // Get responses with user details
    const responses = await LeadResponse.find({ leadId })
      .populate('userId', 'name email roleId')
      .populate('targetUserId', 'name email')
      .populate('userId.roleId', 'name')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: responses.length,
      data: responses
    });
  } catch (error) {
    console.error('Get lead responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create a new response for a lead
// @route   POST /api/leads/:leadId/responses
// @access  Private
router.post('/:leadId/responses', protect, async (req, res) => {
  try {
    const { leadId } = req.params;
    const { message, targetUserId, isInternal = false } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Check if lead exists and user has access
    const lead = await Lead.findById(leadId)
      .populate('assignedUsers.userId', 'name email')
      .populate('createdById', 'name email');
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if user is authorized to respond
    const isCreator = lead.createdById._id.toString() === req.user._id.toString();
    const isAssigned = lead.assignedUsers.some(assignment => 
      assignment.userId._id.toString() === req.user._id.toString()
    );
    const isAssignedTo = lead.assignedToId && lead.assignedToId.toString() === req.user._id.toString();

    if (!isCreator && !isAssigned && !isAssignedTo) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to respond to this lead'
      });
    }

    // Validate target user if provided
    if (targetUserId) {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(400).json({
          success: false,
          message: 'Target user not found'
        });
      }
    }

    // Create the response
    const response = await LeadResponse.create({
      leadId,
      userId: req.user._id,
      targetUserId: targetUserId || null,
      message: message.trim(),
      isInternal
    });

    // Populate the response with user details
    await response.populate([
      { path: 'userId', select: 'name email roleId' },
      { path: 'targetUserId', select: 'name email' },
      { path: 'userId.roleId', select: 'name' }
    ]);

    // Update lead's updatedAt timestamp
    lead.updatedAt = new Date();
    await lead.save();

    res.status(201).json({
      success: true,
      message: 'Response created successfully',
      data: response
    });
  } catch (error) {
    console.error('Create lead response error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Mark response as read
// @route   PUT /api/leads/:leadId/responses/:responseId/read
// @access  Private
router.put('/:leadId/responses/:responseId/read', protect, async (req, res) => {
  try {
    const { leadId, responseId } = req.params;

    const response = await LeadResponse.findById(responseId);
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Check if response belongs to the lead
    if (response.leadId.toString() !== leadId) {
      return res.status(400).json({
        success: false,
        message: 'Response does not belong to this lead'
      });
    }

    // Mark as read by the appropriate user
    const isCreator = response.userId.toString() === req.user._id.toString();
    const isTarget = response.targetUserId && response.targetUserId.toString() === req.user._id.toString();

    if (isCreator) {
      response.isReadByCreator = true;
      response.readByCreatorAt = new Date();
    } else if (isTarget) {
      response.isReadByTarget = true;
      response.readByTargetAt = new Date();
    } else {
      // For other users, we can track read status differently if needed
      // For now, we'll just mark it as read by creator if no specific target
      if (!response.targetUserId) {
        response.isReadByCreator = true;
        response.readByCreatorAt = new Date();
      }
    }

    await response.save();

    res.json({
      success: true,
      message: 'Response marked as read'
    });
  } catch (error) {
    console.error('Mark response as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get assigned leads for a user
// @route   GET /api/leads/assigned
// @access  Private
router.get('/assigned', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get leads where user is assigned (either in assignedToId or assignedUsers)
    const leads = await Lead.find({
      isActive: true,
      $or: [
        { assignedToId: userId },
        { 'assignedUsers.userId': userId }
      ]
    })
      .populate('assignedToId', 'name email')
      .populate('assignedUsers.userId', 'name email')
      .populate('createdById', 'name email')
      .populate('departmentId', 'name')
      .populate('sectionId', 'name')
      .populate('programId', 'name')
      .populate('readBy.userId', 'name email')
      .sort({ updatedAt: -1 });

    // Add read status and unread response count for each lead
    const leadsWithStatus = await Promise.all(leads.map(async (lead) => {
      const leadObj = lead.toObject();
      
      // Check if lead is read
      const isRead = lead.readBy.some(read => read.userId._id.toString() === userId.toString());
      leadObj.isRead = isRead;

      // Count unread responses
      const unreadResponses = await LeadResponse.countDocuments({
        leadId: lead._id,
        $or: [
          { userId: { $ne: userId }, isReadByCreator: false },
          { targetUserId: userId, isReadByTarget: false }
        ]
      });
      leadObj.unreadResponses = unreadResponses;

      return leadObj;
    }));

    res.json({
      success: true,
      count: leadsWithStatus.length,
      data: leadsWithStatus
    });
  } catch (error) {
    console.error('Get assigned leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Assign users to a lead
// @route   POST /api/leads/:leadId/assign
// @access  Private
router.post('/:leadId/assign', protect, checkPermission('leads', 'update'), async (req, res) => {
  try {
    const { leadId } = req.params;
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Validate all users exist
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more users not found'
      });
    }

    // Add new assignments (avoid duplicates)
    const existingUserIds = lead.assignedUsers.map(assignment => assignment.userId.toString());
    const newAssignments = userIds
      .filter(userId => !existingUserIds.includes(userId.toString()))
      .map(userId => ({
        userId,
        assignedBy: req.user._id,
        assignedAt: new Date()
      }));

    lead.assignedUsers.push(...newAssignments);
    await lead.save();

    // Populate the updated lead
    await lead.populate([
      { path: 'assignedUsers.userId', select: 'name email' },
      { path: 'assignedUsers.assignedBy', select: 'name email' },
      { path: 'assignedToId', select: 'name email' },
      { path: 'createdById', select: 'name email' },
      { path: 'departmentId', select: 'name' },
      { path: 'sectionId', select: 'name' },
      { path: 'programId', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Users assigned to lead successfully',
      data: lead
    });
  } catch (error) {
    console.error('Assign users to lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Remove user assignment from a lead
// @route   DELETE /api/leads/:leadId/assign/:userId
// @access  Private
router.delete('/:leadId/assign/:userId', protect, checkPermission('leads', 'update'), async (req, res) => {
  try {
    const { leadId, userId } = req.params;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Remove the assignment
    lead.assignedUsers = lead.assignedUsers.filter(
      assignment => assignment.userId.toString() !== userId
    );
    await lead.save();

    // Populate the updated lead
    await lead.populate([
      { path: 'assignedUsers.userId', select: 'name email' },
      { path: 'assignedUsers.assignedBy', select: 'name email' },
      { path: 'assignedToId', select: 'name email' },
      { path: 'createdById', select: 'name email' },
      { path: 'departmentId', select: 'name' },
      { path: 'sectionId', select: 'name' },
      { path: 'programId', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'User assignment removed successfully',
      data: lead
    });
  } catch (error) {
    console.error('Remove user assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Mark multiple responses as read
// @route   PUT /api/leads/:leadId/responses/read-all
// @access  Private
router.put('/:leadId/responses/read-all', protect, async (req, res) => {
  try {
    const { leadId } = req.params;
    const { responseIds } = req.body;
    
    if (!responseIds || !Array.isArray(responseIds) || responseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response IDs array is required'
      });
    }

    // Check if lead exists and user has access
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if user is authorized to mark responses as read
    const isCreator = lead.createdById.toString() === req.user._id.toString();
    const isAssigned = lead.assignedUsers.some(assignment => 
      assignment.userId.toString() === req.user._id.toString()
    );
    const isAssignedTo = lead.assignedToId && lead.assignedToId.toString() === req.user._id.toString();

    if (!isCreator && !isAssigned && !isAssignedTo) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to mark responses as read for this lead'
      });
    }

    // Update responses based on user role
    const updatePromises = responseIds.map(responseId => {
      const isCreator = lead.createdById.toString() === req.user._id.toString();
      const isAssigned = lead.assignedUsers.some(assignment => 
        assignment.userId.toString() === req.user._id.toString()
      );
      const isAssignedTo = lead.assignedToId && lead.assignedToId.toString() === req.user._id.toString();

      let updateFields = {};
      if (isCreator) {
        updateFields.isReadByCreator = true;
      }
      if (isAssigned || isAssignedTo) {
        updateFields.isReadByTarget = true;
      }

      return LeadResponse.findByIdAndUpdate(
        responseId,
        { $set: updateFields },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Responses marked as read successfully',
      data: { count: responseIds.length }
    });
  } catch (error) {
    console.error('Error marking responses as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
