const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const MadarisTeacher = require('../models/MadarisTeacher');
const Madaris = require('../models/Madaris');

// @desc    Get all teachers for a specific madrasa
// @route   GET /api/madaris/get-all-madaris-teachers/:madaris_id
// @access  Public
const getAllMadrasaTeachers = asyncHandler(async (req, res) => {
  try {
    const { madaris_id } = req.params;
    
    if (!madaris_id) {
      return res.status(400).json({
        success: false,
        message: 'Madrasa ID is required'
      });
    }
    
    // Build the match query
    const matchQuery = { isActive: true };
    
    // Add madaris_id to match if provided in URL
    if (madaris_id) {
      matchQuery.madaris_id = new mongoose.Types.ObjectId(madaris_id);
    }
    
    const teachers = await MadarisTeacher.aggregate([
      { $match: matchQuery },
      { $sort: { full_name: 1 } },
      {
        $lookup: {
          from: 'madaris',
          localField: 'madaris_id',
          foreignField: '_id',
          as: 'madrasa'
        }
      },
      { $unwind: '$madrasa' },
      {
        $project: {
          _id: 1,
          full_name: 1,
          gender: 1,
          cnic: 1,
          contact_no: 1,
          email: 1,
          qualification: 1,
          designation: 1,
          status: 1,
          isMohtamim: 1,
          dob: 1,
          address: 1,
          joining_date: 1,
          madrasa: {
            _id: '$madrasa._id',
            name: '$madrasa.name'
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    console.error('Error fetching madrasa teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching madrasa teachers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get single madrasa teacher
// @route   GET /api/madaris/get-single-madaris-teacher/:id
// @access  Public
const getMadrasaTeacherById = asyncHandler(async (req, res) => {
  try {
    // Convert string ID to ObjectId
    const { ObjectId } = mongoose.Types;
    const teacherId = new ObjectId(req.params.id);
    
    const teacher = await MadarisTeacher.aggregate([
      { $match: { _id: teacherId, isActive: true } },
      {
        $lookup: {
          from: 'madaris',
          localField: 'madaris_id',
          foreignField: '_id',
          as: 'madrasa'
        }
      },
      { $unwind: '$madrasa' },
      {
        $project: {
          _id: 1,
          full_name: 1,
          gender: 1,
          dob: 1,
          cnic: 1,
          contact_no: 1,
          email: 1,
          qualification: 1,
          designation: 1,
          joining_date: 1,
          address: 1,
          status: 1,
          isMohtamim: 1,
          madrasa: {
            _id: '$madrasa._id',
            name: '$madrasa.name'
          }
        }
      }
    ]);

    if (!teacher || teacher.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.status(200).json({
      success: true,
      data: teacher[0]
    });
  } catch (error) {
    console.error('Error fetching madrasa teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching madrasa teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Add new madrasa teacher
// @route   POST /api/madaris/add-madaris-teacher
// @access  Private
const addMadrasaTeacher = asyncHandler(async (req, res) => {
  try {
    const {
      full_name,
      gender,
      dob,
      cnic,
      contact_no,
      email,
      qualification,
      designation,
      joining_date,
      address,
      madaris_id,
      isMohtamim
    } = req.body;

    // Check if madrasa exists
    const madrasa = await Madaris.findById(madaris_id);
    if (!madrasa) {
      return res.status(400).json({
        success: false,
        message: 'Invalid madrasa ID'
      });
    }
    

    const teacherData = {
      full_name,
      gender,
      dob: new Date(dob),
      cnic,
      contact_no,
      email,
      qualification,
      designation,
      joining_date: new Date(joining_date),
      address,
      madaris_id,
      isMohtamim: isMohtamim !== undefined ? isMohtamim : true, // Ensure boolean
      status: 'active',
      isActive: true
    };
    
    
    const teacher = new MadarisTeacher(teacherData);

    const createdTeacher = await teacher.save();

    res.status(201).json({
      success: true,
      data: createdTeacher
    });
  } catch (error) {
    console.error('Error adding madrasa teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding madrasa teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update madrasa teacher
// @route   PUT /api/madaris/update-madaris-teacher/:id
// @access  Private
const updateMadrasaTeacher = asyncHandler(async (req, res) => {
  try {
    const teacher = await MadarisTeacher.findById(req.params.id);

    if (!teacher || !teacher.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Update fields
    const updatableFields = [
      'full_name', 'gender', 'dob', 'cnic', 'contact_no', 'email',
      'qualification', 'designation', 'joining_date', 'address', 'status', 'isMohtamim'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        teacher[field] = req.body[field];
      }
    });

    const updatedTeacher = await teacher.save();

    res.status(200).json({
      success: true,
      data: updatedTeacher
    });
  } catch (error) {
    console.error('Error updating madrasa teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating madrasa teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete madrasa teacher (soft delete)
// @route   DELETE /api/madaris/delete-madaris-teacher/:id
// @access  Private
const deleteMadrasaTeacher = asyncHandler(async (req, res) => {
  try {
    const teacher = await MadarisTeacher.findById(req.params.id);

    if (!teacher || !teacher.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Soft delete
    teacher.isActive = false;
    await teacher.save();

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting madrasa teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting madrasa teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = {
  getAllMadrasaTeachers,
  getMadrasaTeacherById,
  addMadrasaTeacher,
  updateMadrasaTeacher,
  deleteMadrasaTeacher
};
