const express = require('express');
const router = express.Router();
const {
  getIllegalActions,
  getIllegalActionById,
  createIllegalAction,
  updateIllegalAction,
  deleteIllegalAction
} = require('../controllers/madarisIllegalActionController');

// @route   GET /api/madaris/get-illegal-actions/:madaris_id
// @desc    Get all illegal actions for a specific madrasa
router.get('/get-illegal-actions/:madaris_id', getIllegalActions);

// @route   GET /api/madaris/get-single-illegal-action/:id
// @desc    Get single illegal action by ID
router.get('/get-single-illegal-action/:id', getIllegalActionById);

// @route   POST /api/madaris/add-illegal-action
// @desc    Add a new illegal action
router.post('/add-illegal-action', createIllegalAction);

// @route   PUT /api/madaris/update-illegal-action/:id
// @desc    Update an illegal action
router.put('/update-illegal-action/:id', updateIllegalAction);

// @route   DELETE /api/madaris/delete-illegal-action/:id
// @desc    Delete an illegal action (soft delete)
router.delete('/delete-illegal-action/:id', deleteIllegalAction);

module.exports = router;
