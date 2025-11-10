const asyncHandler = require('express-async-handler');
const MadarisStudents = require('../models/MadarisStudents');
const mongoose = require('mongoose');

// @desc    Get all students for a specific madrasa
// @route   GET /api/madaris/get-all-madaris-students/:madaris_id
// @access  Public
const getAllMadarisStudents = asyncHandler(async (req, res) => {
  try {
    const { madaris_id } = req.params;
    
    if (!madaris_id) {
      return res.status(400).json({
        success: false,
        message: 'Madrasa ID is required'
      });
    }

    const students = await MadarisStudents.aggregate([
      {
        $match: {
          madaris_id: new mongoose.Types.ObjectId(madaris_id),
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'lu_countries',
          localField: 'origin_country',
          foreignField: '_id',
          as: 'country'
        }
      },
      {
        $unwind: {
          path: '$country',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          total_foreign_students: 1,
          total_local_students: 1,
          remarks: 1,
          origin_country: {
            _id: '$country._id',
            name: '$country.name',
            code: '$country.code'
          },
          createdAt: 1,
          updatedAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Error fetching madrasa students:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching madrasa students',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get single student by ID
// @route   GET /api/madaris/get-single-madaris-student/:id
// @access  Public
const getMadarisStudentById = asyncHandler(async (req, res) => {
  try {
    const student = await MadarisStudents.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'lu_countries',
          localField: 'origin_country',
          foreignField: '_id',
          as: 'country'
        }
      },
      {
        $unwind: {
          path: '$country',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          total_foreign_students: 1,
          total_local_students: 1,
          remarks: 1,
          madaris_id: 1,
          origin_country: {
            _id: '$country._id',
            name: '$country.name',
            code: '$country.code'
          },
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    if (student.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student[0]
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Add a new student
// @route   POST /api/madaris/add-madaris-student
// @access  Private
const addMadarisStudent = asyncHandler(async (req, res) => {
  try {
    const {
      total_foreign_students,
      total_local_students,
      origin_country,
      remarks,
      madaris_id
    } = req.body;

    // Validate required fields
    if (!total_foreign_students || !total_local_students || !origin_country || !madaris_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if the student record already exists for this madrasa and country
    const existingStudent = await MadarisStudents.findOne({
      madaris_id,
      origin_country,
      isActive: true
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student record already exists for this madrasa and country'
      });
    }

    const student = new MadarisStudents({
      total_foreign_students: parseInt(total_foreign_students, 10) || 0,
      total_local_students: parseInt(total_local_students, 10) || 0,
      origin_country,
      remarks,
      madaris_id,
      isActive: true
    });

    const createdStudent = await student.save();

    // Get the created student with populated country data
    const result = await MadarisStudents.aggregate([
      {
        $match: { _id: createdStudent._id }
      },
      {
        $lookup: {
          from: 'lu_countries',
          localField: 'origin_country',
          foreignField: '_id',
          as: 'country'
        }
      },
      {
        $unwind: {
          path: '$country',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          total_foreign_students: 1,
          total_local_students: 1,
          remarks: 1,
          madaris_id: 1,
          origin_country: {
            _id: '$country._id',
            name: '$country.name',
            code: '$country.code'
          },
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding student',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update a student
// @route   PUT /api/madaris/update-madaris-student/:id
// @access  Private
const updateMadarisStudent = asyncHandler(async (req, res) => {
  try {
    const student = await MadarisStudents.findById(req.params.id);

    if (!student || !student.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update fields
    const updatableFields = [
      'total_foreign_students',
      'total_local_students',
      'origin_country',
      'remarks'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'total_foreign_students' || field === 'total_local_students') {
          student[field] = parseInt(req.body[field], 10) || 0;
        } else {
          student[field] = req.body[field];
        }
      }
    });

    // Check for duplicate record if origin_country is being updated
    if (req.body.origin_country) {
      const existingStudent = await MadarisStudents.findOne({
        madaris_id: student.madaris_id,
        origin_country: req.body.origin_country,
        _id: { $ne: student._id },
        isActive: true
      });

      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Another student record already exists for this madrasa and country'
        });
      }
    }

    const updatedStudent = await student.save();

    // Get the updated student with populated country data
    const result = await MadarisStudents.aggregate([
      {
        $match: { _id: updatedStudent._id }
      },
      {
        $lookup: {
          from: 'lu_countries',
          localField: 'origin_country',
          foreignField: '_id',
          as: 'country'
        }
      },
      {
        $unwind: {
          path: '$country',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          total_foreign_students: 1,
          total_local_students: 1,
          remarks: 1,
          madaris_id: 1,
          origin_country: {
            _id: '$country._id',
            name: '$country.name',
            code: '$country.code'
          },
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating student',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete a student (soft delete)
// @route   DELETE /api/madaris/delete-madaris-student/:id
// @access  Private
const deleteMadarisStudent = asyncHandler(async (req, res) => {
  try {
    const student = await MadarisStudents.findById(req.params.id);

    if (!student || !student.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Soft delete
    student.isActive = false;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting student',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = {
  getAllMadarisStudents,
  getMadarisStudentById,
  addMadarisStudent,
  updateMadarisStudent,
  deleteMadarisStudent
};
