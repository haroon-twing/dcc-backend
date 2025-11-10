const express = require('express');
const router = express.Router();
const {
  getAllMadrasaTeachers,
  getMadrasaTeacherById,
  addMadrasaTeacher,
  updateMadrasaTeacher,
  deleteMadrasaTeacher
} = require('../controllers/madarisTeacherController');

// Public routes
router.get('/get-all-madaris-teachers/:madaris_id', getAllMadrasaTeachers);
router.get('/get-single-madaris-teacher/:id', getMadrasaTeacherById);

// Protected routes (add authentication middleware if needed)
router.post('/add-madaris-teacher', addMadrasaTeacher);
router.put('/update-madaris-teacher/:id', updateMadrasaTeacher);
router.delete('/delete-madaris-teacher/:id', deleteMadrasaTeacher);

module.exports = router;
