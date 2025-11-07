const express = require('express');
const router = express.Router();
const {
  addMadrassa,
  getAllMadaris,
  getMadrassaById,
  updateMadrassa,
  deleteMadrassa
} = require('../controllers/madarisController');

// Public routes
router.get('/get-all-madaris', getAllMadaris);
router.get('/view-single-madaris/:id', getMadrassaById);

// Protected routes (add authentication middleware if needed)
router.post('/add-madaris', addMadrassa);
router.put('/update-madaris/:id', updateMadrassa);
router.delete('/delete-madaris/:id', deleteMadrassa);

module.exports = router;
