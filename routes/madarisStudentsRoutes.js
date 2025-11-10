const express = require('express');
const router = express.Router();
const {
  getAllMadarisStudents,
  getMadarisStudentById,
  addMadarisStudent,
  updateMadarisStudent,
  deleteMadarisStudent
} = require('../controllers/madarisStudentsController');

// Public routes
router.get('/get-all-madaris-students/:madaris_id', getAllMadarisStudents);
router.get('/get-single-madaris-student/:id', getMadarisStudentById);

// Protected routes (add authentication middleware if needed)
router.post('/add-madaris-student', addMadarisStudent);
router.put('/update-madaris-student/:id', updateMadarisStudent);
router.delete('/delete-madaris-student/:id', deleteMadarisStudent);

module.exports = router;
