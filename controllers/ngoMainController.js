const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const NGOMain = require('../models/NGOMain');

// @desc    Get single NGO by ID
// @route   GET /api/ngo/get-single-ngo/:id
// @access  Public
const getNGOById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid NGO ID format' });
    }

    const ngo = await NGOMain.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          is_active: true
        }
      },
      {
        $lookup: {
          from: 'lu_district',
          localField: 'operating_area_district_id',
          foreignField: '_id',
          as: 'district'
        }
      },
      { $unwind: { path: '$district', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          field_of_work: 1,
          funding_source: 1,
          known_affiliate_linkage: 1,
          is_involve_financial_irregularities: 1,
          is_against_national_interest: 1,
          nature_antinational_activity: 1,
          remarks: 1,
          operating_area_district: {
            _id: '$district._id',
            name: '$district.name'
          },
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    if (!ngo || ngo.length === 0) {
      return res.status(404).json({ success: false, message: 'NGO not found' });
    }

    res.status(200).json({ success: true, data: ngo[0] });
  } catch (error) {
    console.error('Error fetching NGO:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Server error while fetching NGO'
    });
  }
});

// @desc    Add a new NGO
// @route   POST /api/ngo/add-ngo
// @access  Private
const addNGO = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      field_of_work,
      operating_area_district_id,
      funding_source,
      known_affiliate_linkage,
      is_involve_financial_irregularities,
      is_against_national_interest,
      nature_antinational_activity,
      remarks
    } = req.body;

    // Validate required fields
    if (!name || !field_of_work || !operating_area_district_id || !funding_source || !known_affiliate_linkage) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (is_against_national_interest === true && !nature_antinational_activity) {
      return res.status(400).json({ success: false, message: 'Nature of anti-national activity is required when against national interest' });
    }

    // Check duplicates on active records
    const existing = await NGOMain.findOne({
      name: name.trim(),
      operating_area_district_id,
      is_active: true
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'NGO with this name already exists for the selected district' });
    }

    const ngo = await NGOMain.create({
      name: name.trim(),
      field_of_work,
      operating_area_district_id,
      funding_source,
      known_affiliate_linkage,
      is_involve_financial_irregularities: !!is_involve_financial_irregularities,
      is_against_national_interest: !!is_against_national_interest,
      nature_antinational_activity: is_against_national_interest ? nature_antinational_activity : undefined,
      remarks,
      is_active: true
    });

    res.status(201).json({ success: true, message: 'NGO added successfully', data: ngo });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate NGO for the selected district' });
    }
    console.error('Error adding NGO:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Server error while adding NGO'
    });
  }
});

// @desc    Get all NGOs
// @route   GET /api/ngo-main/get-all-ngo-main
// @access  Public
const getAllNGOMain = asyncHandler(async (req, res) => {
  try {
    const ngos = await NGOMain.aggregate([
      { $match: { is_active: true } },
      {
        $lookup: {
          from: 'lu_district',
          localField: 'operating_area_district_id',
          foreignField: '_id',
          as: 'district'
        }
      },
      { $unwind: { path: '$district', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          field_of_work: 1,
          funding_source: 1,
          known_affiliate_linkage: 1,
          is_involve_financial_irregularities: 1,
          is_against_national_interest: 1,
          nature_antinational_activity: 1,
          remarks: 1,
          operating_area_district: { _id: '$district._id', name: '$district.name' },
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.status(200).json({ success: true, count: ngos.length, data: ngos });
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Server error while fetching NGOs'
    });
  }
});

// @desc    Update an NGO
// @route   PUT /api/ngo/update-ngo/:id
// @access  Private
const updateNGO = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid NGO ID format' });
    }

    const ngo = await NGOMain.findById(id);
    if (!ngo || !ngo.is_active) {
      return res.status(404).json({ success: false, message: 'NGO not found' });
    }

    const updatableFields = [
      'name',
      'field_of_work',
      'operating_area_district_id',
      'funding_source',
      'known_affiliate_linkage',
      'is_involve_financial_irregularities',
      'is_against_national_interest',
      'nature_antinational_activity',
      'remarks'
    ];

    // Prepare updates
    const updates = {};
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Validation for anti-national fields
    if (updates.is_against_national_interest === false) {
      updates.nature_antinational_activity = undefined;
    }
    if (updates.is_against_national_interest === true && !updates.nature_antinational_activity && !ngo.nature_antinational_activity) {
      return res.status(400).json({ success: false, message: 'Nature of anti-national activity is required when against national interest' });
    }

    // Duplicate check if name or district changed
    if (updates.name || updates.operating_area_district_id) {
      const duplicate = await NGOMain.findOne({
        _id: { $ne: id },
        name: (updates.name || ngo.name).trim(),
        operating_area_district_id: updates.operating_area_district_id || ngo.operating_area_district_id,
        is_active: true
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Another NGO with this name exists in the selected district' });
      }
    }

    const updated = await NGOMain.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'NGO updated successfully', data: updated });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate NGO for the selected district' });
    }
    console.error('Error updating NGO:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Server error while updating NGO'
    });
  }
});

// @desc    Delete an NGO (soft delete)
// @route   DELETE /api/ngo/delete-ngo/:id
// @access  Private
const deleteNGO = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid NGO ID format' });
    }

    const ngo = await NGOMain.findById(id);
    if (!ngo || !ngo.is_active) {
      return res.status(404).json({ success: false, message: 'NGO not found' });
    }

    await NGOMain.findByIdAndUpdate(id, { is_active: false }, { new: true });

    res.status(200).json({ success: true, message: 'NGO deleted successfully' });
  } catch (error) {
    console.error('Error deleting NGO:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Server error while deleting NGO'
    });
  }
});

module.exports = {
  getAllNGOMain,
  getNGOById,
  addNGO,
  updateNGO,
  deleteNGO
};
