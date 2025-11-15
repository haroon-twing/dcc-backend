const express = require('express');
const router = express.Router();
const {
  getAllNGOSuspeciousTransactions,
  getNGOSuspeciousTransaction,
  addNGOSuspeciousTransaction,
  updateNGOSuspeciousTransaction,
  deleteNGOSuspeciousTransaction
} = require('../controllers/ngoSuspeciousTransactionController');

// @route   GET /api/ngo/get-ngo-suspecious-transactions/:ngo_id
// @desc    Get all NGOSuspeciousTransaction records by NGO ID
// @access  Public
router.get('/get-ngo-suspecious-transactions/:ngo_id', getAllNGOSuspeciousTransactions);

// @route   GET /api/ngo/get-single-ngo-suspecious-transaction/:id
// @desc    Get single NGOSuspeciousTransaction record
// @access  Public
router.get('/get-single-ngo-suspecious-transaction/:id', getNGOSuspeciousTransaction);

// @route   POST /api/ngo/add-ngo-suspecious-transaction
// @desc    Add new NGOSuspeciousTransaction record
// @access  Private
router.post('/add-ngo-suspecious-transaction', addNGOSuspeciousTransaction);

// @route   PUT /api/ngo/update-ngo-suspecious-transaction/:id
// @desc    Update NGOSuspeciousTransaction record
// @access  Private
router.put('/update-ngo-suspecious-transaction/:id', updateNGOSuspeciousTransaction);

// @route   DELETE /api/ngo/delete-ngo-suspecious-transaction/:id
// @desc    Delete NGOSuspeciousTransaction record (soft delete)
// @access  Private
router.delete('/delete-ngo-suspecious-transaction/:id', deleteNGOSuspeciousTransaction);

module.exports = router;
