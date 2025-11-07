const express = require('express');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/assigned', protect, async (req, res) => {
  try {
    const leads = await Lead.find({ 
      assignedToId: req.user._id,
      isActive: true 
    })
      .populate('assignedToId', 'name email')
      .populate('createdById', 'name email')
      .populate('departmentId', 'name')
      .populate('sectionId', 'name')
      .populate('programId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
