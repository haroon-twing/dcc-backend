const express = require('express');
const router = express.Router();
const {
  getAllBankAccounts,
  getBankAccountById,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount
} = require('../controllers/madarisBankAccountController');

// @route   GET /api/madaris/get-bank-accounts/:madaris_id
// @desc    Get all bank accounts for a specific madrasa
router.get('/get-bank-accounts/:madaris_id', getAllBankAccounts);

// @route   GET /api/madaris/get-single-bank-account/:id
// @desc    Get single bank account by ID
router.get('/get-single-bank-account/:id', getBankAccountById);

// @route   POST /api/madaris/add-bank-account
// @desc    Add a new bank account
router.post('/add-bank-account', addBankAccount);

// @route   PUT /api/madaris/update-bank-account/:id
// @desc    Update a bank account
router.put('/update-bank-account/:id', updateBankAccount);

// @route   DELETE /api/madaris/delete-bank-account/:id
// @desc    Delete a bank account (soft delete)
router.delete('/delete-bank-account/:id', deleteBankAccount);

module.exports = router;
