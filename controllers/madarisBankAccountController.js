const MadarisBankAccount = require('../models/MadarisBankAccount');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// @desc    Add a new madrassa bank account

// @route   POST /api/madaris/add-madaris-bank-account
// @access  Private
const addMadrassaBankAccount = [
  body('madrassaId', 'Valid Madrassa ID is required').isMongoId(),
  body('bankName', 'Bank name is required').notEmpty(),
  body('accountNumber', 'Account number is required').notEmpty(),
  body('accountTitle', 'Account title is required').notEmpty(),
  
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const bankAccount = new MadarisBankAccount({
      ...req.body,
      createdBy: req.user.id
    });

    const createdAccount = await bankAccount.save();
    
    res.status(201).json({
      success: true,
      message: 'Bank account added successfully',
      data: await createdAccount.populate('madrassa', 'name')
    });
  })
];

// @desc    Get all bank accounts for a madrassa
// @route   GET /api/madaris/get-all-madaris-bank-accounts/:madrassaId
// @access  Private
const getAllMadrassaBankAccounts = asyncHandler(async (req, res) => {
  const { madrassaId } = req.params;
  
  const accounts = await MadarisBankAccount.find({ madrassaId })
    .populate('madrassa', 'name')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: accounts.length,
    data: accounts
  });
});

// @desc    Get single madrassa bank account
// @route   GET /api/madaris/get-single-madaris-bank-account/:id
// @access  Private
const getSingleMadrassaBankAccount = asyncHandler(async (req, res) => {
  const account = await MadarisBankAccount.findById(req.params.id)
    .populate('madrassa', 'name')
    .populate('createdBy', 'name email');

  if (!account) {
    return res.status(404).json({
      success: false,
      message: 'Bank account not found'
    });
  }

  res.json({
    success: true,
    data: account
  });
});

// @desc    Update madrassa bank account
// @route   PUT /api/madaris/update-madaris-bank-account/:id
// @access  Private
const updateMadrassaBankAccount = [
  body('bankName', 'Bank name cannot be empty').optional().notEmpty(),
  body('accountNumber', 'Account number cannot be empty').optional().notEmpty(),
  body('accountTitle', 'Account title cannot be empty').optional().notEmpty(),
  
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const account = await MadarisBankAccount.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        account[key] = req.body[key];
      }
    });
    
    account.updatedBy = req.user.id;
    const updatedAccount = await account.save();

    res.json({
      success: true,
      message: 'Bank account updated successfully',
      data: await updatedAccount.populate('madrassa', 'name')
    });
  })
];

// @desc    Delete madrassa bank account
// @route   DELETE /api/madaris/delete-madaris-bank-account/:id
// @access  Private
const deleteMadrassaBankAccount = asyncHandler(async (req, res) => {
  const account = await MadarisBankAccount.findById(req.params.id);

  if (!account) {
    return res.status(404).json({
      success: false,
      message: 'Bank account not found'
    });
  }

  await account.deleteOne();

  res.json({
    success: true,
    message: 'Bank account deleted successfully'
  });
});

module.exports = {
  addMadrassaBankAccount,
  getSingleMadrassaBankAccount,
  getAllMadrassaBankAccounts,
  updateMadrassaBankAccount,
  deleteMadrassaBankAccount
};
