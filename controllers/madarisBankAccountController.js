const asyncHandler = require('express-async-handler');
const MadarisBankAccount = require('../models/MadarisBankAccount');
const mongoose = require('mongoose');

// @desc    Get all bank accounts for a specific madrasa
// @route   GET /api/madaris/get-bank-accounts/:madaris_id
// @access  Public
const getAllBankAccounts = asyncHandler(async (req, res) => {
  try {
    const { madaris_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(madaris_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid madrasa ID format'
      });
    }

    const accounts = await MadarisBankAccount.aggregate([
      {
        $match: {
          madaris_id: new mongoose.Types.ObjectId(madaris_id),
          is_active: true
        }
      },
      {
        $lookup: {
          from: 'madaris',
          localField: 'madaris_id',
          foreignField: '_id',
          as: 'madrasa'
        }
      },
      { $unwind: '$madrasa' },
      {
        $project: {
          bank_name: 1,
          acc_no: 1,
          acc_title: 1,
          branch_code: 1,
          branch_address: 1,
          remarks: 1,
          'madrasa.name': 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error fetching bank accounts'
    });
  }
});

// @desc    Get single bank account by ID
// @route   GET /api/madaris/get-single-bank-account/:id
// @access  Public
const getBankAccountById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bank account ID format'
      });
    }

    const account = await MadarisBankAccount.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          is_active: true
        }
      },
      {
        $lookup: {
          from: 'madaris',
          localField: 'madaris_id',
          foreignField: '_id',
          as: 'madrasa'
        }
      },
      { $unwind: '$madrasa' },
      {
        $project: {
          bank_name: 1,
          acc_no: 1,
          acc_title: 1,
          branch_code: 1,
          branch_address: 1,
          remarks: 1,
          'madrasa.name': 1,
          'madrasa._id': 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    if (!account || account.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    res.status(200).json({
      success: true,
      data: account[0]
    });
  } catch (error) {
    console.error('Error fetching bank account:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error fetching bank account'
    });
  }
});

// @desc    Add a new bank account
// @route   POST /api/madaris/add-bank-account
// @access  Public
const addBankAccount = asyncHandler(async (req, res) => {
  try {
    const { 
      bank_name, 
      acc_no, 
      acc_title, 
      branch_code, 
      branch_address, 
      remarks, 
      madaris_id 
    } = req.body;

    // Validate required fields
    if (!bank_name || !acc_no || !acc_title || !branch_code || !madaris_id) {
      return res.status(400).json({
        success: false,
        message: 'Bank name, account number, account title, branch code, and madrasa ID are required fields'
      });
    }

    // Check if the bank account already exists for this madrasa
    const existingAccount = await MadarisBankAccount.findOne({
      madaris_id,
      bank_name,
      acc_no,
      is_active: true
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'A bank account with these details already exists for this madrasa'
      });
    }

    const newAccount = await MadarisBankAccount.create({
      bank_name,
      acc_no,
      acc_title,
      branch_code,
      branch_address,
      remarks,
      madaris_id,
      is_active: true
    });

    res.status(201).json({
      success: true,
      message: 'Bank account added successfully',
      data: newAccount
    });
  } catch (error) {
    console.error('Error adding bank account:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error adding bank account'
    });
  }
});

// @desc    Update a bank account
// @route   PUT /api/madaris/update-bank-account/:id
// @access  Public
const updateBankAccount = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      bank_name, 
      acc_no, 
      acc_title, 
      branch_code, 
      branch_address, 
      remarks 
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bank account ID format'
      });
    }

    // Check if account exists and is active
    const existingAccount = await MadarisBankAccount.findOne({
      _id: id,
      is_active: true
    });

    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found or already deleted'
      });
    }

    // Check for duplicate account
    if (bank_name || acc_no) {
      const duplicate = await MadarisBankAccount.findOne({
        _id: { $ne: id },
        madaris_id: existingAccount.madaris_id,
        bank_name: bank_name || existingAccount.bank_name,
        acc_no: acc_no || existingAccount.acc_no,
        is_active: true
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'A bank account with these details already exists for this madrasa'
        });
      }
    }

    // Update only the fields that are provided in the request
    const updateData = {};
    if (bank_name) updateData.bank_name = bank_name;
    if (acc_no) updateData.acc_no = acc_no;
    if (acc_title) updateData.acc_title = acc_title;
    if (branch_code) updateData.branch_code = branch_code;
    if (branch_address !== undefined) updateData.branch_address = branch_address;
    if (remarks !== undefined) updateData.remarks = remarks;

    const updatedAccount = await MadarisBankAccount.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Bank account updated successfully',
      data: updatedAccount
    });
  } catch (error) {
    console.error('Error updating bank account:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error updating bank account'
    });
  }
});

// @desc    Delete a bank account (soft delete)
// @route   DELETE /api/madaris/delete-bank-account/:id
// @access  Public
const deleteBankAccount = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bank account ID format'
      });
    }

    // Check if account exists and is active
    const existingAccount = await MadarisBankAccount.findOne({
      _id: id,
      is_active: true
    });

    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found or already deleted'
      });
    }

    // Soft delete by setting is_active to false
    await MadarisBankAccount.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Bank account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bank account:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error deleting bank account'
    });
  }
});

module.exports = {
  getAllBankAccounts,
  getBankAccountById,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount
};
