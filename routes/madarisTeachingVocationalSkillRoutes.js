const express = require('express');
const router = express.Router();
const {
  getAllVocationalSkills,
  getVocationalSkillById,
  addVocationalSkill,
  updateVocationalSkill,
  deleteVocationalSkill
} = require('../controllers/madarisTeachingVocationalSkillController');

// @desc    Get all vocational skills for a madrasa
// @route   GET /api/madaris/teaching-vocational-skills/:madaris_id
router.get('/get-teaching-vocational-skills/:madaris_id', getAllVocationalSkills);

// @desc    Get single vocational skill by ID
// @route   GET /api/madaris/teaching-vocational-skills/skill/:id
router.get('/get-teaching-vocational-skills/skill/:id', getVocationalSkillById);

// @desc    Add a new vocational skill
// @route   POST /api/madaris/teaching-vocational-skills
router.post('/add-teaching-vocational-skills', addVocationalSkill);

// @desc    Update a vocational skill
// @route   PUT /api/madaris/teaching-vocational-skills/:id
router.put('/update-teaching-vocational-skills/:id', updateVocationalSkill);

// @desc    Delete a vocational skill (soft delete)
// @route   DELETE /api/madaris/teaching-vocational-skills/:id
router.delete('/delete-teaching-vocational-skills/:id', deleteVocationalSkill);

module.exports = router;
