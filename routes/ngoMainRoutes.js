const express = require('express');
const router = express.Router();
const {
  getAllNGOMain,
  getNGOById,
  addNGO,
  updateNGO,
  deleteNGO
} = require('../controllers/ngoMainController');

router.get('/get-all-ngo-main', getAllNGOMain);
router.get('/get-single-ngo-main/:id', getNGOById);
router.post('/add-ngo-main', addNGO);
router.put('/update-ngo-main/:id', updateNGO);
router.delete('/delete-ngo-main/:id', deleteNGO);

module.exports = router;
