const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const SafecityMeasuresTaken = require('../models/SafecityMeasuresTaken');
const SafecityMain = require('../models/SafecityMain');

// @desc    Get all measures taken for a specific safecity main record
// @route   GET /api/safecity/get-all-safecity-measures-taken/:sc_id
// @access  Public
const getAllSafecityMeasuresTaken = asyncHandler(async (req, res) => {
  try {
    const { sc_id } = req.params;

    if (!sc_id) {
      return res.status(400).json({
        success: false,
        message: 'SafecityMain ID (sc_id) is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(sc_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sc_id format'
      });
    }

    const measures = await SafecityMeasuresTaken.aggregate([
      {
        $match: {
          sc_id: new mongoose.Types.ObjectId(sc_id),
          is_active: true
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $project: {
          _id: 1,
          measure_taken: 1,
          measure_taken_authority: 1,
          details: 1,
          remarks: 1,
          sc_id: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: measures.length,
      data: measures
    });
  } catch (error) {
    console.error('Error fetching safecity measures taken:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching safecity measures taken',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get single measure taken by ID
// @route   GET /api/safecity/get-single-safecity-measure-taken/:id
// @access  Public
const getSafecityMeasureTakenById = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid id format'
      });
    }
    const result = await SafecityMeasuresTaken.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
          is_active: true
        }
      },
      {
        $project: {
          _id: 1,
          measure_taken: 1,
          measure_taken_authority: 1,
          details: 1,
          remarks: 1,
          sc_id: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Measure taken record not found'
      });
    }

    res.status(200).json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error fetching measure taken record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching measure taken record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Add a new measure taken record
// @route   POST /api/safecity/add-safecity-measure-taken
// @access  Private
const addSafecityMeasureTaken = asyncHandler(async (req, res) => {
  try {
    const {
      measure_taken,
      measure_taken_authority,
      details,
      remarks,
      sc_id
    } = req.body;

    // Validate required fields
    if (!measure_taken || !measure_taken_authority || !details || !sc_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide measure_taken, measure_taken_authority, details and sc_id'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(sc_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sc_id format'
      });
    }

    // Ensure the referenced SafecityMain exists
    const sc = await SafecityMain.findById(sc_id);
    if (!sc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SafecityMain ID (sc_id)'
      });
    }

    const doc = new SafecityMeasuresTaken({
      measure_taken,
      measure_taken_authority,
      details,
      remarks,
      sc_id,
      is_active: true
    });

    const created = await doc.save();

    res.status(201).json({
      success: true,
      message: 'Measure taken record added successfully',
      data: created
    });
  } catch (error) {
    console.error('Error adding measure taken record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding measure taken record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update a measure taken record
// @route   PUT /api/safecity/update-safecity-measure-taken/:id
// @access  Private
const updateSafecityMeasureTaken = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid id format'
      });
    }
    const record = await SafecityMeasuresTaken.findById(req.params.id);

    if (!record || !record.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Measure taken record not found'
      });
    }

    const updatableFields = [
      'measure_taken',
      'measure_taken_authority',
      'details',
      'remarks'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        record[field] = req.body[field];
      }
    });

    const updated = await record.save();

    res.status(200).json({
      success: true,
      message: 'Measure taken record updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating measure taken record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating measure taken record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete a measure taken record (soft delete)
// @route   DELETE /api/safecity/delete-safecity-measure-taken/:id
// @access  Private
const deleteSafecityMeasureTaken = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid id format'
      });
    }
    const record = await SafecityMeasuresTaken.findById(req.params.id);

    if (!record || !record.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Measure taken record not found'
      });
    }

    record.is_active = false;
    await record.save();

    res.status(200).json({
      success: true,
      message: 'Measure taken record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting measure taken record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting measure taken record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = {
  getAllSafecityMeasuresTaken,
  getSafecityMeasureTakenById,
  addSafecityMeasureTaken,
  updateSafecityMeasureTaken,
  deleteSafecityMeasureTaken
};
