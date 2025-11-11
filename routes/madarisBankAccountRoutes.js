const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addMadrassaBankAccount,
  getSingleMadrassaBankAccount,
  getAllMadrassaBankAccounts,
  updateMadrassaBankAccount,
  deleteMadrassaBankAccount
} = require('../controllers/madarisBankAccountController');

// Apply auth middleware to all routes
router.use(protect);

// @route   POST /add-madaris-bank-account
router.post('/add-madaris-bank-account', addMadrassaBankAccount);

// @route   GET /get-single-madaris-bank-account/:id
router.get('/get-single-madaris-bank-account/:id', getSingleMadrassaBankAccount);

// @route   GET /get-all-madaris-bank-accounts/:madrassaId
router.get('/get-all-madaris-bank-accounts/:madrassaId', getAllMadrassaBankAccounts);

// @route   PUT /update-madaris-bank-account/:id
router.put('/update-madaris-bank-account/:id', updateMadrassaBankAccount);

// @route   DELETE /delete-madaris-bank-account/:id
router.delete('/delete-madaris-bank-account/:id', deleteMadrassaBankAccount);

module.exports = router;
