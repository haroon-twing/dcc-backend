const asyncHandler = require('express-async-handler');
const NGOSuspeciousTransaction = require('../models/NGOSuspeciousTransaction');
const mongoose = require('mongoose');

// @desc    Get all NGOSuspeciousTransaction records by NGO ID
// @route   GET /api/ngo/get-ngo-suspecious-transactions/:ngo_id
// @access  Public
const getAllNGOSuspeciousTransactions = asyncHandler(async (req, res) => {
  try {
    const { ngo_id } = req.params;

    const records = await NGOSuspeciousTransaction.find({ is_active: true, ngo_id })
      .populate('ngo_id', 'ngo_name')
      .populate('created_by', 'name')
      .populate('updated_by', 'name')
      .sort({ transaction_date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Get single NGOSuspeciousTransaction record
// @route   GET /api/ngo/get-single-ngo-suspecious-transaction/:id
// @access  Public
const getNGOSuspeciousTransaction = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await NGOSuspeciousTransaction.findOne({ _id: id, is_active: true })
      .populate('ngo_id', 'ngo_name')
      .populate('created_by', 'name')
      .populate('updated_by', 'name');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or has been deleted'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Add new NGOSuspeciousTransaction record
// @route   POST /api/ngo/add-ngo-suspecious-transaction
// @access  Private
const addNGOSuspeciousTransaction = asyncHandler(async (req, res) => {
  try {
    const {
      source_of_reported_transaction,
      nature_susp_trans,
      action_taken,
      remarks = '',
      ngo_id,
      transaction_date,
      amount,
      currency = 'PKR',
      status = 'Reported'
    } = req.body;

    // Validate required fields
    if (!source_of_reported_transaction || !nature_susp_trans || !action_taken || !ngo_id || !transaction_date || !amount) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(ngo_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid NGO ID format'
      });
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    // Validate currency
    if (typeof currency !== 'string' || currency.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Currency is required'
      });
    }

    // Create new record
    const newRecord = new NGOSuspeciousTransaction({
      source_of_reported_transaction,
      nature_susp_trans,
      action_taken,
      remarks,
      ngo_id,
      transaction_date,
      amount,
      currency,
      status,
      created_by: req.user?._id
    });

    const createdRecord = await newRecord.save();

    // Populate the created record
    const populatedRecord = await NGOSuspeciousTransaction.findById(createdRecord._id)
      .populate('ngo_id', 'ngo_name')
      .populate('created_by', 'name');

    res.status(201).json({
      success: true,
      message: 'NGO suspicious transaction record created successfully',
      data: populatedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating NGO suspicious transaction record',
      error: error.message
    });
  }
});

// @desc    Update NGOSuspeciousTransaction record
// @route   PUT /api/ngo/update-ngo-suspecious-transaction/:id
// @access  Private
const updateNGOSuspeciousTransaction = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      source_of_reported_transaction,
      nature_susp_trans,
      action_taken,
      remarks,
      ngo_id,
      transaction_date,
      amount,
      currency,
      status
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    // Find the record
    const record = await NGOSuspeciousTransaction.findOne({ _id: id, is_active: true });
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or has been deleted'
      });
    }

    // Update fields if provided
    if (source_of_reported_transaction !== undefined) record.source_of_reported_transaction = source_of_reported_transaction;
    if (nature_susp_trans !== undefined) record.nature_susp_trans = nature_susp_trans;
    if (action_taken !== undefined) record.action_taken = action_taken;
    if (remarks !== undefined) record.remarks = remarks;
    if (transaction_date !== undefined) record.transaction_date = transaction_date;
    
    // Validate ngo_id if provided
    if (ngo_id !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(ngo_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid NGO ID format'
        });
      }
      record.ngo_id = ngo_id;
    }

    // Validate amount if provided
    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number'
        });
      }
      record.amount = amount;
    }

    // Validate currency if provided
    if (currency !== undefined) {
      if (typeof currency !== 'string' || currency.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Currency is required'
        });
      }
      record.currency = currency;
    }

    // Update status if provided
    if (status !== undefined) {
      record.status = status;
    }

    // Update the updated_by field if user is authenticated
    if (req.user) {
      record.updated_by = req.user._id;
    }

    const updatedRecord = await record.save();

    // Populate the updated record
    const populatedRecord = await NGOSuspeciousTransaction.findById(updatedRecord._id)
      .populate('ngo_id', 'ngo_name')
      .populate('updated_by', 'name')
      .populate('created_by', 'name');

    res.status(200).json({
      success: true,
      message: 'NGO suspicious transaction record updated successfully',
      data: populatedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating NGO suspicious transaction record',
      error: error.message
    });
  }
});

// @desc    Delete NGOSuspeciousTransaction record (soft delete)
// @route   DELETE /api/ngo/delete-ngo-suspecious-transaction/:id
// @access  Private
const deleteNGOSuspeciousTransaction = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await NGOSuspeciousTransaction.findOne({ _id: id, is_active: true });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or already deleted'
      });
    }

    // Soft delete by setting is_active to false
    record.is_active = false;
    
    // Set updated_by if user is authenticated
    if (req.user) {
      record.updated_by = req.user._id;
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: 'NGO suspicious transaction record deleted successfully',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting NGO suspicious transaction record',
      error: error.message
    });
  }
});

module.exports = {
  getAllNGOSuspeciousTransactions,
  getNGOSuspeciousTransaction,
  addNGOSuspeciousTransaction,
  updateNGOSuspeciousTransaction,
  deleteNGOSuspeciousTransaction
};
