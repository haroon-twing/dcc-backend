const asyncHandler = require('express-async-handler');
const MadarisTeachingVocationalSkill = require('../models/MadarisTeachingVocationalSkill');
const mongoose = require('mongoose');

// @desc    Get all vocational skills for a specific madrasa
// @route   GET /api/madaris/get-teaching-vocational-skills/:madaris_id
// @access  Public
const getAllVocationalSkills = asyncHandler(async (req, res) => {
  try {
    const { madaris_id } = req.params;
    
    if (!madaris_id) {
      return res.status(400).json({
        success: false,
        message: 'Madrasa ID is required'
      });
    }

    const skills = await MadarisTeachingVocationalSkill.aggregate([
      {
        $match: {
          madaris_id: new mongoose.Types.ObjectId(madaris_id),
          is_active: true
        }
      },
      {
        $lookup: {
          from: 'madaris',
          localField: 'madaris_id',
          foreignField: '_id',
          as: 'madrasa'
        }
      },
      {
        $unwind: {
          path: '$madrasa',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          voc_skill_offered: 1,
          age_group_offered: 1,
          remarks: 1,
          madrasa: {
            _id: '$madrasa._id',
            name: '$madrasa.name'
          },
          created_at: 1,
          updated_at: 1
        }
      },
      {
        $sort: { created_at: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (error) {
    console.error('Error fetching vocational skills:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vocational skills',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get single vocational skill by ID
// @route   GET /api/madaris/get-teaching-vocational-skills/skill/:id
// @access  Public
const getVocationalSkillById = asyncHandler(async (req, res) => {
  try {
    const skill = await MadarisTeachingVocationalSkill.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
          is_active: true
        }
      },
      {
        $lookup: {
          from: 'madaris',
          localField: 'madaris_id',
          foreignField: '_id',
          as: 'madrasa'
        }
      },
      {
        $unwind: {
          path: '$madrasa',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          voc_skill_offered: 1,
          age_group_offered: 1,
          remarks: 1,
          madrasa: {
            _id: '$madrasa._id',
            name: '$madrasa.name'
          },
          created_at: 1,
          updated_at: 1
        }
      }
    ]);

    if (!skill || skill.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vocational skill not found or inactive'
      });
    }

    res.status(200).json({
      success: true,
      data: skill[0]
    });
  } catch (error) {
    console.error('Error fetching vocational skill:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vocational skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Add a new vocational skill
// @route   POST /api/madaris/add-teaching-vocational-skills
// @access  Public
const addVocationalSkill = asyncHandler(async (req, res) => {
  try {
    const {
      madaris_id,
      voc_skill_offered,
      age_group_offered,
      remarks
    } = req.body;

    // Basic validation
    if (!madaris_id || !voc_skill_offered || !age_group_offered) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    // Check if vocational skill already exists for this madrasa
    const existingSkill = await MadarisTeachingVocationalSkill.findOne({
      madaris_id,
      voc_skill_offered,
      is_active: true
    });

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'This vocational skill already exists for this madrasa'
      });
    }

    const newSkill = new MadarisTeachingVocationalSkill({
      madaris_id,
      voc_skill_offered,
      age_group_offered,
      remarks,
      created_by: req.user ? req.user.id : null,
      is_active: true
    });

    const savedSkill = await newSkill.save();

    res.status(201).json({
      success: true,
      message: 'Vocational skill added successfully',
      data: savedSkill
    });
  } catch (error) {
    console.error('Error adding vocational skill:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding vocational skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update a vocational skill
// @route   PUT /api/madaris/update-teaching-vocational-skills/:id
// @access  Public
const updateVocationalSkill = asyncHandler(async (req, res) => {
  try {
    const skill = await MadarisTeachingVocationalSkill.findById(req.params.id);

    if (!skill || !skill.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Vocational skill not found or inactive'
      });
    }

    const {
      voc_skill_offered,
      age_group_offered,
      remarks,
      is_active
    } = req.body;

    // Check if vocational skill is being updated and already exists
    if (voc_skill_offered && voc_skill_offered !== skill.voc_skill_offered) {
      const existingSkill = await MadarisTeachingVocationalSkill.findOne({
        madaris_id: skill.madaris_id,
        voc_skill_offered,
        is_active: true
      });

      if (existingSkill) {
        return res.status(400).json({
          success: false,
          message: 'This vocational skill already exists for this madrasa'
        });
      }
    }

    // Update fields
    skill.voc_skill_offered = voc_skill_offered || skill.voc_skill_offered;
    skill.age_group_offered = age_group_offered || skill.age_group_offered;
    skill.remarks = remarks !== undefined ? remarks : skill.remarks;
    skill.is_active = is_active !== undefined ? is_active : skill.is_active;
    skill.updated_by = req.user ? req.user.id : null;

    const updatedSkill = await skill.save();

    res.status(200).json({
      success: true,
      message: 'Vocational skill updated successfully',
      data: updatedSkill
    });
  } catch (error) {
    console.error('Error updating vocational skill:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating vocational skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete a vocational skill (soft delete)
// @route   DELETE /api/madaris/delete-teaching-vocational-skills/:id
// @access  Public
const deleteVocationalSkill = asyncHandler(async (req, res) => {
  try {
    const skill = await MadarisTeachingVocationalSkill.findById(req.params.id);

    if (!skill || !skill.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Vocational skill not found or already deleted'
      });
    }

    // Soft delete by setting is_active to false
    skill.is_active = false;
    skill.updated_by = req.user ? req.user.id : null;
    await skill.save();

    res.status(200).json({
      success: true,
      message: 'Vocational skill deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vocational skill:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting vocational skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = {
  getAllVocationalSkills,
  getVocationalSkillById,
  addVocationalSkill,
  updateVocationalSkill,
  deleteVocationalSkill
};
